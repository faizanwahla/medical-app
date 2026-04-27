import React, { useState } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  label: string;
}

export default function TagInput({ tags, onChange, placeholder, suggestions = [], label }: TagInputProps) {
  const [input, setInput] = useState('');

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(t => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(input);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-xs font-bold text-gray-600 uppercase tracking-tight">{label}</label>
      <div className="flex flex-wrap gap-2 p-2 min-h-[44px] bg-gray-50 border-2 border-transparent rounded-xl focus-within:bg-white focus-within:border-medical-500 transition-all">
        {tags.map((tag) => (
          <span 
            key={tag} 
            className="inline-flex items-center px-3 py-1 bg-medical-600 text-white text-[10px] font-black uppercase rounded-full"
          >
            {tag}
            <button 
              type="button" 
              onClick={() => removeTag(tag)}
              className="ml-2 hover:text-red-200 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-1 min-w-[120px]"
        />
      </div>
      
      {suggestions.length > 0 && input && (
        <div className="flex flex-wrap gap-2 mt-1">
          {suggestions
            .filter(s => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s))
            .slice(0, 5)
            .map(s => (
              <button
                key={s}
                type="button"
                onClick={() => addTag(s)}
                className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-500 hover:border-medical-400 hover:text-medical-600 transition-all"
              >
                + {s}
              </button>
            ))
          }
        </div>
      )}
    </div>
  );
}
