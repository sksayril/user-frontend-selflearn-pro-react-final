import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Facebook, Instagram, Youtube, Twitter, Linkedin, MessageCircle } from 'lucide-react';
import { FaFacebook } from 'react-icons/fa';

// Create the SocialMediaCarousel component
const SocialMediaCarousel = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  // Social media platforms with icons, colors, and links
  const socialPlatforms = [
    { 
      name: 'Facebook', 
      color: 'bg-gradient-to-r from-blue-500 to-blue-700', 
      icon: <FaFacebook className="w-5 h-5" />,
      link: 'https://facebook.com/adhyan.guru' 
    },
    { 
      name: 'Instagram', 
      color: 'bg-gradient-to-r from-pink-500 to-purple-600', 
      icon: <Instagram className="w-5 h-5 mr-2" />,
      link: 'https://www.instagram.com/notes.market' 
    },
    { 
      name: 'YouTube', 
      color: 'bg-red-600', 
      icon: <Youtube className="w-5 h-5 mr-2" />,
      link: 'https://youtube.com/adhyan.guru' 
    },
    { 
      name: 'Twitter', 
      color: 'bg-blue-400', 
      icon: <Twitter className="w-5 h-5 mr-2" />,
      link: 'https://twitter.com/adhyan.guru' 
    },
    { 
      name: 'LinkedIn', 
      color: 'bg-blue-700', 
      icon: <Linkedin className="w-5 h-5 mr-2" />,
      link: 'https://linkedin.com/company/adhyan.guru' 
    },
    { 
      name: 'Pinterest', 
      color: 'bg-red-600', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
              <path d="M12 0c-6.627 0-12 5.373-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
            </svg>,
      link: 'https://pinterest.com/adhyan.guru' 
    },
    { 
      name: 'WhatsApp', 
      color: 'bg-green-500', 
      icon: <MessageCircle className="w-5 h-5 mr-2" />,
      link: 'https://whatsapp.com/channel/0029VbAgHAAGk1FjmR9p4v0V' 
    },
    { 
      name: 'Telegram', 
      color: 'bg-blue-500', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
              <path d="M12 0c-6.626 0-12 5.372-12 12 0 6.627 5.374 12 12 12 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12zm3.224 17.871c.188.133.43.166.646.085.215-.082.374-.253.413-.484.331-1.94 1.14-6.868 1.432-8.635.024-.147-.015-.302-.105-.416-.09-.113-.224-.182-.368-.195-.4-.036-1.07-.087-1.84-.087-1.064 0-1.896.118-2.472.575-.696.556-.902 1.454-.8 2.848.028.384.408.585.718.401.128-.076.207-.216.229-.363.045-.296.093-.563.146-.796.052-.228.243-.412.475-.456.278-.053 1.074-.099 1.304-.099.316 0 .35.165.307.447-.135.847-.873 5.315-.949 5.786-.055.335-.342.529-.673.512-.34-.018-.653-.252-.729-.587-.13-.568-.401-1.685-.528-2.222-.066-.283-.211-.504-.435-.612-.225-.108-.47-.101-.684.034-.213.135-.34.372-.336.631.006.259.132.502.349.651.045.031.076.078.096.13.104.427.632 2.578.786 3.317.065.312.166.618.308.909zm-3.797-10.366c.11-.31.401-.092.591.051.19.143.256.38.145.591-.904 1.4-1.786 4.364-3.087 8.678-.069.227-.273.393-.506.405-.233.012-.449-.131-.537-.352-1.024-2.556-1.512-3.891-2.126-5.256-.053-.118-.1-.301-.145-.479-.111-.445.047-.734.267-.868.22-.134.485-.104.659.076 0 0 .178.161.316.483.138.323.348.87.545 1.638.458-1.422 2.738-7.809 3.873-4.967zm-5.111 6.352c.051-.198.241-.334.447-.318.205.016.375.173.399.378.042.35.081.708.117 1.073.24.254-.142.49-.393.523-.251.033-.484-.139-.545-.388-.075-.301-.151-.597-.227-.886-.047-.172-.005-.362.202-.382z" />
            </svg>,
      link: 'https://t.me/adhyan.guruofficial' 
    },
    { 
      name: 'Facebook', 
      color: 'bg-gradient-to-r from-blue-500 to-blue-700', 
      icon: <FaFacebook className="w-5 h-5" />,
      link: 'https://facebook.com/adhyan.guru' 
    }
  ];

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'right' ? 250 : -250;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      
      // Check scroll position after animation
      setTimeout(() => {
        if (carouselRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
          setIsBeginning(scrollLeft <= 10);
          setIsEnd(scrollLeft + clientWidth >= scrollWidth - 10);
        }
      }, 300);
    }
  };

  // Handle scroll events to update button states
  const handleScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setIsBeginning(scrollLeft <= 10);
      setIsEnd(scrollLeft + clientWidth >= scrollWidth - 10);
    }
  };

  return (
    <section className="py-12 bg-gradient-to-b from-white to-blue-50" aria-labelledby="social-media-heading">
      <div className="container mx-auto px-4">
        <h2 
          id="social-media-heading" 
          className="text-3xl md:text-4xl font-bold text-center mb-4"
        >
          Stay Connected With Us On Our Social Media Handles
        </h2>
        
        <div className="text-center mb-10">
          <span className="text-blue-600 text-2xl font-bold">Adhyan</span>
          <span className="text-green-600 text-2xl font-bold">.Guru</span>
        </div>
        
        <div className="relative">
          {/* Left Scroll Button */}
          <button 
            onClick={() => scrollCarousel('left')}
            className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 focus:outline-none
                      ${isBeginning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
            disabled={isBeginning}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6 text-blue-600" />
          </button>
          
          {/* Social Media Carousel */}
          <div 
            ref={carouselRef}
            className="overflow-x-auto flex space-x-4 py-4 px-10 scrollbar hide-scrollbar"
            onScroll={handleScroll}
          >
            {socialPlatforms.map((platform, index) => (
              <a
                key={`${platform.name}-${index}`}
                href={platform.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-none flex items-center justify-center ${platform.color} text-white py-4 px-6 rounded-xl 
                          shadow-md hover:shadow-lg transition-transform duration-300 hover:scale-105 min-w-[170px]`}
                aria-label={`Follow us on ${platform.name}`}
              >
                {platform.icon}
                <span>{platform.name}</span>
              </a>
            ))}
          </div>
          
          {/* Right Scroll Button */}
          <button 
            onClick={() => scrollCarousel('right')}
            className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 focus:outline-none
                      ${isEnd ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
            disabled={isEnd}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6 text-blue-600" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default SocialMediaCarousel;