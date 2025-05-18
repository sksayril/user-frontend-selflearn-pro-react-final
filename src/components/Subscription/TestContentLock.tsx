import React, { useState } from 'react';
import { useContentProtection } from '../../contexts/ContentProtectionContext';
import { useAuth } from '../../contexts/AuthContext';
import LockedContent from '../LockedContent';

const TestContentLock: React.FC = () => {
  const { isContentLocked } = useContentProtection();
  const { isAuthenticated, currentUser } = useAuth();
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Content Protection Test</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>
        <p>User is {isAuthenticated ? 'authenticated' : 'not authenticated'}</p>
        {isAuthenticated && currentUser && (
          <div className="mt-2">
            <p>User: {currentUser.name}</p>
            <p>Subscription: {currentUser.subscription?.isActive ? 'Active' : 'Inactive'}</p>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">Content Protection Status</h2>
        <p>Content is {isContentLocked ? 'locked' : 'unlocked'}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Text Content Example</h2>
          {isContentLocked ? (
            <LockedContent 
              contentType="text" 
              onSubscribe={() => setShowSubscribeModal(true)} 
            />
          ) : (
            <div className="prose">
              <p>This is sample text content that should be visible only to subscribed users.</p>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">PDF Example</h2>
          {isContentLocked ? (
            <LockedContent 
              contentType="pdf" 
              onSubscribe={() => setShowSubscribeModal(true)} 
            />
          ) : (
            <div className="border rounded p-4 text-center">
              <p>PDF viewer would be here for subscribed users</p>
            </div>
          )}
        </div>
      </div>
      
      {showSubscribeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h2 className="text-xl font-bold mb-4">Subscribe Now</h2>
            <p className="mb-4">Please subscribe to access premium content.</p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowSubscribeModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  // Handle subscription flow
                  alert('Subscription flow would start here');
                  setShowSubscribeModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestContentLock; 