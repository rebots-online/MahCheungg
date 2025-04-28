import Purchases, {
  CustomerInfo,
  PurchasesConfiguration,
  LogLevel,
  Package,
  StoreProduct,
  PurchaseResult
} from '@revenuecat/purchases-js';

// Subscription tiers
export enum SubscriptionTier {
  FREE = 'free_tier',
  STANDARD = 'standard_tier',
  PREMIUM = 'premium_tier'
}

// Virtual currency types
export interface VirtualCurrency {
  id: string;
  name: string;
  amount: number;
}

// RevenueCat configuration
const REVENUECAT_API_KEY = process.env.REACT_APP_REVENUECAT_API_KEY || ''; // API Key from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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

  /**
   * Initialize RevenueCat with a user ID
   * @param userId The user ID to identify the customer
   * @returns Promise that resolves when initialization is complete
   */
  public async initialize(userId: string): Promise<void> {
    if (this.initialized) return;

    try {
      // Enable debug logs in development
      if (process.env.NODE_ENV === 'development') {
        Purchases.setLogLevel(LogLevel.DEBUG);
      }

      // Configure RevenueCat with the user ID
      // Since you've configured RevenueCat to use Stripe customer IDs,
      // RevenueCat will automatically create a Stripe customer if needed
      const configuration: PurchasesConfiguration = {
        apiKey: REVENUECAT_API_KEY,
        appUserID: userId,
        observerMode: false // Set to false since we're using RevenueCat as the primary payment system
      };

      await Purchases.configure(configuration);
      this.initialized = true;

      // Get initial customer info
      this.customerInfo = await Purchases.getCustomerInfo();

      // Set up customer info listener
      Purchases.addCustomerInfoUpdateListener((info) => {
        this.customerInfo = info;
        console.log('Customer info updated:', info);
      });

      console.log('RevenueCat initialized successfully with user ID:', userId);
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
      const pkg = offerings.current.availablePackages.find(p => p.identifier === packageId);

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

  /**
   * Get the user's virtual currency balance
   * @param currencyId The ID of the virtual currency
   * @returns The amount of virtual currency the user has, or 0 if not found
   */
  public async getVirtualCurrencyBalance(currencyId: string): Promise<number> {
    if (!this.initialized) {
      return 0;
    }

    try {
      const customerInfo = await Purchases.getCustomerInfo();

      // Check if the user has any virtual currency
      const currencies = customerInfo.virtualCurrencies || {};
      return currencies[currencyId] || 0;
    } catch (error) {
      console.error(`Failed to get virtual currency balance for ${currencyId}:`, error);
      return 0;
    }
  }

  /**
   * Get all virtual currencies for the user
   * @returns An object mapping currency IDs to amounts
   */
  public async getAllVirtualCurrencies(): Promise<Record<string, number>> {
    if (!this.initialized) {
      return {};
    }

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo.virtualCurrencies || {};
    } catch (error) {
      console.error('Failed to get all virtual currencies:', error);
      return {};
    }
  }

  /**
   * Purchase a virtual currency package
   * @param packageId The ID of the package to purchase
   * @returns The purchase result
   */
  public async purchaseVirtualCurrency(packageId: string): Promise<PurchaseResult | null> {
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
      const pkg = offerings.current.availablePackages.find(p => p.identifier === packageId);

      if (!pkg) {
        throw new Error(`Package ${packageId} not found`);
      }

      // Purchase the package
      const purchaseResult = await Purchases.purchasePackage(pkg);

      console.log(`Successfully purchased virtual currency package: ${packageId}`);
      return purchaseResult;
    } catch (error) {
      console.error('Failed to purchase virtual currency:', error);
      throw error;
    }
  }

  /**
   * Get all available virtual currency packages
   * @returns An array of available packages
   */
  public async getVirtualCurrencyPackages(): Promise<Package[]> {
    if (!this.initialized) {
      throw new Error('RevenueCat not initialized');
    }

    try {
      const offerings = await Purchases.getOfferings();

      if (!offerings.current) {
        return [];
      }

      // Filter packages that are for virtual currency
      // This assumes you've set up your offerings in RevenueCat with a specific identifier pattern
      return offerings.current.availablePackages.filter(pkg =>
        pkg.identifier.startsWith('currency_') ||
        pkg.product.title.toLowerCase().includes('coin') ||
        pkg.product.title.toLowerCase().includes('gem')
      );
    } catch (error) {
      console.error('Failed to get virtual currency packages:', error);
      return [];
    }
  }

  /**
   * Enable debug logs for RevenueCat (development only)
   */
  public static enableDebugLogs(): void {
    if (process.env.NODE_ENV !== 'production') {
      Purchases.setLogLevel(LogLevel.DEBUG);
    }
  }
}

export default RevenueCatService;
