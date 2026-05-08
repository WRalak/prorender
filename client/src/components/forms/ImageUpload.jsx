import React, { useState, useRef, useCallback } from 'react';
import { PhotoIcon, XMarkIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

const ImageUpload = ({
  images = [],
  onImagesChange,
  maxImages = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  className = "",
  showPreview = true,
  showRemove = true,
  dragAndDrop = true,
  multiple = true,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      setError(`File type ${file.type} is not supported. Please upload ${acceptedTypes.join(', ')}`);
      return false;
    }

    // Check file size
    if (file.size > maxSize) {
      setError(`File size ${file.size} exceeds maximum size of ${maxSize / 1024 / 1024}MB`);
      return false;
    }

    // Check max images limit
    if (!multiple && images.length >= 1) {
      setError('Only one image is allowed');
      return false;
    }

    if (multiple && images.length >= maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return false;
    }

    return true;
  };

  const processFiles = (files) => {
    setError('');
    const validFiles = [];
    const errors = [];

    Array.from(files).forEach((file) => {
      if (validateFile(file)) {
        validFiles.push(file);
      } else {
        errors.push(file.name);
      }
    });

    if (validFiles.length > 0) {
      setUploading(true);
      
      // Create preview URLs
      const newImages = validFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        type: file.type,
        id: Date.now() + Math.random()
      }));

      if (multiple) {
        onImagesChange([...images, ...newImages]);
      } else {
        onImagesChange(newImages);
      }

      setUploading(false);
    }

    if (errors.length > 0) {
      setError(`Failed to upload: ${errors.join(', ')}`);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [images, multiple, maxImages]);

  const handleRemove = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
          ${!dragAndDrop ? 'cursor-pointer' : 'cursor-pointer hover:border-gray-400'}
        `}
        onClick={dragAndDrop ? undefined : openFileDialog}
        onDragEnter={dragAndDrop ? handleDrag : undefined}
        onDragLeave={dragAndDrop ? handleDrag : undefined}
        onDragOver={dragAndDrop ? handleDrag : undefined}
        onDrop={dragAndDrop ? handleDrop : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center space-y-3">
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Uploading...</p>
            </>
          ) : (
            <>
              <CloudArrowUpIcon className="h-12 w-12 text-gray-400" />
              <div>
                <p className="text-gray-600">
                  {dragAndDrop ? 'Drag and drop images here, or click to select' : 'Click to select images'}
                </p>
                <p className="text-sm text-gray-500">
                  {acceptedTypes.join(', ')} • Max {maxSize / 1024 / 1024}MB each
                  {maxImages > 1 && ` • Up to ${maxImages} images`}
                </p>
              </div>
              {!dragAndDrop && (
                <button
                  type="button"
                  onClick={openFileDialog}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Select Images
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Image Previews */}
      {showPreview && images.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">
            Images ({images.length}/{maxImages})
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={image.id || index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                  <img
                    src={image.preview || image.url}
                    alt={image.name || `Image ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                
                {/* Image Info */}
                <div className="mt-2">
                  <p className="text-xs text-gray-600 truncate">
                    {image.name || `Image ${index + 1}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {image.size ? formatFileSize(image.size) : 'Unknown size'}
                  </p>
                </div>

                {/* Remove Button */}
                {showRemove && (
                  <button
                    onClick={() => handleRemove(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove image"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add More Button */}
          {multiple && images.length < maxImages && (
            <button
              type="button"
              onClick={openFileDialog}
              className="w-full py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add More Images
            </button>
          )}
        </div>
      )}

      {/* Instructions */}
      {images.length === 0 && (
        <div className="text-xs text-gray-500 text-center">
          {dragAndDrop && 'Drag images here or click to browse'}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;