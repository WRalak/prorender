import React, { useState } from 'react';

const EmojiPicker = ({ onEmojiSelect, onClose }) => {
  const [category, setCategory] = useState('smileys');

  const categories = [
    { name: 'smileys', label: 'Smileys', icon: '😊' },
    { name: 'people', label: 'People', icon: '👋' },
    { name: 'animals', label: 'Animals', icon: '🐶' },
    { name: 'food', label: 'Food', icon: '🍕' },
    { name: 'activities', label: 'Activities', icon: '⚽' },
    { name: 'travel', label: 'Travel', icon: '🚗' },
    { name: 'objects', label: 'Objects', icon: '💡' },
    { name: 'symbols', label: 'Symbols', icon: '❤️' },
    { name: 'flags', label: 'Flags', icon: '🏳️' },
  ];

  const emojis = {
    smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥'],
    people: ['👋', '🤚', '🙋', '🙎', '🙅', '🙇', '💁', '🙆', '🙋', '🧏', '🙌', '👏', '🤝', '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👀', '👅', '👄'],
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🕸️'],
    food: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🥞', '🧇', '🥓', '🥔', '🍳', '🧈', '🥞', '🧇', '🥓', '🥔', '🍳', '🧈'],
    activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🏒', '🥍', '🏑', '🥌', '🥍', '🎯', '🪀', '🪁', '🎱', '🎳', '🎮', '🎰', '🎲', '🃏', '🎴', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🪘', '🎷', '🎺', '🎸', '🪕', '🪗'],
    travel: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚲', '🛸', '🚁', '🛩️', '✈️', '🛫', '🛬', '🚀', '🛰️', '🛸', '🚂', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚆', '🚇', '🚊', '🚉', '🚝', '🚞', '🚋', '🚃', '🚙'],
    objects: ['💡', '🔦', '🕯️', '🪔', '🔥', '💧', '📦', '📥', '📤', '📧', '📨', '📩', '📪', '📫', '📬', '📭', '📮', '📯', '📪', '📫', '📬', '📭', '📮', '📯', '📪', '📫', '📬', '📭', '📮', '📯', '📪', '📫', '📬', '📭', '📮', '📯', '📪', '📫', '📬', '📭'],
    symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'],
    flags: ['🏳️', '🏴', '🏁', '🚩', '🏴', '🏳️', '🏴', '🏁', '🚩', '🏴', '🏳️', '🏴', '🏁', '🚩', '🏴', '🏳️', '🏴', '🏁', '🚩', '🏴', '🏳️', '🏴', '🏁', '🚩', '🏴', '🏳️', '🏴', '🏁', '🚩', '🏴', '🏳️', '🏴', '🏁', '🚩', '🏴', '🏳️'],
  };

  const handleEmojiClick = (emoji) => {
    onEmojiSelect(emoji);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">Emoji Picker</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Categories */}
      <div className="flex items-center space-x-1 p-2 border-b border-gray-200 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setCategory(cat.name)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              category === cat.name
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {cat.icon}
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="grid grid-cols-8 gap-1 p-3 max-h-64 overflow-y-auto">
        {emojis[category]?.map((emoji, index) => (
          <button
            key={`${category}-${index}`}
            onClick={() => handleEmojiClick(emoji)}
            className="p-2 text-lg hover:bg-gray-100 rounded-md transition-colors"
            title={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-2 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          Click to insert emoji
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default EmojiPicker;