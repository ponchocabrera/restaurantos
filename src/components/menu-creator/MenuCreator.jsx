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
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

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

  const saveMenuToDB = async () => {
    try {
      setIsLoading(true);
      const menuRes = await fetch('/api/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedMenuId,
          restaurantId: 1,
          name: menuName,
          templateId: selectedTemplate,
        }),
      });

      if (!menuRes.ok) throw new Error('Failed to save menu');
      const menuData = await menuRes.json();
      const menuId = menuData.menu.id;

      if (!selectedMenuId) {
        setSavedMenus((prev) => [...prev, menuData.menu]);
      }
      setSelectedMenuId(menuId);

      for (const item of menuItems) {
        const itemRes = await fetch('/api/menuItems', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: item.id,
            menuId,
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
          }),
        });
        if (!itemRes.ok) throw new Error('Failed to save menu item');
      }

      setIsMenuChanged(false);
      alert('Menu and items saved successfully!');
    } catch (err) {
      console.error('Error saving menu:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addMenuItem = () => {
    if (!newItemName) return;
    
    setMenuItems((prev) => [
      ...prev,
      {
        name: newItemName,
        description: newItemDescription,
        price: newItemPrice,
        category: '',
      },
    ]);
    setNewItemName('');
    setNewItemDescription('');
    setNewItemPrice('');
    setIsMenuChanged(true);
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

  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar */}
      <div className="w-48 bg-white border-r">
        <div className="p-4 font-medium text-gray-800">Website Menu</div>
        <nav className="space-y-1">
          <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Dashboard</a>
          <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Templates</a>
          <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Support</a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-medium text-gray-800">Menu Creator</h1>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 max-w-4xl mx-auto">
          {/* Menu Selection */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="p-6">
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
                  className="flex-1 p-2 border rounded-md text-gray-700"
                >
                  <option value="">-- New Menu --</option>
                  {savedMenus.map((menu) => (
                    <option key={menu.id} value={menu.id}>
                      {menu.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Template Selection - Always visible */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Template Style</h2>
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
                        ? 'border-[#FF7A5C] bg-[#FFF4F2]'
                        : 'border-gray-200 hover:border-[#FF7A5C]'
                    }`}
                  >
                    <div className="font-medium text-gray-800 mb-1">{template.name}</div>
                    <div className="text-sm text-gray-600">{template.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Menu Details for New Menu */}
          {selectedMenuId === null && (
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Menu Details</h2>
                <input
                  type="text"
                  placeholder="Menu Name"
                  value={menuName}
                  onChange={(e) => {
                    setMenuName(e.target.value);
                    setIsMenuChanged(true);
                  }}
                  className="w-full p-2 border rounded-md text-gray-700"
                />
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Menu Items</h2>
              
              {/* Menu Items Table */}
              {menuItems.length > 0 && (
                <div className="mb-6 overflow-hidden rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 w-32">Price</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 w-40">Category</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 w-24">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {menuItems.map((item, idx) => (
                        <tr key={item.id ?? idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-700">{item.name || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{item.description || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">${item.price || '0.00'}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{item.category || '-'}</td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => removeMenuItem(idx)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add New Item Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Item Name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="p-2 border rounded-md text-gray-700"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="p-2 border rounded-md text-gray-700"
                  />
                </div>
                <textarea
                  placeholder="Description"
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  className="w-full p-2 border rounded-md text-gray-700"
                  rows="2"
                />
                <button
                  onClick={addMenuItem}
                  className="w-full bg-[#FF7A5C] text-white py-2 rounded-md hover:bg-[#ff6647]"
                >
                  Add Item
                </button>
              </div>

              {/* Bulk Upload */}
              <div className="mt-6">
                <BulkUpload onUploadSuccess={handleBulkUpload} />
              </div>

              {/* Preview & Save buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowPreview(true)}
                  className="flex items-center justify-center flex-1 py-2 border border-[#FF7A5C] text-[#FF7A5C] rounded-md hover:bg-[#FF7A5C] hover:text-white transition-colors"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Preview Menu
                </button>
                {isMenuChanged && menuItems.length > 0 && (
                  <button
                    onClick={saveMenuToDB}
                    disabled={isLoading}
                    className="flex items-center justify-center flex-1 bg-[#FF7A5C] text-white py-2 rounded-md hover:bg-[#ff6647] disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? 'Saving...' : (selectedMenuId ? 'Save Changes' : 'Create Menu')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <MenuPreview
          items={menuItems}
          template={selectedTemplate}
          menuName={menuName}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}