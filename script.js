class ChatUI {
    constructor() {
        this.messages = [];
        this.isLoading = false;
        this.totalUsage = {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0
        };
        this.metrics = {
            timePerOutputToken: 0,
            requestsRunning: 0,
            requestsWaiting: 0,
            cacheUsage: 0
        };
        this.settings = {
            apiUrl: 'https://api.openai.com/v1',
            apiKey: '',
            modelName: 'gpt-3.5-turbo',
            systemPrompt: 'You are a helpful assistant.',
            useServerProxy: false,
            darkMode: false // Default to light mode
        };
        
        this.initializeElements();
        this.loadSettings(); // Keep as non-blocking
        this.bindEvents();
        this.autoResizeTextarea();
        this.updateUsageDisplay();
        this.initializeTheme();
    }
    
    initializeElements() {
        this.messagesContainer = document.getElementById('messages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.charCount = document.getElementById('charCount');
        this.status = document.getElementById('status');
        this.settingsPanel = document.getElementById('settingsPanel');
        this.settingsToggle = document.getElementById('settingsToggle');
        this.themeToggle = document.getElementById('themeToggle');
        
        // Settings inputs
        this.apiUrlInput = document.getElementById('apiUrl');
        this.apiKeyInput = document.getElementById('apiKey');
        this.modelNameInput = document.getElementById('modelName');
        this.systemPromptInput = document.getElementById('systemPrompt');
        this.saveSettingsButton = document.getElementById('saveSettings');
        this.clearChatButton = document.getElementById('clearChat');
    }
    
    bindEvents() {
        // Main chat events
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        this.messageInput.addEventListener('input', () => this.updateCharCount());
        
        // Settings events
        this.settingsToggle.addEventListener('click', () => this.toggleSettings());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.saveSettingsButton.addEventListener('click', () => this.saveSettings());
        this.clearChatButton.addEventListener('click', () => this.clearChat());
        
        // Close settings when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.settingsPanel.contains(e.target) && 
                !this.settingsToggle.contains(e.target) && 
                this.settingsPanel.classList.contains('open')) {
                this.toggleSettings();
            }
        });
    }
    
    autoResizeTextarea() {
        this.messageInput.addEventListener('input', () => {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
        });
    }
    
    updateCharCount() {
        const count = this.messageInput.value.length;
        this.charCount.textContent = `${count}/4000`;
        this.charCount.style.color = count > 3800 ? '#f56565' : '#a0aec0';
    }
    
    updateStatus(message, type = 'ready') {
        this.status.textContent = message;
        this.status.className = `status ${type}`;
    }
    
    toggleSettings() {
        this.settingsPanel.classList.toggle('open');
        if (this.settingsPanel.classList.contains('open')) {
            this.loadSettingsToUI();
        }
    }
    
    async loadSettings() {
        // First load server configuration from .env
        try {
            const response = await fetch('/api/config');
            if (response.ok) {
                const serverConfig = await response.json();
                this.settings.apiUrl = serverConfig.apiUrl;
                this.settings.modelName = serverConfig.modelName;
                
                // If server has API key configured, we'll use server proxy
                if (serverConfig.hasApiKey) {
                    this.settings.useServerProxy = true;
                    this.settings.apiKey = 'server-configured'; // Placeholder
                }
            }
        } catch (error) {
            console.log('Could not load server config, using client-side settings');
        }
        
        // Then override with any saved local settings
        const saved = localStorage.getItem('chatui_settings');
        if (saved) {
            const localSettings = JSON.parse(saved);
            // Don't override server settings unless explicitly set by user
            if (localSettings.apiUrl && localSettings.apiUrl !== 'https://api.openai.com/v1') {
                this.settings.apiUrl = localSettings.apiUrl;
            }
            if (localSettings.modelName && localSettings.modelName !== 'gpt-3.5-turbo') {
                this.settings.modelName = localSettings.modelName;
            }
            if (localSettings.apiKey && localSettings.apiKey !== '') {
                this.settings.apiKey = localSettings.apiKey;
                this.settings.useServerProxy = false; // Use client-side if user provided key
            }
            if (localSettings.systemPrompt) {
                this.settings.systemPrompt = localSettings.systemPrompt;
            }
            if (typeof localSettings.darkMode === 'boolean') {
                this.settings.darkMode = localSettings.darkMode;
            }
        }
        
        this.validateSettings();
    }
    
    loadSettingsToUI() {
        this.apiUrlInput.value = this.settings.apiUrl;
        this.modelNameInput.value = this.settings.modelName;
        this.systemPromptInput.value = this.settings.systemPrompt;
        
        if (this.settings.useServerProxy) {
            this.apiKeyInput.value = '';
            this.apiKeyInput.placeholder = 'Using server configuration';
            this.apiKeyInput.disabled = true;
        } else {
            this.apiKeyInput.value = this.settings.apiKey;
            this.apiKeyInput.placeholder = 'Enter your API key';
            this.apiKeyInput.disabled = false;
        }
    }
    
    saveSettings() {
        this.settings.apiUrl = this.apiUrlInput.value.trim() || 'https://api.openai.com/v1';
        this.settings.modelName = this.modelNameInput.value.trim() || 'gpt-3.5-turbo';
        this.settings.systemPrompt = this.systemPromptInput.value.trim() || 'You are a helpful assistant.';
        
        // Only update API key if not using server proxy
        if (!this.settings.useServerProxy) {
            this.settings.apiKey = this.apiKeyInput.value.trim();
        }
        
        // If user provides API key, switch to client-side mode
        if (this.apiKeyInput.value.trim() && !this.apiKeyInput.disabled) {
            this.settings.apiKey = this.apiKeyInput.value.trim();
            this.settings.useServerProxy = false;
        }
        
        localStorage.setItem('chatui_settings', JSON.stringify(this.settings));
        this.validateSettings();
        this.updateStatus('Settings saved!', 'ready');
        
        setTimeout(() => {
            this.toggleSettings();
        }, 1000);
    }
    
    initializeTheme() {
        this.applyTheme();
    }
    
    toggleTheme() {
        this.settings.darkMode = !this.settings.darkMode;
        this.applyTheme();
        localStorage.setItem('chatui_settings', JSON.stringify(this.settings));
    }
    
    applyTheme() {
        const body = document.body;
        const sunIcon = this.themeToggle.querySelector('.sun-icon');
        const moonIcon = this.themeToggle.querySelector('.moon-icon');
        
        if (this.settings.darkMode) {
            body.classList.add('dark-mode');
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            body.classList.remove('dark-mode');
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
    }
    
    validateSettings() {
        if (this.settings.useServerProxy) {
            this.updateStatus('Ready (using server config)', 'ready');
        } else if (!this.settings.apiKey || this.settings.apiKey === 'server-configured') {
            this.updateStatus('Please configure API key in settings', 'error');
        } else {
            this.updateStatus('Ready', 'ready');
        }
    }
    
    clearChat() {
        this.messages = [];
        this.totalUsage = {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0
        };
        this.messagesContainer.innerHTML = `
            <div class="message system">
                <div class="message-content">
                    Chat cleared. Start a new conversation!
                </div>
            </div>
        `;
        this.updateUsageDisplay();
        
        // Clear performance display
        const performanceElement = document.getElementById('performanceDisplay');
        if (performanceElement) {
            performanceElement.style.display = 'none';
        }
        
        this.updateStatus('Chat cleared', 'ready');
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isLoading) return;
        
        if (!this.settings.useServerProxy && (!this.settings.apiKey || this.settings.apiKey === 'server-configured')) {
            this.updateStatus('Please configure API key in settings', 'error');
            return;
        }
        
        // Add user message
        this.addMessage('user', message);
        this.messageInput.value = '';
        this.updateCharCount();
        this.messageInput.style.height = 'auto';
        
        // Show loading
        this.isLoading = true;
        this.sendButton.disabled = true;
        this.addLoadingMessage();
        this.updateStatus('Thinking...', 'loading');
        
        try {
            const startTime = Date.now();
            const response = await this.callAPI(message);
            const endTime = Date.now();
            const responseTime = (endTime - startTime) / 1000; // Convert to seconds
            
            this.removeLoadingMessage();
            
            // Collect metrics after API call
            const metrics = await this.collectMetrics();
            
            // Calculate tokens per second for this response
            const tokensPerSecond = response.usage?.completion_tokens 
                ? Math.round(response.usage.completion_tokens / responseTime)
                : 0;
            
            this.addMessage('assistant', response.content, response.usage, metrics, tokensPerSecond);
            
            // Update performance display in header
            if (metrics) {
                this.updatePerformanceDisplay(metrics, tokensPerSecond);
            }
            
            // Update cumulative usage
            if (response.usage) {
                this.totalUsage.prompt_tokens += response.usage.prompt_tokens || 0;
                this.totalUsage.completion_tokens += response.usage.completion_tokens || 0;
                this.totalUsage.total_tokens += response.usage.total_tokens || 0;
                this.updateUsageDisplay();
            }
            
            this.updateStatus(this.settings.useServerProxy ? 'Ready (using server config)' : 'Ready', 'ready');
        } catch (error) {
            this.removeLoadingMessage();
            this.addMessage('system', `Error: ${error.message}`);
            this.updateStatus('Error occurred', 'error');
            console.error('API Error:', error);
        } finally {
            this.isLoading = false;
            this.sendButton.disabled = false;
        }
    }
    
    async callAPI(userMessage) {
        const messages = [
            { role: 'system', content: this.settings.systemPrompt },
            ...this.messages.filter(m => m.role !== 'system').slice(-10), // Keep last 10 messages
            { role: 'user', content: userMessage }
        ];
        
        // Use server proxy if configured, otherwise direct API call
        if (this.settings.useServerProxy) {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: messages,
                    model: this.settings.modelName,
                    max_tokens: 1000,
                    temperature: 0.7
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            const content = data.choices[0]?.message?.content || 'No response received';
            const usage = data.usage;
            
            return { content, usage };
        } else {
            // Direct API call
            const apiUrl = this.settings.apiUrl.endsWith('/') 
                ? this.settings.apiUrl + 'chat/completions'
                : this.settings.apiUrl + '/chat/completions';
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.settings.apiKey}`
                },
                body: JSON.stringify({
                    model: this.settings.modelName,
                    messages: messages,
                    max_tokens: 1000,
                    temperature: 0.7
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            const content = data.choices[0]?.message?.content || 'No response received';
            const usage = data.usage;
            
            return { content, usage };
        }
    }
    
    addMessage(role, content, usage = null, metrics = null, tokensPerSecond = 0) {
        const message = { role, content, timestamp: new Date(), usage, metrics, tokensPerSecond };
        this.messages.push(message);
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${role}`;
        
        let usageHtml = '';
        if (usage) {
            const tokensPerSecDisplay = tokensPerSecond > 0 ? ` | ${tokensPerSecond} tok/s` : '';
            usageHtml = `
                <div class="usage-stats">
                    <small>
                        Tokens: ${usage.completion_tokens || 0} completion / ${usage.prompt_tokens || 0} prompt / ${usage.total_tokens || 0} total${tokensPerSecDisplay}
                    </small>
                </div>
            `;
        }
        
        let metricsHtml = '';
        if (metrics && role === 'assistant') {
            metricsHtml = `
                <div class="metrics-stats">
                    <small>
                        Performance: ${metrics.timePerOutputToken}ms/token | Cache: ${metrics.cacheUsage}% | Queue: ${metrics.requestsWaiting}
                    </small>
                </div>
            `;
        }
        
        // Render markdown for assistant messages, escape HTML for user messages
        let messageContent;
        if (role === 'assistant') {
            messageContent = this.renderMarkdown(content);
        } else {
            messageContent = this.escapeHtml(content);
        }
        
        // Add resend button for user messages
        let resendButtonHtml = '';
        if (role === 'user') {
            resendButtonHtml = `
                <div class="message-actions">
                    <button class="resend-button" onclick="chatUI.resendMessage('${this.escapeHtml(content).replace(/'/g, '\\\'')}')" title="Resend message">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                            <path d="M21 3v5h-5"/>
                            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                            <path d="M3 21v-5h5"/>
                        </svg>
                    </button>
                </div>
            `;
        }
        
        messageElement.innerHTML = `
            <div class="message-content">${messageContent}</div>
            ${resendButtonHtml}
            ${usageHtml}
            ${metricsHtml}
        `;
        
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }
    
    addLoadingMessage() {
        const loadingElement = document.createElement('div');
        loadingElement.className = 'message assistant loading';
        loadingElement.id = 'loading-message';
        loadingElement.innerHTML = `
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        this.messagesContainer.appendChild(loadingElement);
        this.scrollToBottom();
    }
    
    removeLoadingMessage() {
        const loadingElement = document.getElementById('loading-message');
        if (loadingElement) {
            loadingElement.remove();
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    renderMarkdown(text) {
        // Configure marked options for better security and formatting
        const self = this;
        marked.setOptions({
            breaks: true,
            gfm: true,
            sanitize: false,
            highlight: function(code, lang) {
                // Basic syntax highlighting for code blocks
                return `<code class="language-${lang || 'text'}">${self.escapeHtml(code)}</code>`;
            }
        });
        
        return marked.parse(text);
    }
    
    async collectMetrics() {
        try {
            let metricsUrl;
            
            // Use server proxy if available
            if (this.settings.useServerProxy) {
                metricsUrl = '/api/metrics';
            } else {
                // Extract the base URL from the API URL
                const baseUrl = this.settings.apiUrl.replace('/v1', '').replace(/\/+$/, '');
                metricsUrl = `${baseUrl}/metrics`;
            }
            
            const response = await fetch(metricsUrl);
            if (!response.ok) {
                console.warn('Could not fetch metrics:', response.statusText);
                return null;
            }
            
            const metricsText = await response.text();
            return this.parsePrometheusMetrics(metricsText);
        } catch (error) {
            console.warn('Error collecting metrics:', error);
            return null;
        }
    }
    
    parsePrometheusMetrics(metricsText) {
        const metrics = {
            timePerOutputToken: 0,
            requestsRunning: 0,
            requestsWaiting: 0,
            cacheUsage: 0
        };
        
        const lines = metricsText.split('\n');
        
        for (const line of lines) {
            // Parse time per output token (calculate average from histogram)
            if (line.includes('vllm:time_per_output_token_seconds_sum')) {
                const sumMatch = line.match(/vllm:time_per_output_token_seconds_sum.*?\s+([\d.]+)/);
                if (sumMatch) {
                    const sum = parseFloat(sumMatch[1]);
                    
                    // Find the corresponding count
                    const countLine = lines.find(l => l.includes('vllm:time_per_output_token_seconds_count'));
                    if (countLine) {
                        const countMatch = countLine.match(/vllm:time_per_output_token_seconds_count.*?\s+([\d.]+)/);
                        if (countMatch) {
                            const count = parseFloat(countMatch[1]);
                            if (count > 0) {
                                metrics.timePerOutputToken = Math.round((sum / count) * 1000); // Convert to ms
                            }
                        }
                    }
                }
            }
            
            // Parse running requests
            else if (line.includes('vllm:num_requests_running') && !line.includes('#')) {
                const match = line.match(/vllm:num_requests_running.*?\s+([\d.]+)/);
                if (match) {
                    metrics.requestsRunning = parseInt(parseFloat(match[1]));
                }
            }
            
            // Parse waiting requests
            else if (line.includes('vllm:num_requests_waiting') && !line.includes('#')) {
                const match = line.match(/vllm:num_requests_waiting.*?\s+([\d.]+)/);
                if (match) {
                    metrics.requestsWaiting = parseInt(parseFloat(match[1]));
                }
            }
            
            // Parse cache usage (prefer the non-deprecated version)
            else if (line.includes('vllm:kv_cache_usage_perc') && !line.includes('#') && !line.includes('gpu_cache_usage_perc')) {
                const match = line.match(/vllm:kv_cache_usage_perc.*?\s+([\d.]+)/);
                if (match) {
                    metrics.cacheUsage = Math.round(parseFloat(match[1]) * 100); // Convert to percentage
                }
            }
            // Fallback to deprecated version if new one not found
            else if (line.includes('vllm:gpu_cache_usage_perc') && !line.includes('#') && metrics.cacheUsage === 0) {
                const match = line.match(/vllm:gpu_cache_usage_perc.*?\s+([\d.]+)/);
                if (match) {
                    metrics.cacheUsage = Math.round(parseFloat(match[1]) * 100); // Convert to percentage
                }
            }
        }
        
        return metrics;
    }
    
    updateUsageDisplay() {
        const usageElement = document.getElementById('totalUsage');
        if (usageElement && this.totalUsage.total_tokens > 0) {
            usageElement.textContent = `Total: ${this.totalUsage.total_tokens} tokens (${this.totalUsage.completion_tokens} completion + ${this.totalUsage.prompt_tokens} prompt)`;
            usageElement.style.display = 'block';
        } else if (usageElement) {
            usageElement.style.display = 'none';
        }
    }
    
    updatePerformanceDisplay(metrics, tokensPerSecond = 0) {
        const performanceElement = document.getElementById('performanceDisplay');
        if (performanceElement && metrics) {
            const tokensPerSecDisplay = tokensPerSecond > 0 ? ` | ${tokensPerSecond} tok/s` : '';
            performanceElement.textContent = `Last response: ${metrics.timePerOutputToken}ms/token | Cache: ${metrics.cacheUsage}% | Queue: ${metrics.requestsWaiting}${tokensPerSecDisplay}`;
            performanceElement.style.display = 'block';
        }
    }
    
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

// Initialize the chat UI when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChatUI();
});
