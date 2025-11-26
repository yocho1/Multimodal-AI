import logging
import numpy as np
from PIL import Image
import cv2
import aiofiles
import os
import io
from typing import List, Optional, Tuple
from transformers import ViTImageProcessor, ViTModel
import torch
from src.core.config import settings

logger = logging.getLogger(__name__)

class ImageProcessor:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Using device: {self.device}")
        
        # Load processor and model
        self.processor = ViTImageProcessor.from_pretrained(settings.IMAGE_MODEL_NAME)
        self.model = ViTModel.from_pretrained(settings.IMAGE_MODEL_NAME)
        self.model.to(self.device)
        self.model.eval()
        
        logger.info(f"Image processor initialized with model: {settings.IMAGE_MODEL_NAME}")

    async def load_image(self, image_path: str) -> Optional[Image.Image]:
        """Load and validate image"""
        try:
            async with aiofiles.open(image_path, 'rb') as file:
                image_data = await file.read()
            
            image = Image.open(io.BytesIO(image_data))
            if image.mode != 'RGB':
                image = image.convert('RGB')
            return image
        except Exception as e:
            logger.error(f"Error loading image {image_path}: {str(e)}")
            return None

    def preprocess_image(self, image: Image.Image) -> torch.Tensor:
        """Preprocess image for ViT model"""
        try:
            inputs = self.processor(images=image, return_tensors="pt")
            return inputs.pixel_values.to(self.device)
        except Exception as e:
            logger.error(f"Error preprocessing image: {str(e)}")
            raise

    async def extract_embeddings(self, image_path: str) -> Optional[np.ndarray]:
        """Extract embeddings from image using Vision Transformer"""
        try:
            image = await self.load_image(image_path)
            if image is None:
                return None

            # Preprocess
            inputs = self.preprocess_image(image)
            
            # Extract features
            with torch.no_grad():
                outputs = self.model(**inputs)
                embeddings = outputs.last_hidden_state[:, 0, :].cpu().numpy()
            
            # Normalize embeddings
            embeddings = embeddings / np.linalg.norm(embeddings, axis=1, keepdims=True)
            return embeddings[0]  # Return first (and only) embedding
        
        except Exception as e:
            logger.error(f"Error extracting embeddings from {image_path}: {str(e)}")
            return None

    async def extract_features_batch(self, image_paths: List[str]) -> List[Optional[np.ndarray]]:
        """Process multiple images in batch"""
        embeddings = []
        for path in image_paths:
            embedding = await self.extract_embeddings(path)
            embeddings.append(embedding)
        return embeddings

    def image_similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """Calculate cosine similarity between two image embeddings"""
        return float(np.dot(embedding1, embedding2))

# Singleton instance
image_processor = ImageProcessor()