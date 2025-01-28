'use client';

import React from 'react';
import { ModernTemplate } from './templates/ModernTemplate';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { MinimalTemplate } from './templates/MinimalTemplate';

const templateComponents = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate
};

export function MenuPreview({ items, template = 'modern', menuName, onClose }) {
  const TemplateComponent = templateComponents[template] || ModernTemplate;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Menu Preview</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
        
        <div className="p-6">
          <TemplateComponent items={items} menuName={menuName} />
        </div>
      </div>
    </div>
  );
}