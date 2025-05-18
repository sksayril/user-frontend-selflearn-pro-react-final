import axios from 'axios';
import { authHeader } from './authService';

const API_URL = 'https://api.adhyan.guru/api';

// Public content APIs (no auth required)

// Get latest updates
export const getLatestUpdates = async () => {
  const response = await axios.get(`${API_URL}/latest-updates`);
  return response.data;
};

// Get hero banners
export const getHeroBanners = async () => {
  const response = await axios.get(`${API_URL}/get/hero-banners`);
  return response.data;
};

// Get parent categories
export const getParentCategories = async () => {
  const response = await axios.get(`${API_URL}/categories/parents`);
  return response.data;
};

// Get subcategories
export const getSubcategories = async (parentId: string) => {
  const response = await axios.get(`${API_URL}/categories/subcategories/${parentId}`);
  return response.data;
};

// Get category tree
export const getCategoryTree = async () => {
  const response = await axios.get(`${API_URL}/categories/tree`);
  return response.data;
};

// Get sponsors
export const getSponsors = async () => {
  const response = await axios.get(`${API_URL}/getsponser`);
  return response.data;
};

// Get blogs
export const getBlogs = async () => {
  const response = await axios.get(`${API_URL}/get/blogs`);
  return response.data;
};

// Protected content APIs (auth and subscription required)

// Check if content is protected
export const isContentProtected = (categoryType: string): boolean => {
  // The following category types contain content that requires subscription
  const protectedTypes = ['premium', 'subscription-only', 'paid', 'content'];
  return protectedTypes.includes(categoryType);
};

// Get preview version of content (blurred/partial for non-subscribers)
export const getContentPreview = async (categoryId: string) => {
  try {
    // This uses the non-protected endpoint but marks content as protected
    const response = await axios.get(`${API_URL}/categories/preview/${categoryId}`);
    
    // Check if content should be protected
    const data = response.data;
    if (data && data.type === 'content') {
      // Mark as protected content
      data.isProtected = true;
      
      // Create preview versions of content
      if (data.content) {
        // Provide limited preview for text (first paragraph or truncated)
        if (data.content.text) {
          const paragraphs = data.content.text.split('\n');
          data.content.text = paragraphs[0].substring(0, 150) + '...';
          data.content.fullTextAvailable = true;
        }
        
        // For PDF, keep URL but mark as protected
        if (data.content.pdfUrl) {
          data.content.pdfProtected = true;
        }
        
        // For images, mark as protected but provide first image as preview
        if (data.content.imageUrls && data.content.imageUrls.length > 0) {
          const previewUrl = data.content.imageUrls[0];
          data.content.imageUrls = [previewUrl];
          data.content.moreImagesAvailable = data.content.imageUrls.length > 1;
        }
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching content preview:', error);
    throw error;
  }
};

// Get category details with content
export const getCategoryDetails = async (categoryId: string) => {
  try {
  const response = await axios.get(
    `${API_URL}/categories/${categoryId}`,
    { headers: authHeader() }
  );
  return response.data;
  } catch (error) {
    // If 403 error (subscription required), try to get the preview version
    if (isSubscriptionRequiredError(error)) {
      return getContentPreview(categoryId);
    }
    throw error;
  }
};

// Get quiz details
export const getQuizById = async (quizId: string) => {
  const response = await axios.get(
    `${API_URL}/getquizbyid/${quizId}`,
    { headers: authHeader() }
  );
  return response.data;
};

// Check if a request is unauthorized (for handling 401 errors)
export const isUnauthorizedError = (error: any): boolean => {
  return error.response && error.response.status === 401;
};

// Check if a request is forbidden due to subscription (for handling 403 errors)
export const isSubscriptionRequiredError = (error: any): boolean => {
  return (
    error.response && 
    error.response.status === 403 && 
    error.response.data && 
    error.response.data.subscriptionRequired
  );
};
