'use client';
import React, { useState, useEffect } from 'react';
import { TrendyTriFoldTemplate } from './templates/TrendyTriFoldTemplate'; 
import { SinglePageTemplate } from './templates/SinglePageTemplate'; 
// Potential "Professional index" route if we do that approach

export default function MenuPublisherPage() {
  // AI input fields
  const [brandVoice, setBrandVoice] = useState('');
  const [style, setStyle] = useState('');
  const [tone, setTone] = useState('');
  const [extraInfo, setExtraInfo] = useState('');

  // AI design results
  const [colorPalette, setColorPalette] = useState([]);
  const [headingFont, setHeadingFont] = useState('');
  const [bodyFont, setBodyFont] = useState('');
  const [heroPrompt, setHeroPrompt] = useState('');

  // Textures (3 distinct but similar)
  const [textureUrl1, setTextureUrl1] = useState('');
  const [textureUrl2, setTextureUrl2] = useState('');
  const [textureUrl3, setTextureUrl3] = useState('');

  // Whether we are generating textures (status bar)
  const [textureLoading, setTextureLoading] = useState(false);

  // Menus and items
  const [menus, setMenus] = useState([]);
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [menuData, setMenuData] = useState(null);

  // Template choice
  const [templateChoice, setTemplateChoice] = useState('trendy');

  // Brand fields
  const [logoUrl, setLogoUrl] = useState('');
  const [businessName, setBusinessName] = useState('My Trendy Restaurant');
  const [tagline, setTagline] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [website, setWebsite] = useState('');

  // Dish images
  const [dishImages, setDishImages] = useState([]);

  // Optional "professional" rating
  const [professionalIndex, setProfessionalIndex] = useState(null);

  useEffect(() => {
    fetchMenus();
  }, []);

  async function fetchMenus() {
    try {
      const res = await fetch('/api/menus');
      if (!res.ok) throw new Error('Failed to fetch menus');
      const data = await res.json();
      setMenus(data.menus || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSelectMenu(menuId) {
    setSelectedMenuId(menuId);
    if (!menuId) {
      setMenuData(null);
      return;
    }
    const basicMenu = menus.find((m) => m.id === Number(menuId)) || {};

    try {
      const itemsRes = await fetch(`/api/menuItems?menuId=${menuId}`);
      if (!itemsRes.ok) throw new Error('Failed to fetch items');
      const itemsData = await itemsRes.json();
      const menuItems = itemsData.menuItems || [];

      setMenuData({
        name: basicMenu.name || 'Untitled Menu',
        items: menuItems,
      });
    } catch (err) {
      console.error(err);
    }
  }

  // AI design route
  async function handleGenerateAIStyle() {
    try {
      const res = await fetch('/api/ai/getDesign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandVoice, style, tone, extraInfo }),
      });
      if (!res.ok) throw new Error('Failed to get AI style');
      const data = await res.json();
      setColorPalette(data.design.colors || []);
      setHeadingFont(data.design.headingFont || 'Arial');
      setBodyFont(data.design.bodyFont || 'Arial');
      setHeroPrompt(data.design.heroPrompt || '');
    } catch (err) {
      console.error(err);
    }
  }

  // Generate 3 textures with small variations
  async function handleGenerateTextures() {
    setTextureLoading(true);
    try {
      // We'll call /api/ai/getTexture once, with numVariations=3
      const basePrompt = `A seamless pattern, brand voice=${brandVoice}, style=${style}, tone=${tone}, additional=${extraInfo}. Variation.`;
      const res = await fetch('/api/ai/getTexture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: basePrompt, numVariations: 3 }),
      });
      if (!res.ok) throw new Error('Failed to get textures');
      const data = await res.json();
      const urls = data.urls || [];
      setTextureUrl1(urls[0] || '');
      setTextureUrl2(urls[1] || '');
      setTextureUrl3(urls[2] || '');
    } catch (err) {
      console.error(err);
    } finally {
      setTextureLoading(false);
    }
  }

  // Example dish image logic
  function addDishImage(url) {
    setDishImages((prev) => [...prev, url]);
  }

  // Optionally get a "professional index" rating from GPT
  async function handleRateProfessional() {
    // This is optional. We'll do a silly prompt:
    try {
      const prompt = `
        Rate how professional these design inputs are from 1-10:
        colorPalette=${colorPalette}, headingFont=${headingFont}, bodyFont=${bodyFont}.
        Return just a single integer with no explanation.
      `;
      // Suppose we have /api/ai/proRate route
      const res = await fetch('/api/ai/proRate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error('Failed rating');
      const data = await res.json();
      setProfessionalIndex(data.rating || null);
    } catch (err) {
      console.error(err);
    }
  }

  function renderTemplate() {
    if (!menuData) return <p>No menu selected or no data.</p>;

    const templateProps = {
      menuData,
      colorPalette,
      headingFont,
      bodyFont,
      heroPrompt,
      // Distinct textures
      textureUrl1,
      textureUrl2,
      textureUrl3,
      logoUrl,
      businessName,
      tagline,
      address,
      phoneNumber,
      website,
      dishImages,
    };

    switch (templateChoice) {
      case 'single':
        return <SinglePageTemplate {...templateProps} />;
      case 'trendy':
        return <TrendyTriFoldTemplate {...templateProps} />;
      default:
        return <TrendyTriFoldTemplate {...templateProps} />;
    }
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Menu Publisher - Multi Texture & AI Images</h1>

      {/* AI design inputs */}
      <div className="border p-3 mb-4">
        <h2 className="font-medium mb-2">AI Design Inputs</h2>
        <div className="mb-2">
          <label>Brand Voice:</label>
          <input
            className="border p-1 ml-2"
            value={brandVoice}
            onChange={(e) => setBrandVoice(e.target.value)}
          />
        </div>
        <div className="mb-2">
          <label>Style:</label>
          <input
            className="border p-1 ml-2"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          />
        </div>
        <div className="mb-2">
          <label>Tone:</label>
          <input
            className="border p-1 ml-2"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          />
        </div>
        <div className="mb-2">
          <label>Extra Info:</label>
          <input
            className="border p-1 ml-2"
            value={extraInfo}
            onChange={(e) => setExtraInfo(e.target.value)}
          />
        </div>
        <button
          onClick={handleGenerateAIStyle}
          className="bg-blue-600 text-white px-3 py-1 rounded mr-2"
        >
          Generate AI Style
        </button>
        <button
          onClick={handleGenerateTextures}
          className="bg-green-600 text-white px-3 py-1 rounded"
          disabled={textureLoading}
        >
          {textureLoading ? 'Generating Textures...' : 'Generate 3 Textures'}
        </button>
      </div>

      {/* Display the 3 textures if loaded */}
      <div className="flex gap-2 mb-4">
        {textureUrl1 && <img src={textureUrl1} alt="texture1" className="w-24 h-24 object-cover" />}
        {textureUrl2 && <img src={textureUrl2} alt="texture2" className="w-24 h-24 object-cover" />}
        {textureUrl3 && <img src={textureUrl3} alt="texture3" className="w-24 h-24 object-cover" />}
      </div>

      {/* Menu selection */}
      <div className="border p-3 mb-4">
        <h2 className="font-medium mb-2">Select a Menu</h2>
        <select
          className="border p-2"
          value={selectedMenuId || ''}
          onChange={(e) => handleSelectMenu(e.target.value)}
        >
          <option value="">-- choose --</option>
          {menus.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {/* brand fields */}
      <div className="border p-3 mb-4">
        <h2 className="font-medium mb-2">Brand Details</h2>
        <div className="mb-2">
          <label>Logo URL:</label>
          <input
            className="border p-1 ml-2"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
          />
        </div>
        <div className="mb-2">
          <label>Business Name:</label>
          <input
            className="border p-1 ml-2"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </div>
        <div className="mb-2">
          <label>Tagline:</label>
          <input
            className="border p-1 ml-2"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
          />
        </div>
        <div className="mb-2">
          <label>Address:</label>
          <input
            className="border p-1 ml-2"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div className="mb-2">
          <label>Phone:</label>
          <input
            className="border p-1 ml-2"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
        <div className="mb-2">
          <label>Website:</label>
          <input
            className="border p-1 ml-2"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>
      </div>

      {/* Dish images */}
      <div className="border p-3 mb-4">
        <h2 className="font-medium mb-2">Dish Images</h2>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            className="border p-1"
            placeholder="Paste dish image URL"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addDishImage(e.target.value);
                e.target.value = '';
              }
            }}
          />
          <button
            className="bg-gray-600 text-white px-3 py-1 rounded"
            onClick={() => {
              // sample
              const sampleUrl = 'https://picsum.photos/200/200';
              addDishImage(sampleUrl);
            }}
          >
            Add Sample
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {dishImages.map((url, idx) => (
            <img key={idx} src={url} alt="Dish" className="w-24 h-24 object-cover border" />
          ))}
        </div>
      </div>

      {/* Template choice */}
      <div className="border p-3 mb-4">
        <h2 className="font-medium mb-2">Choose Template</h2>
        <label className="mr-3">
          <input
            type="radio"
            name="template"
            value="single"
            checked={templateChoice === 'single'}
            onChange={(e) => setTemplateChoice(e.target.value)}
          />
          Single Page
        </label>
        <label>
          <input
            type="radio"
            name="template"
            value="trendy"
            checked={templateChoice === 'trendy'}
            onChange={(e) => setTemplateChoice(e.target.value)}
          />
          Trendy Tri-Fold
        </label>
      </div>

      {/* Optional professional rating */}
      <div className="mb-4">
        <button
          onClick={handleRateProfessional}
          className="bg-pink-600 text-white px-3 py-1 rounded"
        >
          Rate Professional
        </button>
        {professionalIndex && (
          <p className="mt-2">Professional Index: {professionalIndex}/10</p>
        )}
      </div>

      {/* Preview */}
      <div className="border p-3">
        <h2 className="font-medium mb-2">Preview</h2>
        {renderTemplate()}
      </div>
    </div>
  );
}
