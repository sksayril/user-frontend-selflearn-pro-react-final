import React, { useState, useEffect } from 'react';
import { MessageSquare, BrainCircuit, Loader2, Lock } from 'lucide-react';
import { AIRequestPayload, AIResponse, AIMessage } from '../types/api';
import ReactMarkdown from 'react-markdown';

interface AITeacherProps {
  contentText: string;
  subCategoryName: string;
  isSubscribed: boolean;
}

/**
 * AI Teacher Component
 * Processes study material content and provides AI-powered explanations with Markdown support
 */
const AITeacher: React.FC<AITeacherProps> = ({ contentText, subCategoryName, isSubscribed }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Initial prompt to generate a response based on content
  const generateInitialPrompt = () => {
    return `Explain the key concepts of ${subCategoryName} in simple terms based on the following content. Use markdown formatting with headers (##, ###), bullet points, **bold** for important terms, and _italics_ for emphasis: ${contentText.substring(0, 1000)}...`;
  };

  // Function to toggle theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Function to process content and generate AI response
  const processContent = async () => {
    if (!isSubscribed) {
      return; // Don't process if user is not subscribed
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // API endpoint
      const apiUrl = 'https://api.a0.dev/ai/llm';
      
      // Create request payload
      const messages: AIMessage[] = [
        { 
          role: 'system', 
          content: 'You are Gami, an AI teacher assistant who explains educational concepts in a clear, concise, and helpful manner. Your explanations should be friendly, engaging, and easy to understand. Use markdown formatting with headers (##, ###), bullet points, **bold** for important terms, and _italics_ for emphasis.' 
        },
        { 
          role: 'user', 
          content: generateInitialPrompt()
        }
      ];
      
      const payload: AIRequestPayload = {
        messages,
        stream: false
      };
      
      // Make API request
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data: AIResponse = await response.json();
      
      // Extract completion from response
      if (data && data.completion) {
        setAiResponse(data.completion);
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (err) {
      console.error('Error fetching AI response:', err);
      setError('Failed to generate AI explanation. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load AI response when component is expanded
  useEffect(() => {
    if (isExpanded && !aiResponse && !isLoading && isSubscribed) {
      processContent();
    }
  }, [isExpanded, aiResponse, isLoading, isSubscribed]);

  // Don't render anything for non-authenticated or non-subscribed users
  if (isExpanded && !isSubscribed) {
    return (
      <div className={`mt-8 border rounded-xl overflow-hidden shadow-md ${
        theme === 'light' 
          ? 'border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50' 
          : 'border-gray-700 bg-gradient-to-r from-gray-900 to-indigo-900'
      }`}>
        {/* Header */}
        <div 
          className={`p-4 flex items-center justify-between cursor-pointer ${
            theme === 'light'
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
              : 'bg-gradient-to-r from-gray-800 to-indigo-800'
          }`}
          onClick={() => setIsExpanded(false)}
        >
          <div className="flex items-center">
            <BrainCircuit className="text-white mr-2 h-6 w-6" />
            <h3 className="text-white font-medium text-lg">AI Teacher - Gami</h3>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-white/20 px-3 py-1 rounded-full text-white text-sm">
              Hide
            </div>
          </div>
        </div>
        
        <div className="p-4 ai-response-appear">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Premium Feature</h3>
            <p className="text-gray-600 mb-4">
              AI Teacher is available exclusively to premium subscribers.
              Subscribe now to get AI-powered explanations of study materials.
            </p>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                // Navigate to subscription page or show subscription modal
                window.location.href = '/subscription';
              }}
            >
              Subscribe Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mt-8 border rounded-xl overflow-hidden shadow-md ${
      theme === 'light' 
        ? 'border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50' 
        : 'border-gray-700 bg-gradient-to-r from-gray-900 to-indigo-900'
    }`}>
      {/* Header */}
      <div 
        className={`p-4 flex items-center justify-between cursor-pointer ${
          theme === 'light'
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
            : 'bg-gradient-to-r from-gray-800 to-indigo-800'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <BrainCircuit className="text-white mr-2 h-6 w-6" />
          <h3 className="text-white font-medium text-lg">AI Teacher - Gami</h3>
        </div>
        <div className="flex items-center space-x-2">
          {isSubscribed && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleTheme();
              }}
              className="bg-white/20 px-2 py-1 rounded-md text-white text-xs"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? 'Dark' : 'Light'}
            </button>
          )}
          <div className="bg-white/20 px-3 py-1 rounded-full text-white text-sm">
            {isExpanded ? 'Hide' : 'Explain this topic'}
          </div>
        </div>
      </div>
      
      {/* Expanded content - only for subscribers */}
      {isExpanded && isSubscribed && (
        <div className="p-4 ai-response-appear">
          {/* AI Response Area */}
          <div className={`${
            theme === 'light'
              ? 'bg-white'
              : 'bg-gray-800 text-gray-100'
            } p-4 rounded-lg min-h-[150px] shadow-inner scrollbar`}>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-32">
                <Loader2 className={`h-10 w-10 ${
                  theme === 'light' ? 'text-blue-500' : 'text-blue-400'
                } animate-spin mb-2`} />
                <p className={`${
                  theme === 'light' ? 'text-gray-500' : 'text-gray-300'
                } animate-pulse-slow`}>
                  Generating explanation...
                </p>
              </div>
            ) : error ? (
              <div className="text-red-500 p-4 text-center">
                <p>{error}</p>
                <button 
                  onClick={processContent}
                  className={`mt-2 px-4 py-2 ${
                    theme === 'light'
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'bg-blue-900 text-blue-200 hover:bg-blue-800'
                  } rounded-md transition-colors`}
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className={`prose ${theme === 'light' ? 'prose-blue' : 'prose-invert'} max-w-none`}>
                <div className="flex items-start mb-4">
                  <div className={`${
                    theme === 'light' ? 'bg-blue-100' : 'bg-blue-900'
                  } p-2 rounded-full mr-3 flex-shrink-0`}>
                    <MessageSquare className={`h-5 w-5 ${
                      theme === 'light' ? 'text-blue-600' : 'text-blue-300'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${
                      theme === 'light' ? 'text-gray-500' : 'text-gray-300'
                    } mb-1`}>
                      AI Teacher - Gami
                    </p>
                    <div className={`${
                      theme === 'light' ? 'text-gray-800' : 'text-gray-100'
                    } ai-response-appear markdown-content`}>
                      <ReactMarkdown>
                        {aiResponse}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AITeacher; 