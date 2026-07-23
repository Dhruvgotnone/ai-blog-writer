// routes/blogs.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Blog = require('../models/Blog');
const User = require('../models/User');
const { optionalAuth, protect } = require('../middleware/auth');

// Helper to call Hugging Face text models with serverless timeout safety
const callHuggingFace = async (prompt, selectedModel = null) => {
  const HF_API_KEY = process.env.HF_API_KEY;

  if (!HF_API_KEY || HF_API_KEY.includes('REPLACE') || HF_API_KEY.includes('your_')) {
    console.log('HF_API_KEY not configured or using template, generating smart blog response');
    return generateFallbackBlog(prompt);
  }

  const defaultModels = [
    'mistralai/Mistral-7B-Instruct-v0.2',
    'HuggingFaceH4/zephyr-7b-beta',
    'tiiuae/falcon-7b-instruct',
    'gpt2',
  ];

  const MODELS = selectedModel ? [selectedModel, ...defaultModels.filter(m => m !== selectedModel)] : defaultModels;

  for (const model of MODELS) {
    try {
      console.log(`Trying text model: ${model}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500); // 4.5 second limit per model

      const response = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 600,
              temperature: 0.7,
              return_full_text: false,
            },
            options: {
              wait_for_model: false,
              use_cache: true,
            },
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.log(`Model ${model} returned status ${response.status}, trying next...`);
        continue;
      }

      const data = await response.json();

      let generatedText = null;
      if (Array.isArray(data) && data[0]?.generated_text) {
        generatedText = data[0].generated_text;
      } else if (data?.generated_text) {
        generatedText = data.generated_text;
      } else if (typeof data === 'string') {
        generatedText = data;
      }

      if (generatedText && generatedText.trim().length > 20) {
        console.log(`Success with text model: ${model}`);
        return generatedText.trim();
      }
    } catch (err) {
      console.log(`Model ${model} call failed/timed out:`, err.message);
      continue;
    }
  }

  console.log('All HF text models timed out or failed, using smart blog fallback');
  return generateFallbackBlog(prompt);
};

// Helper for AI Cover Image generation
const generateCoverImage = async (topic) => {
  try {
    const encodedTopic = encodeURIComponent(topic.substring(0, 100));
    // Use Pollinations AI / Unsplash dynamic image service
    const imageUrl = `https://image.pollinations.ai/prompt/blog%20cover%20illustration%20for%20${encodedTopic}?width=1200&height=630&seed=${Math.floor(Math.random() * 10000)}&nologo=true`;
    return imageUrl;
  } catch (err) {
    console.error('Cover image generation error:', err.message);
    return null;
  }
};

const generateFallbackBlog = (prompt) => {
  const topicMatch = prompt.match(/about:\s*"([^"]+)"/i);
  const topic = topicMatch ? topicMatch[1].trim() : 'this topic';

  return `## Introduction

Welcome to this comprehensive guide on ${topic}. Understanding ${topic} has become increasingly important in today's digital landscape. This post covers everything you need to know.

## Why ${topic} Matters

There are several compelling reasons to explore ${topic}:

- It has a significant impact on modern strategy and workflow
- Understanding it opens new opportunities for growth and innovation
- It connects directly with key trends shaping our industry

## Key Strategies & Insights

When exploring ${topic}, keep these core principles in mind:

- **Solid Foundation:** Start with the core principles before scaling
- **Practical Application:** Focus on practical, real-world execution  
- **Continuous Learning:** Monitor metrics and iterate for improvement

## Actionable Steps to Implement

Begin your journey with ${topic} by taking small, consistent steps:

1. Identify your primary goals and target outcome.
2. Build an efficient system to execute consistently.
3. Review progress regularly and refine your approach.

## Conclusion

${topic} is a transformative subject with massive potential. The journey of mastering it is well worth the investment. Start today and leverage these insights for long-term success.`;
};

const generateValidation = [
  body('topic').trim().notEmpty().withMessage('Topic is required'),
  body('wordCount').isInt({ min: 100, max: 2000 }),
  body('tone').isIn(['professional', 'casual', 'academic', 'creative', 'persuasive']),
];

// Generate Blog Post
router.post('/generate', optionalAuth, generateValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { topic, wordCount, tone, seoKeywords = [], selectedModel = null, language = 'English', generateImage = true, outline = [] } = req.body;

  // Check user credits if logged in
  if (req.user) {
    const userDoc = await User.findById(req.user._id);
    if (userDoc && userDoc.credits <= 0) {
      return res.status(403).json({
        success: false,
        error: 'You have run out of AI generation credits! Please upgrade your plan to continue.',
        outOfCredits: true,
      });
    }
  }

  try {
    const toneDesc = {
      professional: 'professional and authoritative',
      casual: 'friendly and conversational',
      academic: 'scholarly and well-researched',
      creative: 'creative and engaging',
      persuasive: 'persuasive and compelling',
    };

    const keywordsText = seoKeywords.length > 0
      ? `Include these keywords organically: ${seoKeywords.join(', ')}.`
      : '';

    const langText = language !== 'English' ? `Write the entire blog in ${language}.` : '';
    const outlineText = outline.length > 0 ? `Follow this structured outline:\n${outline.map((item, idx) => `${idx + 1}. ${item}`).join('\n')}\n` : '';

    const prompt = `Write a ${toneDesc[tone]} blog post of approximately ${wordCount} words in ${language} about: "${topic}". Use markdown headers (##) for section headings. Include an introduction, main body sections, and a conclusion. ${keywordsText} ${langText}\n${outlineText}\nBlog post:`;

    console.log(`Generating blog: "${topic}" | ${tone} | ${wordCount} words | Lang: ${language}`);

    // Generate text and optional cover image in parallel
    const [content, coverImage] = await Promise.all([
      callHuggingFace(prompt, selectedModel),
      generateImage ? generateCoverImage(topic) : Promise.resolve(null),
    ]);

    // Deduct 1 credit if user is logged in
    let remainingCredits = null;
    if (req.user) {
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $inc: { credits: -1, blogsGenerated: 1 } },
        { new: true }
      );
      if (user) remainingCredits = user.credits;
    }

    res.json({
      success: true,
      data: {
        content,
        topic,
        tone,
        wordCount,
        seoKeywords,
        coverImage,
        language,
        modelUsed: selectedModel || 'mistralai/Mistral-7B-Instruct-v0.2',
        estimatedWords: content.split(/\s+/).length,
        remainingCredits,
      },
    });
  } catch (error) {
    console.error('Generation error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate Outline
router.post('/outline', optionalAuth,
  [body('topic').trim().notEmpty().withMessage('Topic is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { topic, tone = 'professional', language = 'English' } = req.body;

    try {
      const prompt = `Create a 5-point outline for a blog post about "${topic}" in ${language}. List 5 section titles, one per line:\n1.`;
      const result = await callHuggingFace(prompt);
      
      // Parse output lines into outline items
      const items = result
        .split('\n')
        .map((line) => line.replace(/^[\d#.\s*-]+/, '').trim())
        .filter((line) => line.length > 3)
        .slice(0, 6);

      const fallbackItems = [
        `Introduction to ${topic}`,
        `Core Principles & Background`,
        `Key Benefits and Impact`,
        `Step-by-Step Implementation Guide`,
        `Future Outlook and Conclusion`
      ];

      res.json({
        success: true,
        data: { outline: items.length >= 3 ? items : fallbackItems },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Social Media Repurposing Endpoint
router.post('/repurpose', optionalAuth,
  [body('content').notEmpty().withMessage('Blog content is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { content, topic = 'Blog Post' } = req.body;

    try {
      const prompt = `Based on this blog post content:\n"${content.substring(0, 1000)}"\n\nGenerate 3 social media posts:\n1. A 3-tweet Twitter/X Thread\n2. A professional LinkedIn post with hashtags\n3. A 2-sentence TL;DR summary.\n\nSocial Media Pack:`;
      const result = await callHuggingFace(prompt);

      res.json({
        success: true,
        data: { repurposedContent: result },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Humanize / Rewrite Endpoint
router.post('/humanize', optionalAuth,
  [body('content').notEmpty().withMessage('Content is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { content } = req.body;
    try {
      const prompt = `Rewrite this blog post to sound more natural and human:\n\n${content.substring(0, 1500)}\n\nRewritten version:`;
      const humanized = await callHuggingFace(prompt);
      res.json({ success: true, data: { content: humanized, isHumanized: true } });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Save Blog Post
router.post('/save', optionalAuth,
  [
    body('topic').trim().notEmpty(),
    body('content').notEmpty(),
    body('tone').isIn(['professional', 'casual', 'academic', 'creative', 'persuasive']),
    body('wordCount').isInt({ min: 100, max: 2000 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      const { topic, content, tone, wordCount, seoKeywords, coverImage, language, modelUsed, outline, isHumanized, originalContent } = req.body;
      const blog = new Blog({
        topic,
        content,
        tone,
        wordCount,
        seoKeywords: seoKeywords || [],
        coverImage: coverImage || null,
        language: language || 'English',
        modelUsed: modelUsed || 'mistralai/Mistral-7B-Instruct-v0.2',
        outline: outline || [],
        isHumanized: isHumanized || false,
        originalContent: originalContent || null,
        userId: req.user ? req.user._id : null,
      });
      await blog.save();
      res.status(201).json({ success: true, data: blog, message: 'Blog saved successfully!' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to save blog.' });
    }
  }
);

// Get User Saved Blogs
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = req.user ? { userId: req.user._id } : {};
    const [blogs, total] = await Promise.all([
      Blog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Blog.countDocuments(filter),
    ]);
    res.json({ success: true, data: blogs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch blogs.' });
  }
});

// Get Single Blog
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, error: 'Blog not found.' });
    res.json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch blog.' });
  }
});

// Toggle Favorite
router.patch('/:id/favorite', optionalAuth, async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user) filter.userId = req.user._id;
    
    const blog = await Blog.findOne(filter);
    if (!blog) return res.status(404).json({ success: false, error: 'Blog not found.' });
    blog.isFavorite = !blog.isFavorite;
    await blog.save();
    res.json({ success: true, data: { isFavorite: blog.isFavorite }, message: blog.isFavorite ? 'Added to favorites!' : 'Removed from favorites.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update.' });
  }
});

// Delete Blog
router.delete('/:id', optionalAuth, async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user) filter.userId = req.user._id;
    
    const blog = await Blog.findOneAndDelete(filter);
    if (!blog) return res.status(404).json({ success: false, error: 'Not found.' });
    res.json({ success: true, message: 'Deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete.' });
  }
});

module.exports = router;
