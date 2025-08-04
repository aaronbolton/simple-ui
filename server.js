const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint to get configuration (without exposing the API key)
app.get('/api/config', (req, res) => {
    res.json({
        apiUrl: process.env.OPENAI_API_URL || 'https://api.openai.com/v1',
        modelName: process.env.MODEL_NAME || 'gpt-3.5-turbo',
        hasApiKey: !!process.env.OPENAI_API_KEY
    });
});

// API endpoint to get default configuration for reset functionality
app.get('/api/defaults', (req, res) => {
    res.json({
        apiUrl: process.env.OPENAI_API_URL || 'https://api.openai.com/v1',
        modelName: process.env.MODEL_NAME || 'gpt-3.5-turbo',
        systemPrompt: 'You are a helpful assistant.',
        hasApiKey: !!process.env.OPENAI_API_KEY
    });
});

// Proxy endpoint for API calls (optional - for better security)
app.post('/api/chat', async (req, res) => {
    try {
        const { messages, model, max_tokens, temperature, stream = true } = req.body;
        
        if (!process.env.OPENAI_API_KEY) {
            return res.status(400).json({ error: { message: 'API key not configured' } });
        }
        
        const apiUrl = process.env.OPENAI_API_URL || 'https://api.openai.com/v1';
        const endpoint = apiUrl.endsWith('/') ? apiUrl + 'chat/completions' : apiUrl + '/chat/completions';
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: model || process.env.MODEL_NAME || 'gpt-3.5-turbo',
                messages,
                max_tokens: max_tokens || 1000,
                temperature: temperature || 0.7,
                stream: stream
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return res.status(response.status).json(errorData);
        }
        
        if (stream) {
            // Set headers for streaming response
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.setHeader('Transfer-Encoding', 'chunked');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            
            // Stream the response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    const chunk = decoder.decode(value, { stream: true });
                    res.write(chunk);
                }
                res.end();
            } catch (streamError) {
                console.error('Streaming error:', streamError);
                res.end();
            }
        } else {
            // Non-streaming response (fallback)
            const data = await response.json();
            res.json(data);
        }
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
});

// Proxy endpoint for metrics
app.get('/api/metrics', async (req, res) => {
    try {
        const apiUrl = process.env.OPENAI_API_URL || 'https://api.openai.com/v1';
        const baseUrl = apiUrl.replace('/v1', '').replace(/\/+$/, '');
        const metricsUrl = `${baseUrl}/metrics`;
        
        const response = await fetch(metricsUrl);
        
        if (!response.ok) {
            return res.status(response.status).text('Metrics not available');
        }
        
        const metricsText = await response.text();
        res.set('Content-Type', 'text/plain');
        res.send(metricsText);
    } catch (error) {
        console.error('Metrics Error:', error);
        res.status(500).text('Error fetching metrics');
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Simple Chat UI server running on http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${__dirname}`);
    
    if (!process.env.OPENAI_API_KEY) {
        console.log('⚠️  Warning: OPENAI_API_KEY not set in .env file');
        console.log('   Please copy .env.example to .env and configure your settings');
    } else {
        console.log('✅ API key configured');
    }
});
