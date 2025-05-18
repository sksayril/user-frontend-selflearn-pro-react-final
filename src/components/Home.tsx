import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from './Hero';
import LatestUpdates from './LatestUpdates';
import SocialMediaCarousel from './SocialMediaCarousel';
import {
  Book,
  ArrowRight,
  Download,
  Users,
  BookOpen,
  Award,
  BrainCircuit,
  BookCheck,
  FileText,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import bannermobileapp from '/pragraph.png';

// Define Category type
interface Category {
  _id: string;
  name: string;
  path?: string[];
}

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https://api.adhyan.guru/api/categories/parents');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        if (data[0]?.parents) {
          setCategories(data[0].parents);
          // Set the first category as active by default
          if (data[0].parents.length > 0) {
            setActiveCategory(data[0].parents[0]._id);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching categories:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleMaterialClick = (categoryId: string) => {
    navigate(`/study-materials/${categoryId}`);
  };

  const handleCategoryHover = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  // Map category names to colors for visual distinction
  const getCategoryColor = (index: number) => {
    const colors = ['bg-gradient-to-r from-blue-500 to-blue-700',
                   'bg-gradient-to-r from-green-500 to-green-700',
                   'bg-gradient-to-r from-purple-500 to-purple-700',
                   'bg-gradient-to-r from-orange-500 to-orange-700',
                   'bg-gradient-to-r from-red-500 to-red-700',
                   'bg-gradient-to-r from-indigo-500 to-indigo-700'];
    return colors[index % colors.length];
  };

  const scrollToCategoriesSection = () => {
    categoriesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-gray-50">
      
      <Hero />

      {/* Latest Updates Section with Animation */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-100 to-green-100 rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-lg bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 shadow-lg mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m0-4h.01M12 8v4m0 4h.01m-6.938 4H19.938c1.118 0 2.062-.895 2.062-2V6c0-1.105-.944-2-2.062-2H5.062C3.944 4 3 4.895 3 6v12c0 1.105.944 2 2.062 2z" />
                </svg>
                Latest Updates
              </button>
            </div>
            <LatestUpdates />
          </div>
        </div>
      </div>

      {/* Enhanced Study Materials Section */}
      <div ref={categoriesRef} className="py-16 bg-gradient-to-b from-green-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg mx-auto">
              <Sparkles className="h-6 w-6" />
              <h2 className="text-xl font-bold">Study Materials</h2>
            </div>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Access comprehensive learning resources designed to enhance your educational journey
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
            </div>
          ) : error ? (
            <div className="text-center bg-red-50 p-8 rounded-lg shadow-md">
              <div className="text-xl font-medium text-red-600">Error: {error}</div>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div>
              {/* Categories Tabs */}
              <div className="flex flex-wrap justify-center mb-10">
                {categories.map((category, index) => (
                  <button
                    key={category._id}
                    className={`px-6 py-3 m-2 rounded-full font-medium transition-all duration-300 flex items-center ${
                      activeCategory === category._id
                        ? `${getCategoryColor(index)} text-white shadow-lg transform scale-105`
                        : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                    }`}
                    onClick={() => handleCategoryHover(category._id)}
                    onMouseEnter={() => handleCategoryHover(category._id)}
                  >
                    <BookOpen className={`w-5 h-5 mr-2 ${activeCategory === category._id ? 'text-white' : 'text-blue-500'}`} />
                    <span className="capitalize">{category.name}</span>
                    {activeCategory === category._id && (
                      <ChevronRight className="w-5 h-5 ml-1" />
                    )}
                  </button>
                ))}
              </div>

              {/* Featured Category Section */}
              {activeCategory && (
                <div className="bg-white rounded-xl shadow-lg p-8 mb-12 transform transition-all duration-500">
                  <div className="flex flex-col md:flex-row items-center">
                    <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
                      <h3 className="text-2xl font-bold mb-4 text-gray-800 capitalize">
                        {categories.find(cat => cat._id === activeCategory)?.name} Resources
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Explore our comprehensive collection of study materials for {categories.find(cat => cat._id === activeCategory)?.name}. 
                        Our expert-curated content is designed to make learning effective and engaging.
                      </p>
                      <button
                        onClick={() => handleMaterialClick(activeCategory)}
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Explore Materials
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </button>
                    </div>
                    <div className="md:w-1/2">
                      <div className="aspect-video bg-gradient-to-r from-blue-100 to-green-100 rounded-lg flex items-center justify-center">
                        <div className="p-6 bg-white rounded-lg shadow-md">
                          <Book className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                          <p className="text-center text-gray-700 font-medium">
                            Click to access all materials
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Category Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories.map((category, index) => (
                  <div
                    key={category._id}
                    className={`transform transition-all duration-300 ${
                      activeCategory === category._id ? 'scale-105 z-10' : 'hover:scale-105'
                    }`}
                  >
                    <button
                      onClick={() => handleMaterialClick(category._id)}
                      onMouseEnter={() => handleCategoryHover(category._id)}
                      className={`${
                        activeCategory === category._id 
                          ? 'ring-4 ring-blue-300 ring-opacity-50' 
                          : ''
                      } bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center w-full h-full`}
                    >
                      <div className={`${getCategoryColor(index)} p-4 rounded-full shadow-md`}>
                        <Book className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="mt-5 text-xl font-semibold text-gray-800 capitalize">{category.name}</h3>
                      <div className="mt-4 bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                        FREE Access
                      </div>
                      {activeCategory === category._id && (
                        <div className="mt-3 inline-flex items-center text-blue-600 text-sm font-medium">
                          Explore <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-12">
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6 md:p-8">
                    <h3 className="text-xl md:text-2xl font-bold mb-4 text-center">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-600">
                        Popular Study Resources
                      </span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Study Resource Card 1 */}
                      <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-all duration-300 transform hover:scale-102 border border-gray-100">
                        <div className="flex items-start space-x-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">NCERT Solutions</h4>
                            <p className="text-sm text-gray-600 mt-1">Class 6-12 detailed solutions</p>
                          </div>
                        </div>
                      </div>

                      {/* Study Resource Card 2 */}
                      <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-all duration-300 transform hover:scale-102 border border-gray-100">
                        <div className="flex items-start space-x-3">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <FileText className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">Previous Year Papers</h4>
                            <p className="text-sm text-gray-600 mt-1">Last 10 years with solutions</p>
                          </div>
                        </div>
                      </div>

                      {/* Study Resource Card 3 */}
                      <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-all duration-300 transform hover:scale-102 border border-gray-100">
                        <div className="flex items-start space-x-3">
                          <div className="bg-purple-100 p-2 rounded-lg">
                            <Award className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">Important Questions</h4>
                            <p className="text-sm text-gray-600 mt-1">Chapter-wise important questions</p>
                          </div>
                        </div>
                      </div>

                      {/* Study Resource Card 4 */}
                      <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-all duration-300 transform hover:scale-102 border border-gray-100">
                        <div className="flex items-start space-x-3">
                          <div className="bg-orange-100 p-2 rounded-lg">
                            <BrainCircuit className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">Concept Maps</h4>
                            <p className="text-sm text-gray-600 mt-1">Visual learning aids for quick revision</p>
                          </div>
                        </div>
                      </div>

                      {/* Study Resource Card 5 */}
                      <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-all duration-300 transform hover:scale-102 border border-gray-100">
                        <div className="flex items-start space-x-3">
                          <div className="bg-red-100 p-2 rounded-lg">
                            <BookCheck className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">Revision Notes</h4>
                            <p className="text-sm text-gray-600 mt-1">Comprehensive chapter summaries</p>
                          </div>
                        </div>
                      </div>

                      {/* Study Resource Card 6 */}
                      <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-all duration-300 transform hover:scale-102 border border-gray-100">
                        <div className="flex items-start space-x-3">
                          <div className="bg-teal-100 p-2 rounded-lg">
                            <Users className="w-5 h-5 text-teal-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">Practice Tests</h4>
                            <p className="text-sm text-gray-600 mt-1">Self-assessment quizzes by chapter</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Call-to-action button */}
          <div className="text-center mt-10">
            <button
              onClick={scrollToCategoriesSection}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Book className="w-5 h-5 mr-2" />
              Browse All Categories
            </button>
          </div>
        </div>
      </div>

      {/* Social Media Section */}
      <SocialMediaCarousel />

      {/* Mobile App Banner */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl overflow-hidden shadow-xl">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-1/2 p-8 lg:p-12">
                <h2 className="text-3xl font-bold text-white mb-4">Download Our Mobile App</h2>
                <p className="text-blue-100 mb-6">
                  Access study materials anytime, anywhere. Our mobile app makes learning on-the-go easier than ever.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium flex items-center space-x-2 hover:bg-blue-50 transition-colors">
                    <Download className="w-5 h-5" />
                    <span>App Store</span>
                  </button>
                  <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium flex items-center space-x-2 hover:bg-blue-50 transition-colors">
                    <Download className="w-5 h-5" />
                    <span>Google Play</span>
                  </button>
                </div>
                <div className="mt-6 flex items-center space-x-2 text-blue-100">
                  <Users className="w-5 h-5" />
                  <span>Join 50,000+ students already learning</span>
                </div>
              </div>
              <div className="lg:w-1/2">
                <img 
                  src={bannermobileapp} 
                  alt="Mobile App" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;