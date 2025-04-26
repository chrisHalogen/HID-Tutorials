# 🚀 AI Chat Application with Django & React (Vite)

Build a beautiful AI-powered chat application using Django for the backend and React (Vite) for the frontend. This tutorial will guide you through creating a DeepSeek-like interface with Markdown rendering for AI responses.

## 🌟 Features
- Modern UI with Material-UI
- Gemini AI integration
- Markdown rendering (tables, code blocks, lists)


## 📋 Prerequisites
Before starting, ensure you have:
- Python 3.8+ and Node.js 16+
- Basic knowledge of Django and React
- Google AI Studio account (for Gemini API key) - There's a free tier
- Code editor (VS Code recommended)

## 📺 YouTube Tutorial

Watch the full video walkthrough on YouTube:  
🎥  [COMING SOON](https://youtu.be/8yHZdCTDRi0)

## Architecture Overview

1. **Backend (Django)**:
   - REST API endpoints for prompt handling
   - Integration with AI models (you can start with simple models, then add GEN API later)
   - User session management (optional)

2. **Frontend (React)**:
   - Clean, modern chat interface
   - Prompt input area
   - Response display area
   - Loading states

## Step 1: Set Up Django Backend

### 1. Create Django Project and App
```bash
django-admin startproject aichatbackend
cd aichatbackend
python manage.py startapp chatapi
```

### 2. Install Required Packages
```bash
pip install django djangorestframework django-cors-headers
```

### 3. Configure settings.py
```python
INSTALLED_APPS = [
    # ...
    'rest_framework',
    'corsheaders',
    'chatapi',
]

MIDDLEWARE = [
    # ...
    'corsheaders.middleware.CorsMiddleware',
]

CORS_ALLOW_ALL_ORIGINS = True  # For development only
```

### 4. Create API Views (chatapi/views.py)
```python
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import time

@api_view(['POST'])
def process_prompt(request):
    prompt = request.data.get('prompt', '')
    
    # Simulate AI processing (replace with actual AI model later)
    time.sleep(1)  # Simulate processing time
    response = f"I received your prompt: '{prompt}'. This is a simulated response."
    
    return Response({'response': response}, status=status.HTTP_200_OK)
```

### 5. Set Up URLs (chatapi/urls.py)
```python
from django.urls import path
from . import views

urlpatterns = [
    path('api/process-prompt/', views.process_prompt, name='process_prompt'),
]
```

Include in main urls.py:
```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('chatapi.urls')),
]
```

## Step 2: Frontend Setup (Vite + React)

### 1. Create Vite project
```bash
npm create vite@latest aichatfrontend -- --template react
cd aichatfrontend
npm install axios @mui/material @mui/icons-material @emotion/react @emotion/styled
```

### 2. Create Chat Component (`src/ChatInterface.jsx`)
```jsx
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, TextField, Button, Paper, Typography, 
  CircularProgress, Avatar, List, ListItem, 
  ListItemAvatar, ListItemText, Divider 
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

const ChatInterface = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    const userMessage = { text: prompt, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);
    
    try {
      const response = await axios.post('http://localhost:8000/api/process-prompt/', {
        prompt: prompt
      });
      
      const aiMessage = { text: response.data.response, sender: 'ai' };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = { text: 'Error processing your request', sender: 'ai' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      maxWidth: '900px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f5f5f5'
    }}>
      <Typography variant="h4" sx={{ 
        mb: 3, 
        color: '#3f51b5',
        textAlign: 'center',
        fontWeight: 'bold'
      }}>
        AI Chat Assistant
      </Typography>
      
      <Paper elevation={3} sx={{ 
        flexGrow: 1, 
        overflow: 'auto', 
        mb: 2,
        p: 2,
        backgroundColor: 'white'
      }}>
        <List>
          {messages.map((message, index) => (
            <React.Fragment key={index}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar sx={{ 
                    bgcolor: message.sender === 'user' ? '#3f51b5' : '#4caf50'
                  }}>
                    {message.sender === 'user' ? 'U' : 'AI'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={message.sender === 'user' ? 'You' : 'AI Assistant'}
                  secondary={
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {message.text}
                    </Typography>
                  }
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
          <div ref={messagesEndRef} />
        </List>
      </Paper>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your prompt here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          sx={{ 
            mr: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: '24px',
              backgroundColor: 'white'
            }
          }}
        />
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          disabled={isLoading}
          sx={{ 
            borderRadius: '24px',
            minWidth: '56px',
            height: '56px'
          }}
        >
          <SendIcon />
        </Button>
      </Box>
    </Box>
  );
};

export default ChatInterface;
```

### 3. Update `src/App.jsx`
```jsx
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import ChatInterface from './ChatInterface';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#4caf50',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ChatInterface />
    </ThemeProvider>
  );
}

export default App;
```

### 4. Update `src/main.jsx`
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## Step 3: Run Both Servers

1. Start Django backend:
```bash
python manage.py runserver
```

2. Start Vite frontend (in another terminal):
```bash
npm run dev
```

## Step 4: Enhancements

### 1. Connect to Gemini AI
1. Get API key from [Google AI Studio](https://aistudio.google.com/)
2. Update backend view:
```python
@api_view(['POST'])
def process_prompt(request):
    prompt = request.data.get('prompt', '')
    client = genai.Client(api_key="YOUR_API_KEY")

    try:

        response = client.models.generate_content(
            model="gemini-2.0-flash", contents=prompt
        )
        ai_response = response.text
        return Response({'response': ai_response}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

### 2. Add Markdown Support for Responses

Install in React:
```bash
npm install react-markdown remark-gfm rehype-raw react-syntax-highlighter
```

Create MarkdownRenderer.jsx:
```jsx
import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism";

export default function MarkdownRenderer({ children }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        code({ node, inline, className, children: codeChildren, ...props }) {
          const match = /language-(\w+)/.exec(className || "");

          return !inline && match ? (
            <SyntaxHighlighter
              style={dracula}
              PreTag="div"
              language={match[1]}
              {...props}
            >
              {String(codeChildren).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {codeChildren}
            </code>
          );
        },

        p({ node, children, ...props }) {
          return (
            <p
              style={{ marginBottom: "0.5rem", whiteSpace: "pre-line" }}
              {...props}
            >
              {children}
            </p>
          );
        },
      }}
    >
      {children}
    </Markdown>
  );
}
```

Update ChatInterface.js:
```jsx
// Adjust as needed
import MarkdownRenderer from "./MarkdownRenderer";

