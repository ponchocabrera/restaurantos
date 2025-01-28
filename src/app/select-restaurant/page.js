'use client';

import React, { useEffect, useState } from 'react';

export default function SelectRestaurantPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [menus, setMenus] = useState([]);
  const [newMenuName, setNewMenuName] = useState('');

  // 1) On mount, fetch all restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await fetch('/api/restaurants');
        if (!res.ok) throw new Error('Failed to load restaurants');
        const data = await res.json();
        setRestaurants(data.restaurants || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRestaurants();
  }, []);

  // 2) When user selects a restaurant, fetch its menus
  const handleSelectRestaurant = async (restaurantId) => {
    setSelectedRestaurantId(restaurantId);
    setMenus([]); // reset or show loading indicator

    if (!restaurantId) {
      return; // user selected blank or reset
    }

    try {
      const res = await fetch(`/api/menus?restaurantId=${restaurantId}`);
      if (!res.ok) throw new Error('Failed to load menus');
      const data = await res.json();
      setMenus(data.menus || []);
    } catch (err) {
      console.error(err);
    }
  };

  // 3) Create a new menu for the selected restaurant
  const handleCreateMenu = async () => {
    if (!selectedRestaurantId || !newMenuName) {
      alert('Select a restaurant and enter a menu name.');
      return;
    }

    try {
      const res = await fetch('/api/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: selectedRestaurantId,
          name: newMenuName,
        }),
      });
      if (!res.ok) throw new Error('Failed to create menu');
      const data = await res.json();
      // Add the newly created menu to our local list
      setMenus((prev) => [...prev, data.menu]);
      setNewMenuName('');
      alert('Menu created successfully!');
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Select a Restaurant</h1>

      {/* Dropdown to choose the restaurant */}
      <select
        className="border p-2 rounded w-full max-w-md"
        value={selectedRestaurantId || ''}
        onChange={(e) => {
          const val = e.target.value;
          handleSelectRestaurant(val ? Number(val) : null);
        }}
      >
        <option value="">-- Choose a Restaurant --</option>
        {restaurants.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>

      {/* If a restaurant is selected, show its menus & a form to create more */}
      {selectedRestaurantId && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Menus</h2>
            {menus.length === 0 ? (
              <p>No menus found. Create one below!</p>
            ) : (
              <ul className="list-disc list-inside space-y-1">
                {menus.map((m) => (
                  <li key={m.id}>
                    {m.name} (template: {m.template_id || 'N/A'})
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Create new menu */}
          <div className="bg-gray-50 p-4 rounded shadow">
            <h3 className="text-lg font-medium mb-2">Create a New Menu</h3>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Menu Name"
                value={newMenuName}
                onChange={(e) => setNewMenuName(e.target.value)}
                className="border p-2 rounded flex-grow"
              />
              <button
                onClick={handleCreateMenu}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
