import logging
import numpy as np
from typing import List, Optional, Dict, Any
from src.core.config import settings
from src.models.schemas import MediaType
from .image_processor import image_processor
from .text_processor import text_processor

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        self.embedding_dim = settings.EMBEDDING_DIM
        logger.info("Embedding service initialized")

    async def generate_embedding(
        self, 
        text: Optional[str] = None, 
        image_path: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate embeddings for text, image, or both"""
        try:
            text_embedding = None
            image_embedding = None
            media_type = None

            # Process text
            if text:
                text_embedding = text_processor.encode_text(text)[0]
                media_type = MediaType.TEXT

            # Process image
            if image_path:
                image_embedding = await image_processor.extract_embeddings(image_path)
                if media_type:
                    media_type = MediaType.MULTIMODAL
                else:
                    media_type = MediaType.IMAGE

            # Combine embeddings if multimodal
            if text_embedding is not None and image_embedding is not None:
                # Simple concatenation and normalization
                combined_embedding = np.concatenate([text_embedding, image_embedding])
                combined_embedding = combined_embedding / np.linalg.norm(combined_embedding)
                final_embedding = combined_embedding.tolist()
            elif text_embedding is not None:
                final_embedding = text_embedding.tolist()
            elif image_embedding is not None:
                final_embedding = image_embedding.tolist()
            else:
                raise ValueError("Either text or image_path must be provided")

            return {
                "embedding": final_embedding,
                "media_type": media_type,
                "model_used": f"{settings.TEXT_MODEL_NAME}+{settings.IMAGE_MODEL_NAME}",
                "dimensions": len(final_embedding)
            }

        except Exception as e:
            logger.error(f"Error generating embedding: {str(e)}")
            raise

    async def batch_generate_embeddings(
        self, 
        items: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Generate embeddings for multiple items"""
        results = []
        for item in items:
            try:
                embedding_data = await self.generate_embedding(
                    text=item.get('text'),
                    image_path=item.get('image_path')
                )
                results.append(embedding_data)
            except Exception as e:
                logger.error(f"Error processing item: {str(e)}")
                results.append(None)
        
        return results

# Singleton instance
embedding_service = EmbeddingService()