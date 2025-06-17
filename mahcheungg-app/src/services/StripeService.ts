import axios from 'axios';
import AuthService from './AuthService';

export enum SubscriptionTier {
  FREE = 'free_tier',
  STANDARD = 'standard_tier',
  PREMIUM = 'premium_tier'
}

interface PaymentIntent {
  clientSecret: string;
}

interface Subscription {
  subscriptionId: string;
  clientSecret: string;
  customerId: string;
}

interface SubscriptionStatus {
  status: string;
  tier: SubscriptionTier;
}

interface Customer {
  customerId: string;
}

interface PaymentMethod {
  id: string;
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

class StripeService {
  private static instance: StripeService;
  private baseUrl: string = 'http://localhost:3001/api';
  private authService: AuthService;
  
  private constructor() {
    this.authService = AuthService.getInstance();
  }
  
  public static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }
  
  private getAuthHeaders() {
    const token = this.authService.getToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }
  
  public async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<PaymentIntent> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/create-payment-intent`,
        { amount, currency },
        this.getAuthHeaders()
      );
      
      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }
  
  public async createSubscription(priceId: string, customerId?: string): Promise<Subscription> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/create-subscription`,
        { priceId, customerId },
        this.getAuthHeaders()
      );
      
      return response.data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }
  
  public async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/cancel-subscription`,
        { subscriptionId },
        this.getAuthHeaders()
      );
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }
  
  public async updateSubscription(subscriptionId: string, newPriceId: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/update-subscription`,
        { subscriptionId, newPriceId },
        this.getAuthHeaders()
      );
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }
  
  public async getSubscriptionStatus(subscriptionId: string): Promise<SubscriptionStatus> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/subscription-status?subscriptionId=${subscriptionId}`,
        this.getAuthHeaders()
      );
      
      return response.data;
    } catch (error) {
      console.error('Error getting subscription status:', error);
      throw error;
    }
  }
  
  public async createCustomer(email: string, name: string): Promise<Customer> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/create-customer`,
        { email, name },
        this.getAuthHeaders()
      );
      
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }
  
  public async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/payment-methods?customerId=${customerId}`,
        this.getAuthHeaders()
      );
      
      return response.data;
    } catch (error) {
      console.error('Error getting payment methods:', error);
      throw error;
    }
  }
  
  public async addPaymentMethod(customerId: string, paymentMethodId: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/add-payment-method`,
        { customerId, paymentMethodId },
        this.getAuthHeaders()
      );
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }
  
  public async removePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/remove-payment-method`,
        { paymentMethodId },
        this.getAuthHeaders()
      );
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw error;
    }
  }
}

export default StripeService;
