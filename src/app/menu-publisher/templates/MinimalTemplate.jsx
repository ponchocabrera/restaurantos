// app/menu-publisher/templates/MinimalTemplate.jsx

export function MinimalTemplate({
    menuData,
    colorPalette = [],
    headingFont = 'Arial',
    bodyFont = 'Arial',
    heroPrompt = '',
  }) {
    if (!menuData) return <div>No Data</div>;
  
    const { name, items = [] } = menuData;
  
    // (A) Pick your brand color / accent color from colorPalette
    const brandColor = colorPalette[0] || '#FF7A5C';
    const accentColor = colorPalette[1] || '#FFFFFF';
  
    return (
      <div style={{ padding: '1rem', fontFamily: bodyFont, backgroundColor: accentColor }}>
        <h2
          style={{
            marginBottom: '1rem',
            fontSize: '1.5rem',
            fontFamily: headingFont,
            color: brandColor,
          }}
        >
          {name}
        </h2>
        {heroPrompt && (
          <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '1rem' }}>
            [AI Hero Prompt: {heroPrompt}]
          </div>
        )}
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {items.map((item) => {
            const numericPrice = parseFloat(item.price || '0');
            return (
              <li
                key={item.id}
                style={{
                  marginBottom: '1rem',
                  borderBottom: `1px solid ${brandColor}`,
                  paddingBottom: '0.5rem',
                }}
              >
                <strong>{item.name}</strong> &mdash;{' '}
                <span style={{ color: brandColor }}>${numericPrice.toFixed(2)}</span>
                <div style={{ fontSize: '0.9rem', color: '#555', marginTop: '0.25rem' }}>
                  {item.description}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
  