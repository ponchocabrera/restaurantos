// Example: RestaurantCreator.jsx (create a new file)
'use client'; // for Next.js 13

import { useState } from 'react';

export default function RestaurantCreator() {
  const [restaurantName, setRestaurantName] = useState('');

  async function handleCreateRestaurant() {
    if (!restaurantName) return alert('Please enter a name!');

    const res = await fetch('/api/restaurants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: restaurantName }),
    });

    if (!res.ok) {
      alert('Failed to create restaurant');
      return;
    }
    const data = await res.json();
    alert(`Created new restaurant with ID: ${data.restaurant.id}`);

    // possibly reset the input or refresh a list
    setRestaurantName('');
  }

  return (
    <div className="p-4">
      <h2>Add a New Restaurant</h2>
      <input
        type="text"
        placeholder="Restaurant Name"
        value={restaurantName}
        onChange={(e) => setRestaurantName(e.target.value)}
      />
      <button onClick={handleCreateRestaurant}>Create Restaurant</button>
    </div>
  );
}
