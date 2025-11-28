import logging
import chromadb
import numpy as np
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
from src.core.config import settings
from src.models.schemas import MediaType, SearchResult
from .embedding_service import embedding_service
from .text_processor import text_processor

logger = logging.getLogger(__name__)

class HybridRAGService:
    def __init__(self):
        self.client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIRECTORY)
        self.collection = self._get_or_create_collection()
        logger.info("Hybrid RAG service initialized")

    def _get_or_create_collection(self) -> chromadb.Collection:
        """Get or create ChromaDB collection"""
        try:
            return self.client.get_collection("multimodal_rag")
        except:
            return self.client.create_collection(
                name="multimodal_rag",
                metadata={"description": "Multimodal RAG collection"}
            )

    async def add_document(
        self,
        content: str,
        media_type: MediaType,
        embedding: List[float],
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Add document to vector store"""
        try:
            doc_id = str(uuid.uuid4())
            
            default_metadata = {
                "media_type": media_type,
                "created_at": datetime.now().isoformat(),
                "content_preview": content[:100] + "..." if len(content) > 100 else content
            }
            
            if metadata:
                default_metadata.update(metadata)

            self.collection.add(
                documents=[content],
                embeddings=[embedding],
                metadatas=[default_metadata],
                ids=[doc_id]
            )
            
            logger.info(f"Added document {doc_id} to vector store")
            return doc_id
            
        except Exception as e:
            logger.error(f"Error adding document: {str(e)}")
            raise

    async def hybrid_search(
        self,
        query_text: Optional[str] = None,
        query_image_path: Optional[str] = None,
        top_k: int = 10
    ) -> List[SearchResult]:
        """Perform hybrid search using text and/or image"""
        try:
            # Generate query embedding
            embedding_data = await embedding_service.generate_embedding(
                text=query_text,
                image_path=query_image_path
            )
            query_embedding = embedding_data["embedding"]

            # Search in vector store
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                include=["metadatas", "documents", "distances"]
            )

            # Convert to SearchResult objects
            search_results = []
            for i, (doc, metadata, distance) in enumerate(zip(
                results['documents'][0],
                results['metadatas'][0],
                results['distances'][0]
            )):
                # Convert distance to similarity score
                similarity_score = 1 - (distance / 2)  # Chroma uses L2 distance
                
                search_results.append(SearchResult(
                    id=results['ids'][0][i],
                    content=doc,
                    media_type=metadata.get('media_type', MediaType.TEXT),
                    similarity_score=similarity_score,
                    metadata=metadata
                ))

            return search_results

        except Exception as e:
            logger.error(f"Error in hybrid search: {str(e)}")
            raise

    async def multimodal_rag(
        self,
        query: str,
        context_images: Optional[List[str]] = None,
        hybrid_search: bool = True,
        top_k: int = 5
    ) -> Dict[str, Any]:
        """Multimodal RAG with text and image context"""
        import time
        start_time = time.time()

        try:
            # Perform search
            search_results = await self.hybrid_search(
                query_text=query,
                query_image_path=context_images[0] if context_images else None,
                top_k=top_k
            )

            # Prepare context from search results
            context = self._prepare_context(search_results)
            
            # Generate answer (in real implementation, use LLM like GPT-4)
            answer = await self._generate_answer(query, context, context_images)
            
            processing_time = time.time() - start_time

            return {
                "answer": answer,
                "sources": search_results,
                "processing_time": processing_time
            }

        except Exception as e:
            logger.error(f"Error in multimodal RAG: {str(e)}")
            raise

    def _prepare_context(self, search_results: List[SearchResult]) -> str:
        """Prepare context from search results"""
        context_parts = []
        
        for i, result in enumerate(search_results[:3]):  # Top 3 results
            context_parts.append(
                f"Source {i+1} ({result.media_type}): {result.content}"
            )
        
        return "\n\n".join(context_parts)

    async def _generate_answer(
        self, 
        query: str, 
        context: str,
        context_images: Optional[List[str]] = None
    ) -> str:
        """Generate more intelligent answers based on context"""
        
        # Check if we have relevant context
        if not context or "Source" not in context:
            return f"I couldn't find specific information about '{query}' in my knowledge base. Try adding more documents or asking about topics related to multimodal AI, images, or text processing."
        
        # Analyze the query type and provide more contextual responses
        query_lower = query.lower()
        
        # Personal questions
        if any(word in query_lower for word in ['name', 'call', 'who are', 'your name']):
            return "I'm your Multimodal AI Assistant! I can help you search through documents and images in your knowledge base. While I don't store personal information between conversations, I'm here to help you find information using both text and visual content."
        
        # Greeting questions
        if any(word in query_lower for word in ['hello', 'hi', 'hey', 'greetings']):
            return "Hello! I'm your Multimodal AI Assistant. I can help you search through your knowledge base containing documents and images. What would you like to know about?"
        
        # Question about capabilities
        if any(word in query_lower for word in ['what can you do', 'help', 'capabilities', 'features']):
            return "I'm a Multimodal AI Assistant that can:\n• Search through your documents and images\n• Understand both text and visual content\n• Find similar content using AI embeddings\n• Answer questions based on your knowledge base\n• Help you organize and retrieve information across different media types"
        
        # Question about the system
        if any(word in query_lower for word in ['multimodal', 'ai', 'system', 'how does this work']):
            return "This system uses Multimodal AI to understand both text and images. It creates numerical representations (embeddings) of your content and can find similar items using vector similarity search. The RAG (Retrieval Augmented Generation) system retrieves relevant information from your knowledge base to answer questions."
        
        # Default intelligent response based on context
        context_preview = context[:300] + "..." if len(context) > 300 else context
        
        return f"""Based on the information in my knowledge base, I found some relevant content that might help answer your question about "{query}".

Here's what I found:
{context_preview}

This information comes from the documents and images in your knowledge base. The system found these sources to be relevant to your query.

Is there anything specific about this information you'd like me to explain further?"""

# Singleton instance
rag_service = HybridRAGService()