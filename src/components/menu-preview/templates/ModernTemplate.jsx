export function ModernTemplate({ items, menuName }) {
    // Group items by category
    const groupedItems = items.reduce((acc, item) => {
      const category = item.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
  
    return (
      <div className="font-sans">
        {/* Restaurant Name */}
        <h1 className="text-3xl font-bold text-center mb-8">{menuName}</h1>
  
        {/* Categories and Items */}
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600 border-b pb-2">
              {category}
            </h2>
            <div className="grid gap-4">
              {categoryItems.map((item, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">{item.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                  </div>
                  <div className="text-lg font-semibold ml-4">
                    ${parseFloat(item.price).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }