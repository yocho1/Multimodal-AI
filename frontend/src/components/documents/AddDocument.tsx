import React, { useState } from 'react';
import { useMultimodalAI } from '../../hooks/useMultimodalAI';
import { FileUpload } from '../common/FileUpload';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Plus, FileText, Image, CheckCircle } from 'lucide-react';

export const AddDocument: React.FC = () => {
  const { addDocument, loading, error } = useMultimodalAI();
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'text' | 'image' | 'multimodal'>('text');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() && !image) {
      alert('Please enter content or upload an image!');
      return;
    }

    // Determine media type
    let actualMediaType = mediaType;
    if (content && image) {
      actualMediaType = 'multimodal';
    } else if (image) {
      actualMediaType = 'image';
    } else {
      actualMediaType = 'text';
    }

    const success = await addDocument(content, actualMediaType, image || undefined);
    
    if (success) {
      setSuccess(true);
      setContent('');
      setImage(null);
      setMediaType('text');
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleClear = () => {
    setContent('');
    setImage(null);
    setMediaType('text');
    setSuccess(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl">
            <Plus className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
          Add to Knowledge Base
        </h2>
        <p className="text-gray-600">
          Add documents, images, or both to make them searchable!
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <div>
            <p className="text-green-800 font-medium">Success!</p>
            <p className="text-green-600 text-sm">Document added to search database</p>
          </div>
        </div>
      )}

      {/* Content Input */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-800">Content</h3>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter text content... (e.g., 'A beautiful baby playing with toys in the garden')"
          className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Image Upload */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Image className="h-5 w-5 text-pink-500" />
          <h3 className="text-lg font-semibold text-gray-800">Image (Optional)</h3>
        </div>
        <FileUpload onFileSelect={setImage} />
      </div>

      {/* Media Type Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Content Type
        </label>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'text' as const, label: 'Text Only', icon: FileText, color: 'blue' },
            { value: 'image' as const, label: 'Image Only', icon: Image, color: 'pink' },
            { value: 'multimodal' as const, label: 'Text + Image', icon: Plus, color: 'purple' },
          ].map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setMediaType(option.value)}
                className={`
                  p-4 border-2 rounded-xl text-center transition-all
                  ${mediaType === option.value
                    ? `border-${option.color}-500 bg-${option.color}-50 text-${option.color}-700`
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }
                `}
              >
                <Icon className={`h-6 w-6 mx-auto mb-2 ${
                  mediaType === option.value ? `text-${option.color}-500` : 'text-gray-400'
                }`} />
                <div className="text-sm font-medium">{option.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleSubmit}
          disabled={loading || (!content.trim() && !image)}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform shadow-lg flex items-center space-x-2"
        >
          {loading ? <LoadingSpinner size="sm" /> : <Plus className="h-4 w-4" />}
          <span>{loading ? 'Adding...' : 'Add to Database'}</span>
        </button>
        
        <button
          onClick={handleClear}
          className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-medium">Error: {error}</p>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-800 mb-2">How this works:</h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Add text, images, or both to your search database</li>
          <li>• The AI will generate embeddings and store them</li>
          <li>• You can then search for similar content</li>
          <li>• Each addition makes your search smarter! 🧠</li>
        </ul>
      </div>
    </div>
  );
};