// Replace the ListItemText secondary content with:
<MarkdownRenderer>
    {message.text.replace(/(\[.*?\])/g, "$1\n")}
</MarkdownRenderer>
```


## 🔍 Test Prompts
Try these 15 prompts to test different response formats:

1. ```
    List countries in Africa with their capitals
    ```  
   *(Should return Markdown table)*

2. ```python
   Write a Python function to calculate factorial
   ```

3. ```
    Create a bash script to backup my documents folder
    ```

4. ```
    Compare REST vs GraphQL in table format
    ```

5. ```
    Explain OOP principles with code examples
    ```

6. ```javascript
   Show me React hooks cheat sheet
   ```

7. ```
    Give me 5 Linux commands every developer should know
   ```

8. ```
    Write a poem about programming in Markdown format
   ```

9. ```
    Explain quantum computing like I'm 5
   ```

10. ```
    Generate a weekly workout plan in list format
    ```

11. ```sql
    Write SQL query to find duplicate records
    ```

12. ```
    Create a comparison table: Django vs Flask vs FastAPI
    ```

13. ```
    Explain blockchain technology with bullet points
    ```

14. ```dockerfile
    Show me Dockerfile for Python Django app
    ```

15. ```
    Give me 3 business ideas for AI startups
    ```

## Final Notes

1. **Styling**: The provided UI uses Material-UI for a clean, professional look. You can customize colors and styles in the theme object.

2. **Responsiveness**: The layout is responsive and works well on different screen sizes.

3. **Future Improvements**:
   - Add user authentication
   - Save chat history
   - Implement streaming responses
   - Add dark/light mode toggle
   - Implement rate limiting

4. **Deployment**: When ready to deploy, you'll need to:
   - Configure CORS properly (instead of allowing all origins)
   - Set up environment variables for API keys
   - Consider using Django Channels for WebSocket support if you want real-time streaming

This implementation gives you a solid foundation for an AI chat application with a professional UI similar to DeepSeek.

## 🎉 Conclusion
You've now built a full-stack AI chat application with:
- Django backend
- React/Vite frontend
- Gemini AI integration
- Beautiful Markdown rendering
- Professional UI

## 📢 Share This Guide
Found this useful? Share with your network:  
```
COMING_SOON_LINK
```

## 💖 Support Us
If you enjoyed this tutorial:
- ⭐ Star this repository
- 🐛 Report issues
- ✍️ Suggest improvements
- 👍 Like the video → [Watch on YouTube](https://youtu.be/8yHZdCTDRi0)  
- 🔔 Subscribe to the channel → [Halogenius Ideas](https://www.youtube.com/@halogenius-ideas)  
- 📢 Share this project on your socials

## 🙏 Thank You!
Happy coding! Let me know if you have any questions or need further enhancements.

