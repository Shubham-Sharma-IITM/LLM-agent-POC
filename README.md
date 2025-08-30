# Agentic ChatBot: A powerful browser-based AI agent

A powerful browser-based AI agent that can autonomously break down complex tasks and execute them using multiple tools including Google Search, JavaScript execution, and AI reasoning.

`JavaScript` `Bootstrap` `License`

## 🚀 Features

-   🤖 **Autonomous Agent**: Breaks down complex tasks and executes them step by step
-   🔍 **Google Search Integration**: Real-time web search with Custom Search API
-   💻 **JavaScript Execution**: Safe in-browser code execution with result display
-   🧠 **AI Task Processing**: Advanced reasoning and content generation
-   🔄 **Agentic Loop**: Continuous tool calling until tasks are completed
-   🎯 **Multiple LLM Providers**: Support for AIPipe, OpenAI, and compatible APIs
-   📱 **Responsive Design**: Works on desktop and mobile devices
-   🛡️ **Demo Mode**: Test functionality without API configuration

## 📋 Prerequisites

-   Modern web browser (Chrome, Firefox, Safari, Edge)
-   Local web server (Python, Node.js, or Live Server)
-   API keys for desired services:
    -   AIPipe Token (recommended) or OpenAI API Key
    -   Google Custom Search API Key (optional, for real search)

## 🛠️ Installation

1.  **Clone or Download**
    
    ```bash
    # Clone the repository
    git clone <repository-url>
    cd agentic-chatbot
    
    # Or create directory and download files
    mkdir agentic-chatbot
    cd agentic-chatbot
    # Download index.html and app.js
    ```

2.  **Start Local Server**
    
    Choose one of the following methods:
    
    **Python (recommended):**
    
    ```bash
    # Python 3
    python -m http.server 8000
    
    # Python 2
    python -M SimpleHTTPServer 8000
    ```
    
    **Node.js:**
    
    ```bash
    npx http-server -p 8000
    ```
    
    **VS Code Live Server:**
    
    -   Install "Live Server" extension
    -   Right-click `index.html` → "Open with Live Server"

3.  **Open in Browser**
    
    Navigate to `http://localhost:8000` in your web browser.

## ⚙️ Configuration

### LLM Provider Setup

#### Option 1: AIPipe (Recommended)

1.  Visit aipipe.org
2.  Sign up and get your API token
3.  In the app:
    -   Select "AIPipe" as provider
    -   Enter your token in "API Key" field
    -   Choose model (`gpt-4o-mini` recommended for cost efficiency)
    -   Click "Test" to verify connection

#### Option 2: OpenAI

1.  Visit platform.openai.com
2.  Create account and get API key
3.  In the app:
    -   Select "OpenAI" as provider
    -   Enter your API key
    -   Choose model
    -   Click "Test" to verify connection

### Google Search API Setup (Optional)

For real Google Search functionality:

1.  **Get Google API Key**
    -   Go to Google Cloud Console
    -   Create new project or select existing
    -   Enable "Custom Search API":
        -   Navigate to "APIs & Services" → "Library"
        -   Search for "Custom Search API" and enable it
    -   Create credentials:
        -   Go to "APIs & Services" → "Credentials"
        -   Click "Create Credentials" → "API Key"
    -   Copy the generated key
2.  **Create Custom Search Engine**
    -   Visit Google Custom Search
    -   Click "Add" to create new search engine
    -   Configure:
        -   Sites to search: Enter `*.com` (or specific sites)
        -   Name: Choose a descriptive name
    -   After creation, go to "Control Panel"
    -   Copy the "Search engine ID" (CX ID)
3.  **Configure in App**
    -   Enter Google API Key in "Google API Key" field
    -   Enter CX ID in "Custom Search Engine ID" field

## 📖 Usage

### Basic Usage

1.  Configure your LLM provider (see Configuration section)
2.  Start chatting by typing in the input field
3.  Watch the agent work as it breaks down tasks and uses tools
4.  Get completion confirmation when all tasks are finished

### Example Interactions

