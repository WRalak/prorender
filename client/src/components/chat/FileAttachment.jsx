import React from 'react';
import { XMarkIcon, DocumentIcon, PhotoIcon } from '@heroicons/react/24/outline';

const FileAttachment = ({ file, onRemove }) => {
  if (!file) return null;

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <PhotoIcon className="h-8 w-8 text-blue-500" />;
    }
    return <DocumentIcon className="h-8 w-8 text-gray-500" />;
  };

  const getFileSize = (size) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else {
      return `${(size / 1024 / 1024).toFixed(1)} MB`;
    }
  };

  const getFileType = (fileType) => {
    if (fileType.startsWith('image/')) {
      return 'Image';
    } else if (fileType === 'application/pdf') {
      return 'PDF';
    } else if (fileType.includes('word')) {
      return 'Word';
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return 'Excel';
    } else if (fileType === 'text/plain') {
      return 'Text';
    }
    return 'File';
  };

  const isImage = file.type.startsWith('image/');

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      {/* File Icon */}
      <div className="flex-shrink-0">
        {isImage ? (
          <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-200 flex items-center justify-center">
            {file.type.startsWith('image/') && (
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        ) : (
          <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center">
            {getFileIcon(file.type)}
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {file.name}
          </h4>
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
            {getFileType(file.type)}
          </span>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>{getFileSize(file.size)}</span>
          <span>{file.type}</span>
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 text-gray-500"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

export default FileAttachment;