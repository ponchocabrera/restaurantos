export function ClassicTemplate({ items, menuName }) {
    const groupedItems = items.reduce((acc, item) => {
      const category = item.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
  
    return (
      <div className="font-serif bg-amber-50 p-8">
        <h1 className="text-4xl font-bold text-center mb-12 text-amber-900">
          {menuName}
        </h1>
  
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center text-amber-800 uppercase tracking-widest">
              {category}
            </h2>
            <div className="space-y-6">
              {categoryItems.map((item, index) => (
                <div 
                  key={index} 
                  className="flex flex-col text-center border-b border-amber-200 pb-4"
                >
                  <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                  <p className="text-gray-700 mb-2 italic">{item.description}</p>
                  <span className="text-lg font-bold text-amber-900">
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