import StripeService, { SubscriptionTier } from './StripeService';
import RevenueCatService from './RevenueCatService';

class SubscriptionService {
  private static instance: SubscriptionService;
  private stripeService: StripeService;
  private revenueCatService: RevenueCatService;
  private userId: string | null = null;
  private subscriptionId: string | null = null;
  private customerId: string | null = null;
  private currentTier: SubscriptionTier = SubscriptionTier.FREE;
  
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
      // Try to get subscription info from RevenueCat first
      const rcSubscription = await this.revenueCatService.getSubscriberInfo(userId);
      
      if (rcSubscription && rcSubscription.entitlements) {
        // Map RevenueCat entitlements to subscription tier
        if (rcSubscription.entitlements.premium) {
          this.currentTier = SubscriptionTier.PREMIUM;
        } else if (rcSubscription.entitlements.standard) {
          this.currentTier = SubscriptionTier.STANDARD;
        } else {
          this.currentTier = SubscriptionTier.FREE;
        }
        
        return;
      }
      
      // If no RevenueCat subscription, try Stripe
      // In a real app, you would store the subscription ID and customer ID in a database
      // For now, we'll just use a mock subscription
      this.subscriptionId = 'mock-subscription-id';
      this.customerId = 'mock-customer-id';
      
      // Get subscription status from Stripe
      if (this.subscriptionId) {
        const status = await this.stripeService.getSubscriptionStatus(this.subscriptionId);
        this.currentTier = status.tier;
      }
    } catch (error) {
      console.error('Error initializing subscription service:', error);
      // Default to free tier if there's an error
      this.currentTier = SubscriptionTier.FREE;
    }
  }
  
  public async getSubscriptionTier(): Promise<SubscriptionTier> {
    return this.currentTier;
  }
  
  public async upgradeSubscription(newTier: SubscriptionTier): Promise<void> {
    if (!this.userId) {
      throw new Error('User not initialized');
    }
    
    try {
      // Determine which service to use based on the current subscription
      if (this.subscriptionId && this.customerId) {
        // Use Stripe to upgrade
        const priceId = this.getPriceIdForTier(newTier);
        await this.stripeService.updateSubscription(this.subscriptionId, priceId);
      } else {
        // Use RevenueCat to upgrade
        const entitlement = this.getEntitlementForTier(newTier);
        await this.revenueCatService.purchasePackage(this.userId, entitlement);
      }
      
      // Update the current tier
      this.currentTier = newTier;
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      throw error;
    }
  }
  
  public async cancelSubscription(): Promise<void> {
    if (!this.subscriptionId) {
      throw new Error('No active subscription');
    }
    
    try {
      await this.stripeService.cancelSubscription(this.subscriptionId);
      this.currentTier = SubscriptionTier.FREE;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }
  
  private getPriceIdForTier(tier: SubscriptionTier): string {
    switch (tier) {
      case SubscriptionTier.STANDARD:
        return 'price_standard';
      case SubscriptionTier.PREMIUM:
        return 'price_premium';
      default:
        return 'price_free';
    }
  }
  
  private getEntitlementForTier(tier: SubscriptionTier): string {
    switch (tier) {
      case SubscriptionTier.STANDARD:
        return 'standard';
      case SubscriptionTier.PREMIUM:
        return 'premium';
      default:
        return 'free';
    }
  }
}

export default SubscriptionService;
