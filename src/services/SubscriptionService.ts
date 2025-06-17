import StripeService, { SubscriptionTier } from './StripeService';
import RevenueCatService from './RevenueCatService';

// Payment providers
export enum PaymentProvider {
  STRIPE = 'stripe',
  REVENUECAT = 'revenuecat',
  WEBLN = 'webln'
}

// Subscription plans
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  tier: SubscriptionTier;
  features: string[];
}

class SubscriptionService {
  private static instance: SubscriptionService;
  private stripeService: StripeService;
  private revenueCatService: RevenueCatService;
  private activeProvider: PaymentProvider = PaymentProvider.STRIPE;
  private userId: string | null = null;

  // Subscription plans
  private plans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free Trial',
      description: 'Basic access with limited features',
      price: 0,
      currency: 'USD',
      interval: 'month',
      tier: SubscriptionTier.FREE,
      features: [
        'Basic AI opponents',
        'Limited game modes',
        'Access to learning resources'
      ]
    },
    {
      id: 'standard',
      name: 'Standard',
      description: 'Full access to local gameplay',
      price: 4.99,
      currency: 'USD',
      interval: 'month',
      tier: SubscriptionTier.STANDARD,
      features: [
        'All free features',
        'Local LAN play',
        'Advanced AI opponents'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Complete access with online matchmaking',
      price: 9.99,
      currency: 'USD',
      interval: 'month',
      tier: SubscriptionTier.PREMIUM,
      features: [
        'All standard features',
        'Online matchmaking',
        'Tournament access'
      ]
    }
  ];

  private constructor() {
    this.stripeService = StripeService.getInstance();
    this.revenueCatService = RevenueCatService.getInstance();
  }

  public static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  public async initialize(userId: string): Promise<void> {
    this.userId = userId;
    
    try {
      // Initialize RevenueCat
      await this.revenueCatService.initialize(userId);
      
      // Set customer ID in Stripe if available
      // This would typically come from your backend
      // this.stripeService.setCustomerId('cus_123456789');
    } catch (error) {
      console.error('Failed to initialize subscription service:', error);
    }
  }

  public async getSubscriptionTier(): Promise<SubscriptionTier> {
    try {
      if (this.activeProvider === PaymentProvider.REVENUECAT) {
        return await this.revenueCatService.getSubscriptionTier();
      } else {
        return this.stripeService.getSubscriptionTier();
      }
    } catch (error) {
      console.error('Failed to get subscription tier:', error);
      return SubscriptionTier.FREE;
    }
  }

  public async subscribe(planId: string, paymentProvider: PaymentProvider = this.activeProvider): Promise<boolean> {
    try {
      const plan = this.getPlanById(planId);
      if (!plan) {
        throw new Error(`Plan ${planId} not found`);
      }

      if (paymentProvider === PaymentProvider.REVENUECAT) {
        await this.revenueCatService.purchasePackage(planId);
        this.activeProvider = PaymentProvider.REVENUECAT;
        return true;
      } else if (paymentProvider === PaymentProvider.STRIPE) {
        // Map plan ID to Stripe price ID
        const stripePriceId = this.mapPlanToStripePrice(planId);
        await this.stripeService.createSubscription(stripePriceId);
        this.activeProvider = PaymentProvider.STRIPE;
        return true;
      } else {
        throw new Error(`Payment provider ${paymentProvider} not supported for subscriptions`);
      }
    } catch (error) {
      console.error('Failed to subscribe:', error);
      return false;
    }
  }

  public async cancelSubscription(): Promise<boolean> {
    try {
      if (this.activeProvider === PaymentProvider.REVENUECAT) {
        // RevenueCat doesn't have a direct cancel method in the client SDK
        // This would typically be handled through the app store
        return false;
      } else if (this.activeProvider === PaymentProvider.STRIPE) {
        const result = await this.stripeService.cancelSubscription();
        return result.success;
      } else {
        throw new Error(`Payment provider ${this.activeProvider} not supported for cancellation`);
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      return false;
    }
  }

  public async upgradeSubscription(newPlanId: string): Promise<boolean> {
    try {
      const newPlan = this.getPlanById(newPlanId);
      if (!newPlan) {
        throw new Error(`Plan ${newPlanId} not found`);
      }

      const currentTier = await this.getSubscriptionTier();
      if (newPlan.tier === currentTier) {
        return true; // Already on this tier
      }

      return await this.subscribe(newPlanId);
    } catch (error) {
      console.error('Failed to upgrade subscription:', error);
      return false;
    }
  }

  public async downgradeSubscription(newPlanId: string): Promise<boolean> {
    // Downgrading is the same as upgrading in terms of API calls
    return this.upgradeSubscription(newPlanId);
  }

  public async restorePurchases(): Promise<boolean> {
    try {
      if (this.activeProvider === PaymentProvider.REVENUECAT) {
        await this.revenueCatService.restorePurchases();
        return true;
      } else {
        // Stripe doesn't have a client-side restore function
        // This would typically be handled by checking the customer's subscriptions
        return false;
      }
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      return false;
    }
  }

  public getPlans(): SubscriptionPlan[] {
    return this.plans;
  }

  public getPlanById(planId: string): SubscriptionPlan | undefined {
    return this.plans.find(plan => plan.id === planId);
  }

  public getPlanByTier(tier: SubscriptionTier): SubscriptionPlan | undefined {
    return this.plans.find(plan => plan.tier === tier);
  }

  public setActiveProvider(provider: PaymentProvider): void {
    this.activeProvider = provider;
  }

  public getActiveProvider(): PaymentProvider {
    return this.activeProvider;
  }

  private mapPlanToStripePrice(planId: string): string {
    // Map plan IDs to Stripe price IDs
    const planPriceMap: Record<string, string> = {
      'standard': 'price_standard',
      'premium': 'price_premium'
    };

    return planPriceMap[planId] || '';
  }
}

export default SubscriptionService;
