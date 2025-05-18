// Parent category section for sidebar
<div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 mb-4">
  <div className="p-3 bg-blue-50 border-b border-blue-100">
    <h3 className="text-blue-700 font-semibold tracking-wide flex items-center">
      <FolderOpen className="w-5 h-5 mr-2" />
      Study Categories
    </h3>
  </div>
  <div className="divide-y divide-gray-100">
    {parentCategories.map(category => (
      <button
        key={category._id}
        onClick={() => navigate(`/study-materials/${category._id}`)}
        className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center ${
          categoryId === category._id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
        }`}
      >
        <Book className={`w-4 h-4 mr-3 ${
          categoryId === category._id ? 'text-blue-600' : 'text-gray-500'
        }`} />
        {category.name}
      </button>
    ))}
  </div>
</div>

// Subcategories section for sidebar (existing code with minor improvements)
<div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 divide-y divide-gray-100 flex flex-col h-full">
  <div className="p-2">
    <h3 className="text-gray-500 text-sm uppercase font-medium tracking-wider px-2 py-2">Topics</h3>
  </div>
  <div className="flex-1 overflow-y-auto scrollbar-hide">
    {subcategories.length === 0 ? (
      <div className="p-4 text-center text-gray-500">
        No items found
      </div>
    ) : (
      <div className="space-y-1">
        {subcategories.map((subcategory) => (
          <button
            key={subcategory._id}
            onClick={() => handleSubcategoryClick(subcategory)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-between group ${
              selectedContent?._id === subcategory._id 
                ? 'bg-blue-50 text-blue-700' 
                : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
            }`}
          >
            <span className="font-medium">
              {subcategory.name}
            </span>
            {subcategory.type === 'content' ? (
              <FileText className={`w-5 h-5 ${
                selectedContent?._id === subcategory._id 
                  ? 'text-blue-500' 
                  : 'text-gray-400 group-hover:text-gray-600'
              }`} />
            ) : (
              <Book className={`w-5 h-5 ${
                selectedContent?._id === subcategory._id 
                  ? 'text-blue-500' 
                  : 'text-gray-400 group-hover:text-gray-600'
              }`} />
            )}
          </button>
        ))}
      </div>
    )}
  </div>
</div>
