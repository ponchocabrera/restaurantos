'use client';

import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';

export default function MenuCreator() {
  const [menuName, setMenuName] = useState('');
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [menuItems, setMenuItems] = useState([]);
  const [savedMenus, setSavedMenus] = useState([]);
  const [isMenuChanged, setIsMenuChanged] = useState(false);

  // Fetch existing menus on mount
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

  // Fetch items for the selected menu
  const fetchMenuItems = async (menuId) => {
    try {
      const res = await fetch(`/api/menuItems?menuId=${menuId}`);
      if (!res.ok) throw new Error('Failed to fetch menu items');
      const data = await res.json();
      setMenuItems(data.menuItems || []);
    } catch (err) {
      console.error('Error fetching menu items:', err);
    }
  };

  // Handle selecting a menu (or new menu)
  const handleMenuSelect = (menuId) => {
    if (!menuId) {
      // NEW menu
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

  // Add a new item in local state
  const addMenuItem = () => {
    setMenuItems((prev) => [
      ...prev,
      { name: '', description: '', price: '', category: '' },
    ]);
    setIsMenuChanged(true);
  };

  // Update an item in local state
  const updateMenuItem = (index, field, value) => {
    setMenuItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setIsMenuChanged(true);
  };

  // Remove an item from local state
  const removeMenuItem = (index) => {
    setMenuItems((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    setIsMenuChanged(true);
  };

  // Save (create/update) the menu
  const saveMenuToDB = async () => {
    try {
      // Upsert the menu
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

      // If new menu, add to local savedMenus
      if (!selectedMenuId) {
        setSavedMenus((prev) => [...prev, menuData.menu]);
      }
      setSelectedMenuId(menuId);

      // Upsert each item
      for (const item of menuItems) {
        const itemRes = await fetch('/api/menuItems', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: item.id, // update if present, else insert
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
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Header / Logo */}
      <header className="p-4 border-b flex items-center justify-between">
        <div className="text-xl font-bold">My Restaurant Logo</div>
        {/* Could add a nav or user menu here */}
      </header>

      {/* Main Container */}
      <main className="flex-grow p-8 max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-6">Menu Creator</h1>

        {/* Select or Create Menu */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select or Create Menu
          </label>
          <select
            value={selectedMenuId || ''}
            onChange={(e) => {
              const val = e.target.value;
              handleMenuSelect(val ? Number(val) : null);
            }}
            className="w-full p-3 border rounded-lg"
          >
            <option value="">-- New Menu --</option>
            {savedMenus.map((menu) => (
              <option key={menu.id} value={menu.id}>
                {menu.name}
              </option>
            ))}
          </select>
        </div>

        {/* Menu Details */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-lg font-semibold mb-4">Menu Details</h2>
          {/* 
            Show the Menu Name field ONLY if we are creating a new menu.
            (selectedMenuId === null)
          */}
          {selectedMenuId === null && (
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
          )}

          {/* Template selection is always visible (optional). 
              If you only want it for new menus, wrap it in 
              {selectedMenuId === null && (...)} as well. 
          */}
          <label className="block text-sm font-medium text-gray-700">
            Template
          </label>
          <select
            value={selectedTemplate}
            onChange={(e) => {
              setSelectedTemplate(e.target.value);
              setIsMenuChanged(true);
            }}
            className="w-full p-3 border rounded-lg mt-2"
          >
            <option value="modern">Modern</option>
            <option value="classic">Classic</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>

        {/* Menu Items */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Menu Items</h2>
          {menuItems.length === 0 ? (
            <p className="text-gray-500 italic">
              No menu items yet. Add some!
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {menuItems.map((item, idx) => (
                <div
                  key={item.id ?? idx}
                  className="bg-white p-4 rounded-lg shadow-sm border"
                >
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Item Name"
                      value={item.name}
                      onChange={(e) =>
                        updateMenuItem(idx, 'name', e.target.value)
                      }
                      className="w-full p-2 border rounded"
                    />
                    <textarea
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) =>
                        updateMenuItem(idx, 'description', e.target.value)
                      }
                      className="w-full p-2 border rounded"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) =>
                        updateMenuItem(idx, 'price', e.target.value)
                      }
                      className="w-full p-2 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Category"
                      value={item.category}
                      onChange={(e) =>
                        updateMenuItem(idx, 'category', e.target.value)
                      }
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <button
                    onClick={() => removeMenuItem(idx)}
                    className="mt-3 px-4 py-2 bg-red-500 text-white rounded flex items-center"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Remove Item
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={addMenuItem}
            className="mt-6 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg flex items-center"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add Item
          </button>
        </section>

        {/* Save Button */}
        {isMenuChanged && (
          <div className="flex justify-end mt-6">
            <button
              onClick={saveMenuToDB}
              className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
            >
              Save Menu
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
