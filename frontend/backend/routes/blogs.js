// routes/blogs.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Blog = require('../models/Blog');
const User = require('../models/User');
const { optionalAuth, protect } = require('../middleware/auth');

// Helper to call Grok API (xAI / Groq)
const callGrokAPI = async (prompt, selectedModel = 'grok-beta') => {
  const apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY || process.env.GROQ_API_KEY;

  if (!apiKey || apiKey.includes('REPLACE') || apiKey.includes('your_')) {
    throw new Error('Grok API Key is missing. Please add GROK_API_KEY or XAI_API_KEY in Vercel Environment Variables.');
  }

  // Support both xAI Grok and Groq API keys
  const isGroq = apiKey.startsWith('gsk_');
  const endpoint = isGroq
    ? 'https://api.groq.com/openai/v1/chat/completions'
    : 'https://api.x.ai/v1/chat/completions';

  const targetModel = isGroq ? 'llama-3.3-70b-versatile' : (selectedModel || 'grok-beta');

  console.log(`🚀 Calling Grok API (${endpoint}) with model: ${targetModel}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: targetModel,
      messages: [
        {
          role: 'system',
          content: 'You are Grok, an ultra-intelligent, witty, master AI blog writer. Write comprehensive, engaging, beautifully formatted Markdown blog posts with clear headings (##) based on the user prompt.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    }),
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (response.status === 401) {
    throw new Error('Invalid Grok API Key. Please verify GROK_API_KEY / XAI_API_KEY in Vercel Environment Variables.');
  }

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Grok API Error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content || content.trim().length < 30) {
    throw new Error('Grok API returned empty text. Please try again.');
  }

  return content.trim();
};

// Helper to call Hugging Face text models with serverless timeout safety
const callHuggingFace = async (prompt, selectedModel = null) => {
  const HF_API_KEY = process.env.HF_API_KEY;

  if (!HF_API_KEY || HF_API_KEY.includes('REPLACE') || HF_API_KEY.includes('your_')) {
    throw new Error('Hugging Face API key is not configured on the server. Please add HF_API_KEY in Vercel environment variables.');
  }

  const defaultModels = [
    'Qwen/Qwen2.5-72B-Instruct',
    'meta-llama/Llama-3.2-3B-Instruct',
    'mistralai/Mistral-7B-Instruct-v0.3',
    'HuggingFaceH4/zephyr-7b-beta',
  ];

  const MODELS = selectedModel ? [selectedModel, ...defaultModels.filter(m => m !== selectedModel)] : defaultModels;

  let lastErrorReason = 'Hugging Face API timeout or unavailable';

  // 1. Try Hugging Face Chat Completions Router API
  for (const model of MODELS) {
    try {
      console.log(`Trying HF Chat Completions API: ${model}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const response = await fetch('https://router.huggingface.co/hf-inference/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert AI blog writer. Write comprehensive, engaging, beautifully structured Markdown blog posts with clear section headers (##) based on the user prompt.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 1200,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        throw new Error('Invalid Hugging Face API Key. Please verify HF_API_KEY in Vercel Environment Variables.');
      }

      if (response.status === 503) {
        lastErrorReason = `Model ${model} is currently loading on Hugging Face.`;
        continue;
      }

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content && content.trim().length > 50) {
          console.log(`✅ Success with HF Chat API: ${model}`);
          return content.trim();
        }
      } else {
        const errText = await response.text();
        lastErrorReason = `Status ${response.status}: ${errText}`;
      }
    } catch (err) {
      if (err.message.includes('Invalid Hugging Face API Key')) throw err;
      console.log(`HF Chat API ${model} failed/timed out:`, err.message);
      lastErrorReason = err.message;
    }
  }

  // 2. Fallback to Active HF Router Models API
  for (const model of MODELS) {
    try {
      console.log(`Trying Active HF Router Model API: ${model}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(`https://router.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 700,
            temperature: 0.7,
            return_full_text: false,
          },
          options: { wait_for_model: false, use_cache: true },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        throw new Error('Invalid Hugging Face API Key. Please verify HF_API_KEY in Vercel Environment Variables.');
      }

      if (response.ok) {
        const data = await response.json();
        let text = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
        if (text && text.trim().length > 50) {
          console.log(`✅ Success with HF Model API: ${model}`);
          return text.trim();
        }
      }
    } catch (err) {
      if (err.message.includes('Invalid Hugging Face API Key')) throw err;
      console.log(`HF Model API ${model} failed:`, err.message);
    }
  }

  // NO TEMPLATES - Throw explicit error if AI generation failed
  throw new Error(`AI Blog Generation failed (${lastErrorReason}). Please try selecting another model or verify your HF_API_KEY.`);
};

// Unified AI Text Router supporting Grok (xAI) and Hugging Face
const callAITextModel = async (prompt, selectedModel = null) => {
  const isGrokModel = selectedModel && (selectedModel.startsWith('grok') || selectedModel.includes('xai'));
  const hasGrokKey = Boolean(process.env.GROK_API_KEY || process.env.XAI_API_KEY || process.env.GROQ_API_KEY);

  if (isGrokModel || hasGrokKey) {
    try {
      return await callGrokAPI(prompt, selectedModel);
    } catch (grokErr) {
      if (isGrokModel) throw grokErr;
      console.warn('Grok API failed, attempting Hugging Face fallback:', grokErr.message);
    }
  }

  return await callHuggingFace(prompt, selectedModel);
};

