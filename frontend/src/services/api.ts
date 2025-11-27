import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API endpoints
export const apiEndpoints = {
  health: '/health',
  embeddings: '/embeddings',
  search: '/search',
  rag: '/rag',
  documents: '/documents',
};

// Types for our data
export interface EmbeddingRequest {
  text?: string;
  image?: File;
}

export interface EmbeddingResponse {
  embedding: number[];
  media_type: 'image' | 'text' | 'multimodal';
  model_used: string;
  dimensions: number;
}

export interface SearchQuery {
  query_text?: string;
  query_image?: File;
  top_k: number;
}

export interface SearchResult {
  id: string;
  content: string;
  media_type: 'image' | 'text' | 'multimodal';
  similarity_score: number;
  metadata: Record<string, any>;
}

export interface RAGRequest {
  query: string;
  context_images?: string[];
  hybrid_search: boolean;
  top_k: number;
}

export interface RAGResponse {
  answer: string;
  sources: SearchResult[];
  processing_time: number;
}

// API functions
export const apiService = {
  // Health check
  healthCheck: async (): Promise<any> => {
    const response = await api.get(apiEndpoints.health);
    return response.data;
  },

  // Generate embeddings
  generateEmbeddings: async (data: FormData): Promise<EmbeddingResponse> => {
    const response = await api.post(apiEndpoints.embeddings, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Hybrid search
  hybridSearch: async (query: SearchQuery): Promise<SearchResult[]> => {
    const formData = new FormData();
    
    if (query.query_text) {
      formData.append('query_text', query.query_text);
    }
    
    if (query.query_image) {
      formData.append('query_image', query.query_image);
    }
    
    formData.append('top_k', query.top_k.toString());

    const response = await api.post(apiEndpoints.search, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Multimodal RAG
  multimodalRAG: async (request: RAGRequest): Promise<RAGResponse> => {
    const response = await api.post(apiEndpoints.rag, request);
    return response.data;
  },

  // Add document
  addDocument: async (content: string, mediaType: string, image?: File): Promise<any> => {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('media_type', mediaType);
    
    if (image) {
      formData.append('image', image);
    }

    const response = await api.post(apiEndpoints.documents, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};