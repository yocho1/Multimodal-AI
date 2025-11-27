import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import List, Optional
import os
import uuid
import aiofiles

from src.models.schemas import (
    EmbeddingRequest, 
    EmbeddingResponse,
    SearchQuery,
    SearchResult,
    RAGRequest,
    RAGResponse,
    BatchProcessRequest
)
from src.services.embedding_service import embedding_service
from src.services.rag_service import rag_service
from src.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

# Temporary storage for uploaded files
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def save_upload_file(upload_file: UploadFile) -> str:
    """Save uploaded file and return path"""
    file_extension = upload_file.filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await upload_file.read()
        await out_file.write(content)
    
    return file_path

@router.post("/embeddings", response_model=EmbeddingResponse)
async def generate_embeddings(
    background_tasks: BackgroundTasks,
    text: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None)
):
    """Generate embeddings for text and/or image"""
    try:
        image_path = None
        if image:
            # Validate image type
            if image.content_type not in settings.ALLOWED_IMAGE_TYPES:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Image type {image.content_type} not allowed"
                )
            image_path = await save_upload_file(image)
            # Schedule cleanup
            background_tasks.add_task(lambda: os.remove(image_path) if os.path.exists(image_path) else None)

        embedding_data = await embedding_service.generate_embedding(
            text=text,
            image_path=image_path
        )

        return EmbeddingResponse(**embedding_data)

    except Exception as e:
        logger.error(f"Error generating embeddings: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/search", response_model=List[SearchResult])
async def hybrid_search(
    background_tasks: BackgroundTasks,
    query_text: Optional[str] = Form(None),
    query_image: Optional[UploadFile] = File(None),
    top_k: int = Form(10)
):
    """Hybrid search using text and/or image"""
    try:
        logger.info(f"Received search request: text={query_text}, top_k={top_k}")
        
        image_path = None
        if query_image:
            # Save uploaded image temporarily
            image_path = await save_upload_file(query_image)
            # Schedule cleanup
            background_tasks.add_task(lambda: os.remove(image_path) if os.path.exists(image_path) else None)

        # Perform search
        results = await rag_service.hybrid_search(
            query_text=query_text,
            query_image_path=image_path,
            top_k=top_k
        )

        logger.info(f"Search completed with {len(results)} results")
        return results

    except Exception as e:
        logger.error(f"Error in hybrid search: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/documents")
async def add_document(
    content: str = Form(...),
    media_type: str = Form(...),
    image: Optional[UploadFile] = File(None)
):
    """Add document to vector store"""
    try:
        image_path = None
        if image:
            image_path = await save_upload_file(image)

        # Generate embedding
        embedding_data = await embedding_service.generate_embedding(
            text=content,
            image_path=image_path
        )

        # Add to vector store
        doc_id = await rag_service.add_document(
            content=content,
            media_type=embedding_data["media_type"],
            embedding=embedding_data["embedding"],
            metadata={"user_uploaded": True}
        )

        return {"document_id": doc_id, "status": "success"}

    except Exception as e:
        logger.error(f"Error adding document: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Multimodal AI Backend",
        "version": settings.VERSION
    }
async def save_upload_file(upload_file: UploadFile) -> str:
    """Save uploaded file and return path"""
    import uuid
    import aiofiles
    
    file_extension = upload_file.filename.split('.')[-1] if upload_file.filename else 'jpg'
    filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await upload_file.read()
        await out_file.write(content)
    
    return file_path