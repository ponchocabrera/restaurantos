'use client';

import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Eye } from 'lucide-react';
import BulkUpload from './BulkUpload';
import { MenuPreview } from '../menu-preview/MenuPreview';

export default function MenuCreator() {
  const [menuName, setMenuName] = useState('');
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [menuItems, setMenuItems] = useState([]);
  const [savedMenus, setSavedMenus] = useState([]);
  const [isMenuChanged, setIsMenuChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await fetch('/api/menus?restaurantId=1');
        if (!res.ok) throw new Error('Failed to fetch menus');
        const data = await res.json();
        setSavedMenus(data.menus || []);
      } catch (err) {
        console.error('Error fetching menus:', err);
      }
    };
    fetchMenus();
  }, []);

  const fetchMenuItems = async (menuId) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/menuItems?menuId=${menuId}`);
      if (!res.ok) throw new Error('Failed to fetch menu items');
      const data = await res.json();
      setMenuItems(data.menuItems.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category
      })));
    } catch (err) {
      console.error('Error fetching menu items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuSelect = (menuId) => {
    if (!menuId) {
      setSelectedMenuId(null);
      setMenuName('');
      setSelectedTemplate('modern');
      setMenuItems([]);
      setIsMenuChanged(false);
      return;
    }
    const existingMenu = savedMenus.find((m) => m.id === menuId);
    setSelectedMenuId(menuId);
    setMenuName(existingMenu?.name || '');
    setSelectedTemplate(existingMenu?.template_id || 'modern');
    fetchMenuItems(menuId);
    setIsMenuChanged(false);
  };

  const deleteMenuItem = async (itemId) => {
    try {
      const res = await fetch(`/api/menuItems?itemId=${itemId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete item');
      return true;
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Failed to delete item');
      return false;
    }
  };

  const removeMenuItem = async (index) => {
    const item = menuItems[index];
    
    if (item.id) {
      const success = await deleteMenuItem(item.id);
      if (!success) return;
    }

    setMenuItems(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    setIsMenuChanged(true);
  };

  const addMenuItem = () => {
    setMenuItems((prev) => [
      ...prev,
      { name: '', description: '', price: '', category: '' },
    ]);
    setIsMenuChanged(true);
  };

  const updateMenuItem = (index, field, value) => {
    setMenuItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setIsMenuChanged(true);
  };

  const handleBulkUpload = (items) => {
    setMenuItems(prev => [...prev, ...items]);
    setIsMenuChanged(true);
  };

  {selectedMenuId === null && (
    <div className="bg-white border rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-lg font-semibold mb-4">Menu Details</h2>
      
      {/* Menu Name Input */}
      <input
        type="text"
        placeholder="Menu Name"
        value={menuName}
        onChange={(e) => {
          setMenuName(e.target.value);
          setIsMenuChanged(true);
        }}
        className="w-full p-3 border rounded-lg mb-4"
      />
  
      {/* Template Selection */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Template
      </label>
      <select
        value={selectedTemplate}
        onChange={(e) => {
          setSelectedTemplate(e.target.value);
          setIsMenuChanged(true);
        }}
        className="w-full p-3 border rounded-lg"
      >
        <option value="modern">Modern</option>
        <option value="classic">Classic</option>
        <option value="minimal">Minimal</option>
      </select>
    </div>
  )

  };

  return (
    <div className="w-full bg-white text-gray-900">
      <header className="p-4 border-b flex items-center justify-between bg-white">
        <div className="text-xl font-bold">My Restaurant Logo</div>
      </header>

      <main className="p-8 max-w-4xl mx-auto bg-white">
        <h1 className="text-3xl font-bold mb-8">Menu Creator</h1>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select or Create Menu
          </label>
          <div className="flex gap-4">
            <select
              value={selectedMenuId || ''}
              onChange={(e) => {
                const val = e.target.value;
                handleMenuSelect(val ? Number(val) : null);
              }}
              className="flex-1 p-3 border rounded-lg"
            >
              <option value="">-- New Menu --</option>
              {savedMenus.map((menu) => (
                <option key={menu.id} value={menu.id}>
                  {menu.name}
                </option>
              ))}
            </select>
            
            {selectedMenuId === null && menuName && (
              <button
                onClick={saveMenuToDB}
                disabled={isLoading}
                className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Menu'}
              </button>
            )}
          </div>
        </div>

        {selectedMenuId === null && (
          <div className="bg-white border rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Menu Details</h2>
            <input
              type="text"
              placeholder="Menu Name"
              value={menuName}
              onChange={(e) => {
                setMenuName(e.target.value);
                setIsMenuChanged(true);
              }}
              className="w-full p-3 border rounded-lg mb-4"
            />

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => {
                setSelectedTemplate(e.target.value);
                setIsMenuChanged(true);
              }}
              className="w-full p-3 border rounded-lg"
            >
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>
        )}
        {/* Template Selection - Always visible */}
<div className="bg-white border rounded-lg shadow-sm p-6 mb-8">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-lg font-semibold">Template Style</h2>
    <button
      onClick={() => setShowPreview(true)}
      className="inline-flex items-center px-4 py-2 text-sm border border-transparent font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
    >
      <Eye className="w-4 h-4 mr-2" />
      Preview Current Design
    </button>
  </div>
  
  <div className="grid grid-cols-3 gap-4">
    {[
      { id: 'modern', name: 'Modern', description: 'Clean and contemporary layout' },
      { id: 'classic', name: 'Classic', description: 'Traditional elegant design' },
      { id: 'minimal', name: 'Minimal', description: 'Simple and straightforward' },
    ].map((template) => (
      <div
        key={template.id}
        onClick={() => {
          setSelectedTemplate(template.id);
          setIsMenuChanged(true);
        }}
        className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
          selectedTemplate === template.id
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-blue-200'
        }`}
      >
        <div className="font-medium mb-1">{template.name}</div>
        <div className="text-sm text-gray-500">{template.description}</div>
      </div>
    ))}
  </div>
</div>
        {(selectedMenuId || menuName) && (
          <>
            <BulkUpload onUploadSuccess={handleBulkUpload} />

            <section className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Menu Items</h2>
              {isLoading ? (
                <p className="text-gray-500 italic">Loading...</p>
              ) : menuItems.length === 0 ? (
                <p className="text-gray-500 italic">
                  No menu items yet. Add some!
                </p>
              ) : (
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Description</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 w-32">Price</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 w-40">Category</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 w-32">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {menuItems.map((item, idx) => (
                        <tr 
                          key={item.id ?? idx} 
                          className="transition-colors hover:bg-gray-50"
                        >
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              placeholder="Item Name"
                              value={item.name}
                              onChange={(e) => updateMenuItem(idx, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <textarea
                              placeholder="Description"
                              value={item.description}
                              onChange={(e) => updateMenuItem(idx, 'description', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              rows="2"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                              <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={item.price}
                                onChange={(e) => updateMenuItem(idx, 'price', e.target.value)}
                                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              placeholder="Category"
                              value={item.category}
                              onChange={(e) => updateMenuItem(idx, 'category', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => removeMenuItem(idx)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 mr-1.5" />
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <button
                  onClick={addMenuItem}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Add Item
                </button>

                <button
                  onClick={() => setShowPreview(true)}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Preview Menu
                </button>

                {isMenuChanged && selectedMenuId && (
                  <button
                    onClick={saveMenuToDB}
                    disabled={isLoading}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors ml-auto"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>
            </section>
          </>
        )}

        {showPreview && (
          <MenuPreview
            items={menuItems}
            template={selectedTemplate}
            menuName={menuName}
            onClose={() => setShowPreview(false)}
          />
        )}
      </main>
    </div>
  );
}