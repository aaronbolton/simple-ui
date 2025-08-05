# Simple Chat UI

A secure, modern chat web interface for OpenAI compatible services with real-time streaming support.

## Overview

Simple Chat UI is a lightweight, secure web-based chat interface designed to work with OpenAI compatible API services. It features real-time streaming responses, a clean modern interface with dark/light mode support, and comprehensive security features. The application can run as a standalone web service or in a Docker container.

## Features

- 🚀 **Real-time Streaming**: Live token-by-token response streaming
- 🔒 **Security First**: Content Security Policy, XSS protection, and secure headers
- 🎨 **Modern UI**: Clean, responsive design with dark/light theme toggle
- 💭 **Think Tags Support**: Collapsible reasoning sections in AI responses
- 📊 **Performance Metrics**: Real-time tokens/sec display and API metrics
- ⚙️ **Flexible Configuration**: Support for any OpenAI compatible API
- 🐳 **Docker Ready**: Full containerization support
- 📱 **Mobile Responsive**: Works seamlessly on all devices

## Quick Start

### Using npm

1. **Clone the repository**:
   ```bash
   git clone https://github.com/aaronbolton/simple-ui.git
   cd simple-ui
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure your environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your API configuration
   ```

4. **Start the server**:
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Open your browser** to `http://localhost:3000`

### Using Docker

#### Option 1: Docker Compose (Recommended)

1. **Clone and configure**:
   ```bash
   git clone https://github.com/aaronbolton/simple-ui.git
   cd simple-ui
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Start with Docker Compose**:
   ```bash
   npm run docker-run
   # or directly:
   docker-compose up -d
   ```

3. **Access the application** at `http://localhost:3000`

#### Option 2: Direct Docker Build

1. **Build the image**:
   ```bash
   npm run docker-build
   # or directly:
   docker build -t simple-chat-ui .
   ```

2. **Run the container**:
   ```bash
   docker run -d \
     --name simple-chat-ui \
     -p 3000:3000 \
     --env-file .env \
     simple-chat-ui
   ```

## Configuration

### Environment Variables

Create a `.env` file in the root directory with the following configuration:

```bash
# OpenAI Compatible API Configuration
OPENAI_API_URL=https://api.openai.com/v1
OPENAI_API_KEY=your-api-key-here
MODEL_NAME=gpt-3.5-turbo

# Server Configuration  
PORT=3000
```

### Configuration Options

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `OPENAI_API_URL` | API endpoint URL | `https://api.openai.com/v1` | Yes |
| `OPENAI_API_KEY` | API authentication key | None | Yes* |
| `MODEL_NAME` | Default model to use | `gpt-3.5-turbo` | No |
| `PORT` | Server port | `3000` | No |

*Note: API key can be configured server-side (recommended) or client-side through the UI.

### Compatible APIs

This application works with any OpenAI compatible API service, including:

- **OpenAI** (GPT-3.5, GPT-4, etc.)
- **Local LLMs** (via vLLM, Ollama, LM Studio, etc.)
- **Azure OpenAI Service**
- **Anthropic Claude** (via compatible proxies)
- **Open source models** (Llama, Mistral, CodeLlama, etc.)

## Usage

### Basic Chat

1. Open the application in your web browser
2. Type your message in the input field
3. Press Enter or click the send button
4. Watch the AI response stream in real-time

### Advanced Features

#### Settings Panel
- Click the gear icon to access settings
- Configure API URL, model, and system prompt
- Save settings locally or reset to server defaults

#### Think Tags
AI responses may include collapsible "thinking" sections:
```
💭 Thinking... (click to expand)
```
Click to view the AI's reasoning process.

#### Theme Toggle
- Click the sun/moon icon to switch between light and dark modes
- Preference is saved locally

#### Message Actions
- Hover over user messages to see the resend button
- Click to resend any previous message

### API Usage Modes

#### Server-Side Configuration (Recommended)
- Configure API key in `.env` file
- More secure as API key never leaves the server
- Supports server-side metrics and monitoring

#### Client-Side Configuration
- Enter API key in the settings panel
- Useful for personal use or testing
- API key stored locally in browser

## Architecture

### Frontend
- **Vanilla JavaScript** - No framework dependencies
- **Marked.js** - Markdown rendering for AI responses
- **CSS Custom Properties** - Theme system
- **ES6 Modules** - Modern JavaScript features

### Backend
- **Node.js** with Express
- **CORS** enabled for cross-origin requests
- **Security middleware** with CSP headers
- **Streaming API** support for real-time responses

### Security Features
- Content Security Policy (CSP)
- XSS protection headers
- Request size limits
- Rate limiting
- Input validation and sanitization
- Secure cookie handling

## Development

### Prerequisites
- Node.js 16+ and npm 8+
- Modern web browser

### Development Commands

```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run security audit
npm run security-audit

# Fix security issues
npm run security-fix

# Build Docker image
npm run docker-build

# Run with Docker Compose
npm run docker-run
```

### Project Structure

```
simple-ui/
├── server.js           # Express server with API endpoints
├── index.html          # Main HTML template
├── script.js           # Frontend JavaScript application
├── styles.css          # CSS with theme system
├── package.json        # npm configuration
├── Dockerfile          # Multi-stage Docker build
├── docker-compose.yml  # Container orchestration
├── .env.example        # Environment configuration template
└── logs/              # Application logs (Docker)
```

### API Endpoints

- `GET /` - Serve main application
- `GET /api/config` - Get server configuration (without API key)
- `GET /api/defaults` - Get default settings for reset
- `POST /api/chat` - Proxy chat requests to configured API
- `GET /api/metrics` - Get performance metrics (if available)

## Deployment

### Production Deployment

1. **Prepare environment**:
   ```bash
   cp .env.example .env
   # Configure production values
   ```

2. **Using Docker (Recommended)**:
   ```bash
   docker-compose up -d
   ```

3. **Direct Node.js**:
   ```bash
   npm ci --only=production
   npm start
   ```

### Reverse Proxy Setup

For production deployment, use a reverse proxy like Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Troubleshooting

### Common Issues

**Connection Errors**
- Verify API URL is correct and accessible
- Check API key is valid and has sufficient credits
- Ensure network connectivity to API endpoint

**Streaming Issues**
- Some proxy/CDN services may buffer responses
- Try disabling any caching layers
- Check browser console for JavaScript errors

**Docker Issues**
- Ensure .env file is properly configured
- Check container logs: `docker logs simple-chat-ui`
- Verify port 3000 is not in use

### Logs and Debugging

**Development Mode**:
- Browser console shows detailed debug information
- Server logs display API requests and responses

**Production Mode**:
- Check Docker logs: `docker-compose logs -f`
- Monitor `/app/logs` directory in container

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit with clear messages: `git commit -m "Add feature"`
5. Push to your fork: `git push origin feature-name`
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- **Issues**: https://github.com/aaronbolton/simple-ui/issues
- **Discussions**: https://github.com/aaronbolton/simple-ui/discussions

---

Built with ❤️ for the AI community 