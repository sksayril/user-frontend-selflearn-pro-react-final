import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { checkSubscriptionStatus, cancelSubscription } from '../../services/subscriptionService';

const SubscriptionStatus: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState('');
  const [subDetails, setSubDetails] = useState<any>(null);
  const { currentUser, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchSubscriptionStatus = async () => {
      try {
        setLoading(true);
        const status = await checkSubscriptionStatus();
        setSubDetails(status);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch subscription status');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [currentUser, navigate]);

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium content at the end of your current billing period.')) {
      return;
    }

    try {
      setCancelLoading(true);
      const response = await cancelSubscription();
      
      if (response.success) {
        // Update user in auth context
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            subscription: {
              ...currentUser.subscription,
              isActive: false
            }
          };
          updateUser(updatedUser);
        }
        
        // Refresh subscription details
        setSubDetails({
          ...subDetails,
          isActive: false
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!subDetails?.isSubscribed) {
    return (
      <div className="p-8 max-w-md mx-auto">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">No Active Subscription</h3>
          <p className="mt-2 text-sm text-gray-500">
            You don't have an active subscription. Subscribe to access premium content.
          </p>
          <button
            onClick={() => navigate('/subscription')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View Subscription Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 text-red-700">
          <p>{error}</p>
        </div>
      )}
      
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-blue-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Subscription Details</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {subDetails.isActive ? (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                ) : (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    Inactive
                  </span>
                )}
              </dd>
            </div>
            
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Plan</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {subDetails.plan.charAt(0).toUpperCase() + subDetails.plan.slice(1)}
              </dd>
            </div>
            
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Start Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {subDetails.startDate ? new Date(subDetails.startDate).toLocaleDateString() : 'N/A'}
              </dd>
            </div>
            
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Expiry Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {subDetails.endDate ? new Date(subDetails.endDate).toLocaleDateString() : 'N/A'}
              </dd>
            </div>
          </dl>
        </div>
        
        {subDetails.paymentHistory && subDetails.paymentHistory.length > 0 && (
          <div>
            <div className="px-4 py-3 bg-gray-50 text-sm font-medium text-gray-500">
              Recent Payments
            </div>
            <ul className="divide-y divide-gray-200">
              {subDetails.paymentHistory.slice(0, 3).map((payment: any, index: number) => (
                <li key={index} className="px-4 py-3">
                  <div className="flex justify-between">
                    <div className="text-sm text-gray-900">₹{payment.amount}</div>
                    <div className="text-sm text-gray-500">{new Date(payment.date).toLocaleDateString()}</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">ID: {payment.razorpayPaymentId}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="px-4 py-4 bg-gray-50 text-right sm:px-6">
          {subDetails.isActive && (
            <button
              onClick={handleCancelSubscription}
              disabled={cancelLoading}
              className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                cancelLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {cancelLoading ? 'Processing...' : 'Cancel Subscription'}
            </button>
          )}
          
          <button
            onClick={() => navigate('/study-materials')}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View Study Materials
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStatus;
