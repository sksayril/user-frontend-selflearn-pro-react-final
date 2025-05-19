import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createSubscriptionOrder, verifyPayment } from '../../services/subscriptionService';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const SubscriptionPlans: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'monthly'>('monthly');
  const { currentUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubscription = async (plan: 'monthly' = 'monthly') => {
    if (!currentUser) {
      navigate('/login', { state: { returnTo: '/subscription', plan: 'monthly' } });
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Create an order with the selected plan
      const orderData = await createSubscriptionOrder('monthly');
      
      const options = {
        key: orderData.key_id, // Razorpay Key ID - using rzp_test_BDT2TegS4Ax6Vp
        amount: 49900, // Set amount to 499 INR (in paise)
        currency: orderData.currency,
        name: "adhyan.guru",
        description: "Monthly Subscription",
        order_id: orderData.orderId,
        prefill: {
          name: orderData.user.name,
          email: orderData.user.email,
          contact: orderData.user.phone
        },
        handler: async function (response: any) {
          try {
            // Verify payment
            const verificationResponse = await verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });
            
            if (verificationResponse.success && verificationResponse.subscription) {
              // Update user in auth context with new subscription info
              if (currentUser) {
                const updatedUser = {
                  ...currentUser,
                  subscription: verificationResponse.subscription
                };
                updateUser(updatedUser);
              }
              
              // Redirect to study materials
              navigate('/study-materials');
            }
          } catch (err: any) {
            setError(err.response?.data?.message || 'Payment verification failed');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initialize payment');
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Monthly Subscription Plan
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Get unlimited access to all study materials, quizzes, and more for just ₹499/Year.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mt-8 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 gap-8 max-w-md mx-auto">
          {/* Monthly Plan */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ring-2 ring-blue-500">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 flex justify-between items-center">
              <div>
                <h3 className="text-white font-bold text-xl">Yearly Plan</h3>
                <p className="text-blue-100 text-sm">Affordable access to premium content</p>
              </div>
                  <div className="text-lg line-through opacity-70">₹999</div>

              <div className="text-white text-3xl font-bold">₹499<span className="text-sm font-normal">/year</span></div>
            </div>
            <div className="p-6">
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-2 text-gray-700">Full access to all study materials</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-2 text-gray-700">High-quality PDF downloads</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-2 text-gray-700">All premium images and content</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-2 text-gray-700">Pay monthly, cancel anytime</span>
                </li>
              </ul>
              <button
                onClick={() => handleSubscription()}
                disabled={loading && selectedPlan === 'monthly'}
                className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${loading && selectedPlan === 'monthly' ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading && selectedPlan === 'monthly' ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Subscribe Yearly'
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Already subscribed?{' '}
            <button
              onClick={() => navigate('/study-materials')}
              className="text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
            >
              View Study Materials
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
