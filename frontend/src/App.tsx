import React, { useState } from 'react';
import { EmbeddingsGenerator } from './components/embeddings/EmbeddingsGenerator';
import { SearchInterface } from './components/search/SearchInterface';
import { RAGInterface } from './components/rag/RAGInterface';
import { AddDocument } from './components/documents/AddDocument';
import { Brain, Search, MessageSquare, Plus, Database } from 'lucide-react';

type Tab = 'embeddings' | 'search' | 'rag' | 'add-document';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('add-document'); // Start with add document

  const tabs = [
    { id: 'add-document' as Tab, name: 'Add Content', icon: Plus, description: 'Add documents to search database' },
    { id: 'embeddings' as Tab, name: 'Embeddings', icon: Brain, description: 'Generate AI embeddings' },
    { id: 'search' as Tab, name: 'Search', icon: Search, description: 'Hybrid search' },
    { id: 'rag' as Tab, name: 'AI Chat', icon: MessageSquare, description: 'Multimodal Q&A' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-ai-purple to-ai-pink rounded-xl">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-ai-purple to-ai-pink bg-clip-text text-transparent">
                  Multimodal AI
                </h1>
                <p className="text-xs text-gray-500">See + Read + Understand</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                      ${activeTab === tab.id
                        ? 'bg-gradient-to-r from-ai-purple to-ai-pink text-white shadow-lg'
                        : 'text-gray-600 hover:text-ai-purple hover:bg-white'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Content */}
        <div className="space-y-8">
          {/* Tab Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">
              {tabs.find(t => t.id === activeTab)?.name}
            </h2>
            <p className="text-gray-600">
              {tabs.find(t => t.id === activeTab)?.description}
            </p>
          </div>

          {/* Tab Components */}
          <div className="transition-all duration-300">
            {activeTab === 'add-document' && <AddDocument />}
            {activeTab === 'embeddings' && <EmbeddingsGenerator />}
            {activeTab === 'search' && <SearchInterface />}
            {activeTab === 'rag' && <RAGInterface />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;