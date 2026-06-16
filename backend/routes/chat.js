// // routes/chat.js
// const express = require('express');
// const router = express.Router();
// const Groq = require('groq-sdk');
// const { LocalIndex } = require('vectra');
// const path = require('path');
// const { pipeline } = require('@xenova/transformers');

// const INDEX_PATH = path.join(__dirname, '../data/vectra-index');
// let index = null;
// let embedder = null;

// // Simple in‑memory cache
// const answerCache = new Map();
// const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// // Rate‑limit tracking (optional)
// let lastRequestTime = 0;
// const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests

// async function getEmbedder() {
//     if (!embedder) {
//         embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
//     }
//     return embedder;
// }

// async function getIndex() {
//     if (!index) {
//         index = new LocalIndex(INDEX_PATH);
//         if (!await index.isIndexCreated()) throw new Error('Run ingestion first.');
//     }
//     return index;
// }

// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// router.post('/', async (req, res) => {
//     try {
//         const { message } = req.body;
//         if (!message) return res.status(400).json({ error: 'Message required' });

//         // 1. Check cache
//         const cached = answerCache.get(message);
//         if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
//             console.log(`📦 Cache hit for: ${message}`);
//             return res.json({ reply: cached.answer });
//         }

//         // 2. Optional: enforce minimum time between requests (helps with rate limits)
//         const now = Date.now();
//         if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
//             await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - (now - lastRequestTime)));
//         }
//         lastRequestTime = Date.now();

//         // 3. Generate embedding for user question
//         const embedModel = await getEmbedder();
//         const output = await embedModel(message, { pooling: 'mean', normalize: true });
//         const queryVector = Array.from(output.data);

//         // 4. Retrieve only 2 most relevant chunks (reduced from 5)
//         const vectraIndex = await getIndex();
//         const results = await vectraIndex.queryItems(queryVector, 2);

//         if (!results || results.length === 0) {
//     return res.json({ reply: "I appreciate your question! 😊 That topic isn't in my knowledge base yet. Could you please ask me about our subscription plans, AI resume analysis, mock interviews, or job search features? I'd love to help you prepare for your interviews!" });
// }

//         // 5. Build context and truncate to max 1500 chars (~375 tokens)
//         let context = results.map(r => r.item.metadata.text).join('\n\n');
//         const MAX_CONTEXT_CHARS = 1500;
//         if (context.length > MAX_CONTEXT_CHARS) {
//             context = context.substring(0, MAX_CONTEXT_CHARS);
//             // Optional: add ellipsis to indicate truncation
//             context += '... (truncated)';
//         }

//         // 6. Short system prompt (saves tokens)
//         const systemPrompt = `You are a helpful assistant for AI Interview Hub. Answer ONLY based on the provided context. If not present, say "I don't know". Keep answers concise.`;

//         const userPrompt = `Context:\n${context}\n\nQuestion: ${message}\nAnswer:`;

//         // 7. Call Groq API
//         const completion = await groq.chat.completions.create({
//             messages: [
//                 { role: "system", content: systemPrompt },
//                 { role: "user", content: userPrompt }
//             ],
//             model: "llama-3.1-8b-instant",
//             temperature: 0.3,
//         });

//         const answer = completion.choices[0]?.message?.content || "Sorry, no response.";
        
//         // 8. Store in cache
//         answerCache.set(message, { answer, timestamp: Date.now() });

//         res.json({ reply: answer });
//     } catch (error) {
//         console.error('Chat API error:', error);
//         // Handle rate limit specifically
//         if (error.status === 413 || error.message?.includes('rate_limit')) {
//             return res.status(429).json({ 
//                 error: 'Rate limit exceeded. Please wait a moment and try again.' 
//             });
//         }
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// module.exports = router;



// routes/chat.js
const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const { LocalIndex } = require('vectra');
const path = require('path');
const { pipeline } = require('@xenova/transformers');

const INDEX_PATH = path.join(__dirname, '../data/vectra-index');
let index = null;
let embedder = null;

// Simple in‑memory cache
const answerCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Rate‑limit tracking (optional)
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests

async function getEmbedder() {
    if (!embedder) {
        embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return embedder;
}

async function getIndex() {
    if (!index) {
        index = new LocalIndex(INDEX_PATH);
        if (!await index.isIndexCreated()) throw new Error('Run ingestion first.');
    }
    return index;
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: 'Message required' });

        // 1. Check cache
        const cached = answerCache.get(message);
        if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
            console.log(`📦 Cache hit for: ${message}`);
            return res.json({ reply: cached.answer });
        }

        // 2. Optional: enforce minimum time between requests (helps with rate limits)
        const now = Date.now();
        if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
            await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - (now - lastRequestTime)));
        }
        lastRequestTime = Date.now();

        // 3. Generate embedding for user question
        const embedModel = await getEmbedder();
        const output = await embedModel(message, { pooling: 'mean', normalize: true });
        const queryVector = Array.from(output.data);

        // 4. Retrieve 4 most relevant chunks (increased from 2) <-- CHANGE
        const vectraIndex = await getIndex();
        const results = await vectraIndex.queryItems(queryVector, 4);

        if (!results || results.length === 0) {
            return res.json({ reply: "I appreciate your question! 😊 That topic isn't in my knowledge base yet. Could you please ask me about our subscription plans, AI resume analysis, mock interviews, or job search features? I'd love to help you prepare for your interviews!" });
        }

        // 5. Build context and truncate to max 3000 chars (increased from 1500) <-- CHANGE
        let context = results.map(r => r.item.metadata.text).join('\n\n');
        const MAX_CONTEXT_CHARS = 3000;
        if (context.length > MAX_CONTEXT_CHARS) {
            context = context.substring(0, MAX_CONTEXT_CHARS);
            context += '... (truncated)';
        }

        // 6. System prompt (kept concise)
        const systemPrompt = `You are a helpful assistant for AI Interview Hub. Answer ONLY based on the provided context. If the answer is not in the context, say "I don't have that information in my knowledge base." Keep answers clear and helpful.`;

        const userPrompt = `Context:\n${context}\n\nQuestion: ${message}\nAnswer:`;

        // 7. Call Groq API
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.3,
        });

        const answer = completion.choices[0]?.message?.content || "Sorry, no response.";
        
        // 8. Store in cache
        answerCache.set(message, { answer, timestamp: Date.now() });

        res.json({ reply: answer });
    } catch (error) {
        console.error('Chat API error:', error);
        // Handle rate limit specifically
        if (error.status === 413 || error.message?.includes('rate_limit')) {
            return res.status(429).json({ 
                error: 'Rate limit exceeded. Please wait a moment and try again.' 
            });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;