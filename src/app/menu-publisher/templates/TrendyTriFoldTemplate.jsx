// file: app/menu-publisher/templates/TrendyTriFoldTemplate.jsx

export function TrendyTriFoldTemplate({
    menuData,
    colorPalette = [],
    headingFont = 'Arial',
    bodyFont = 'Arial',
    heroPrompt = '',
    // 3 distinct texture URLs
    textureUrl1 = '',
    textureUrl2 = '',
    textureUrl3 = '',
  
    logoUrl = '',
    businessName = '',
    tagline = '',
    address = '',
    phoneNumber = '',
    website = '',
    dishImages = [],
  }) {
    if (!menuData) return <div>No data</div>;
  
    const { name = '', items = [] } = menuData;
  
    const brandColor = colorPalette[0] || '#D23F2B';
    const accentColor = colorPalette[1] || '#F5EBD9';
  
    // Split items
    const totalCount = items.length;
    const perColumn = Math.ceil(totalCount / 3);
    const col1 = items.slice(0, perColumn);
    const col2 = items.slice(perColumn, perColumn * 2);
    const col3 = items.slice(perColumn * 2);
  
    // We'll do 3 folds, each with its own texture background
    // Possibly do semi-transparent overlay on each
    const containerStyle = {
      display: 'flex',
      width: '11in',
      minHeight: '8.5in',
      margin: '0 auto',
      fontFamily: bodyFont,
      color: '#333',
    };
  
    const panelCommon = {
      width: '33.33%',
      padding: '1rem',
      boxSizing: 'border-box',
      position: 'relative', // so we can have overlays
    };
  
    const overlayStyle = {
      backgroundColor: 'rgba(255,255,255,0.8)',
      backdropFilter: 'blur(4px)',
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 1,
    };
  
    const contentStyle = {
      position: 'relative',
      zIndex: 2, // above the overlay
    };
  
    return (
      <div style={containerStyle}>
        {/* LEFT PANEL */}
        <div
          style={{
            ...panelCommon,
            borderRight: `2px solid ${brandColor}`,
            backgroundImage: textureUrl1 ? `url(${textureUrl1})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'repeat',
          }}
        >
          {/* The semi-transparent overlay */}
          <div style={overlayStyle}></div>
          <div style={contentStyle}>
            {/* Logo, brand block, etc. */}
            {logoUrl && (
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <img src={logoUrl} alt="Logo" style={{ maxWidth: '80%', height: 'auto' }} />
              </div>
            )}
            <h2
              style={{
                fontFamily: headingFont,
                fontSize: '1.5rem',
                color: brandColor,
                textAlign: 'center',
                marginBottom: '0.5rem',
              }}
            >
              {businessName}
            </h2>
            {tagline && (
              <p style={{ textAlign: 'center', fontStyle: 'italic', marginBottom: '1rem' }}>
                {tagline}
              </p>
            )}
            {(address || phoneNumber || website) && (
              <div style={{ fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center' }}>
                {address && <div>{address}</div>}
                {phoneNumber && <div>{phoneNumber}</div>}
                {website && <div>{website}</div>}
              </div>
            )}
            {heroPrompt && (
              <p style={{ fontStyle: 'italic', fontSize: '0.8rem', color: '#555' }}>
                [AI Hero Prompt: {heroPrompt}]
              </p>
            )}
            {/* Optionally show a dish image */}
            {dishImages[0] && (
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <img
                  src={dishImages[0]}
                  alt="Dish"
                  style={{ width: '100%', borderRadius: '8px' }}
                />
              </div>
            )}
          </div>
        </div>
  
        {/* MIDDLE PANEL */}
        <div
          style={{
            ...panelCommon,
            borderRight: `2px solid ${brandColor}`,
            backgroundImage: textureUrl2 ? `url(${textureUrl2})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'repeat',
          }}
        >
          <div style={overlayStyle}></div>
          <div style={contentStyle}>
            <h3
              style={{
                fontFamily: headingFont,
                color: brandColor,
                borderBottom: `2px solid ${brandColor}`,
                marginTop: 0,
                paddingBottom: '0.5rem',
              }}
            >
              {name || 'Menu'}
            </h3>
            {col1.map((item) => {
              const numericPrice = parseFloat(item.price || '0');
              return (
                <div
                  key={item.id}
                  style={{
                    marginBottom: '1rem',
                    borderBottom: `1px dashed ${brandColor}`,
                    paddingBottom: '0.5rem',
                  }}
                >
                  <strong>{item.name}</strong>
                  <span style={{ float: 'right', color: brandColor, fontWeight: 'bold' }}>
                    ${numericPrice.toFixed(2)}
                  </span>
                  <div style={{ clear: 'both', marginTop: '0.25rem' }}>{item.description}</div>
                </div>
              );
            })}
            {col2.map((item) => {
              const numericPrice = parseFloat(item.price || '0');
              return (
                <div
                  key={item.id}
                  style={{
                    marginBottom: '1rem',
                    borderBottom: `1px dashed ${brandColor}`,
                    paddingBottom: '0.5rem',
                  }}
                >
                  <strong>{item.name}</strong>
                  <span style={{ float: 'right', color: brandColor, fontWeight: 'bold' }}>
                    ${numericPrice.toFixed(2)}
                  </span>
                  <div style={{ clear: 'both', marginTop: '0.25rem' }}>{item.description}</div>
                </div>
              );
            })}
          </div>
        </div>
  
        {/* RIGHT PANEL */}
        <div
          style={{
            ...panelCommon,
            borderRight: 'none',
            backgroundImage: textureUrl3 ? `url(${textureUrl3})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'repeat',
          }}
        >
          <div style={overlayStyle}></div>
          <div style={contentStyle}>
            {col3.map((item) => {
              const numericPrice = parseFloat(item.price || '0');
              return (
                <div
                  key={item.id}
                  style={{
                    marginBottom: '1rem',
                    borderBottom: `1px dashed ${brandColor}`,
                    paddingBottom: '0.5rem',
                  }}
                >
                  <strong>{item.name}</strong>
                  <span style={{ float: 'right', color: brandColor, fontWeight: 'bold' }}>
                    ${numericPrice.toFixed(2)}
                  </span>
                  <div style={{ clear: 'both', marginTop: '0.25rem' }}>{item.description}</div>
                </div>
              );
            })}
  
            {/* Another dish image? */}
            {dishImages[1] && (
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <img
                  src={dishImages[1]}
                  alt="Dish"
                  style={{ width: '100%', borderRadius: '8px' }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  