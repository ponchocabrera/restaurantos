'use client';

import React, { useState, useEffect } from 'react';

export default function RestaurantAdmin() {
  const [restaurants, setRestaurants] = useState([]);
  const [newName, setNewName] = useState('');

  // On mount, load all restaurants
  useEffect(() => {
    fetchRestaurants();
  }, []);

  async function fetchRestaurants() {
    try {
      const res = await fetch('/api/restaurants');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setRestaurants(data.restaurants || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function createRestaurant() {
    if (!newName) return alert('Enter a restaurant name!');

    try {
      const res = await fetch('/api/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) throw new Error('Failed to create restaurant');
      const data = await res.json();
      alert('Created new restaurant: ' + data.restaurant.name);
      setNewName('');
      // reload the list
      fetchRestaurants();
    } catch (err) {
      console.error(err);
      alert('Error creating restaurant');
    }
  }

  async function deleteRestaurant(id) {
    const yes = confirm('Are you sure you want to delete this restaurant?');
    if (!yes) return;

    try {
      const res = await fetch(`/api/restaurants/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete restaurant');
      alert('Deleted successfully!');
      // remove from local state or refetch
      setRestaurants((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete');
    }
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Restaurant Admin</h1>

      {/* CREATE NEW RESTAURANT */}
      <div className="mb-6 flex items-center gap-2">
        <input
          type="text"
          className="border p-2 rounded"
          placeholder="New Restaurant Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button
          onClick={createRestaurant}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Create
        </button>
      </div>

      {/* LIST ALL RESTAURANTS */}
      <ul className="space-y-2">
        {restaurants.map((r) => (
          <li
            key={r.id}
            className="flex justify-between items-center bg-white p-2 rounded shadow"
          >
            <div>{r.name}</div>
            <button
              onClick={() => deleteRestaurant(r.id)}
              className="text-red-600 hover:text-red-700"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
