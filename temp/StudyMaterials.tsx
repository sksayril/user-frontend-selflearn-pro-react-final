import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Book, ArrowLeft, FileText, Image as ImageIcon, FileIcon, ChevronRight, X, ChevronLeft, ChevronRight as ChevronRightIcon, Bookmark, Lock, FolderOpen } from 'lucide-react';
import PDFViewer from './PDFViewer';
import type { Category, SubCategory, SubCategoryResponse } from '../types/category';
import { useAuth } from '../contexts/AuthContext';

const StudyMaterials = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [navigationPath, setNavigationPath] = useState<SubCategory[]>([]);
  const [selectedContent, setSelectedContent] = useState<SubCategory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'images' | 'pdf' | 'all'>('all');
  
  // Image gallery state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxAnimation, setLightboxAnimation] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Subscription state
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  // State for parent categories
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  
  // Ref for top of page scrolling
  const pageTopRef = useRef<HTMLDivElement>(null);

  const API_URL = 'https://api.adhyan.guru/api';

  const scrollToTop = () => {
    pageTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Check if user is subscribed
  useEffect(() => {
    if (currentUser && currentUser.subscription) {
      setIsSubscribed(currentUser.subscription.isActive);
    } else {
      setIsSubscribed(false);
    }
  }, [currentUser]);

  // Fetch parent categories on component mount
  useEffect(() => {
    const fetchParentCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/categories/parents`);
        if (!response.ok) {
          throw new Error('Failed to fetch parent categories');
        }
        const data = await response.json();
        if (data[0]?.parents) {
          setParentCategories(data[0].parents);
          console.log('Parent categories loaded:', data[0].parents);
        }
      } catch (err) {
        console.error('Error fetching parent categories:', err);
      }
    };

    fetchParentCategories();
  }, [API_URL]);

  // Fetch subcategories when categoryId changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!categoryId) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/categories/subcategories/${categoryId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch subcategories');
        }
        const data: SubCategoryResponse[] = await response.json();
        console.log('Subcategories loaded:', data);
        setSubcategories(data[0]?.subcategories || []);
        // Scroll to top when new subcategories are loaded
        scrollToTop();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching subcategories:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubcategories();
    
    // Handle responsive sidebar - keep sidebar open on mobile for visibility
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // Keep sidebar visible even on mobile by default
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [categoryId, API_URL]);

  // Determine which content type to show based on availability
  useEffect(() => {
    if (selectedContent?.content) {
      const { text, imageUrls, pdfUrl } = selectedContent.content;
      
      if (text) {
        setActiveTab('text');
      } else if (imageUrls && imageUrls.length > 0) {
        setActiveTab('images');
      } else if (pdfUrl) {
        setActiveTab('pdf');
      } else {
        setActiveTab('all'); // Will show "No data found" message
      }
    }
  }, [selectedContent]);

  // Define navigateImage with useCallback to avoid dependency issues
  const navigateImage = useCallback((direction: number) => {
    if (!selectedContent?.content?.imageUrls) return;
    
    const imageUrls = selectedContent.content.imageUrls;
    const newIndex = (currentImageIndex + direction + imageUrls.length) % imageUrls.length;
    
    // Add animation class based on direction
    setLightboxAnimation(direction > 0 ? 'slide-left' : 'slide-right');
    
    // Change image after a short delay to allow animation to play
    setTimeout(() => {
      setCurrentImageIndex(newIndex);
      setLightboxAnimation(''); // Remove animation class
    }, 200);
  }, [selectedContent, currentImageIndex]);

  // Define closeLightbox with useCallback
  const closeLightbox = useCallback(() => {
    setLightboxAnimation('fade-out');
    
    setTimeout(() => {
      setLightboxOpen(false);
      setLightboxAnimation('');
    }, 200);
  }, []);

  // Handle keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        navigateImage(1);
      } else if (e.key === 'ArrowLeft') {
        navigateImage(-1);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, navigateImage, closeLightbox]);

  const handleSubcategoryClick = (subcategory: SubCategory) => {
    setSelectedContent(subcategory);
    
    // For mobile, hide the sidebar after selection to maximize content view
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
    
    // If content is protected, we need to check if user is subscribed first
    if (subcategory.isProtected) {
      if (!isAuthenticated) {
        navigate('/login', { state: { from: `/study-materials/${categoryId}` } });
        return;
      }
      
      if (!isSubscribed) {
        setShowSubscriptionModal(true);
        return;
      }
    }
    
    // Scroll to content
    setTimeout(() => {
      window.scrollTo({
        top: pageTopRef.current?.offsetTop || 0,
        behavior: 'smooth'
      });
    }, 100);
  };

  const handleBack = () => {
    if (navigationPath.length > 0) {
      const currentPath = [...navigationPath];
      
      // Remove current and go back one level
      currentPath.pop();
      
      if (currentPath.length === 0) {
        // We're back at the root, clear selected content
        setSelectedContent(null);
        setNavigationPath([]);
      } else {
        // Go to previous item in path
        const previousItem = currentPath[currentPath.length - 1];
        setSelectedContent(previousItem);
        setNavigationPath(currentPath);
      }
    } else {
      // If there's no path (direct URL access), go back to main subcategory view
      setSelectedContent(null);
    }
    
    // For mobile, show the sidebar again
    setIsSidebarOpen(true);
  };

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const renderContentTabs = () => {
    if (!selectedContent?.content) return null;
    
    const { text, imageUrls, pdfUrl } = selectedContent.content;
    const hasText = !!text;
    const hasImages = imageUrls && imageUrls.length > 0;
    const hasPdf = !!pdfUrl;
    
    // If we only have one type of content, don't show tabs
    if ([hasText, hasImages, hasPdf].filter(Boolean).length <= 1) {
      return null;
    }
    
    return (
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex space-x-4">
          {hasText && (
            <button
              onClick={() => setActiveTab('text')}
              className={`px-3 py-2 font-medium text-sm rounded-t-lg border-b-2 -mb-px flex items-center ${
                activeTab === 'text' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Text
            </button>
          )}
          
          {hasImages && (
            <button
              onClick={() => setActiveTab('images')}
              className={`px-3 py-2 font-medium text-sm rounded-t-lg border-b-2 -mb-px flex items-center ${
                activeTab === 'images' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Images
            </button>
          )}
          
          {hasPdf && (
            <button
              onClick={() => setActiveTab('pdf')}
              className={`px-3 py-2 font-medium text-sm rounded-t-lg border-b-2 -mb-px flex items-center ${
                activeTab === 'pdf' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileIcon className="w-4 h-4 mr-2" />
              PDF
            </button>
          )}
          
          {/* <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-2 font-medium text-sm rounded-t-lg border-b-2 -mb-px flex items-center ${
              activeTab === 'all' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Book className="w-4 h-4 mr-2" />
            All
          </button> */}
        </nav>
      </div>
    );
  };

  const renderImageGallery = (imageUrls: string[]) => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
        {imageUrls.map((url, index) => (
          <div 
            key={index}
            className="relative aspect-[3/2] overflow-hidden rounded-lg border border-gray-200 bg-gray-100 cursor-pointer transform transition hover:scale-[1.02] hover:shadow-md"
            onClick={() => openLightbox(index)}
          >
            <img 
              src={url}
              alt={`Study material ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    );
  };

  const renderLightbox = () => {
    if (!lightboxOpen || !selectedContent?.content?.imageUrls) return null;
    
    const { imageUrls } = selectedContent.content;
    const currentImage = imageUrls[currentImageIndex];
    
    return (
      <div 
        className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
        onClick={closeLightbox}
      >
        <div 
          className={`relative max-w-4xl max-h-[90vh] ${lightboxAnimation}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button 
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full z-20 hover:bg-black/70 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          {/* Image */}
          <div className="relative">
            <img 
              src={currentImage}
              alt={`Study material ${currentImageIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain"
            />
            
            {/* Navigation arrows */}
            {imageUrls.length > 1 && (
              <>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage(-1);
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage(1);
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
            
            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
              {currentImageIndex + 1} / {imageUrls.length}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTextContent = (text: string) => {
    return (
      <div className="prose prose-blue max-w-none px-1">
        {text.split('\n').map((paragraph, i) => (
          <p key={i} className="mb-4">{paragraph}</p>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    if (!selectedContent?.content) return null;
    
    const { text, imageUrls, pdfUrl } = selectedContent.content;
    
    // If no content is available
    if (!text && (!imageUrls || imageUrls.length === 0) && !pdfUrl) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="bg-gray-100 p-6 rounded-full mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No content available</h3>
          <p className="text-gray-500 max-w-md">
            This material doesn't have any content yet. Please check back later.
          </p>
        </div>
      );
    }
    
    // Show everything in "all" mode
    if (activeTab === 'all') {
      return (
        <div className="space-y-8">
          {text && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-500" />
                Text Content
              </h3>
              {renderTextContent(text)}
            </div>
          )}
          
          {imageUrls && imageUrls.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-blue-500" />
                Images
              </h3>
              {renderImageGallery(imageUrls)}
            </div>
          )}
          
          {pdfUrl && (
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                <FileIcon className="w-5 h-5 mr-2 text-blue-500" />
                PDF Document
              </h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <PDFViewer url={pdfUrl} />
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // Show specific content based on active tab
    switch (activeTab) {
      case 'text':
        return text ? renderTextContent(text) : null;
      case 'images':
        return imageUrls && imageUrls.length > 0 ? renderImageGallery(imageUrls) : null;
      case 'pdf':
        return pdfUrl ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <PDFViewer url={pdfUrl} />
          </div>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Reference for scroll to top */}
      <div ref={pageTopRef} className="absolute top-0"></div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs and back button */}
        {selectedContent && (
          <div className="mb-6">
            <button
              onClick={handleBack}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to list
            </button>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className={`md:col-span-1 order-2 md:order-1 ${isSidebarOpen ? 'block' : 'hidden md:block'}`}>
            <div className="sticky top-20 space-y-4">
              {/* Parent Categories */}
              {!isLoading && parentCategories.length > 0 && (
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
              )}
              
              {/* Subcategories */}
              {!isLoading && subcategories.length > 0 && (
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
              )}
            </div>
          </div>

          {/* Content Display */}
          <div className="md:col-span-3 order-1 md:order-2">
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              {selectedContent ? (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                      {selectedContent.name}
                    </h2>
                    {selectedContent.description && (
                      <p className="mt-2 text-gray-600">{selectedContent.description}</p>
                    )}
                  </div>
                  {renderContentTabs()}
                  <div className="mt-6">
                    {renderContent()}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="bg-blue-50 p-6 rounded-full mb-4">
                    <Book className="w-12 h-12 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Select a category</h3>
                  <p className="text-gray-500 max-w-md">
                    Choose a category from the list to view study materials
                  </p>
                  
                  {/* Mobile-only action button - Just toggle visibility */}
                  {!isSidebarOpen && (
                    <button
                      onClick={() => setIsSidebarOpen(true)}
                      className="mt-6 md:hidden bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                    >
                      <Bookmark className="w-5 h-5 mr-2" />
                      Show Categories
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {renderLightbox()}
      
      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 mx-4 animate-scaleIn">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Premium Content</h3>
              <p className="text-gray-500 mb-6">
                This content is available exclusively to our premium subscribers. Subscribe now to access all study materials, including text content, PDF files, and high-quality images.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={() => navigate('/subscription')}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors"
                >
                  Subscribe Now
                </button>
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="w-full sm:w-auto mt-2 sm:mt-0 border border-gray-300 text-gray-700 px-4 py-2 rounded font-medium hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add some CSS for animations */}
      <style>
        {`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .slide-left {
          animation: slideLeft 0.3s ease-out;
        }
        .slide-right {
          animation: slideRight 0.3s ease-out;
        }
        .fade-out {
          animation: fadeOut 0.3s ease-out;
        }
        @keyframes slideLeft {
          0% { opacity: 0; transform: translateX(20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideRight {
          0% { opacity: 0; transform: translateX(-20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeOut {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        `}
      </style>
    </div>
  );
};

export default StudyMaterials;
