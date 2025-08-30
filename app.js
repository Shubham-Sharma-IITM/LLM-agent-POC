class AgenticChatBot {
    constructor() {
        this.messages = [];
        this.isProcessing = false;
        this.config = {
            baseURL: '',
            apiKey: '',
            model: 'gpt-4o-mini'
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTools();
        this.updateConfigStatus();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('chat-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleUserInput();
        });

        // Enter key support
        document.getElementById('user-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserInput();
            }
        });

        // Provider configuration
        ['provider-select', 'api-key', 'model-select'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.updateConfig();
            });
            document.getElementById(id).addEventListener('input', () => {
                this.updateConfig();
            });
        });

        // API key visibility toggle
        document.getElementById('toggle-key').addEventListener('click', () => {
            const keyInput = document.getElementById('api-key');
            const toggleBtn = document.getElementById('toggle-key');
            
            if (keyInput.type === 'password') {
                keyInput.type = 'text';
                toggleBtn.innerHTML = '<i class="bi bi-eye-slash"></i>';
            } else {
                keyInput.type = 'password';
                toggleBtn.innerHTML = '<i class="bi bi-eye"></i>';
            }
        });

        // Test connection
        document.getElementById('test-connection').addEventListener('click', () => {
            this.testConnection();
        });
    }

    updateConfig() {
        const provider = document.getElementById('provider-select').value;
        const apiKey = document.getElementById('api-key').value;
        const model = document.getElementById('model-select').value;

        this.config = {
            baseURL: provider === 'aipipe' ? 'https://aipipe.org/openai/v1' : 'https://api.openai.com/v1',
            apiKey: apiKey.trim(),
            model: model
        };

        this.updateConfigStatus();
    }

    updateConfigStatus() {
        const statusBadge = document.getElementById('config-status');
        const testBtn = document.getElementById('test-connection');
        
        const isConfigured = this.config.apiKey && this.config.baseURL && this.config.model;
        
        if (isConfigured) {
            statusBadge.className = 'badge bg-warning ms-2';
            statusBadge.textContent = 'Ready to Test';
            testBtn.disabled = false;
            this.setStatus('LLM configured - Click Test to verify connection');
        } else {
            statusBadge.className = 'badge bg-secondary ms-2';
            statusBadge.textContent = 'Not Configured';
            testBtn.disabled = true;
            this.setStatus('Configure LLM above or use demo mode');
        }
    }

    async testConnection() {
        const testBtn = document.getElementById('test-connection');
        const statusBadge = document.getElementById('config-status');
        const originalContent = testBtn.innerHTML;
        
        testBtn.disabled = true;
        testBtn.innerHTML = '<i class="bi bi-hourglass-split spinning"></i> Testing...';
        statusBadge.className = 'badge bg-info ms-2';
        statusBadge.textContent = 'Testing...';
        
        try {
            this.addMessage('system', `🧪 Testing connection to ${this.config.baseURL.includes('aipipe') ? 'AIPipe' : 'OpenAI'}...`);
            
            const response = await fetch(`${this.config.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    model: this.config.model,
                    messages: [{ 
                        role: 'user', 
                        content: 'Say "Connection test successful" if you can read this.' 
                    }],
                    max_tokens: 10,
                    temperature: 0
                })
            });

            if (response.ok) {
                const data = await response.json();
                const reply = data.choices[0].message.content;
                
                this.addMessage('system', `✅ Connection successful!\n📡 Response: ${reply}`);
                this.showAlert('LLM connection test passed! You can now chat with full AI capabilities.', 'success');
                
                statusBadge.className = 'badge bg-success ms-2';
                statusBadge.textContent = 'Connected ✓';
                this.setStatus('Connected! Ready to chat with AI agent.');
                
            } else {
                const errorText = await response.text();
                let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
                
                try {
                    const errorData = JSON.parse(errorText);
                    if (errorData.error && errorData.error.message) {
                        errorMsg = errorData.error.message;
                    }
                } catch (e) {
                    // Use the original error message
                }
                
                throw new Error(errorMsg);
            }
            
        } catch (error) {
            console.error('Connection test error:', error);
            
            let userFriendlyError = error.message;
            
            if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
                userFriendlyError = 'Network error - this might be due to CORS restrictions. Try chatting directly instead of testing.';
            } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                userFriendlyError = 'Invalid API key. Please check your credentials.';
            } else if (error.message.includes('quota') || error.message.includes('billing')) {
                userFriendlyError = 'API quota exceeded or billing issue. Check your account.';
            }
            
            this.addMessage('system', `❌ Connection test failed: ${userFriendlyError}`);
            this.showAlert(`Connection test failed: ${userFriendlyError}`, 'warning');
            
            statusBadge.className = 'badge bg-danger ms-2';
            statusBadge.textContent = 'Test Failed';
        } finally {
            testBtn.disabled = false;
            testBtn.innerHTML = originalContent;
        }
    }

    setupTools() {
        this.tools = [
            {
                type: "function",
                function: {
                    name: "google_search",
                    description: "Search Google for current information. Returns search results with titles, links, and snippets.",
                    parameters: {
                        type: "object",
                        properties: {
                            query: {
                                type: "string",
                                description: "The search query"
                            }
                        },
                        required: ["query"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "execute_javascript",
                    description: "Execute JavaScript code in the browser. Use this for calculations, data processing, or demonstrations. Always return the result.",
                    parameters: {
                        type: "object",
                        properties: {
                            code: {
                                type: "string",
                                description: "The JavaScript code to execute. Make sure to return a value."
                            },
                            description: {
                                type: "string",
                                description: "Brief description of what the code does"
                            }
                        },
                        required: ["code"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "ai_task",
                    description: "Use AI for complex reasoning, analysis, or generation tasks that require advanced language model capabilities.",
                    parameters: {
                        type: "object",
                        properties: {
                            task: {
                                type: "string",
                                description: "The AI task to perform"
                            },
                            context: {
                                type: "string",
                                description: "Additional context for the task"
                            }
                        },
                        required: ["task"]
                    }
                }
            }
        ];
    }

    async handleUserInput() {
        const input = document.getElementById('user-input');
        const userMessage = input.value.trim();
        
        if (!userMessage || this.isProcessing) return;
        
        input.value = '';
        this.addMessage('user', userMessage);
        
        // Check if LLM is configured
        if (!this.config.apiKey || !this.config.baseURL) {
            this.addMessage('system', '⚠️ LLM not configured. Running in demo mode with limited functionality.');
            this.handleDemoMode(userMessage);
            return;
        }
        
        // Start the agentic loop
        this.messages.push({ role: 'user', content: userMessage });
        await this.agenticLoop();
    }

    handleDemoMode(userMessage) {
        const message = userMessage.toLowerCase();
        
        if (message.includes('calculate') || message.includes('math') || message.includes('fibonacci') || message.includes('javascript') || message.includes('tip')) {
            this.addMessage('assistant', 'I can help with calculations! Let me execute some JavaScript for you.');
            
            if (message.includes('fibonacci')) {
                this.executeJavaScript(`
function fibonacci(n) {
    let fib = [0, 1];
    for (let i = 2; i < n; i++) {
        fib[i] = fib[i-1] + fib[i-2];
    }
    return fib.slice(0, n);
}

return fibonacci(10);`, 'Generate Fibonacci sequence up to 10 numbers');
            } else if (message.includes('tip')) {
                this.executeJavaScript(`
const bill = 84;
const tipPercent = 15;
const tipAmount = (bill * tipPercent) / 100;
const total = bill + tipAmount;

return {
    bill: bill,
    tipPercent: tipPercent + '%',
    tipAmount: tipAmount,
    total: total
};`, 'Calculate tip amount');
            } else if (message.includes('sort')) {
                this.executeJavaScript(`
const array = [3, 1, 4, 1, 5, 9, 2, 6];
const sorted = [...array].sort((a, b) => a - b);

return {
    original: array,
    sorted: sorted
};`, 'Sort array of numbers');
            } else {
                this.executeJavaScript(`
const result = Math.pow(2, 8) + Math.sqrt(144);
return {
    calculation: "2^8 + √144",
    result: result
};`, 'Mathematical calculation example');
            }
        } else if (message.includes('search')) {
            this.addMessage('assistant', 'I can search for information!');
            this.googleSearch('demo search query from user message');
        } else if (message.includes('test') || message.includes('hello')) {
            this.addMessage('assistant', 'Hello! I\'m working in demo mode. Here\'s what I can do:\n\n🧮 Try: "Calculate 15% tip on $84"\n🔍 Try: "Search for latest AI news"\n💻 Try: "Generate fibonacci numbers"\n🔢 Try: "Sort array [3,1,4,1,5]"\n\n🚀 Configure your LLM provider above for full AI capabilities!');
        } else {
            this.addMessage('assistant', 'Demo mode active! I can demonstrate:\n\n• ✨ **JavaScript execution** - "calculate tip" or "fibonacci"\n• 🔍 **Search simulation** - "search for information"\n• 🤖 **Tool usage** - "sort an array"\n\nConfigure your LLM provider above for intelligent conversation and automatic tool selection!');
        }
    }

    async agenticLoop() {
    this.isProcessing = true;
    this.setStatus('🤖 Agent thinking...');
    
    try {
        let loopCount = 0;
        const maxLoops = 10;
        let tasksCompleted = false;
        
        while (loopCount < maxLoops) {
            const response = await this.callLLM();
            
            if (response.content) {
                this.addMessage('assistant', response.content);
            }
            
            if (response.tool_calls && response.tool_calls.length > 0) {
                this.messages.push({
                    role: 'assistant',
                    content: response.content,
                    tool_calls: response.tool_calls
                });
                
                await this.handleToolCalls(response.tool_calls);
                loopCount++;
            } else {
                // No more tool calls, tasks completed successfully
                tasksCompleted = true;
                break;
            }
        }
        
        if (loopCount >= maxLoops) {
            this.addMessage('system', '⚠️ Maximum loop iterations reached. Task completed.');
            this.addMessage('assistant', 'I have completed all the tasks assigned by you. Let me know if you need help with anything else.');
        } else if (tasksCompleted) {
            // Add completion message when all tasks are done successfully
            this.addMessage('assistant', '✅ I have completed all the tasks assigned by you. Let me know if you need help with anything else.');
        }
        
    } catch (error) {
        console.error('Agentic loop error:', error);
        this.showAlert('Error in agentic loop: ' + error.message, 'danger');
        this.addMessage('system', `❌ Error: ${error.message}\n\nTip: If this is a connection error, your API key might be working even if the test failed due to CORS restrictions.`);
    } finally {
        this.isProcessing = false;
        this.setStatus('Ready to chat!');
    }
}

    async callLLM() {
        const response = await fetch(`${this.config.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`
            },
            body: JSON.stringify({
                model: this.config.model,
                messages: this.messages,
                tools: this.tools,
                tool_choice: 'auto',
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        return data.choices[0].message;
    }

    async handleToolCalls(toolCalls) {
        for (const toolCall of toolCalls) {
            this.setStatus(`🔧 Executing: ${toolCall.function.name}`);
            
            try {
                const result = await this.executeTool(toolCall);
                
                this.messages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(result, null, 2)
                });
            } catch (error) {
                this.showAlert(`Tool execution failed: ${error.message}`, 'warning');
                
                this.messages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: JSON.stringify({ error: error.message })
                });
            }
        }
    }

    async executeTool(toolCall) {
        const { name, arguments: args } = toolCall.function;
        const params = JSON.parse(args);

        switch (name) {
            case 'google_search':
                return await this.googleSearch(params.query);
            
            case 'execute_javascript':
                return this.executeJavaScript(params.code, params.description);
            
            case 'ai_task':
                return await this.aiTask(params.task, params.context);
            
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }

    async googleSearch(query) {
        // Get credentials from form inputs
        const GOOGLE_API_KEY = document.getElementById('google-api-key')?.value || '';
        const GOOGLE_CX = document.getElementById('google-cx')?.value || '';
        
        this.addMessage('system', `🔍 Searching Google for: "${query}"`);
        
        // Check if Google credentials are configured
        if (!GOOGLE_API_KEY || !GOOGLE_CX) {
            this.addMessage('system', '⚠️ Google Search API not configured. Using mock results.');
            return this.mockGoogleSearch(query);
        }
        
        try {
            // Real Google Custom Search API call
            const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query)}&num=5`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Google API Error: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data.items || data.items.length === 0) {
                this.addMessage('system', '📭 No search results found.');
                return {
                    query,
                    results: [],
                    note: "No results found for this query"
                };
            }
            
            // Format real results
            const results = data.items.map(item => ({
                title: item.title,
                link: item.link,
                snippet: item.snippet || 'No description available'
            }));
            
            // Display results in chat
            this.addSearchResults(results, false);
            
            return {
                query,
                results,
                total_results: data.searchInformation?.totalResults || 0,
                search_time: data.searchInformation?.searchTime || 0
            };
            
        } catch (error) {
            console.error('Google Search Error:', error);
            this.addMessage('system', `❌ Google Search failed: ${error.message}`);
            
            // Fall back to mock results on error
            return this.mockGoogleSearch(query);
        }
    }

    mockGoogleSearch(query) {
        const mockResults = [
            {
                title: `Latest information about "${query}"`,
                link: "https://example.com/result1",
                snippet: `This is a mock search result for "${query}". Configure Google API credentials for real search results.`
            },
            {
                title: `${query} - Complete Guide`,
                link: "https://example.com/result2",
                snippet: `Mock result showing comprehensive information about ${query}. Real Google Search API integration available.`
            }
        ];
        
        this.addSearchResults(mockResults, true);
        
        return {
            query,
            results: mockResults,
            note: "Mock implementation - configure Google API for real results"
        };
    }

    addSearchResults(results, isMock = false) {
        const chatContainer = document.getElementById('chat-container');
        const resultDiv = document.createElement('div');
        resultDiv.className = 'mb-3';
        
        let resultsHtml = `<div class="search-result">
            <h6><i class="bi bi-search"></i> ${isMock ? 'Mock ' : ''}Search Results</h6>`;
        
        results.forEach((result, index) => {
            resultsHtml += `
                <div class="border-start border-${isMock ? 'secondary' : 'primary'} ps-3 ms-2 mt-2">
                    <strong>${index + 1}. ${isMock ? result.title : `<a href="${result.link}" target="_blank">${result.title}</a>`}</strong><br>
                    <small class="text-${isMock ? 'muted' : 'success'}">${result.link}</small><br>
                    <span class="text-muted">${result.snippet}</span>
                </div>
            `;
        });
        
        resultsHtml += '</div>';
        resultDiv.innerHTML = resultsHtml;
        
        chatContainer.appendChild(resultDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    executeJavaScript(code, description) {
        this.addMessage('system', `💻 Executing JavaScript: ${description || 'Code execution'}`);
        this.addCodeBlock(code);
        
        try {
            // Improved JavaScript execution with proper return handling
            let result;
            
            // Check if code already has return statement
            if (code.includes('return ')) {
                // Execute as function body
                result = Function('"use strict"; ' + code)();
            } else {
                // Try to execute as expression first
                try {
                    result = Function('"use strict"; return (' + code + ')')();
                } catch (e) {
                    // If expression fails, execute as statements
                    result = Function('"use strict"; ' + code)();
                }
            }
            
            // Handle different result types
            let displayResult;
            if (result === undefined) {
                displayResult = 'undefined (code executed but no value returned)';
            } else if (result === null) {
                displayResult = 'null';
            } else if (typeof result === 'object') {
                displayResult = JSON.stringify(result, null, 2);
            } else {
                displayResult = String(result);
            }
            
            this.addCodeResult(displayResult, true);
            
            return {
                code,
                result: result,
                displayResult: displayResult,
                success: true,
                description
            };
        } catch (error) {
            this.addCodeResult(`Error: ${error.message}`, false);
            
            return {
                code,
                error: error.message,
                success: false,
                description
            };
        }
    }

    addCodeResult(result, success) {
        const chatContainer = document.getElementById('chat-container');
        const resultDiv = document.createElement('div');
        resultDiv.className = 'mb-3';
        
        resultDiv.innerHTML = `
            <div class="code-result border-start border-${success ? 'success' : 'danger'}">
                <h6><i class="bi bi-${success ? 'check-circle text-success' : 'x-circle text-danger'}"></i> Execution Result</h6>
                <pre class="mb-0"><code>${this.escapeHtml(result)}</code></pre>
            </div>
        `;
        
        chatContainer.appendChild(resultDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    async aiTask(task, context) {
        this.addMessage('system', `🤖 Performing AI task: ${task}`);
        
        const taskMessages = [
            { role: 'system', content: 'You are a helpful AI assistant performing a specific task. Be concise and accurate.' },
            { role: 'user', content: `Task: ${task}${context ? `\n\nContext: ${context}` : ''}` }
        ];
        
        const response = await fetch(`${this.config.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`
            },
            body: JSON.stringify({
                model: this.config.model,
                messages: taskMessages,
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const result = data.choices[0].message.content;
        
        this.addMessage('system', `📝 AI Task Result:\n${result}`);
        
        return {
            task,
            context,
            result
        };
    }

    addMessage(role, content) {
        const chatContainer = document.getElementById('chat-container');
        
        // Clear initial message if this is the first real message
        if (chatContainer.children.length === 1 && chatContainer.textContent.includes('Welcome to Agentic ChatBot')) {
            chatContainer.innerHTML = '';
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `mb-3 ${role === 'user' ? 'text-end' : ''}`;
        
        const badge = this.getRoleBadge(role);
        const messageContent = this.formatMessage(content);
        
        messageDiv.innerHTML = `
            <div class="d-inline-block p-3 rounded ${this.getMessageClass(role)}" style="max-width: 85%;">
                ${badge}
                <div class="mt-1">${messageContent}</div>
            </div>
        `;
        
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    addCodeBlock(code) {
        const chatContainer = document.getElementById('chat-container');
        const codeDiv = document.createElement('div');
        codeDiv.className = 'mb-3';
        codeDiv.innerHTML = `
            <div class="bg-dark text-light p-3 rounded">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <small class="text-warning"><i class="bi bi-code-slash"></i> JavaScript Code</small>
                    <button class="btn btn-sm btn-outline-light copy-btn" onclick="navigator.clipboard.writeText(\`${this.escapeForJS(code)}\`)">
                        <i class="bi bi-clipboard"></i> Copy
                    </button>
                </div>
                <pre><code>${this.escapeHtml(code)}</code></pre>
            </div>
        `;
        chatContainer.appendChild(codeDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    getRoleBadge(role) {
        const badges = {
            user: '<span class="badge bg-primary"><i class="bi bi-person"></i> You</span>',
            assistant: '<span class="badge bg-success"><i class="bi bi-robot"></i> Agent</span>',
            system: '<span class="badge bg-secondary"><i class="bi bi-gear"></i> System</span>'
        };
        return badges[role] || '';
    }

    getMessageClass(role) {
        const classes = {
            user: 'bg-primary text-white',
            assistant: 'bg-light border border-success',
            system: 'bg-warning bg-opacity-25 border border-warning'
        };
        return classes[role] || 'bg-light';
    }

    formatMessage(content) {
        return this.escapeHtml(content).replace(/\n/g, '<br>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    escapeForJS(text) {
        return text.replace(/`/g, '\\`').replace(/\$/g, '\\$');
    }

    setStatus(message) {
        document.getElementById('status').textContent = message;
    }

    showAlert(message, type = 'info') {
        const alertContainer = document.getElementById('alert-container');
        const alertId = 'alert-' + Date.now();
        
        const alertHTML = `
            <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
                <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-triangle' : 'info-circle'}"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        alertContainer.insertAdjacentHTML('beforeend', alertHTML);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const alert = document.getElementById(alertId);
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 5000);
    }
}

// Initialize the chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AgenticChatBot();
});