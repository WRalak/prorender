import React, { useState, useRef, useCallback, useEffect } from 'react';
import { BoldIcon, ItalicIcon, UnderlineIcon, ListBulletIcon, LinkIcon, PhotoIcon, CodeBracketIcon, XMarkIcon } from "@heroicons/react/24/outline";

const RichTextEditor = ({
  value = '',
  onChange,
  placeholder = 'Start typing...',
  className = '',
  toolbarClassName = '',
  editorClassName = '',
  showToolbar = true,
  maxLength = 10000,
  height = '300px',
  readOnly = false,
}) => {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const editorRef = useRef(null);
  const selectionRef = useRef(null);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Save selection before any toolbar action
  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      selectionRef.current = selection.getRangeAt(0);
    }
  }, []);

  // Restore selection after toolbar action
  const restoreSelection = useCallback(() => {
    if (selectionRef.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(selectionRef.current);
    }
  }, []);

  // Execute command
  const execCommand = useCallback((command, value = null) => {
    saveSelection();
    restoreSelection();
    
    if (command === 'createLink') {
      setIsLinkModalOpen(true);
    } else {
      document.execCommand(command, false, value);
      handleChange();
    }
  }, [saveSelection, restoreSelection]);

  // Handle content change
  const handleChange = useCallback(() => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      const textContent = editorRef.current.textContent || '';
      
      // Check max length
      if (textContent.length <= maxLength) {
        onChange(content);
      } else {
        // Truncate content if it exceeds max length
        editorRef.current.textContent = textContent.substring(0, maxLength);
        onChange(editorRef.current.innerHTML);
      }
    }
  }, [onChange, maxLength]);

  // Handle link insertion
  const handleInsertLink = () => {
    if (linkUrl) {
      restoreSelection();
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      
      if (!range.collapsed) {
        // If text is selected, use it as link text
        const selectedText = range.toString();
        document.execCommand('createLink', false, linkUrl);
      } else {
        // If no text is selected, insert link with provided text
        const linkTextToUse = linkText || linkUrl;
        const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkTextToUse}</a>`;
        document.execCommand('insertHTML', false, linkHtml);
      }
      
      handleChange();
      setIsLinkModalOpen(false);
      setLinkUrl('');
      setLinkText('');
    }
  };

  // Handle image insertion
  const handleImageInsert = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imgHtml = `<img src="${e.target.result}" alt="${file.name}" style="max-width: 100%; height: auto;" />`;
          restoreSelection();
          document.execCommand('insertHTML', false, imgHtml);
          handleChange();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (readOnly) return;
    
    // Common shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        case 'k':
          e.preventDefault();
          execCommand('createLink');
          break;
      }
    }
  };

  // Toolbar buttons
  const toolbarButtons = [
    { icon: BoldIcon, command: 'bold', title: 'Bold (Ctrl+B)' },
    { icon: ItalicIcon, command: 'italic', title: 'Italic (Ctrl+I)' },
    { icon: UnderlineIcon, command: 'underline', title: 'Underline (Ctrl+U)' },
    { divider: true },
    { icon: ListBulletIcon, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: CodeBracketIcon, command: 'formatBlock', value: 'pre', title: 'Code Block' },
    { divider: true },
    { icon: LinkIcon, command: 'createLink', title: 'Link (Ctrl+K)' },
    { icon: PhotoIcon, command: 'insertImage', title: 'Image' },
  ];

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      {showToolbar && !readOnly && (
        <div className={`flex items-center space-x-1 p-2 bg-gray-50 border-b border-gray-300 ${toolbarClassName}`}>
          {toolbarButtons.map((button, index) => {
            if (button.divider) {
              return (
                <div key={`divider-${index}`} className="w-px h-6 bg-gray-300" />
              );
            }

            const Icon = button.icon;
            return (
              <button
                key={button.command}
                type="button"
                onClick={() => {
                  if (button.command === 'insertImage') {
                    handleImageInsert();
                  } else {
                    execCommand(button.command, button.value);
                  }
                }}
                className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                  button.command === 'createLink' && isLinkModalOpen ? 'bg-gray-200' : ''
                }`}
                title={button.title}
              >
                <Icon className="h-4 w-4 text-gray-700" />
              </button>
            );
          })}
        </div>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!readOnly}
        onInput={handleChange}
        onKeyDown={handleKeyDown}
        className={`p-4 min-h-[${height}] max-h-[${height}] overflow-y-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 ${editorClassName}`}
        style={{ minHeight: height, maxHeight: height }}
        dangerouslySetInnerHTML={{ __html: value }}
        suppressContentEditableWarning={true}
      />

      {/* Character Count */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-300 text-xs text-gray-500">
        {editorRef.current?.textContent?.length || 0} / {maxLength} characters
      </div>

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Insert Link</h3>
              <button
                onClick={() => {
                  setIsLinkModalOpen(false);
                  setLinkUrl('');
                  setLinkText('');
                }}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Text (optional)
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Link text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleInsertLink}
                  disabled={!linkUrl}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Insert Link
                </button>
                <button
                  onClick={() => {
                    setIsLinkModalOpen(false);
                    setLinkUrl('');
                    setLinkText('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder */}
      {!value && !readOnly && (
        <div className="absolute top-4 left-4 pointer-events-none text-gray-400">
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;