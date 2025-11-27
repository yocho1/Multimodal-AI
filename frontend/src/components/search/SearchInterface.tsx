import React, { useState } from 'react';
import { useMultimodalAI } from '../../hooks/useMultimodalAI';
import { FileUpload } from '../common/FileUpload';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Search, Image, FileText, Star, Download } from 'lucide-react';

export const SearchInterface: React.FC = () => {
  const { hybridSearch, loading, error } = useMultimodalAI();
  const [queryText, setQueryText] = useState('');
  const [queryImage, setQueryImage] = useState<File | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [topK, setTopK] = useState(10);

  const handleSearch = async () => {
    if (!queryText && !queryImage) {
      alert('Please enter text or upload an image to search!');
      return;
    }

    const searchResults = await hybridSearch(queryText, queryImage || undefined, topK);
    if (searchResults) {
      setResults(searchResults);
    }
  };

  const handleClear = () => {
    setQueryText('');
    setQueryImage(null);
    setResults([]);
  };

  const getSimilarityColor = (score: number) => {
    if (score > 0.8) return 'text-green-600';
    if (score > 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSimilarityBg = (score: number) => {
    if (score > 0.8) return 'bg-green-100 border-green-200';
    if (score > 0.6) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-gradient-to-r from-ai-blue to-ai-purple rounded-2xl">
            <Search className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-ai-blue to-ai-purple bg-clip-text text-transparent">
          Hybrid Search
        </h1>
        <p className="text-gray-600 text-lg">
          Search using text, images, or both to find similar content!
        </p>
      </div>

      {/* Search Inputs */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Text Search */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-ai-blue" />
            <h3 className="text-lg font-semibold text-gray-800">Text Search</h3>
          </div>
          <textarea
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="What are you looking for? (e.g., 'fluffy cats', 'sunset beaches', 'technical documents')"
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-ai-blue focus:border-transparent transition-all"
          />
        </div>

        {/* Image Search */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Image className="h-5 w-5 text-ai-pink" />
            <h3 className="text-lg font-semibold text-gray-800">Image Search</h3>
          </div>
          <FileUpload onFileSelect={setQueryImage} />
        </div>
      </div>

      {/* Search Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">
              Number of results:
            </label>
            <select
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-ai-blue focus:border-transparent"
            >
              <option value={5}>5 results</option>
              <option value={10}>10 results</option>
              <option value={20}>20 results</option>
              <option value={50}>50 results</option>
            </select>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleSearch}
              disabled={loading || (!queryText && !queryImage)}
              className="px-6 py-3 bg-gradient-to-r from-ai-blue to-ai-purple text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform shadow-lg flex items-center space-x-2"
            >
              <Search className="h-4 w-4" />
              <span>{loading ? 'Searching...' : 'Search'}</span>
            </button>
            
            <button
              onClick={handleClear}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Clear
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

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Searching through knowledge..." />
        </div>
      )}

      {/* Results */}
      {results.length > 0 && !loading && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-800">
              Found {results.length} Results
            </h3>
            <div className="text-sm text-gray-600">
              Sorted by relevance
            </div>
          </div>

          <div className="grid gap-6">
            {results.map((result, index) => (
              <div
                key={result.id}
                className={`bg-white rounded-xl border-2 p-6 transition-all hover:shadow-lg ${getSimilarityBg(result.similarity_score)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className={`font-semibold ${getSimilarityColor(result.similarity_score)}`}>
                        {(result.similarity_score * 100).toFixed(1)}% Match
                      </span>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                      {result.media_type}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Rank #{index + 1}
                  </div>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {result.content}
                  </p>
                </div>

                {result.metadata && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(result.metadata).map(([key, value]) => (
                        <span
                          key={key}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                        >
                          {key}: {String(value)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {results.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Ready to Search!
            </h3>
            <p className="text-gray-500">
              Enter some text or upload an image to find similar content in the knowledge base.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};