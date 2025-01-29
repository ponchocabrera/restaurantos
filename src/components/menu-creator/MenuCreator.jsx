'use client';

import React, { useState, useEffect } from 'react';
import { Eye, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import BulkUpload from './BulkUpload';
import { MenuPreview } from '../menu-preview/MenuPreview';

export default function MenuCreator() {
  // ------------------- RESTAURANT + MENU STATES -------------------
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);

  const [menuName, setMenuName] = useState('');
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [menuItems, setMenuItems] = useState([]);
  const [savedMenus, setSavedMenus] = useState([]);
  const [isMenuChanged, setIsMenuChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // For adding a new item
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  // ------------------- AI SETTINGS (brandVoice, style, tone) -------------------
  const [brandVoice, setBrandVoice] = useState('');
  const [styleWanted, setStyleWanted] = useState('modern');
  const [tone, setTone] = useState('friendly');

  // Toggle panel for showing AI settings
  const [showAiSettings, setShowAiSettings] = useState(false);

  // For enlarging image in a modal
  const [enlargedImageUrl, setEnlargedImageUrl] = useState(null);

  // For disabling double-click on "Gen Image"
  const [generatingImages, setGeneratingImages] = useState({});

  // -------------------------------------------------------------------------
  // 1) LOAD RESTAURANTS ON MOUNT
  // -------------------------------------------------------------------------
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

  // -------------------------------------------------------------------------
  // 2) WHEN USER SELECTS A RESTAURANT, FETCH ITS MENUS
  // -------------------------------------------------------------------------
  const handleRestaurantSelect = async (restaurantId) => {
    setSelectedRestaurantId(restaurantId);
    setSavedMenus([]);
    setSelectedMenuId(null);
    setMenuName('');
    setMenuItems([]);
    setIsMenuChanged(false);

    if (!restaurantId) return;

    try {
      const res = await fetch(`/api/menus?restaurantId=${restaurantId}`);
      if (!res.ok) throw new Error('Failed to fetch menus');
      const data = await res.json();
      setSavedMenus(data.menus || []);
    } catch (err) {
      console.error('Error fetching menus:', err);
    }
  };

  // -------------------------------------------------------------------------
  // 3) FETCH ITEMS FOR THE SELECTED MENU
  // -------------------------------------------------------------------------
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
          image_url: item.image_url || '',
        }))
      );
    } catch (err) {
      console.error('Error fetching menu items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // 4) HANDLE MENU SELECTION
  // -------------------------------------------------------------------------
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

  // -------------------------------------------------------------------------
  // 5) SAVE (CREATE OR UPDATE) THE MENU + ITEMS
  // -------------------------------------------------------------------------
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

      // If it's a new menu, push to our local savedMenus
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
            image_url: item.image_url || '',
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

  // -------------------------------------------------------------------------
  // 6) MENU ITEMS: ADD / REMOVE / UPDATE
  // -------------------------------------------------------------------------
  const addMenuItem = () => {
    if (!newItemName) return;
    setMenuItems((prev) => [
      ...prev,
      {
        name: newItemName,
        description: newItemDescription,
        price: newItemPrice,
        category: '',
        image_url: '',
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

  // -------------------------------------------------------------------------
  // 7) AI-DRIVEN ENHANCEMENTS
  // -------------------------------------------------------------------------
  // (A) Enhance description
  const enhanceItemDescription = async (item, index) => {
    try {
      const res = await fetch('/api/ai/enhanceDescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: item.name,
          oldDescription: item.description,
          brandVoice,
          styleWanted,
          tone,
        }),
      });
      if (!res.ok) throw new Error('Failed to enhance description');

      const data = await res.json();
      const newDesc = data.newDescription;

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

  // (B) Generate Image
  const generateImageForItem = async (item, index) => {
    setGeneratingImages((prev) => ({ ...prev, [index]: true }));

    try {
      const res = await fetch('/api/ai/generateImage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: item.name,
          brandVoice,
          styleWanted,
          tone,
        }),
      });
      if (!res.ok) throw new Error('Failed to generate image');

      const data = await res.json();
      const imageUrl = data.imageUrl;
      updateMenuItem(index, 'image_url', imageUrl);

      alert('Image generated successfully! (Remember to Save Menu if you want to persist this!)');
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setGeneratingImages((prev) => ({ ...prev, [index]: false }));
    }
  };

  // (C) Delete an existing image in local state
  const deleteImageForItem = (index) => {
    const yes = confirm('Are you sure you want to remove this image?');
    if (!yes) return;
    updateMenuItem(index, 'image_url', '');
    alert('Image removed. Don’t forget to click Save Menu!');
  };

  // (D) Enlarge image in a modal
  const enlargeImage = (imageUrl) => {
    setEnlargedImageUrl(imageUrl);
  };
  const closeEnlargedImage = () => {
    setEnlargedImageUrl(null);
  };

  // (Ref1) NEW - Delete Menu function
  // ---------------------------------
  const deleteMenuFromDB = async () => {
    if (!selectedMenuId) {
      alert('No menu selected to delete.');
      return;
    }

    const yes = confirm('Are you sure you want to DELETE this menu? This action cannot be undone.');
    if (!yes) return;

    try {
      // (Ref2) This uses the dedicated /api/menus/[menuId] route (or similar)
      const res = await fetch(`/api/menus/${selectedMenuId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete menu');
      }

      // Remove from local savedMenus
      setSavedMenus((prev) => prev.filter((m) => m.id !== selectedMenuId));
      // Reset state
      setSelectedMenuId(null);
      setMenuName('');
      setMenuItems([]);
      setIsMenuChanged(false);
      alert('Menu deleted!');
    } catch (error) {
      console.error('Error deleting menu:', error);
      alert('Failed to delete menu');
    }
  };

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* LEFT SIDEBAR */}
      <div className="w-full md:w-48 bg-white border-r">
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
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
          {/* (A) SELECT RESTAURANT */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select a Restaurant
              </label>
              <select
                className="p-2 border rounded-md text-gray-700 w-full max-w-xs"
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
                  className="flex-1 p-2 border rounded-md text-gray-700 max-w-xs"
                  disabled={!selectedRestaurantId}
                >
                  <option value="">-- New Menu --</option>
                  {savedMenus.map((menu) => (
                    <option key={menu.id} value={menu.id}>
                      {menu.name}
                    </option>
                  ))}
                </select>

                {/* (Ref3) NEW - Delete Menu button, shown if a menu is selected */}
                {selectedMenuId && (
                  <button
                    onClick={deleteMenuFromDB}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Menu
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* (C) TEMPLATE SELECTION */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                Template Style
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

          {/* (E) AI SETTINGS (EXPANDABLE) */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="p-6">
              <button
                onClick={() => setShowAiSettings(!showAiSettings)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                {showAiSettings ? 'Hide AI Settings' : 'Show AI Settings'}
              </button>

              {showAiSettings && (
                <div className="mt-4 space-y-4">
                  <h2 className="text-lg font-medium text-gray-800">AI Settings</h2>

                  {/* Brand Voice */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand Voice
                    </label>
                    <input
                      type="text"
                      value={brandVoice}
                      onChange={(e) => setBrandVoice(e.target.value)}
                      placeholder="e.g. upscale, fun, quirky..."
                      className="p-2 border rounded-md w-full text-gray-700"
                    />
                  </div>

                  {/* Desired Style */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Desired Style
                    </label>
                    <select
                      value={styleWanted}
                      onChange={(e) => setStyleWanted(e.target.value)}
                      className="p-2 border rounded-md w-full text-gray-700"
                    >
                      <option value="modern">Modern</option>
                      <option value="classic">Classic</option>
                      <option value="rustic">Rustic</option>
                    </select>
                  </div>

                  {/* Tone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tone
                    </label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="p-2 border rounded-md w-full text-gray-700"
                    >
                      <option value="friendly">Friendly</option>
                      <option value="quirky">Quirky</option>
                      <option value="serious">Serious</option>
                      <option value="funny">Funny</option>
                      <option value="romantic">Romantic</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* (F) MENU ITEMS */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                Menu Items
              </h2>

              {/* Items Table */}
              {menuItems.length > 0 && (
                <div className="mb-6 overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 w-24">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 w-28">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 w-28">
                          Image
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 w-32">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {menuItems.map((item, idx) => {
                        const isGenerating = generatingImages[idx] || false;
                        return (
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
                            {/* IMAGE DISPLAY */}
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {item.image_url ? (
                                <div className="flex flex-col space-y-1">
                                  <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="w-16 h-16 object-cover rounded cursor-pointer"
                                    onClick={() => enlargeImage(item.image_url)}
                                    title="Click to enlarge"
                                  />
                                  <button
                                    onClick={() => deleteImageForItem(idx)}
                                    className="text-red-600 hover:text-red-700 text-xs"
                                  >
                                    Delete Image
                                  </button>
                                </div>
                              ) : isGenerating ? (
                                <span className="text-sm text-gray-500">
                                  Generating...
                                </span>
                              ) : (
                                <button
                                  onClick={() => generateImageForItem(item, idx)}
                                  className="text-green-600 hover:text-green-700 text-sm"
                                >
                                  Gen Image
                                </button>
                              )}
                            </td>
                            {/* ACTIONS */}
                            <td className="px-6 py-4 flex gap-2 items-center">
                              <button
                                onClick={() => enhanceItemDescription(item, idx)}
                                className="text-blue-600 hover:text-blue-700 text-sm"
                                disabled={isGenerating}
                              >
                                Enhance
                              </button>
                              <button
                                onClick={() => removeMenuItem(idx)}
                                className="text-red-600 hover:text-red-700"
                                disabled={isGenerating}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add New Item Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Preview & Save Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button
                  onClick={() => setShowPreview(true)}
                  className="flex items-center justify-center sm:flex-1 py-2 border border-[#FF7A5C] text-[#FF7A5C] rounded-md hover:bg-[#FF7A5C] hover:text-white transition-colors"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Preview Menu
                </button>
                {isMenuChanged && menuItems.length > 0 && (
                  <button
                    onClick={saveMenuToDB}
                    disabled={isLoading}
                    className="flex items-center justify-center sm:flex-1 bg-[#FF7A5C] text-white py-2 rounded-md hover:bg-[#ff6647] disabled:opacity-50 transition-colors"
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

      {/* Preview Modal for entire menu */}
      {showPreview && (
        <MenuPreview
          items={menuItems}
          template={selectedTemplate}
          menuName={menuName}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* ENLARGED IMAGE MODAL */}
      {enlargedImageUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-lg max-w-xl max-h-[80vh] overflow-auto relative">
            <img
              src={enlargedImageUrl}
              alt="Enlarged dish"
              className="w-full h-auto object-contain"
            />
            <button
              onClick={closeEnlargedImage}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