// Helper for AI Cover Image generation
const generateCoverImage = async (topic) => {
  try {
    const encodedTopic = encodeURIComponent((topic || 'blog').substring(0, 100));
    const imageUrl = `https://image.pollinations.ai/prompt/blog%20cover%20illustration%20for%20${encodedTopic}?width=1200&height=630&seed=${Math.floor(Math.random() * 10000)}&nologo=true`;
    return imageUrl;
  } catch (err) {
    console.error('Cover image generation error:', err.message);
    return null;
  }
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
    let userDoc = req.user;
    if (!global.isInMemoryDB) {
      try { userDoc = await User.findById(req.user._id); } catch(e) {}
    }
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

    console.log(`Generating blog with AI: "${topic}" | ${tone} | Model: ${selectedModel || 'Grok / Qwen'}`);

    // Generate text and optional cover image in parallel
    const [content, coverImage] = await Promise.all([
      callAITextModel(prompt, selectedModel),
      generateImage ? generateCoverImage(topic) : Promise.resolve(null),
    ]);

    // Deduct 1 credit if user is logged in
    let remainingCredits = null;
    if (req.user) {
      if (!global.isInMemoryDB) {
        try {
          const user = await User.findByIdAndUpdate(
            req.user._id,
            { $inc: { credits: -1, blogsGenerated: 1 } },
            { new: true }
          );
          if (user) remainingCredits = user.credits;
        } catch (e) {}
      } else {
        req.user.credits = Math.max(0, (req.user.credits || 5) - 1);
        req.user.blogsGenerated = (req.user.blogsGenerated || 0) + 1;
        remainingCredits = req.user.credits;
      }
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
        modelUsed: selectedModel || 'Grok AI / Qwen 2.5',
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

    const { topic, tone = 'professional', language = 'English', selectedModel = null } = req.body;

    try {
      const prompt = `Create a 5-point outline for a blog post about "${topic}" in ${language}. List 5 section titles, one per line:\n1.`;
      const result = await callAITextModel(prompt, selectedModel);
      
      const items = result
        .split('\n')
        .map((line) => line.replace(/^[\d#.\s*-]+/, '').trim())
        .filter((line) => line.length > 3)
        .slice(0, 6);

      res.json({
        success: true,
        outline: items.length >= 3 ? items : [
          `Introduction to ${topic}`,
          `Core Principles & Key Insights`,
          `Practical Implementation Steps`,
          `Future Trends & Considerations`,
          `Conclusion & Summary`,
        ],
      });
    } catch (error) {
      console.error('Outline generation error:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Save Blog Post
router.post('/save', protect, async (req, res) => {
  const { title, content, topic, tone, wordCount, seoKeywords, coverImage, language, isFavorite } = req.body;

  try {
    let blog;
    if (!global.isInMemoryDB) {
      blog = await Blog.create({
        userId: req.user._id,
        title: title || topic || 'Untitled Blog Post',
        content,
        topic,
        tone: tone || 'professional',
        wordCount: wordCount || 500,
        seoKeywords: seoKeywords || [],
        coverImage: coverImage || null,
        language: language || 'English',
        isFavorite: Boolean(isFavorite),
      });
    } else {
      const id = 'blog_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      blog = {
        _id: id,
        id,
        userId: req.user._id || req.user.id,
        title: title || topic || 'Untitled Blog Post',
        content,
        topic,
        tone: tone || 'professional',
        wordCount: wordCount || 500,
        seoKeywords: seoKeywords || [],
        coverImage: coverImage || null,
        language: language || 'English',
        isFavorite: Boolean(isFavorite),
        createdAt: new Date().toISOString(),
      };
      global.memoryBlogs.unshift(blog);
    }

    res.status(201).json({
      success: true,
      blog,
      message: 'Blog post saved successfully!',
    });
  } catch (error) {
    console.error('Save blog error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to save blog post.' });
  }
});

// Get User's Generation History
router.get('/history', protect, async (req, res) => {
  try {
    let blogs = [];
    if (!global.isInMemoryDB) {
      blogs = await Blog.find({ userId: req.user._id }).sort({ createdAt: -1 });
    } else {
      const uId = req.user._id || req.user.id;
      blogs = global.memoryBlogs.filter((b) => b.userId === uId);
    }

    res.json({
      success: true,
      count: blogs.length,
      blogs,
    });
  } catch (error) {
    console.error('History error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch generation history.' });
  }
});

// Toggle Favorite Status
router.patch('/:id/favorite', protect, async (req, res) => {
  try {
    let blog;
    if (!global.isInMemoryDB) {
      blog = await Blog.findOne({ _id: req.params.id, userId: req.user._id });
      if (blog) {
        blog.isFavorite = !blog.isFavorite;
        await blog.save();
      }
    } else {
      blog = global.memoryBlogs.find((b) => (b._id === req.params.id || b.id === req.params.id));
      if (blog) blog.isFavorite = !blog.isFavorite;
    }

    if (!blog) {
      return res.status(404).json({ success: false, error: 'Blog not found.' });
    }

    res.json({
      success: true,
      blog,
      message: blog.isFavorite ? 'Added to favorites!' : 'Removed from favorites.',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update favorite status.' });
  }
});

// Delete Blog Post
router.delete('/:id', protect, async (req, res) => {
  try {
    if (!global.isInMemoryDB) {
      const blog = await Blog.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
      if (!blog) return res.status(404).json({ success: false, error: 'Blog not found.' });
    } else {
      const uId = req.user._id || req.user.id;
      global.memoryBlogs = global.memoryBlogs.filter((b) => !(b.userId === uId && (b._id === req.params.id || b.id === req.params.id)));
    }

    res.json({ success: true, message: 'Blog post deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete blog post.' });
  }
});

module.exports = router;
