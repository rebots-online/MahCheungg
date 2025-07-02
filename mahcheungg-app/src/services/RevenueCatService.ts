import { Purchases, CustomerInfo } from '@revenuecat/purchases-js';

// Subscription tiers
export enum SubscriptionTier {
  FREE = 'free_tier',
  STANDARD = 'standard_tier',
  PREMIUM = 'premium_tier'
}

// RevenueCat configuration
const REVENUECAT_API_KEY = 'your_revenuecat_api_key'; // Replace with your actual API key

class RevenueCatService {
  private static instance: RevenueCatService;
  private initialized = false;
  private customerInfo: CustomerInfo | null = null;

  private constructor() {}

  public static getInstance(): RevenueCatService {
    if (!RevenueCatService.instance) {
      RevenueCatService.instance = new RevenueCatService();
    }
    return RevenueCatService.instance;
  }

  public async initialize(userId: string): Promise<void> {
    if (this.initialized) return;

    try {
      await Purchases.configure(REVENUECAT_API_KEY, userId);
      this.initialized = true;
      
      // Get initial customer info
      this.customerInfo = await Purchases.getCustomerInfo();
      
      // Set up customer info listener
      Purchases.addCustomerInfoUpdateListener((info: CustomerInfo) => {
        this.customerInfo = info;
      });
      
      console.log('RevenueCat initialized successfully');
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      throw error;
    }
  }

  public async getSubscriptionTier(): Promise<SubscriptionTier> {
    if (!this.initialized) {
      return SubscriptionTier.FREE;
    }

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      
      // Check for active subscriptions
      const entitlements = customerInfo.entitlements.active;
      
      if (entitlements['premium']) {
        return SubscriptionTier.PREMIUM;
      } else if (entitlements['standard']) {
        return SubscriptionTier.STANDARD;
      } else {
        return SubscriptionTier.FREE;
      }
    } catch (error) {
      console.error('Failed to get subscription tier:', error);
      return SubscriptionTier.FREE;
    }
  }

  public async purchasePackage(packageId: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('RevenueCat not initialized');
    }

    try {
      // Get available packages
      const offerings = await Purchases.getOfferings();
      
      if (!offerings.current) {
        throw new Error('No offerings available');
      }
      
      // Find the package
      const pkg = offerings.current.availablePackages.find((p: any) => p.identifier === packageId);
      
      if (!pkg) {
        throw new Error(`Package ${packageId} not found`);
      }
      
      // Purchase the package
      await Purchases.purchasePackage(pkg);
      
      console.log(`Successfully purchased package: ${packageId}`);
    } catch (error) {
      console.error('Failed to purchase package:', error);
      throw error;
    }
  }

  public async restorePurchases(): Promise<void> {
    if (!this.initialized) {
      throw new Error('RevenueCat not initialized');
    }

    try {
      await Purchases.restorePurchases();
      console.log('Purchases restored successfully');
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      throw error;
    }
  }

  public async getCustomerInfo(): Promise<CustomerInfo | null> {
    if (!this.initialized) {
      return null;
    }

    try {
      this.customerInfo = await Purchases.getCustomerInfo();
      return this.customerInfo;
    } catch (error) {
      console.error('Failed to get customer info:', error);
      return null;
    }
  }
}

export default RevenueCatService;
