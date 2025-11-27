import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, Image, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  acceptedTypes?: string;
  maxSize?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  acceptedTypes = 'image/*',
  maxSize = 50 * 1024 * 1024, // 50MB
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      onFileSelect(selectedFile);
      
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(selectedFile);
      }
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxSize,
    multiple: false,
  });

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    onFileSelect(null);
  };

  return (
    <div className="w-full">
      {!file ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
            transition-all duration-200 ease-in-out
            ${isDragActive 
              ? 'border-ai-purple bg-purple-50 scale-105' 
              : 'border-gray-300 hover:border-ai-blue hover:bg-blue-50'
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-700">
              {isDragActive ? 'Drop your file here!' : 'Upload your file'}
            </p>
            <p className="text-sm text-gray-500">
              Drag & drop or click to select
            </p>
            <p className="text-xs text-gray-400">
              Supports: JPG, PNG, GIF • Max: 50MB
            </p>
          </div>
        </div>
      ) : (
        <div className="border-2 border-green-200 bg-green-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-lg border"
                />
              ) : (
                <File className="h-12 w-12 text-green-500" />
              )}
              <div>
                <p className="font-semibold text-gray-800">{file.name}</p>
                <p className="text-sm text-gray-600">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                </p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};