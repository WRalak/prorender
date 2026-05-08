import React, { useState, useRef } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const DragDropList = ({
  items = [],
  onItemsChange,
  renderItem,
  placeholder = "Drag and drop items here",
  className = "",
  itemClassName = "",
  dragHandle = true,
  removable = true,
  sortable = true,
}) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragItemRef = useRef(null);
  const dragOverItemRef = useRef(null);

  const handleDragStart = (e, item, index) => {
    if (!sortable) return;
    
    setDraggedItem({ item, index });
    e.dataTransfer.effectAllowed = 'move';
    
    // Store the dragged element's HTML
    const dragElement = e.target.closest('[data-drag-item]');
    if (dragElement) {
      dragItemRef.current = dragElement;
    }
  };

  const handleDragOver = (e, index) => {
    if (!sortable || !draggedItem) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnter = (e, index) => {
    if (!sortable || !draggedItem) return;
    
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = (e) => {
    // Only reset if we're actually leaving the container
    const relatedTarget = e.relatedTarget;
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e, dropIndex) => {
    if (!sortable || !draggedItem) return;
    
    e.preventDefault();
    
    const newItems = [...items];
    const draggedIndex = draggedItem.index;
    
    // Remove the dragged item
    const [removed] = newItems.splice(draggedIndex, 1);
    
    // Insert at the new position
    newItems.splice(dropIndex, 0, removed);
    
    onItemsChange(newItems);
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
    dragItemRef.current = null;
    dragOverItemRef.current = null;
  };

  const handleRemove = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    onItemsChange(newItems);
  };

  const handleAddItem = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      const newItem = e.target.value.trim();
      onItemsChange([...items, newItem]);
      e.target.value = '';
    }
  };

  const getDefaultItemContent = (item, index) => (
    <div className="flex items-center justify-between w-full">
      <span className="flex-1">{item}</span>
      {removable && (
        <button
          onClick={() => handleRemove(index)}
          className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
          title="Remove item"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Draggable Items */}
      <div className="space-y-1">
        {items.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">{placeholder}</p>
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={typeof item === 'object' ? item.id || index : index}
              data-drag-item
              className={`
                relative flex items-center p-3 bg-white border rounded-lg transition-all
                ${draggedItem?.index === index ? 'opacity-50' : ''}
                ${dragOverIndex === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                ${sortable ? 'cursor-move' : ''}
                ${itemClassName}
              `}
              draggable={sortable}
              onDragStart={(e) => handleDragStart(e, item, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              {/* Drag Handle */}
              {dragHandle && sortable && (
                <div className="mr-3 cursor-grab active:cursor-grabbing">
                  <Bars3Icon className="h-5 w-5 text-gray-400" />
                </div>
              )}

              {/* Item Content */}
              <div className="flex-1">
                {renderItem ? renderItem(item, index) : getDefaultItemContent(item, index)}
              </div>

              {/* Drag Indicator */}
              {dragOverIndex === index && (
                <div className="absolute inset-x-0 top-0 h-1 bg-blue-500 rounded-t-lg" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Add New Item Input */}
      {typeof items[0] === 'string' && (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Add new item and press Enter..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyDown={handleAddItem}
          />
        </div>
      )}

      {/* Instructions */}
      {items.length > 0 && sortable && (
        <div className="text-xs text-gray-500 text-center">
          Drag items to reorder
        </div>
      )}
    </div>
  );
};

export default DragDropList;