**Search Tasks**
-   "Search for the latest AI news and summarize the top 3 articles"
-   "Find information about Python programming best practices"
-   "Look up weather in New York and plan outdoor activities"

**Calculation Tasks**
-   "Calculate 15% tip on a $84.50 bill"
-   "Generate the first 15 Fibonacci numbers"
-   "Sort this array in ascending order: [64, 34, 25, 12, 22, 11, 90]"

**Complex Multi-Tool Tasks**
-   "Search for current Bitcoin price, then calculate how much 0.5 BTC would be worth"
-   "Find the population of Tokyo and calculate population density per square kilometer"
-   "Look up JavaScript array methods and show me examples of map, filter, and reduce"

**AI Reasoning Tasks**
-   "Write a business plan outline for a food delivery startup"
-   "Explain quantum computing in simple terms"
-   "Create a study schedule for learning web development in 3 months"

### Demo Mode

If no LLM is configured, the app runs in demo mode:
-   Test JavaScript execution: "calculate fibonacci"
-   Test search simulation: "search for something"
-   Test tool integration: "sort an array"

## 📁 File Structure
agentic-chatbot/
├── index.html # Main HTML file with UI
├── app.js # Core application logic
└── README.md # This file


### Key Components

-   `AgenticChatBot`: Main class handling the application
-   `Agentic Loop`: Core logic for autonomous task execution
-   `Tool System`: Pluggable tools (Search, JavaScript, AI tasks)
-   `LLM Integration`: OpenAI-compatible API interface
-   `UI Components`: Bootstrap-based responsive interface

## 🔧 Troubleshooting

### Common Issues

**"Test button not working"**
-   **Cause**: CORS restrictions in browser
-   **Solution**: Skip test and try chatting directly - it often works even when test fails

**"LLM not responding"**
-   Check API key is correct
-   Verify you have credits/quota remaining
-   Try different model (`gpt-4o-mini` is most reliable)

**"Google Search not working"**
-   Verify both API key and CX ID are entered
-   Check Google Cloud Console for API usage/errors
-   Ensure Custom Search API is enabled

**"JavaScript execution shows undefined"**
-   Code should include `return` statements for values
-   Use objects for multiple results: `return { result: value }`

### Network Issues

If you encounter CORS or network errors:
-   Make sure you're using a local server (not opening the HTML file directly)
-   Try a different LLM provider
-   Check the browser console for detailed error messages

## 🎯 Advanced Features

### Tool Development

To add new tools, extend the tools array in `setupTools()`:

```javascript
{
  type: "function",
  function: {
    name: "your_tool_name",
    description: "Description of what your tool does",
    parameters: {
      type: "object",
      properties: {
        param1: {
          type: "string",
          description: "Parameter description"
        }
      },
      required: ["param1"]
    }
  }
}
Then implement the tool in the executeTool() method. ```

## Customization
Styling: Modify CSS in the <style> section of the HTML file
Models: Add new models to the <select> options
Providers: Add new LLM providers in the updateConfig() method
Loop Limits: Adjust maxLoops in the agenticLoop() method
##🔐 Security Notes
API Keys: Never commit API keys to version control.
JavaScript Execution: Code runs in a browser context - generally safe but avoid sensitive operations.
Input Validation: User inputs are processed by the LLM - standard web security practices apply.
## 📊 API Usage & Costs
AIPipe
Pricing: Pay-per-use, typically cheaper than direct OpenAI
Models: Access to latest GPT models
Benefits: Simplified billing, no separate OpenAI account needed
OpenAI Direct
Pricing: Per token usage
Models: Full range of GPT models
Benefits: Direct access, full control
Google Custom Search
Free Tier: 100 queries/day
Paid: $5 per 1000 queries
Alternative: Use mock search for development
## 🤝 Contributing
Fork the repository
Create your feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request
## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments
AIPipe for simplified LLM access
Bootstrap for responsive UI components
OpenAI for powerful language models
Google Custom Search for web search capabilities
## 📞 Support
If you encounter issues:

Check this README and the troubleshooting section
Review the browser console for error messages
Verify API keys and configurations
Try demo mode to test basic functionality
Happy Chatting with your AI Agent! 🤖
