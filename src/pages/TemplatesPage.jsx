// pages/TemplatesPage.jsx - Fixed with getTemplateById for preview
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  getAllTemplates, 
  getTemplateCategories, 
  setSelectedCategory,
  clearError,
  clearMessage,
  getTemplateById
} from '../slice/templateSlice';
import { createWebsite } from '../slice/websiteSlice';
import { toast } from 'react-toastify';
import TemplatePreview from '../components/TemplatePreview';

const TemplatesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { 
    templates, 
    categories, 
    pagination, 
    isLoading, 
    selectedCategory,
    currentTemplate,
    error,
    message 
  } = useSelector((state) => state.template);

  const { user } = useSelector((state) => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    dispatch(getTemplateCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllTemplates({ 
      page: currentPage, 
      limit: 12, 
      category: selectedCategory 
    }));
  }, [dispatch, currentPage, selectedCategory]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (message) {
      toast.success(message);
      dispatch(clearMessage());
    }
  }, [error, message, dispatch]);

  const handleCategoryChange = (category) => {
    dispatch(setSelectedCategory(category));
    setCurrentPage(1);
  };

  const handleUseTemplate = async (templateId, templateName) => {
    if (!user) {
      toast.error('Please login to use templates');
      navigate('/login');
      return;
    }

    try {
      await dispatch(createWebsite({
        userId: user._id,
        templateId,
        customName: `My ${templateName}`
      })).unwrap();

      toast.success('Website created successfully!');
      navigate('/user-websites');
    } catch (error) {
      toast.error(error?.message || 'Failed to create website');
    }
  };

  // ✅ FIXED: Fetch template by ID for preview
  const handlePreview = async (templateId) => {
    try {
      setLoadingPreview(true);
      await dispatch(getTemplateById(templateId)).unwrap();
      setShowPreview(true);
      setLoadingPreview(false);
    } catch (error) {
      setLoadingPreview(false);
      toast.error('Failed to load template preview');
      console.error('Preview error:', error);
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="text-center">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl mb-[-30px]">
            Pick the Website Template You Love
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search and Filters */}
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search templates by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 pl-14 bg-base-100 border-0 border-b-[1px] border-base-content focus:border-blue-500 focus:outline-none transition-colors duration-200"
            />
            <svg
              className="absolute left-5 top-4 h-6 w-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-5 top-5 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide">Filter by Category</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleCategoryChange('')}
                className={`px-6 py-2.5 text-sm transition-all ${
                  selectedCategory === ''
                    ? 'border-0 border-b-[1px] focus:outline-none transition-colors duration-200 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary'
                    : 'bg-base-100 hover:text-primary'
                }`}
              >
                All Templates
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`px-2 py-2.5 text-sm transition-all ${
                    selectedCategory === cat.value
                      ? 'border-0 border-b-[1px] focus:outline-none transition-colors duration-200 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary'
                      : 'bg-base-100 hover:text-primary'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="bg-base-content/5 px-10 py-5 -ml-12 -mr-12 min-h-screen">
          {/* Results Count */}
          <div className="text-lg p-2 mb-5">
            Showing <span className="font-semibold">{filteredTemplates.length}</span> Template{filteredTemplates.length !== 1 ? 's' : ''}
            {searchTerm && ` for "${searchTerm}"`}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                  <div className="h-56 bg-gray-200"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm">
              <svg
                className="mx-auto h-16 w-16 text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? `No templates match "${searchTerm}". Try a different search term.`
                  : 'Try adjusting your filters to see more templates.'}
              </p>
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    handleCategoryChange('');
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredTemplates.map((template) => (
                <div
                  key={template._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 group border border-gray-100"
                >
                  {/* Template Thumbnail */}
                  <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {template.thumbnail ? (
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Preview%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                        <span className="text-white text-5xl">🎨</span>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6 gap-3">
                      <button
                        onClick={() => handlePreview(template._id)}
                        disabled={loadingPreview}
                        className="bg-white text-gray-900 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition transform hover:scale-105 shadow-lg disabled:opacity-50"
                      >
                        {loadingPreview ? '⏳ Loading...' : '👁️ Live Preview'}
                      </button>
                      <button
                        onClick={() => handleUseTemplate(template._id, template.name)}
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition transform hover:scale-105 shadow-lg"
                      >
                        ✨ Use Template
                      </button>
                    </div>

                    {/* Popular Badge */}
                    {template.usageCount > 50 && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          🔥 Popular
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Template Info */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-lg mb-2 truncate group-hover:text-blue-600 transition">
                      {template.name}
                    </h3>
                    
                    {template.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {template.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
                        {template.category}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                        </svg>
                        {template.usageCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-5 py-2.5 rounded-lg border-2 border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 font-medium transition"
            >
              ← Previous
            </button>
            
            <div className="flex gap-2">
              {[...Array(pagination.totalPages)].map((_, i) => {
                const page = i + 1;
                if (
                  page === 1 ||
                  page === pagination.totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2.5 rounded-lg border-2 font-medium transition ${
                        currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return <span key={i} className="px-2 py-2.5 text-gray-400">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
              disabled={currentPage === pagination.totalPages}
              className="px-5 py-2.5 rounded-lg border-2 border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 font-medium transition"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Live Template Preview Modal */}
      {showPreview && currentTemplate && (
        <TemplatePreview
          template={currentTemplate}
          onClose={handleClosePreview}
          onUseTemplate={handleUseTemplate}
        />
      )}

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default TemplatesPage;