import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import RevenueCatService from '@/services/RevenueCatService';
import { Package } from '@revenuecat/purchases-js';
import { Feedback } from '@/lib/sound';

interface CurrencyStoreProps {
  userId: string;
  onClose: () => void;
}

const CurrencyStore: React.FC<CurrencyStoreProps> = ({ userId, onClose }) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [currencies, setCurrencies] = useState<Record<string, number>>({});
  const { toast } = useToast();
  const revenueCatService = RevenueCatService.getInstance();

  useEffect(() => {
    const initializeStore = async () => {
      try {
        setLoading(true);

        // Initialize RevenueCat if not already initialized
        await revenueCatService.initialize(userId);

        // Get available currency packages
        const availablePackages = await revenueCatService.getVirtualCurrencyPackages();
        setPackages(availablePackages);

        // Get user's current currency balances
        const currencyBalances = await revenueCatService.getAllVirtualCurrencies();
        setCurrencies(currencyBalances);
      } catch (error) {
        console.error('Failed to initialize currency store:', error);
        toast({
          title: 'Error',
          description: 'Failed to load currency store. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    initializeStore();
  }, [userId]);

  const handlePurchase = async (pkg: Package) => {
    try {
      setPurchasing(true);

      // Play button click sound
      Feedback.buttonClick();

      // Purchase the package
      await revenueCatService.purchaseVirtualCurrency(pkg.identifier);

      // Refresh currency balances
      const updatedBalances = await revenueCatService.getAllVirtualCurrencies();
      setCurrencies(updatedBalances);

      // Play success sound
      Feedback.success();

      toast({
        title: 'Purchase Successful',
        description: `You have successfully purchased ${pkg.product.title}`,
      });
    } catch (error) {
      console.error('Failed to purchase package:', error);

      // Play error sound
      Feedback.error();

      toast({
        title: 'Purchase Failed',
        description: 'Failed to complete purchase. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setLoading(true);

      // Play button click sound
      Feedback.buttonClick();

      // Restore purchases
      await revenueCatService.restorePurchases();

      // Refresh currency balances
      const updatedBalances = await revenueCatService.getAllVirtualCurrencies();
      setCurrencies(updatedBalances);

      // Play success sound
      Feedback.success();

      toast({
        title: 'Purchases Restored',
        description: 'Your purchases have been successfully restored.',
      });
    } catch (error) {
      console.error('Failed to restore purchases:', error);

      // Play error sound
      Feedback.error();

      toast({
        title: 'Restore Failed',
        description: 'Failed to restore purchases. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Currency Store</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRestorePurchases} disabled={loading}>
            Restore Purchases
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Currency Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {Object.entries(currencies).map(([currencyId, amount]) => (
          <Card key={currencyId}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {currencyId === 'coins' ? '🪙 Coins' : currencyId === 'gems' ? '💎 Gems' : currencyId}
              </CardTitle>
              <CardDescription>Your current balance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{amount}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Available Packages */}
      <h3 className="text-xl font-semibold mb-4">Available Packages</h3>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No currency packages available at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <Card key={pkg.identifier} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle>{pkg.product.title}</CardTitle>
                <CardDescription>{pkg.product.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{pkg.product.priceString}</p>
              </CardContent>
              <CardFooter className="bg-muted/50 pt-2">
                <Button
                  className="w-full"
                  onClick={() => handlePurchase(pkg)}
                  disabled={purchasing}
                >
                  {purchasing ? 'Processing...' : 'Purchase'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrencyStore;
