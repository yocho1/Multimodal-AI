import React, { useState } from 'react';
import { useMultimodalAI } from '../../hooks/useMultimodalAI';
import { FileUpload } from '../common/FileUpload';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Brain, FileText, Image, Code } from 'lucide-react';

export const EmbeddingsGenerator: React.FC = () => {
  const { generateEmbeddings, loading, error } = useMultimodalAI();
  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!text && !image) {
      alert('Please enter text or upload an image!');
      return;
    }

    const embeddings = await generateEmbeddings(text, image || undefined);
    if (embeddings) {
      setResult(embeddings);
    }
  };

  const handleClear = () => {
    setText('');
    setImage(null);
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-gradient-to-r from-ai-purple to-ai-pink rounded-2xl">
            <Brain className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-ai-purple to-ai-pink bg-clip-text text-transparent">
          Multimodal Embeddings
        </h1>
        <p className="text-gray-600 text-lg">
          Generate AI embeddings from text, images, or both!
        </p>
      </div>

      {/* Input Section */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Text Input */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-ai-blue" />
            <h3 className="text-lg font-semibold text-gray-800">Text Input</h3>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to generate embeddings... (e.g., 'A beautiful sunset over mountains')"
            className="w-full h-48 px-4 py-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-ai-blue focus:border-transparent transition-all"
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Image className="h-5 w-5 text-ai-pink" />
            <h3 className="text-lg font-semibold text-gray-800">Image Upload</h3>
          </div>
          <FileUpload onFileSelect={setImage} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleGenerate}
          disabled={loading || (!text && !image)}
          className="px-8 py-3 bg-gradient-to-r from-ai-purple to-ai-pink text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform shadow-lg"
        >
          {loading ? 'Generating...' : 'Generate Embeddings'}
        </button>
        
        <button
          onClick={handleClear}
          className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-medium">Error: {error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="AI is thinking..." />
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-6">
          <div className="flex items-center justify-center space-x-2">
            <Code className="h-6 w-6 text-green-500" />
            <h3 className="text-2xl font-bold text-gray-800">Embeddings Generated!</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Embedding Info */}
            <div className="col-span-1 space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
                <h4 className="font-semibold text-gray-800">Embedding Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Media Type:</span>
                    <span className="font-medium capitalize">{result.media_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dimensions:</span>
                    <span className="font-medium">{result.dimensions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Model:</span>
                    <span className="font-medium text-xs">{result.model_used}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Embedding Visualization */}
            <div className="col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-800 mb-4">Embedding Vector</h4>
                <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(result.embedding, null, 2)}
                  </pre>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {result.embedding.length}-dimensional vector
                </p>
              </div>
            </div>
          </div>

          {/* Visual Representation */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
            <h4 className="font-semibold text-gray-800 mb-4">What does this mean?</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-2xl mb-2">🔢</div>
                <p className="font-medium">Numeric Representation</p>
                <p className="text-gray-600 text-xs mt-1">
                  Your input is converted to {result.dimensions} numbers
                </p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-2xl mb-2">🧠</div>
                <p className="font-medium">AI Understanding</p>
                <p className="text-gray-600 text-xs mt-1">
                  The AI understands the semantic meaning
                </p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-2xl mb-2">🔍</div>
                <p className="font-medium">Similarity Search</p>
                <p className="text-gray-600 text-xs mt-1">
                  Can find similar content using these numbers
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};