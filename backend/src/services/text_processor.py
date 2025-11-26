import logging
import numpy as np
from sentence_transformers import SentenceTransformer
import torch
from typing import List, Union
from src.core.config import settings

logger = logging.getLogger(__name__)

class TextProcessor:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = SentenceTransformer(settings.TEXT_MODEL_NAME)
        self.model.to(self.device)
        
        logger.info(f"Text processor initialized with model: {settings.TEXT_MODEL_NAME}")

    def encode_text(self, text: Union[str, List[str]]) -> np.ndarray:
        """Encode text into embeddings"""
        try:
            if isinstance(text, str):
                text = [text]
            
            embeddings = self.model.encode(
                text, 
                convert_to_tensor=True, 
                device=self.device,
                normalize_embeddings=True
            )
            
            return embeddings.cpu().numpy()
        
        except Exception as e:
            logger.error(f"Error encoding text: {str(e)}")
            raise

    def semantic_similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """Calculate cosine similarity between two text embeddings"""
        return float(np.dot(embedding1, embedding2))

    def chunk_text(self, text: str, chunk_size: int = 512, overlap: int = 50) -> List[str]:
        """Split text into overlapping chunks for processing"""
        words = text.split()
        chunks = []
        
        for i in range(0, len(words), chunk_size - overlap):
            chunk = " ".join(words[i:i + chunk_size])
            chunks.append(chunk)
            
            if i + chunk_size >= len(words):
                break
        
        return chunks

# Singleton instance
text_processor = TextProcessor()