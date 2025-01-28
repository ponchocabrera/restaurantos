'use client';

import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Eye } from 'lucide-react';
import BulkUpload from './BulkUpload';
import { MenuPreview } from '../menu-preview/MenuPreview';

export default function MenuCreator() {
  // ----------------- NEW STATES FOR RESTAURANT SELECTION -----------------
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);

  // ----------------- EXISTING STATES FOR MENUS/ITEMS -----------------
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

  // ---------------------------------------------------------------------
  // 1) Load the list of restaurants on mount
  // ---------------------------------------------------------------------
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await fetch('/api/restaurants');
        if (!res.ok) throw new Error('Failed to fetch restaurants');
        const data = await res.json();
        setRestaurants(data.restaurants || []);
      } catch (err) {
        console.error('Error fetching restaurants:', err);
      }
    };
    fetchRestaurants();
  }, []);

  // ---------------------------------------------------------------------
  // 2) When user selects a restaurant in the dropdown, we fetch its menus
  // ---------------------------------------------------------------------
  const handleRestaurantSelect = async (restaurantId) => {
    setSelectedRestaurantId(restaurantId);
    setSavedMenus([]);
    setSelectedMenuId(null);
    setMenuName('');
    setMenuItems([]);
    setIsMenuChanged(false);

    if (!restaurantId) {
      // User picked blank
      return;
    }

    try {
      const res = await fetch(`/api/menus?restaurantId=${restaurantId}`);
      if (!res.ok) throw new Error('Failed to fetch menus');
      const data = await res.json();
      setSavedMenus(data.menus || []);
    } catch (err) {
      console.error('Error fetching menus:', err);
    }
  };

  // ---------------------------------------------------------------------
  // 3) Fetch items for a selected menu
  // ---------------------------------------------------------------------
  const fetchMenuItems = async (menuId) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/menuItems?menuId=${menuId}`);
      if (!res.ok) throw new Error('Failed to fetch menu items');
      const data = await res.json();
      setMenuItems(
        data.menuItems.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
        }))
      );
    } catch (err) {
      console.error('Error fetching menu items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------
  // 4) Handle menu selection from the 'Select or Create Menu' dropdown
  // ---------------------------------------------------------------------
  const handleMenuSelect = (menuId) => {
    if (!menuId) {
      // User picked "New Menu"
      setSelectedMenuId(null);
      setMenuName('');
      setSelectedTemplate('modern');
      setMenuItems([]);
      setIsMenuChanged(false);
      return;
    }
    // Existing menu
    const existingMenu = savedMenus.find((m) => m.id === menuId);
    setSelectedMenuId(menuId);
    setMenuName(existingMenu?.name || '');
    setSelectedTemplate(existingMenu?.template_id || 'modern');
    fetchMenuItems(menuId);
    setIsMenuChanged(false);
  };

  // ---------------------------------------------------------------------
  // 5) Save (create or update) the menu, then save items
  // ---------------------------------------------------------------------
  const saveMenuToDB = async () => {
    try {
      if (!selectedRestaurantId) {
        alert('Please select a restaurant first!');
        return;
      }

      setIsLoading(true);
      // Upsert the menu
      const menuRes = await fetch('/api/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedMenuId,
          restaurantId: selectedRestaurantId,
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

      // Save items (create/update)
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

  // ---------------------------------------------------------------------
  // 6) Menu Items: Add / Remove / Update
  // ---------------------------------------------------------------------
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

    setMenuItems((prev) => {
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
    setMenuItems((prev) => [...prev, ...items]);
    setIsMenuChanged(true);
  };

  // ---------------------------------------------------------------------
  // NEW: Enhance Item Description Function
  // ---------------------------------------------------------------------
  const enhanceItemDescription = async (item, index) => {
    try {
      const res = await fetch('/api/ai/enhanceDescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: item.name,
          oldDescription: item.description,
          // For better results, pass brandVoice or restaurant data if desired
          brandVoice: 'friendly and upbeat',
        }),
      });
      if (!res.ok) throw new Error('Failed to enhance description');

      const data = await res.json();
      const newDesc = data.newDescription;

      // Ask user if they accept
      const userAccepted = confirm(
        `Original:\n${item.description}\n\nProposed:\n${newDesc}\n\nAccept new description?`
      );
      if (userAccepted) {
        updateMenuItem(index, 'description', newDesc);
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // ---------------------------------------------------------------------
  // 7) Rendering
  // ---------------------------------------------------------------------
  return (
    <div className="flex min-h-screen">
      {/* LEFT SIDEBAR */}
      <div className="w-48 bg-white border-r">
        <div className="p-4 font-medium text-gray-800">Website Menu</div>
        <nav className="space-y-1">
          <a
            href="#"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Dashboard
          </a>
          <a
            href="#"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Templates
          </a>
          <a
            href="#"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Support
          </a>
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 bg-gray-50">
        {/* HEADER */}
        <header className="bg-white border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-medium text-gray-800">Menu Creator</h1>
          </div>
        </header>

        {/* CONTENT */}
        <div className="p-6 max-w-4xl mx-auto">
          {/* (A) SELECT RESTAURANT */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select a Restaurant
              </label>
              <select
                className="p-2 border rounded-md text-gray-700"
                value={selectedRestaurantId || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  handleRestaurantSelect(val ? Number(val) : null);
                }}
              >
                <option value="">-- Choose --</option>
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* (B) SELECT OR CREATE MENU */}
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
                  disabled={!selectedRestaurantId}
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

          {/* (C) TEMPLATE SELECTION */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                Template Style
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    id: 'modern',
                    name: 'Modern',
                    description: 'Clean and contemporary layout',
                  },
                  {
                    id: 'classic',
                    name: 'Classic',
                    description: 'Traditional elegant design',
                  },
                  {
                    id: 'minimal',
                    name: 'Minimal',
                    description: 'Simple and straightforward',
                  },
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
                    <div className="font-medium text-gray-800 mb-1">
                      {template.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {template.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* (D) MENU DETAILS FOR NEW MENU ONLY */}
          {selectedMenuId === null && (
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">
                  Menu Details
                </h2>
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

          {/* (E) MENU ITEMS */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                Menu Items
              </h2>

              {/* Items Table */}
              {menuItems.length > 0 && (
                <div className="mb-6 overflow-hidden rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 w-32">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 w-40">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 w-24">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {menuItems.map((item, idx) => (
                        <tr key={item.id ?? idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {item.name || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {item.description || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            ${item.price || '0.00'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {item.category || '-'}
                          </td>
                          <td className="px-6 py-4 flex gap-3 items-center">
                            {/* Enhance button */}
                            <button
                              onClick={() => enhanceItemDescription(item, idx)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Enhance
                            </button>

                            {/* Delete button */}
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
                    {isLoading
                      ? 'Saving...'
                      : selectedMenuId
                      ? 'Save Changes'
                      : 'Create Menu'}
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
