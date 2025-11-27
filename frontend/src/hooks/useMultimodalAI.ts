import { useState, useCallback } from 'react';
import { apiService, EmbeddingResponse, SearchResult, RAGResponse } from '../services/api';

export const useMultimodalAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateEmbeddings = useCallback(async (text?: string, image?: File): Promise<EmbeddingResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      
      if (text) {
        formData.append('text', text);
      }
      
      if (image) {
        formData.append('image', image);
      }

      const result = await apiService.generateEmbeddings(formData);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate embeddings');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const hybridSearch = useCallback(async (queryText?: string, queryImage?: File, topK: number = 10): Promise<SearchResult[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiService.hybridSearch({
        query_text: queryText,
        query_image: queryImage,
        top_k: topK,
      });
      return result;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Search failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const askRAG = useCallback(async (query: string, topK: number = 5): Promise<RAGResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiService.multimodalRAG({
        query,
        hybrid_search: true,
        top_k: topK,
      });
      return result;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'RAG query failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addDocument = useCallback(async (content: string, mediaType: string, image?: File): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await apiService.addDocument(content, mediaType, image);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add document');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    generateEmbeddings,
    hybridSearch,
    askRAG,
    addDocument,
    clearError: () => setError(null),
  };
};