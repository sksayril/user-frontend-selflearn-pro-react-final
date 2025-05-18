import axios from 'axios';
import { authHeader } from './authService';

const API_URL = 'https://api.adhyan.guru/api';

// Types
export interface SubscriptionOrder {
  orderId: string;
  amount: number;
  currency: string;
  receipt: string;
  key_id: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface SubscriptionStatus {
  isSubscribed: boolean;
  isActive: boolean;
  plan: string;
  startDate: string | null;
  endDate: string | null;
  paymentHistory: Array<{
    razorpayPaymentId: string;
    amount: number;
    status: string;
    date: string;
  }>;
}

// Create subscription order
export const createSubscriptionOrder = async (plan: 'monthly' | 'yearly' = 'monthly'): Promise<SubscriptionOrder> => {
  const response = await axios.post(
    `${API_URL}/users/subscription/create-order`, 
    { plan }, 
    { headers: authHeader() }
  );
  return response.data;
};

// Verify payment after subscription payment
export const verifyPayment = async (paymentData: {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}) => {
  const response = await axios.post(
    `${API_URL}/users/subscription/verify-payment`,
    paymentData,
    { headers: authHeader() }
  );
  
  // Update local storage with subscription data if payment verification was successful
  if (response.data.success && response.data.subscription) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      user.subscription = response.data.subscription;
      localStorage.setItem('user', JSON.stringify(user));
    }
  }
  
  return response.data;
};

// Check subscription status
export const checkSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
  const response = await axios.get(
    `${API_URL}/users/subscription/status`,
    { headers: authHeader() }
  );
  return response.data;
};

// Cancel subscription
export const cancelSubscription = async () => {
  const response = await axios.post(
    `${API_URL}/users/subscription/cancel`,
    {},
    { headers: authHeader() }
  );
  
  // Update local storage if cancellation was successful
  if (response.data.success) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.subscription) {
        user.subscription.isActive = false;
      }
      localStorage.setItem('user', JSON.stringify(user));
    }
  }
  
  return response.data;
};
