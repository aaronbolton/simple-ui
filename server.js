const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Add size limit for JSON requests

// Security headers
app.use((req, res, next) => {
    // Content Security Policy
    res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' cdn.jsdelivr.net; " +
        "style-src 'self' 'unsafe-inline'; " +
        "connect-src 'self' " + (process.env.OPENAI_API_URL || 'https://api.openai.com') + "; " +
        "img-src 'self' data:; " +
        "font-src 'self'; " +
        "object-src 'none'; " +
        "base-uri 'self';"
    );
    
    // Other security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    next();
});

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
        
        // Validate required fields
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: { message: 'Messages array is required and cannot be empty' } });
        }
        
        if (!process.env.OPENAI_API_KEY) {
            return res.status(400).json({ error: { message: 'API key not configured on server' } });
        }
        
        const apiUrl = process.env.OPENAI_API_URL || 'https://api.openai.com/v1';
        const endpoint = apiUrl.endsWith('/') ? apiUrl + 'chat/completions' : apiUrl + '/chat/completions';
        
        const requestBody = {
            model: model || process.env.MODEL_NAME || 'gpt-3.5-turbo',
            messages,
            max_tokens: max_tokens || 1000,
            temperature: temperature || 0.7,
            stream: stream
        };
        
        console.log(`[API] Making request to: ${endpoint}`);
        console.log(`[API] Model: ${requestBody.model}`);
        console.log(`[API] Messages count: ${messages.length}`);
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            console.error(`[API Error] Status: ${response.status}, Response: ${errorText}`);
            
            try {
                const errorData = JSON.parse(errorText);
                return res.status(response.status).json(errorData);
            } catch {
                return res.status(response.status).json({ 
                    error: { 
                        message: `HTTP ${response.status}: ${response.statusText}`,
                        details: errorText.substring(0, 500) // Limit error details
                    } 
                });
            }
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
                console.error('[Streaming Error]:', streamError);
                if (!res.headersSent) {
                    res.status(500).json({ error: { message: 'Streaming error occurred' } });
                } else {
                    res.end();
                }
            }
        } else {
            // Non-streaming response (fallback)
            const data = await response.json();
            res.json(data);
        }
    } catch (error) {
        console.error('[API Error]:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: { message: 'Internal server error', details: error.message } });
        }
    }
});

// Proxy endpoint for metrics
app.get('/api/metrics', async (req, res) => {
    try {
        const apiUrl = process.env.OPENAI_API_URL || 'https://api.openai.com/v1';
        const baseUrl = apiUrl.replace('/v1', '').replace(/\/+$/, '');
        const metricsUrl = `${baseUrl}/metrics`;
        
        console.log(`[Metrics] Fetching from: ${metricsUrl}`);
        
        const response = await fetch(metricsUrl, {
            timeout: 10000 // 10 second timeout
        });
        
        if (!response.ok) {
            console.warn(`[Metrics] Error: ${response.status} ${response.statusText}`);
            return res.status(response.status).send('Metrics not available');
        }
        
        const metricsText = await response.text();
        res.set('Content-Type', 'text/plain');
        res.send(metricsText);
        
        console.log(`[Metrics] Successfully fetched ${metricsText.length} characters`);
    } catch (error) {
        console.error('[Metrics Error]:', error.message);
        res.status(500).send('Error fetching metrics');
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
