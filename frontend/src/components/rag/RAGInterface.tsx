import React, { useState, useRef, useEffect } from 'react';
import { useMultimodalAI } from '../../hooks/useMultimodalAI';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Send, Brain, BookOpen, Zap, User, Bot } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: any[];
}

export const RAGInterface: React.FC = () => {
  const { askRAG, loading, error } = useMultimodalAI();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [topK, setTopK] = useState(5);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!query.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = query;
    setQuery('');

    // Get AI response
    const response = await askRAG(currentQuery, topK);
    
    if (response) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.answer,
        timestamp: new Date(),
        sources: response.sources,
      };
      setMessages(prev => [...prev, assistantMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-gradient-to-r from-ai-pink to-ai-purple rounded-2xl">
            <Brain className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-ai-pink to-ai-purple bg-clip-text text-transparent">
          AI Assistant
        </h1>
        <p className="text-gray-600 text-lg">
          Ask questions and get answers using our multimodal knowledge base!
        </p>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-ai-pink to-ai-purple p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bot className="h-6 w-6" />
              <div>
                <h3 className="text-lg font-semibold">Multimodal AI Assistant</h3>
                <p className="text-pink-100 text-sm">Powered by RAG</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm">Sources:</label>
                <select
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value))}
                  className="bg-white/20 border border-white/30 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-white"
                >
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                </select>
              </div>
              <button
                onClick={clearChat}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
              >
                Clear Chat
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-6 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Start a Conversation!
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Ask me anything about the content in our knowledge base. I can help you find information using both text and images!
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div className="text-left p-3 bg-white rounded-lg border">
                  <Zap className="h-4 w-4 text-blue-500 mb-1" />
                  <p className="font-medium">Ask questions</p>
                  <p className="text-gray-600">"What is multimodal AI?"</p>
                </div>
                <div className="text-left p-3 bg-white rounded-lg border">
                  <Brain className="h-4 w-4 text-purple-500 mb-1" />
                  <p className="font-medium">Get explanations</p>
                  <p className="text-gray-600">"Explain how embeddings work"</p>
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex space-x-4 ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-ai-blue to-ai-purple text-white'
                      : 'bg-gradient-to-r from-ai-pink to-ai-purple text-white'
                  }`}
                >
                  {message.type === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={`flex-1 max-w-3xl ${
                    message.type === 'user' ? 'text-right' : ''
                  }`}
                >
                  <div
                    className={`inline-block px-4 py-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-ai-blue to-ai-purple text-white'
                        : 'bg-white border border-gray-200 text-gray-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {/* Timestamp */}
                  <div
                    className={`text-xs text-gray-500 mt-1 ${
                      message.type === 'user' ? 'text-right' : ''
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </div>

                  {/* Sources for assistant messages */}
                  {message.type === 'assistant' && message.sources && message.sources.length > 0 && (
                    <div className="mt-3 text-left">
                      <p className="text-xs text-gray-500 font-medium mb-2">
                        Sources used ({message.sources.length}):
                      </p>
                      <div className="space-y-2">
                        {message.sources.slice(0, 3).map((source, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-gray-700">
                                Source {index + 1}
                              </span>
                              <span className="text-xs text-gray-500">
                                {(source.similarity_score * 100).toFixed(1)}% match
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {source.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-ai-pink to-ai-purple text-white flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                  <LoadingSpinner size="sm" text="Thinking..." />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex space-x-4">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about the knowledge base..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-ai-purple focus:border-transparent transition-all"
              rows={2}
            />
            <button
              onClick={handleSend}
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-gradient-to-r from-ai-pink to-ai-purple text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform flex items-center space-x-2 self-end"
            >
              <Send className="h-4 w-4" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-medium">Error: {error}</p>
        </div>
      )}
    </div>
  );
};