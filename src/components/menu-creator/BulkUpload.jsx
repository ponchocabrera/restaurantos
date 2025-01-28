'use client';

import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import Papa from 'papaparse';

export default function BulkUpload({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const processFile = (file) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Error parsing file. Please check the format.');
          return;
        }

        const menuItems = results.data.map(item => ({
          id: Date.now() + Math.random(),
          name: item.name || item.Name || '',
          description: item.description || item.Description || '',
          price: item.price || item.Price || '',
          category: item.category || item.Category || '',
          image: null
        }));

        onUploadSuccess(menuItems);
        setSuccess('Menu items imported successfully!');
        setTimeout(() => setSuccess(''), 3000);
      },
      error: (error) => {
        setError('Failed to process file. Please try again.');
      }
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setError('');
    
    const file = e.dataTransfer.files[0];
    if (file.type !== 'text/csv') {
      setError('Please upload a CSV file');
      return;
    }
    
    processFile(file);
  };

  const handleFileInput = (e) => {
    setError('');
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== 'text/csv') {
      setError('Please upload a CSV file');
      return;
    }

    processFile(file);
  };

  return (
    <div className="mb-6">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 mb-2">
          Drag and drop your CSV file here, or
        </p>
        <label className="inline-block cursor-pointer">
          <span className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Browse Files
          </span>
          <input
            type="file"
            className="hidden"
            accept=".csv"
            onChange={handleFileInput}
          />
        </label>
        <p className="text-sm text-gray-500 mt-2">
          Supports CSV files with columns: name, description, price, category
        </p>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}

      <div className="mt-4 p-4 bg-gray-50 rounded-md">
        <h3 className="font-medium mb-2">CSV Format Example:</h3>
        <code className="text-sm">
          name,description,price,category<br />
          "Margherita Pizza","Fresh tomatoes, mozzarella, basil",15.99,Pizza<br />
          "Caesar Salad","Romaine lettuce, croutons, parmesan",8.99,Salads
        </code>
      </div>
    </div>
  );
}