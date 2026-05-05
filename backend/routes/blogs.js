// routes/blogs.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Blog = require('../models/Blog');
const { optionalAuth, protect } = require('../middleware/auth');

const callHuggingFace = async (prompt) => {
  const HF_API_KEY = process.env.HF_API_KEY;

  if (!HF_API_KEY || HF_API_KEY.includes('REPLACE')) {
    throw new Error('Hugging Face API key not configured in backend/.env');
  }

  const MODELS = [
    'mistralai/Mistral-7B-Instruct-v0.2',
    'HuggingFaceH4/zephyr-7b-beta',
    'tiiuae/falcon-7b-instruct',
    'gpt2',
  ];

  let lastError = null;

  for (const model of MODELS) {
    try {
      console.log(`Trying model: ${model}`);

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
              wait_for_model: true,
              use_cache: false,
            },
          }),
        }
      );

      console.log(`Response status from ${model}: ${response.status}`);

      if (response.status === 404) {
        console.log(`Model ${model} not found, trying next...`);
        continue;
      }

      if (response.status === 503) {
        console.log(`Model ${model} loading, waiting 20 seconds...`);
        await new Promise((r) => setTimeout(r, 20000));
        continue;
      }

      if (response.status === 401) {
        throw new Error('Invalid Hugging Face API key. Please check HF_API_KEY in backend/.env');
      }

      if (!response.ok) {
        const errText = await response.text();
        console.log(`Error from ${model}:`, errText);
        lastError = errText;
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
        console.log(`Success with model: ${model}`);
        return generatedText.trim();
      }

      console.log(`Empty response from ${model}, trying next...`);

    } catch (err) {
      if (err.message.includes('API key')) throw err;
      console.log(`Exception with ${model}:`, err.message);
      lastError = err.message;
      continue;
    }
  }

  console.log('All HF models failed, using fallback');
  return generateFallbackBlog(prompt);
};

const generateFallbackBlog = (prompt) => {
  const topicMatch = prompt.match(/about:\s*"([^"]+)"/i);
  const topic = topicMatch ? topicMatch[1].trim() : 'this topic';

  return `## Introduction

Welcome to this comprehensive guide on ${topic}. Understanding ${topic} has become increasingly important in today's world. This post covers everything you need to know.

## Why ${topic} Matters

There are several compelling reasons to explore ${topic}:

- It has a significant impact on modern challenges
- Understanding it opens new opportunities
- It connects with trends shaping our future

## Key Points

When exploring ${topic}, keep these aspects in mind:

- **Foundation:** Start with the basics before diving deeper
- **Application:** Find practical ways to apply what you learn  
- **Growth:** Use your knowledge to continuously improve

## Getting Started

Begin your journey with ${topic} by taking small, consistent steps. Focus on one concept at a time and build your understanding gradually.

## Conclusion

${topic} is a fascinating subject with enormous potential. The journey of learning it is absolutely worth taking. Start today and see where it leads you.

---
Note: AI generation is currently limited. Please verify your Hugging Face API key in backend/.env`;
};

const generateValidation = [
  body('topic').trim().notEmpty().withMessage('Topic is required'),
  body('wordCount').isInt({ min: 100, max: 2000 }),
  body('tone').isIn(['professional', 'casual', 'academic', 'creative', 'persuasive']),
];

router.post('/generate', optionalAuth, generateValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { topic, wordCount, tone, seoKeywords = [] } = req.body;

  try {
    const toneDesc = {
      professional: 'professional and authoritative',
      casual: 'friendly and conversational',
      academic: 'scholarly and well-researched',
      creative: 'creative and engaging',
      persuasive: 'persuasive and compelling',
    };

    const keywordsText = seoKeywords.length > 0
      ? `Include these keywords: ${seoKeywords.join(', ')}.`
      : '';

    const prompt = `Write a ${toneDesc[tone]} blog post of about ${wordCount} words about: "${topic}". Use ## for section headings. Include an introduction, 3 main sections, and a conclusion. ${keywordsText}\nBlog post:`;

    console.log(`Generating blog: "${topic}" | ${tone} | ${wordCount} words`);

    const content = await callHuggingFace(prompt);

    res.json({
      success: true,
      data: { content, topic, tone, wordCount, seoKeywords, estimatedWords: content.split(/\s+/).length },
    });
  } catch (error) {
    console.error('Generation error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

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
      const { topic, content, tone, wordCount, seoKeywords, isHumanized, originalContent } = req.body;
      const blog = new Blog({
        topic, content, tone, wordCount,
        seoKeywords: seoKeywords || [],
        isHumanized: isHumanized || false,
        originalContent: originalContent || null,
        userId: req.user ? req.user._id : null,
      });
      await blog.save();
      res.status(201).json({ success: true, data: blog, message: 'Blog saved!' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to save blog.' });
    }
  }
);

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

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, error: 'Blog not found.' });
    res.json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch blog.' });
  }
});

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
