import { useState, useEffect, useRef, useCallback, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Book, ArrowLeft, FileText, Image as ImageIcon, FileIcon, ChevronRight, X, ChevronLeft, ChevronRight as ChevronRightIcon, Bookmark, Lock, FolderOpen, Video } from 'lucide-react';
import PDFViewer from './PDFViewer';
import LockedContent from './LockedContent';
import AITeacher from './AITeacher';
import type { Category, SubCategoryResponse } from '../types/category';
import { useAuth } from '../contexts/AuthContext';
import { useContentProtection } from '../contexts/ContentProtectionContext';

// Extended SubCategory type with isProtected property
interface SubCategory {
  _id: string;
  name: string;
  type: 'folder' | 'content' | 'category';
  isProtected?: boolean;
  description?: string;
  content?: {
    text?: string;
    pdfUrl?: string;
    imageUrls?: string[];
    pdfProtected?: boolean;
    fullTextAvailable?: boolean;
    moreImagesAvailable?: boolean;
    videoUrl?: string;
  };
  path?: string[];
}

// Add VideoPlayer component at the top level
const VideoPlayer = ({ url }: { url: string }) => {
  // Extract video ID from YouTube URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeId(url);
  
  if (!videoId) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-100 rounded-lg">
        <p className="text-gray-500">Invalid video URL</p>
      </div>
    );
  }

  return (
    <div className="relative pb-[56.25%] h-0 rounded-lg overflow-hidden">
      <iframe
        className="absolute top-0 left-0 w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

const StudyMaterials = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { isContentLocked } = useContentProtection();
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [navigationPath, setNavigationPath] = useState<SubCategory[]>([]);
  const [selectedContent, setSelectedContent] = useState<SubCategory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'images' | 'pdf' | 'all' | 'video'>('all');
  
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

  const API_URL = 'http://localhost:3300/api';

  // Wrap scrollToTop in useCallback to avoid dependency issues in useEffect
  const scrollToTop = useCallback(() => {
    pageTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [pageTopRef]);

  // Check if user is subscribed - enhanced version that fetches latest subscription status
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      // First check if user is authenticated
      if (!isAuthenticated || !currentUser) {
        console.log('User not authenticated. Authentication required first.');
        setIsSubscribed(false);
        return;
      }
      
      console.log('User authenticated:', currentUser.name || currentUser.email);
      
      try {
        // Use cached subscription status first for immediate UI response
        if (currentUser.subscription) {
          setIsSubscribed(currentUser.subscription.isActive);
          console.log('Using cached subscription status:', currentUser.subscription.isActive);
        }
        
        // Always fetch latest subscription status from API
        console.log('Fetching latest subscription status from API...');
        const response = await fetch(`${API_URL}/users/subscription/status`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsSubscribed(data.isActive);
          console.log('Latest subscription status verified:', data.isActive);
          
          // Store updated subscription status in localStorage for persistence
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          userData.subscription = {
            isActive: data.isActive,
            plan: data.plan,
            endDate: data.endDate
          };
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          // If API call fails, rely on user object data but log the error
          console.error('Failed to fetch subscription status:', response.status);
          if (response.status === 401) {
            console.error('Authentication token expired or invalid');
            // Could handle token refresh here if needed
          }
        }
      } catch (err) {
        console.error('Error checking subscription status:', err);
      }
    };
    
    checkSubscriptionStatus();
  }, [currentUser, isAuthenticated, API_URL]);

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
        // For fetching subcategories, we'll use the public API endpoint that doesn't reveal content
        // This endpoint doesn't require subscription, as it only shows folder structure
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
  }, [categoryId, API_URL, scrollToTop]);

  // Determine which content type to show based on availability
  useEffect(() => {
    if (selectedContent?.content) {
      const { text, imageUrls, pdfUrl, videoUrl } = selectedContent.content;
      
      if (text) {
        setActiveTab('text');
      } else if (imageUrls && imageUrls.length > 0) {
        setActiveTab('images');
      } else if (pdfUrl) {
        setActiveTab('pdf');
      } else if (videoUrl) {
        setActiveTab('video');
      } else {
        setActiveTab('all'); // Will show "No data found" message
      }
    }
  }, [selectedContent]);

  // Define navigateImage with useCallback to avoid dependency issues
  const navigateImage = useCallback((direction: number) => {
    if (!selectedContent?.content?.imageUrls) return;
    
    const imageCount = selectedContent.content.imageUrls.length;
    let newIndex = currentImageIndex + direction;
    
    // Loop around if at the beginning/end
    if (newIndex < 0) newIndex = imageCount - 1;
    if (newIndex >= imageCount) newIndex = 0;
    
    // Set animation direction
    setLightboxAnimation(direction > 0 ? 'slide-left' : 'slide-right');
    setTimeout(() => setLightboxAnimation(''), 300);
    
    setCurrentImageIndex(newIndex);
  }, [selectedContent, currentImageIndex]);

  // Define closeLightbox with useCallback
  const closeLightbox = useCallback(() => {
    setLightboxAnimation('fade-out');
    setTimeout(() => {
      setLightboxOpen(false);
      setLightboxAnimation('');
      document.body.style.overflow = 'auto'; // Re-enable scrolling
    }, 300);
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

  const handleSubcategoryClick = useCallback(async (subcategory: SubCategory) => {
    scrollToTop(); // Scroll to top when clicking on any subcategory
    
    // STEP 1: Always check authentication first
    // Regardless of whether content is protected, we'll check authentication
    // to establish a consistent flow: login -> subscription -> content
    if (!isAuthenticated) {
      console.log('Authentication check failed: User not logged in');
      navigate('/login', { 
        state: { 
          from: `/study-materials/${categoryId}`,
          targetContent: subcategory._id,
          message: 'Please log in to access study materials'
        } 
      });
      return;
    }
    
    console.log('Authentication check passed: User is logged in');
    
    // STEP 2: Check subscription status for protected content
    // Only proceed to content if user has necessary subscription
    if (subcategory.isProtected && !isSubscribed) {
      console.log('Subscription check failed: Protected content requires subscription');
      setShowSubscriptionModal(true);
      return;
    }
    
    console.log(subcategory.isProtected ? 
      'Subscription check passed: User has active subscription' : 
      'Subscription check skipped: Content is not protected');
    
    // STEP 3: Now that auth and subscription checks have passed, show the content
    console.log('Proceeding to content access');
    
    // Handle content type subcategory
    if (subcategory.type === 'content') {
      console.log('Opening content item:', subcategory.name);
      
      // For protected content, we need to verify again server-side
      // by using the protected API endpoint that requires subscription
      if (subcategory.isProtected) {
        try {
          // Use the protected content API endpoint (/api/categories/:id)
          // This endpoint requires authentication and active subscription
          const response = await fetch(`${API_URL}/categories/${subcategory._id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }
          });
          
          if (response.status === 403) {
            // 403 Forbidden - User doesn't have an active subscription
            console.error('Server rejected access: No active subscription');
            setIsSubscribed(false); // Update subscription status
            setShowSubscriptionModal(true);
            return;
          }
          
          if (!response.ok) {
            throw new Error(`Failed to fetch content: ${response.status} ${response.statusText}`);
          }
          
          // If we get here, the user is authorized to view the content
          const fullContentData = await response.json();
          
          // Update the subcategory with the full content data
          setSelectedContent({
            ...subcategory,
            content: fullContentData.content,
          });
        } catch (err) {
          console.error('Error fetching protected content:', err);
          setError(err instanceof Error ? err.message : 'Failed to load protected content');
          return;
        }
      } else {
        // Non-protected content can be displayed directly
        setSelectedContent(subcategory);
      }
      
      // For mobile, hide the sidebar after selection to maximize content view
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
      return;
    }

    // Handle folder type subcategory (contains more subcategories)
    setIsLoading(true);
    setError(null);
    try {
      console.log(`Fetching subcategories for: ${subcategory.name} (${subcategory._id})`);
      
      // Include authorization header for all API requests
      const response = await fetch(`${API_URL}/categories/subcategories/${subcategory._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      
      if (!response.ok) {
        // Handle different error cases
        if (response.status === 401) {
          // Token expired or invalid
          console.error('Authentication token expired or invalid');
          navigate('/login', { 
            state: { 
              from: `/study-materials/${categoryId}`,
              message: 'Your session has expired. Please log in again.'
            } 
          });
          return;
        }
        
        if (response.status === 403) {
          // User authenticated but not subscribed to access this content
          console.error('Subscription required for this content');
          setShowSubscriptionModal(true);
          return;
        }
        
        throw new Error(`Failed to fetch content: ${response.status} ${response.statusText}`);
      }
      
      const data: SubCategoryResponse[] = await response.json();
      console.log(`Retrieved ${data[0]?.subcategories?.length || 0} subcategories`);
      
      setSubcategories(data[0]?.subcategories || []);
      setNavigationPath(prev => [...prev, subcategory]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching content:', err);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, categoryId, isAuthenticated, isSubscribed, navigate, scrollToTop]);

  const handleBack = useCallback(async () => {
    scrollToTop(); // Scroll to top when navigating back
    
    if (selectedContent) {
      setSelectedContent(null);
      setActiveTab('all');
      return;
    }

    if (navigationPath.length === 0) {
      navigate('/');
      return;
    }

    const newPath = [...navigationPath];
    newPath.pop();
    setNavigationPath(newPath);

    if (newPath.length === 0) {
      if (categoryId) {
        const response = await fetch(`${API_URL}/categories/subcategories/${categoryId}`);
        const data: SubCategoryResponse[] = await response.json();
        setSubcategories(data[0]?.subcategories || []);
      }
    } else {
      const lastCategory = newPath[newPath.length - 1];
      const response = await fetch(`${API_URL}/categories/subcategories/${lastCategory._id}`);
      const data: SubCategoryResponse[] = await response.json();
      setSubcategories(data[0]?.subcategories || []);
    }
  }, [API_URL, categoryId, navigate, navigationPath, selectedContent, scrollToTop]);

  const openLightbox = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden'; // Disable scrolling when lightbox is open
  }, []);

  const renderContentTabs = () => {
    if (!selectedContent?.content) return null;
    
    const { text, imageUrls, pdfUrl, videoUrl } = selectedContent.content;
    const hasText = !!text;
    const hasImages = imageUrls && imageUrls.length > 0;
    const hasPdf = !!pdfUrl;
    const hasVideo = !!videoUrl;
    
    // If we only have one type of content, don't show tabs
    if ([hasText, hasImages, hasPdf, hasVideo].filter(Boolean).length <= 1) {
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

          {hasVideo && (
            <button
              onClick={() => setActiveTab('video')}
              className={`px-3 py-2 font-medium text-sm rounded-t-lg border-b-2 -mb-px flex items-center ${
                activeTab === 'video' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Video className="w-4 h-4 mr-2" />
              Video
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
    // Check if content is protected and user is not subscribed
    if ((selectedContent?.isProtected && !isSubscribed) || isContentLocked) {
      // If we have a preview image available, show it with blur effect
      if (imageUrls.length > 0 && selectedContent?.content?.moreImagesAvailable) {
      return (
          <div className="space-y-4">
            <div className="relative">
              <img 
                src={imageUrls[0]} 
                alt="Preview" 
                className="w-full rounded-lg shadow-sm filter blur-sm" 
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-50 rounded-lg">
                <LockedContent 
                  contentType="image" 
                  onSubscribe={() => setShowSubscriptionModal(true)} 
                />
          </div>
            </div>
        </div>
      );
    }
    
    return (
        <LockedContent 
          contentType="image" 
          onSubscribe={() => setShowSubscriptionModal(true)} 
        />
      );
    }
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {imageUrls.map((url, index) => (
          <div 
            key={index}
            className="relative group overflow-hidden rounded-lg shadow-sm border border-gray-200 cursor-pointer"
            onClick={() => {
              setCurrentImageIndex(index);
              setLightboxOpen(true);
              document.body.style.overflow = 'hidden'; // Prevent scrolling when lightbox is open
            }}
          >
            <img 
              src={url}
              alt={`Image ${index + 1}`} 
              className="w-full h-60 object-cover transform group-hover:scale-105 transition-transform duration-200" 
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200" />
          </div>
        ))}
      </div>
    );
  };

  const renderLightbox = () => {
    if (!lightboxOpen || !selectedContent?.content?.imageUrls) return null;
    
    // Check subscription for protected content
    if (selectedContent.isProtected && !isSubscribed) {
      // Close the lightbox as the user shouldn't have access
      closeLightbox();
      return null;
    }
    
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
    // Check if content is protected and user is not subscribed
    if ((selectedContent?.isProtected && !isSubscribed) || isContentLocked) {
      return (
        <LockedContent 
          contentType="text" 
          onSubscribe={() => setShowSubscriptionModal(true)} 
        />
      );
    }
    
    return (
      <>
      <div className="prose prose-blue max-w-none px-1">
        {text.split('\n').map((paragraph, i) => (
          <p key={i} className="mb-4">{paragraph}</p>
        ))}
      </div>
        
        {/* AI Teacher Component */}
        {selectedContent && (
          <AITeacher 
            contentText={text} 
            subCategoryName={selectedContent.name}
            isSubscribed={isSubscribed} 
          />
        )}
      </>
    );
  };

  const renderContent = () => {
    if (!selectedContent?.content) return null;
    
    const { text, imageUrls, pdfUrl, pdfProtected, videoUrl } = selectedContent.content;
    
    // If no content is available
    if (!text && (!imageUrls || imageUrls.length === 0) && !pdfUrl && !videoUrl) {
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
    
    // Check if content is protected and user is not subscribed - global lock for entire content
    if ((selectedContent.isProtected && !isSubscribed) || isContentLocked) {
      return (
        <LockedContent 
          contentType="general" 
          onSubscribe={() => setShowSubscriptionModal(true)} 
        />
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
                Images {selectedContent.content?.moreImagesAvailable && isContentLocked && <span className="ml-2 text-sm text-blue-500">(Subscribe to see all images)</span>}
              </h3>
              {renderImageGallery(imageUrls)}
            </div>
          )}
          
          {pdfUrl && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                <FileIcon className="w-5 h-5 mr-2 text-blue-500" />
                PDF Document
              </h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {(pdfProtected || isContentLocked) ? (
                  <LockedContent 
                    contentType="pdf" 
                    onSubscribe={() => setShowSubscriptionModal(true)} 
                  />
                ) : (
                <PDFViewer url={pdfUrl} />
                )}
              </div>
            </div>
          )}

          {videoUrl && (
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                <Video className="w-5 h-5 mr-2 text-blue-500" />
                Video Content
              </h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <VideoPlayer url={videoUrl} />
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
        if (pdfUrl) {
          if (pdfProtected || isContentLocked) {
            return (
              <LockedContent 
                contentType="pdf" 
                onSubscribe={() => setShowSubscriptionModal(true)} 
              />
            );
          }
          
          return (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <PDFViewer url={pdfUrl} />
            </div>
          );
        }
        return null;
      case 'video':
        return videoUrl ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <VideoPlayer url={videoUrl} />
          </div>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" ref={pageTopRef}>
      {/* Header with navigation breadcrumbs */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center">
            <button
              onClick={handleBack}
              className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="ml-3 flex items-center space-x-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
              {navigationPath.length > 0 ? (
                navigationPath.map((item) => (
                  <Fragment key={item._id}>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600 text-sm md:text-base font-medium">{item.name}</span>
                  </Fragment>
                ))
              ) : (
                <span className="text-gray-600 text-sm md:text-base font-medium">Study Materials</span>
              )}
              
              {selectedContent && (
                <>
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-blue-600 text-sm md:text-base font-medium truncate max-w-xs">
                    {selectedContent.name}
                  </span>
                </>
              )}
            </div>
            
            {/* Mobile sidebar toggle - now toggles visibility state */}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="ml-auto md:hidden flex items-center justify-center p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Bookmark className="w-5 h-5" />
              <span className="ml-1 text-sm font-medium">
                {isSidebarOpen ? "Hide Categories" : "Show Categories"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Content Area - Modified grid layout for mobile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:grid md:grid-cols-4 gap-6">
          {/* Navigation List - Always visible in both mobile and desktop views */}
          <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block md:col-span-1 order-2 md:order-1`}>
            <div className="bg-white rounded-xl shadow-sm p-4 md:sticky md:top-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Categories</h2>
                {/* Close button for mobile now toggling visibility */}
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="md:hidden p-1 rounded-full hover:bg-gray-100 text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Parent Categories */}
              {!isLoading && parentCategories.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-blue-700 font-semibold text-sm tracking-wide flex items-center mb-2 px-2">
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Main Categories
                  </h3>
                  <div className="space-y-1 mb-4">
                    {parentCategories.map(category => (
                      <button
                        key={category._id}
                        onClick={() => navigate(`/study-materials/${category._id}`)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center ${categoryId === category._id ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
                      >
                        <Book className={`w-4 h-4 mr-2 ${categoryId === category._id ? 'text-blue-600' : 'text-gray-500'}`} />
                        <span className="truncate">{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Subcategories */}
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="animate-pulse flex items-center p-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="ml-auto h-5 w-5 rounded-full bg-gray-200"></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-red-600 bg-red-50 p-3 rounded-lg flex items-center text-sm">
                  <span className="font-medium">{error}</span>
                </div>
              ) : subcategories.length === 0 ? (
                <div className="text-gray-500 p-3 text-center">
                  No categories found
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
                      <span className="font-medium truncate mr-2">
                        {subcategory.name}
                      </span>
                      {subcategory.type === 'content' ? (
                        <FileText className={`w-5 h-5 flex-shrink-0 ${
                          selectedContent?._id === subcategory._id 
                            ? 'text-blue-500' 
                            : 'text-gray-400 group-hover:text-gray-600'
                        }`} />
                      ) : (
                        <Book className={`w-5 h-5 flex-shrink-0 ${
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
      
      {/* Enhanced Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fadeIn" onClick={() => setShowSubscriptionModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 mx-4 animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Premium Content</h3>
              <p className="text-gray-500 mb-4">
                This content is available exclusively to our premium subscribers. Subscribe now to access all study materials for just ₹499/Year, including text content, PDF files, and high-quality images.
              </p>
              
              {/* Subscription Plans - Updated to single plan */}
              <div className="mt-6 mb-6 grid grid-cols-1 gap-4"> {/* Changed to single column */}
                 <div className="border border-green-500 rounded-lg p-4 shadow-md">
    <h4 className="text-lg font-semibold text-green-600">Yearly Plan</h4>
    <div className="my-2">
      <span className="text-lg font-medium text-gray-400 line-through">₹999</span>
      <span className="text-2xl font-bold ml-2">₹499<span className="text-sm text-gray-500 font-normal">/Year</span></span>
    </div>
    <ul className="text-left text-sm text-gray-600 mb-4 space-y-2">
      <li className="flex items-center"><ChevronRight className="w-4 h-4 text-green-500 mr-1" /> Full access to all study materials</li>
      <li className="flex items-center"><ChevronRight className="w-4 h-4 text-green-500 mr-1" /> PDF downloads</li>
      <li className="flex items-center"><ChevronRight className="w-4 h-4 text-green-500 mr-1" /> High-quality images</li>
      <li className="flex items-center"><ChevronRight className="w-4 h-4 text-green-500 mr-1" /> 50% savings compared to monthly</li>
    </ul>
    <button
      onClick={() => {
        navigate('/subscription', { state: { plan: 'yearly' } });
      }}
      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-colors"
    >
      Choose Yearly
    </button>
  </div>
</div>
              
              <div className="flex justify-center">
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="text-gray-500 hover:text-gray-800 font-medium transition-colors flex items-center"
                >
                  <X className="w-4 h-4 mr-1" />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add some CSS for animations */}
      <style>{`
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
      `}</style>
    </div>
  );
};

export default StudyMaterials;
