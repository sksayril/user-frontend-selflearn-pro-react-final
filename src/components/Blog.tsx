import { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronRight, X, ChevronLeft, ChevronUp } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface BlogPost {
  _id: string; // Using _id to match the actual data structure
  id?: string;
  title: string;
  content: string;
  image: string;
  date: string;
  readTime: string;
  category: string;
  gallery: string[];
  excerpt: string;
  slug?: string; // Added for URL friendly paths
  author?: string; // Added for author info
  tags?: string[]; // Added for better SEO
}

const Blog = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [featuredBlog, setFeaturedBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Function to ensure blog posts have slugs (for SEO-friendly URLs)
    const processBlogs = (data: BlogPost[]) => {
      return data.map(blog => ({
        ...blog,
        slug: blog.slug || blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      }));
    };

    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.adhyan.guru/api/get/blogs');
        
        if (!response.ok) {
          throw new Error('Failed to fetch blogs');
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
          const processedData = processBlogs(data);
          // Set the first blog as featured and the rest as regular blogs
          setFeaturedBlog(processedData[0]);
          setBlogs(processedData.slice(1));
        }
        
        setLoading(false);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const openBlogModal = (blog: BlogPost) => {
    setSelectedBlog(blog);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    
    // Update URL with blog slug for better SEO and sharing
    if (blog.slug) {
      window.history.pushState({}, '', `/blog/${blog.slug}`);
    }
  };

  const closeBlogModal = () => {
    setSelectedBlog(null);
    document.body.style.overflow = 'auto'; // Re-enable scrolling
    
    // Restore original URL
    window.history.pushState({}, '', '/blog');
  };

  const nextImage = () => {
    if (!selectedBlog) return;
    setCurrentImageIndex((prev) =>
      prev === selectedBlog.gallery.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!selectedBlog) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? selectedBlog.gallery.length - 1 : prev - 1
    );
  };

  // Generate Schema.org structured data for the selected blog (for SEO)
  const generateBlogSchema = (blog: BlogPost) => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": blog.title,
      "image": blog.gallery && blog.gallery.length > 0 ? blog.gallery : [blog.image],
      "datePublished": blog.date,
      "description": blog.excerpt,
      "author": {
        "@type": "Person",
        "name": blog.author || "adhyan.guru Team"
      },
      "publisher": {
        "@type": "Organization",
        "name": "adhyan.guru",
        "logo": {
          "@type": "ImageObject",
          "url": "https://adhyan.guru/logo.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://adhyan.guru/blog/${blog.slug || blog._id}`
      }
    };
    return JSON.stringify(schema);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Helmet>
          <title>Loading Blogs - adhyan.guru</title>
          <meta name="description" content="Explore our collection of educational blogs and articles on adhyan.guru. Loading content..." />
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-600">Loading blogs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Helmet>
          <title>Error - adhyan.guru Blog</title>
          <meta name="description" content="We're experiencing technical difficulties. Please try again later." />
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 max-w-lg">
          <p className="text-xl font-medium text-red-600 mb-2">Unable to load blogs</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!featuredBlog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Helmet>
          <title>No Blogs Available - adhyan.guru</title>
          <meta name="description" content="No blog posts are currently available. Please check back later for new content." />
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <p className="text-xl font-medium text-gray-600">No blogs available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Helmet>
        <title>Educational Blogs & Articles | adhyan.guru</title>
        <meta name="description" content="Stay updated with the latest educational insights, study tips, and academic news from adhyan.guru. Browse our collection of helpful articles and resources." />
        <meta name="keywords" content="educational blogs, study tips, academic resources, adhyan.guru, learning resources, education, student resources" />
        <meta property="og:title" content="Educational Blogs & Articles | adhyan.guru" />
        <meta property="og:description" content="Stay updated with the latest educational insights, study tips, and academic news from adhyan.guru." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={featuredBlog?.image} />
        <meta property="og:url" content="https://adhyan.guru/blog" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Educational Blogs & Articles | adhyan.guru" />
        <meta name="twitter:description" content="Stay updated with the latest educational insights, study tips, and academic news from adhyan.guru." />
        <meta name="twitter:image" content={featuredBlog?.image} />
        <link rel="canonical" href="https://adhyan.guru/blog" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "mainEntity": {
              "@type": "ItemList",
              "itemListElement": [featuredBlog, ...blogs].map((blog, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": `https://adhyan.guru/blog/${blog.slug || blog._id}`,
                "name": blog.title
              }))
            },
            "name": "Educational Blogs & Articles",
            "description": "Stay updated with the latest educational insights, study tips, and academic news from adhyan.guru."
          })}
        </script>
      </Helmet>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">Latest Blog Posts</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest educational insights, study tips, and academic news
          </p>
        </div>

        {/* Featured Post */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition hover:shadow-2xl">
            <div className="md:flex">
              <div className="md:w-1/2 lg:w-3/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-500/20 z-10"></div>
                <img
                  src={featuredBlog.image}
                  alt={featuredBlog.title}
                  className="w-full h-64 md:h-96 object-cover transform hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-4 left-4 z-20">
                  <div className="bg-blue-500 text-white text-sm font-medium px-3 py-1 rounded-full inline-block">
                    Featured
                  </div>
                </div>
              </div>
              <div className="md:w-1/2 lg:w-2/5 p-6 md:p-8 flex flex-col justify-center">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                  {featuredBlog.title}
                </h2>
                <p className="text-gray-600 mb-6">
                  {featuredBlog.excerpt}
                </p>
                <div className="flex items-center text-sm text-gray-500 mb-6 space-x-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                    <span>{featuredBlog.date}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-blue-500" />
                    <span>{featuredBlog.readTime}</span>
                  </div>
                </div>
                <button
                  onClick={() => openBlogModal(featuredBlog)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-all duration-300 transform hover:scale-105 flex items-center w-fit"
                  aria-label={`Read more about ${featuredBlog.title}`}
                >
                  Read More
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <article
              key={blog._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="relative overflow-hidden h-48">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 z-10"></div>
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-48 object-cover transform hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-3 right-3 z-20">
                  <span className="bg-blue-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                    {blog.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-800 line-clamp-2">{blog.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{blog.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="text-gray-500 text-sm flex items-center space-x-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-blue-500" />
                      <span>{blog.date}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-blue-500" />
                      <span>{blog.readTime}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => openBlogModal(blog)}
                  className="mt-4 text-blue-600 font-medium hover:text-blue-700 transition-colors flex items-center hover:underline"
                  aria-label={`Read more about ${blog.title}`}
                >
                  Read More
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Blog Modal Popup */}
      {selectedBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 animate-fadeIn backdrop-blur-sm" onClick={closeBlogModal}>
          <Helmet>
            <title>{`${selectedBlog.title} | adhyan.guru Blog`}</title>
            <meta name="description" content={selectedBlog.excerpt} />
            <meta name="keywords" content={`${selectedBlog.category}, ${selectedBlog.tags?.join(', ') || 'educational resources'}, adhyan.guru, education`} />
            <meta property="og:title" content={`${selectedBlog.title} | adhyan.guru Blog`} />
            <meta property="og:description" content={selectedBlog.excerpt} />
            <meta property="og:type" content="article" />
            <meta property="og:image" content={selectedBlog.image} />
            <meta property="og:url" content={`https://adhyan.guru/blog/${selectedBlog.slug || selectedBlog._id}`} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={`${selectedBlog.title} | adhyan.guru Blog`} />
            <meta name="twitter:description" content={selectedBlog.excerpt} />
            <meta name="twitter:image" content={selectedBlog.image} />
            <meta name="article:published_time" content={selectedBlog.date} />
            <meta name="article:section" content={selectedBlog.category} />
            <link rel="canonical" href={`https://adhyan.guru/blog/${selectedBlog.slug || selectedBlog._id}`} />
            <script type="application/ld+json">{generateBlogSchema(selectedBlog)}</script>
          </Helmet>
          <article
            className="bg-white rounded-xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with close button */}
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">{selectedBlog.title}</h2>
              <button
                onClick={closeBlogModal}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            <div className="overflow-y-auto flex-grow">
              {/* Image Gallery */}
              {selectedBlog.gallery && selectedBlog.gallery.length > 0 && (
                <div className="relative">
                  <div className="bg-gray-100 h-64 md:h-80">
                    <img
                      src={selectedBlog.gallery[currentImageIndex]}
                      alt={`${selectedBlog.title} - image ${currentImageIndex + 1}`}
                      className="object-contain w-full h-full"
                      loading="lazy"
                    />
                  </div>

                  {/* Gallery Navigation - only show if more than 1 image */}
                  {selectedBlog.gallery.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-colors"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-700" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-colors"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-700" />
                      </button>

                      {/* Image Indicator */}
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/70 rounded-full px-3 py-1 text-xs text-white">
                        {currentImageIndex + 1} / {selectedBlog.gallery.length}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Blog Content */}
              <div className="p-6">
                <div className="flex flex-wrap items-center mb-6 gap-3">
                  <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2.5 py-1 rounded-full">
                    {selectedBlog.category}
                  </span>
                  <div className="text-gray-500 text-sm flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-blue-500" />
                    <span>{selectedBlog.date}</span>
                  </div>
                  <div className="text-gray-500 text-sm flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-blue-500" />
                    <span>{selectedBlog.readTime}</span>
                  </div>
                </div>

                {/* Article Content */}
                <div className="prose prose-blue max-w-none">
                  {selectedBlog.content.split('\\n\\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
                
                {/* Tags Section for SEO */}
                {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                  <div className="mt-8 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Related Topics:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedBlog.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery - only show if more than 1 image */}
            {selectedBlog.gallery && selectedBlog.gallery.length > 1 && (
              <div className="p-4 border-t flex space-x-2 overflow-x-auto bg-gray-50">
                {selectedBlog.gallery.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 rounded-md overflow-hidden transition-all ${
                      currentImageIndex === index 
                        ? 'ring-2 ring-blue-500 transform scale-105' 
                        : 'ring-1 ring-gray-200 hover:ring-blue-300'
                    }`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="h-16 w-24 object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Back to Top Button */}
            <button
              onClick={() => {
                const modalContent = document.querySelector('.overflow-y-auto');
                if (modalContent) modalContent.scrollTop = 0;
              }}
              className="absolute bottom-20 right-6 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
              aria-label="Back to top"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          </article>
        </div>
      )}
    </div>
  );
};

export default Blog;