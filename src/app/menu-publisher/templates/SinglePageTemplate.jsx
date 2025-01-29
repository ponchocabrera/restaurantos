// file: app/menu-publisher/templates/SinglePageTemplate.jsx

export function SinglePageTemplate({
    menuData,
    colorPalette = [],
    headingFont = 'Arial',
    bodyFont = 'Arial',
    heroPrompt = '',
    // brand props if you want them here
    logoUrl = '',
    businessName = '',
    tagline = '',
    address = '',
    phoneNumber = '',
    website = '',
    heroImageUrl = '',
  }) {
    if (!menuData) return <div>No data</div>;
  
    const { name, items = [] } = menuData;
  
    const brandColor = colorPalette[0] || '#FF7A5C';  // fallback color
    const accentColor = colorPalette[1] || '#FFF4F2'; // fallback second color
  
    return (
      <div
        style={{
          width: '8.5in',
          minHeight: '11in',
          margin: '0 auto',
          padding: '1in',
          backgroundColor: accentColor,
          fontFamily: bodyFont,
          color: '#333',
        }}
      >
        {/* Possibly show a top brand block */}
        {logoUrl && (
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <img src={logoUrl} alt="Logo" style={{ maxHeight: '80px', objectFit: 'contain' }} />
          </div>
        )}
        {businessName && (
          <h1
            style={{
              fontFamily: headingFont,
              textAlign: 'center',
              color: brandColor,
            }}
          >
            {businessName}
          </h1>
        )}
        {tagline && <p style={{ textAlign: 'center', fontStyle: 'italic' }}>{tagline}</p>}
        {/* We could do phone, address, etc. at the top or bottom */}
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          {address && <div>{address}</div>}
          {phoneNumber && <div>{phoneNumber}</div>}
          {website && <div>{website}</div>}
        </div>
  
        {/* Show a hero image if provided */}
        {heroImageUrl && (
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <img src={heroImageUrl} alt="Hero" style={{ maxWidth: '100%', borderRadius: '8px' }} />
          </div>
        )}
        {/* Or show the heroPrompt if no image */}
        {!heroImageUrl && heroPrompt && (
          <p style={{ fontSize: '0.8rem', color: '#666', fontStyle: 'italic', textAlign: 'center' }}>
            [AI Hero Prompt: {heroPrompt}]
          </p>
        )}
  
        <hr style={{ border: `1px solid ${brandColor}`, margin: '1rem 0' }} />
  
        <h2 style={{ color: brandColor, fontFamily: headingFont }}>{name || 'Menu'}</h2>
  
        {items.map((item) => {
          const numericPrice = parseFloat(item.price || '0');
          return (
            <div
              key={item.id}
              style={{
                marginBottom: '0.75rem',
                borderBottom: `1px dashed ${brandColor}`,
                paddingBottom: '0.5rem',
              }}
            >
              <strong style={{ fontSize: '1rem' }}>{item.name}</strong>
              <span style={{ float: 'right', color: brandColor }}>
                ${numericPrice.toFixed(2)}
              </span>
              <p style={{ marginTop: '0.5rem', clear: 'both' }}>{item.description}</p>
            </div>
          );
        })}
      </div>
    );
  }
  