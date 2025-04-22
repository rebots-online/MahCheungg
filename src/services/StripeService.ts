import { loadStripe, Stripe } from '@stripe/stripe-js';

// Subscription tiers
export enum SubscriptionTier {
  FREE = 'free_tier',
  STANDARD = 'standard_tier',
  PREMIUM = 'premium_tier'
}

// Stripe configuration
const STRIPE_PUBLIC_KEY = process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_your_stripe_public_key';

class StripeService {
  private static instance: StripeService;
  private stripePromise: Promise<Stripe | null>;
  private customerId: string | null = null;
  private subscriptionId: string | null = null;
  private subscriptionStatus: string | null = null;
  private subscriptionTier: SubscriptionTier = SubscriptionTier.FREE;

  private constructor() {
    this.stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
  }

  public static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  public async getStripe(): Promise<Stripe | null> {
    return this.stripePromise;
  }

  public async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<{ clientSecret: string }> {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  public async createSubscription(priceId: string): Promise<{ subscriptionId: string; clientSecret: string }> {
    try {
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      const data = await response.json();
      this.subscriptionId = data.subscriptionId;
      this.subscriptionStatus = 'active';
      this.updateSubscriptionTier(priceId);
      
      return data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  public async cancelSubscription(subscriptionId: string = this.subscriptionId || ''): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`/api/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      const data = await response.json();
      if (data.success) {
        this.subscriptionStatus = 'canceled';
        this.subscriptionTier = SubscriptionTier.FREE;
      }
      
      return data;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  public async updateSubscription(subscriptionId: string = this.subscriptionId || '', newPriceId: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`/api/update-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
          newPriceId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

      const data = await response.json();
      if (data.success) {
        this.updateSubscriptionTier(newPriceId);
      }
      
      return data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  public async getSubscriptionStatus(subscriptionId: string = this.subscriptionId || ''): Promise<{ status: string; tier: SubscriptionTier }> {
    try {
      if (!subscriptionId) {
        return { status: 'inactive', tier: SubscriptionTier.FREE };
      }

      const response = await fetch(`/api/subscription-status?subscriptionId=${subscriptionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get subscription status');
      }

      const data = await response.json();
      this.subscriptionStatus = data.status;
      this.subscriptionTier = data.tier;
      
      return data;
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return { status: 'error', tier: SubscriptionTier.FREE };
    }
  }

  public async createCustomer(email: string, name: string): Promise<{ customerId: string }> {
    try {
      const response = await fetch('/api/create-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create customer');
      }

      const data = await response.json();
      this.customerId = data.customerId;
      
      return data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  public async getPaymentMethods(): Promise<any[]> {
    try {
      if (!this.customerId) {
        return [];
      }

      const response = await fetch(`/api/payment-methods?customerId=${this.customerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get payment methods');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting payment methods:', error);
      return [];
    }
  }

  public async addPaymentMethod(paymentMethodId: string): Promise<{ success: boolean }> {
    try {
      if (!this.customerId) {
        throw new Error('Customer ID not set');
      }

      const response = await fetch('/api/add-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: this.customerId,
          paymentMethodId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add payment method');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }

  public async removePaymentMethod(paymentMethodId: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch('/api/remove-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove payment method');
      }

      return await response.json();
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw error;
    }
  }

  public getSubscriptionTier(): SubscriptionTier {
    return this.subscriptionTier;
  }

  private updateSubscriptionTier(priceId: string): void {
    // Map price IDs to subscription tiers
    // This would be configured based on your actual Stripe price IDs
    const priceTierMap: Record<string, SubscriptionTier> = {
      'price_standard': SubscriptionTier.STANDARD,
      'price_premium': SubscriptionTier.PREMIUM,
    };

    this.subscriptionTier = priceTierMap[priceId] || SubscriptionTier.FREE;
  }

  public setCustomerId(customerId: string): void {
    this.customerId = customerId;
  }

  public setSubscriptionId(subscriptionId: string): void {
    this.subscriptionId = subscriptionId;
  }

  public getCustomerId(): string | null {
    return this.customerId;
  }

  public getSubscriptionId(): string | null {
    return this.subscriptionId;
  }

  public getSubscriptionStatus(): string | null {
    return this.subscriptionStatus;
  }
}

export default StripeService;
