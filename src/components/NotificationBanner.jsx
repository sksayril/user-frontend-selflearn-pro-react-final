import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const NotificationBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [sponsorData, setSponsorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSponsorData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:3300/api/getsponser');
        
        if (!response.ok) {
          throw new Error('Failed to fetch sponsor data');
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
          setSponsorData(data[0]);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching sponsor data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSponsorData();
  }, []);

  const handleClose = (e) => {
    e.stopPropagation(); // Prevent redirection when clicking the close button
    setIsVisible(false);
  };

  const handleClick = () => {
    if (sponsorData && sponsorData.url) {
      window.open(sponsorData.url, '_blank');
    }
  };

  // Don't render anything if the banner is closed or no data is available
  if (!isVisible || isLoading || error || !sponsorData) return null;

  // Create style for using the hex color directly as background
  const bannerStyle = {
    backgroundColor: sponsorData.contextColor,
  };

  return (
    <div
      className="relative px-4 py-3 cursor-pointer"
      style={bannerStyle}
      onClick={handleClick}
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex-1 text-center pr-8">
          <p className="font-medium text-black">
            {sponsorData.name}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default NotificationBanner;