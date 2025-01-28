export function MinimalTemplate({ items, menuName }) {
    const groupedItems = items.reduce((acc, item) => {
      const category = item.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
  
    return (
      <div className="font-mono max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8 uppercase tracking-wider">
          {menuName}
        </h1>
  
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category} className="mb-8">
            <h2 className="text-lg font-bold mb-4 uppercase">
              {category}
            </h2>
            <div className="space-y-4">
              {categoryItems.map((item, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-baseline border-b border-dotted border-gray-300 pb-2"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <span className="ml-4 font-bold">
                    ${parseFloat(item.price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }