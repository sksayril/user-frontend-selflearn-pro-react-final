import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown, BookOpen, BrainCircuit, Newspaper, Home, BookOpenCheck, FileText, History, User, Search, MessageSquare, Bell, ShoppingCart, BookText, Folder } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import type { Category, CategoryResponse, SubCategory, SubCategoryResponse } from '../types/category';
import { useAuth } from '../contexts/AuthContext';
import { useContentProtection } from '../contexts/ContentProtectionContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Record<string, SubCategory[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, currentUser, logout } = useAuth();
  const { isContentLocked } = useContentProtection();
  const navRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Mobile bottom navigation items
  const mobileNavItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: BookOpenCheck, label: 'Quiz', path: '/quiz' },
    { icon: Newspaper, label: 'Blogs', path: '/blog' },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3300/api/categories/parents');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data: CategoryResponse[] = await response.json();
        if (data[0]?.parents) {
          setCategories(data[0].parents);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setHoveredCategory(null);
        setIsSearchOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchSubCategories = async (categoryId: string) => {
    if (subCategories[categoryId]) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3300/api/categories/subcategories/${categoryId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch subcategories');
      }
      const data: SubCategoryResponse[] = await response.json();
      if (data[0]?.subcategories) {
        setSubCategories(prev => ({
          ...prev,
          [categoryId]: data[0].subcategories
        }));
      }
    } catch (err) {
      console.error('Error fetching subcategories:', err);
    }
  };

  const handleCategoryHover = (categoryId: string) => {
    setHoveredCategory(categoryId);
      fetchSubCategories(categoryId);
  };

  const handleSubItemClick = (subcategoryId: string) => {
    navigate(`/study-materials/${subcategoryId}`);
    setHoveredCategory(null);
    setIsMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsUserDropdownOpen(false);
  };

  const MobileNavButton = ({ to, icon: Icon, text, gradient }: { to: string; icon: React.ElementType; text: string; gradient: string }) => (
    <Link
      to={to}
      className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-white font-medium ${gradient} transform transition-all duration-200 hover:scale-105 hover:shadow-lg`}
      onClick={() => setIsMobileMenuOpen(false)}
    >
      <Icon size={20} />
      <span>{text}</span>
    </Link>
  );

  // Group subcategories by first letter for better organization
  const groupSubcategories = (subcategories: SubCategory[]) => {
    const grouped: Record<string, SubCategory[]> = {};

    subcategories.forEach(item => {
      const firstLetter = item.name.charAt(0).toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(item);
    });

    return grouped;
  };

  return (
    <>
      <nav className="bg-sky-50 border-b border-sky-100 shadow-sm sticky top-0 z-50" ref={navRef}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <button
                className="md:hidden p-2 text-sky-600 hover:bg-sky-100 rounded-lg"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold">
                  <span className="text-blue-600">adhyan</span>
                  <span className="text-green-600 text-3xl">.guru</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {/* Main Categories */}
              <div className="flex space-x-1">
                {categories.map((category) => (
                  <div
                    key={category._id}
                    className="relative group"
                    onMouseEnter={() => handleCategoryHover(category._id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <button className="text-sky-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center capitalize">
                      {category.name}
                      <ChevronDown size={16} className="ml-1" />
                    </button>

                    {/* Enhanced Dropdown Menu */}
                    {hoveredCategory === category._id && subCategories[category._id] && (
                      <div className="absolute z-50 left-0 mt-0 w-96 bg-white rounded-lg shadow-xl py-4 animate-fadeIn border border-sky-100">
                        <h3 className="px-4 py-2 text-sm font-semibold text-sky-800 border-b border-sky-100 mb-2 bg-sky-50">
                          Browse {category.name} Materials
                        </h3>
                        
                        {/* Featured subcategories section */}
                        {subCategories[category._id].length > 0 && (
                          <div className="px-4 py-2 mb-3">
                            <div className="grid grid-cols-2 gap-2">
                              {subCategories[category._id].slice(0, 4).map((subItem) => (
                                <button
                                  key={subItem._id}
                                  onClick={() => handleSubItemClick(subItem._id)}
                                  className="text-gray-700 hover:bg-sky-50 hover:text-blue-600 text-sm text-left px-3 py-2 rounded-md transition-colors duration-150 capitalize flex items-center"
                                >
                                  <BookText size={14} className="mr-2 text-sky-500" />
                                  {subItem.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Alphabetical listing of subcategories */}
                        {subCategories[category._id].length > 4 && (
                          <div className="px-4 pt-2 border-t border-sky-100">
                            <p className="text-xs text-gray-500 mb-2">All {category.name} Categories</p>
                            <div className="max-h-60 overflow-y-auto scrollbar">
                              {Object.entries(groupSubcategories(subCategories[category._id])).map(([letter, items]) => (
                                <div key={letter} className="mb-2">
                                  <div className="text-xs font-medium text-sky-600 mb-1 px-2">{letter}</div>
                                  {items.map(subItem => (
                                    <button
                                      key={subItem._id}
                                      onClick={() => handleSubItemClick(subItem._id)}
                                      className="text-gray-700 hover:bg-sky-50 hover:text-blue-600 text-sm text-left px-3 py-1.5 rounded-md transition-colors duration-150 capitalize flex items-center w-full"
                                    >
                                      <Folder size={12} className="mr-2 text-sky-400" />
                                      {subItem.name}
                                    </button>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* View all link */}
                        <div className="px-4 py-2 mt-2 border-t border-sky-100">
                          <button
                            onClick={() => navigate(`/study-materials/${category._id}`)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                          >
                            View all {category.name} materials
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop Navigation Links */}
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 flex items-center ${
                  location.pathname === '/' ? 'text-blue-600' : 'text-sky-700 hover:text-blue-600'
                }`}
              >
                <Home size={18} className="mr-1" />
                <span>Home</span>
              </Link>
              
              <Link
                to="/blog"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 flex items-center ${
                  location.pathname === '/blog' ? 'text-blue-600' : 'text-sky-700 hover:text-blue-600'
                }`}
              >
                <Newspaper size={18} className="mr-1" />
                <span>Blog</span>
              </Link>
              
              <Link
                to="/quiz"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 flex items-center ${
                  location.pathname === '/quiz' ? 'text-blue-600' : 'text-sky-700 hover:text-blue-600'
                }`}
              >
                <BrainCircuit size={18} className="mr-1" />
                <span>Quiz</span>
              </Link>
            </div>
            
            {/* Right Section (Search, User) */}
            <div className="flex items-center space-x-3">
              {/* Search Button */}
              <div className="relative">
                  <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-2 rounded-full text-sky-600 hover:bg-sky-100 transition-colors"
                >
                  <Search size={20} />
                </button>
                
                {/* Search Dropdown */}
                {isSearchOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl p-4 animate-fadeIn border border-sky-100">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search for notes, topics..."
                        className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button className="absolute right-2 top-2 text-sky-500">
                        <Search size={18} />
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Try searching for topics, subjects, or chapters
                    </div>
                  </div>
                )}
              </div>
              
              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    className="flex items-center space-x-1 text-sky-700 hover:text-blue-600 p-1 rounded-full hover:bg-sky-100"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                      {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <ChevronDown size={14} className="text-sky-500" />
                  </button>
                  
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 animate-fadeIn border border-sky-100 z-50">
                      <div className="px-4 py-2 border-b border-sky-100">
                        <div className="font-medium text-gray-800">{currentUser?.name}</div>
                        <div className="text-xs text-gray-500">{currentUser?.email}</div>
                      </div>
                      <Link
                        to="/subscription/status"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-sky-50"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <Bell size={16} className="mr-2 text-blue-500" />
                        Subscription Status
                      </Link>
                      <Link
                        to="/test-content-lock"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-sky-50"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <FileText size={16} className="mr-2 text-green-500" />
                        Content Access Test
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1.5 rounded-md transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1.5 rounded-md transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 md:hidden ${
              isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
            className={`fixed inset-y-0 left-0 w-64 bg-white transform transition-transform duration-300 ease-in-out ${
                isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xl font-bold">
                    <span className="text-blue-600">adhyan</span>
                    <span className="text-green-600">.guru</span>
                  </span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-sky-100 text-sky-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Mobile Action Buttons */}
                <div className="space-y-3 mb-6">
                  <MobileNavButton
                    to="/blog"
                    icon={Newspaper}
                    text="Blog"
                    gradient="bg-gradient-to-r from-purple-500 to-pink-500"
                  />
                  <MobileNavButton
                    to="/quiz"
                    icon={BrainCircuit}
                    text="Quiz"
                    gradient="bg-gradient-to-r from-orange-500 to-red-500"
                  />
                </div>

                {/* Mobile Categories */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-sky-500 uppercase tracking-wider mb-2 px-2">
                  Study Categories
                  </h3>
                <div className="space-y-1">
                  {categories.map((category) => (
                      <button
                      key={category._id}
                      onClick={() => navigate(`/study-materials/${category._id}`)}
                      className="flex items-center justify-between w-full px-2 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-blue-600 rounded-md capitalize"
                      >
                      <span className="flex items-center">
                        <BookOpen size={16} className="mr-2 text-sky-500" />
                        {category.name}
                      </span>
                      <ChevronDown size={14} className="text-gray-400" />
                            </button>
                  ))}
                </div>
              </div>

              {/* Authentication Links for Mobile */}
              {isAuthenticated ? (
                <div className="border-t border-sky-100 pt-4">
                  <div className="px-2 py-3">
                    <div className="font-medium text-gray-800">{currentUser?.name}</div>
                    <div className="text-xs text-gray-500">{currentUser?.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              ) : (
                <div className="border-t border-sky-100 pt-4">
                  <Link
                    to="/login"
                    className="flex items-center px-2 py-2 text-sm text-blue-600 hover:bg-sky-50 rounded-md"
                  >
                    <User size={16} className="mr-2" />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center px-2 py-2 text-sm text-blue-600 hover:bg-sky-50 rounded-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-sky-100 flex justify-around p-2 md:hidden z-40">
        {mobileNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg ${
              location.pathname === item.path
                ? 'text-blue-600 bg-sky-50'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <item.icon size={20} />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
        
        {/* Add subscription status indicator */}
        <Link
          to="/subscription/status"
          className="flex flex-col items-center justify-center py-1 px-3 rounded-lg text-gray-500 hover:text-gray-800"
        >
          <Bell size={20} />
          <span className="text-xs mt-1">
            {isContentLocked ? 'Upgrade' : 'Subscribed'}
                </span>
              </Link>
      </div>

      {/* Styles for animations */}
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-in-out;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        `}
      </style>
    </>
  );
};

export default Navbar;
