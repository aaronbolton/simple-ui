# Simple Chat UI

A clean, modern web interface for OpenAI compatible API services. This application provides a beautiful chat experience with configurable settings for different AI services.

## ✨ Features

- **Clean, Modern UI**: Beautiful gradient design with smooth animations
- **OpenAI Compatible**: Works with OpenAI API and other compatible services
- **Configurable**: Easy setup through environment variables or UI settings
- **Responsive**: Works perfectly on desktop and mobile devices
- **Real-time Chat**: Instant messaging with typing indicators
- **Settings Panel**: Configure API endpoint, key, model, and system prompt
- **Local Storage**: Saves your settings automatically
- **Error Handling**: Graceful error messages and status indicators

## 🚀 Quick Start

### Option 1: Direct HTML (Client-side only)

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd simple-ui
   ```

2. Open `index.html` in your browser
3. Click the settings gear icon to configure your API settings
4. Start chatting!

### Option 2: Node.js Server (Recommended for production)

1. Clone and install dependencies:
   ```bash
   git clone <your-repo-url>
   cd simple-ui
   npm install
   ```

2. Copy the environment configuration:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` file with your settings:
   ```env
   OPENAI_API_URL=https://api.openai.com/v1
   OPENAI_API_KEY=your-api-key-here
   MODEL_NAME=gpt-3.5-turbo
   PORT=3000
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Open http://localhost:3000 in your browser

## ⚙️ Configuration

### Environment Variables

- `OPENAI_API_URL`: The API endpoint URL (default: https://api.openai.com/v1)
- `OPENAI_API_KEY`: Your API key
- `MODEL_NAME`: The model to use (default: gpt-3.5-turbo)
- `PORT`: Server port (default: 3000)

### UI Settings

You can also configure settings directly in the web interface:

1. Click the settings gear icon (⚙️) on the right side
2. Configure:
   - **API URL**: Your OpenAI compatible endpoint
   - **API Key**: Your API key
   - **Model**: The model name to use
   - **System Prompt**: Instructions for the AI assistant
3. Click "Save Settings"

Settings are automatically saved to your browser's local storage.

## 🌐 Compatible Services

This chat UI works with any OpenAI compatible API, including:

- OpenAI API
- Azure OpenAI Service
- Anthropic Claude (with compatible proxy)
- Local LLM servers (Ollama, LocalAI, etc.)
- Other OpenAI compatible services

## 🎨 Features in Detail

### Modern UI Design
- Beautiful gradient backgrounds
- Smooth animations and transitions
- Clean message bubbles with proper spacing
- Responsive design for all screen sizes

### Smart Input
- Auto-resizing textarea
- Character counter (4000 char limit)
- Enter to send, Shift+Enter for new line
- Visual feedback for all actions

### Status Indicators
- Real-time status updates
- Loading states with typing indicators
- Error handling with clear messages
- Success confirmations

### Settings Management
- Persistent settings storage
- Secure API key handling
- Easy configuration panel
- One-click chat clearing

## 🔧 Development

The project structure is simple and modular:

```
simple-ui/
├── index.html          # Main HTML file
├── styles.css          # All styling
├── script.js           # Chat functionality
├── server.js           # Optional Node.js server
├── package.json        # Node.js dependencies
├── .env.example        # Environment template
└── README.md           # This file
```

### Customization

You can easily customize the appearance by modifying `styles.css`:

- Change colors in the CSS custom properties
- Modify the gradient backgrounds
- Adjust spacing and typography
- Update animations and transitions

## 📱 Mobile Support

The interface is fully responsive and provides an excellent experience on:
- Desktop computers
- Tablets
- Mobile phones
- Any screen size

## 🔒 Security Notes

- **Never commit API keys**: The `.env` file is ignored by git to prevent accidental exposure
- **Use server proxy mode**: When deploying to production, configure API keys on the server side only
- **HTTPS required**: Always use HTTPS in production to protect API communications
- **Content Security Policy**: The server includes CSP headers to prevent XSS attacks
- **Input validation**: All user inputs are validated and sanitized before processing
- **Rate limiting**: Built-in client-side rate limiting prevents abuse

### Security Best Practices

1. **Environment Variables**: Never hardcode API keys in your source code
2. **Server Configuration**: Use environment variables for all sensitive configuration
3. **HTTPS Only**: Deploy with valid SSL certificates
4. **Regular Updates**: Keep dependencies updated to latest secure versions

```bash
# Check for security vulnerabilities
npm audit

# Fix automatically where possible
npm audit fix
```

## 🚀 Deployment

### Static Hosting (Netlify, Vercel, GitHub Pages)
Just upload the HTML, CSS, and JS files. Users will need to configure their API keys in the UI.

### Node.js Hosting (Railway, Render, Heroku)
1. Deploy the entire project
2. Set environment variables in your hosting platform
3. The server will handle API calls securely

## 🤝 Contributing

Feel free to submit issues and pull requests. Some ideas for contributions:

- Additional themes and customization options
- Support for more AI services
- Enhanced message formatting (markdown, code highlighting)
- File upload capabilities
- Conversation history management

## 📄 License

MIT License - feel free to use this project however you'd like!