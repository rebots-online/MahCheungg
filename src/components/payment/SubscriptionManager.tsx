import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import SubscriptionService, { SubscriptionPlan, PaymentProvider } from '../../services/SubscriptionService';
import { SubscriptionTier } from '../../services/StripeService';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripePaymentModal from './StripePaymentModal';
import DepositModal from './DepositModal';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_your_stripe_public_key');

interface SubscriptionManagerProps {
  onClose: () => void;
  userId: string;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ onClose, userId }) => {
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>(SubscriptionTier.FREE);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [activeProvider, setActiveProvider] = useState<PaymentProvider>(PaymentProvider.STRIPE);
  const [weblnAvailable, setWeblnAvailable] = useState(false);
  const { style } = useTheme();
  const isDeepSite = style === 'deepsite';
  
  const subscriptionService = SubscriptionService.getInstance();

  useEffect(() => {
    const initializeSubscription = async () => {
      try {
        setLoading(true);
        await subscriptionService.initialize(userId);
        const tier = await subscriptionService.getSubscriptionTier();
        setCurrentTier(tier);
        setPlans(subscriptionService.getPlans());
        setActiveProvider(subscriptionService.getActiveProvider());
        
        // Check if WebLN is available
        if (typeof window !== 'undefined' && 'webln' in window) {
          setWeblnAvailable(true);
        }
      } catch (err) {
        console.error('Failed to initialize subscription:', err);
        setError('Failed to load subscription information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initializeSubscription();
  }, [userId]);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };

  const handleUpgrade = () => {
    if (!selectedPlan) return;
    
    if (activeProvider === PaymentProvider.WEBLN) {
      setShowDepositModal(true);
    } else {
      setShowStripeModal(true);
    }
  };

  const handlePaymentSuccess = async (amount: number) => {
    if (!selectedPlan) return;
    
    try {
      setLoading(true);
      const success = await subscriptionService.subscribe(selectedPlan.id, activeProvider);
      
      if (success) {
        const tier = await subscriptionService.getSubscriptionTier();
        setCurrentTier(tier);
        setShowStripeModal(false);
        setShowDepositModal(false);
      } else {
        setError('Failed to process subscription. Please try again.');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setError('Failed to process subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      const success = await subscriptionService.cancelSubscription();
      
      if (success) {
        setCurrentTier(SubscriptionTier.FREE);
      } else {
        setError('Failed to cancel subscription. Please try again.');
      }
    } catch (err) {
      console.error('Cancellation error:', err);
      setError('Failed to cancel subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (provider: PaymentProvider) => {
    setActiveProvider(provider);
    subscriptionService.setActiveProvider(provider);
  };

  const getCurrentPlan = () => {
    return subscriptionService.getPlanByTier(currentTier);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="relative w-full max-w-2xl p-6 rounded-lg shadow-lg"
           style={{ 
             backgroundColor: isDeepSite ? '#1e293b' : 'var(--card-bg, #ffffff)',
             border: isDeepSite ? '1px solid #334155' : 'none'
           }}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-xl"
          style={{ color: isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)' }}
        >
          ✕
        </button>
        
        <h2 className="text-2xl font-bold mb-4"
            style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
          Subscription Management
        </h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
                 style={{ borderColor: isDeepSite ? '#ffc107' : 'var(--accent, #3b82f6)' }}></div>
          </div>
        ) : (
          <>
            {/* Current Subscription */}
            <div className="mb-6 p-4 rounded-lg"
                 style={{ 
                   backgroundColor: isDeepSite ? '#334155' : 'var(--accent-light, #f3f4f6)',
                 }}>
              <h3 className="text-lg font-bold mb-2"
                  style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
                Current Subscription
              </h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold"
                     style={{ color: isDeepSite ? '#ffffff' : 'var(--text-color, #1f2937)' }}>
                    {getCurrentPlan()?.name || 'Free Trial'}
                  </p>
                  <p className="text-sm"
                     style={{ color: isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)' }}>
                    {getCurrentPlan()?.description || 'Basic access with limited features'}
                  </p>
                </div>
                {currentTier !== SubscriptionTier.FREE && (
                  <button 
                    onClick={handleCancel}
                    className="px-3 py-1 rounded-lg text-sm"
                    style={{
                      backgroundColor: isDeepSite ? '#4a2545' : 'var(--primary-button, #3b82f6)',
                      color: isDeepSite ? '#ffc107' : '#ffffff',
                      border: isDeepSite ? '1px solid #ffc107' : 'none'
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
            
            {/* Payment Provider Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2"
                  style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
                Payment Method
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => handleProviderChange(PaymentProvider.STRIPE)}
                  className={`p-3 rounded-lg flex items-center justify-center ${activeProvider === PaymentProvider.STRIPE ? 'ring-2' : ''}`}
                  style={{ 
                    backgroundColor: isDeepSite ? '#334155' : 'var(--accent-light, #f3f4f6)',
                    color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)',
                    ringColor: isDeepSite ? '#ffc107' : 'var(--accent, #3b82f6)'
                  }}
                >
                  <span className="mr-2">💳</span>
                  Credit Card
                </button>
                <button 
                  onClick={() => handleProviderChange(PaymentProvider.WEBLN)}
                  className={`p-3 rounded-lg flex items-center justify-center ${activeProvider === PaymentProvider.WEBLN ? 'ring-2' : ''}`}
                  style={{ 
                    backgroundColor: isDeepSite ? '#334155' : 'var(--accent-light, #f3f4f6)',
                    color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)',
                    ringColor: isDeepSite ? '#ffc107' : 'var(--accent, #3b82f6)'
                  }}
                >
                  <span className="mr-2">⚡</span>
                  Bitcoin Lightning
                </button>
                <button 
                  onClick={() => handleProviderChange(PaymentProvider.REVENUECAT)}
                  className={`p-3 rounded-lg flex items-center justify-center ${activeProvider === PaymentProvider.REVENUECAT ? 'ring-2' : ''}`}
                  style={{ 
                    backgroundColor: isDeepSite ? '#334155' : 'var(--accent-light, #f3f4f6)',
                    color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)',
                    ringColor: isDeepSite ? '#ffc107' : 'var(--accent, #3b82f6)'
                  }}
                >
                  <span className="mr-2">📱</span>
                  In-App Purchase
                </button>
              </div>
              
              {/* WebLN Status */}
              {activeProvider === PaymentProvider.WEBLN && (
                <div className="mt-2 flex items-center"
                     style={{ color: isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)' }}>
                  <div className={`w-3 h-3 rounded-full mr-2 ${weblnAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>
                    {weblnAvailable ? 
                      'WebLN is available. You can pay with Bitcoin Lightning.' : 
                      'WebLN is not available. Please install a compatible wallet.'}
                  </span>
                </div>
              )}
            </div>
            
            {/* Available Plans */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2"
                  style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
                Available Plans
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <div 
                    key={plan.id}
                    onClick={() => handleSelectPlan(plan)}
                    className={`p-4 rounded-lg cursor-pointer transition-all hover:scale-105 ${selectedPlan?.id === plan.id ? 'ring-2' : ''}`}
                    style={{ 
                      backgroundColor: isDeepSite ? '#334155' : 'var(--accent-light, #f3f4f6)',
                      ringColor: isDeepSite ? '#ffc107' : 'var(--accent, #3b82f6)',
                      opacity: currentTier === plan.tier ? 0.7 : 1
                    }}
                  >
                    <h4 className="font-bold mb-1"
                        style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
                      {plan.name}
                    </h4>
                    <p className="text-lg font-bold mb-2"
                       style={{ color: isDeepSite ? '#ffffff' : 'var(--text-color, #1f2937)' }}>
                      ${plan.price.toFixed(2)}/{plan.interval}
                    </p>
                    <p className="text-sm mb-2"
                       style={{ color: isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)' }}>
                      {plan.description}
                    </p>
                    <ul className="text-sm mb-3">
                      {plan.features.map((feature, index) => (
                        <li 
                          key={index}
                          className="flex items-center mb-1"
                          style={{ color: isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)' }}
                        >
                          <span className="mr-1">✓</span> {feature}
                        </li>
                      ))}
                    </ul>
                    {currentTier !== plan.tier && (
                      <div className="text-center">
                        <span 
                          className="text-sm font-bold"
                          style={{ color: isDeepSite ? '#ffc107' : 'var(--accent, #3b82f6)' }}
                        >
                          {currentTier < plan.tier ? 'Upgrade' : 'Downgrade'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100">
                {error}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button 
                onClick={onClose}
                className="px-4 py-2 rounded-lg font-bold"
                style={{
                  backgroundColor: isDeepSite ? '#334155' : 'var(--accent-light, #f3f4f6)',
                  color: isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleUpgrade}
                disabled={!selectedPlan || currentTier === selectedPlan.tier || loading}
                className="px-4 py-2 rounded-lg font-bold"
                style={{
                  backgroundColor: isDeepSite ? '#4a2545' : 'var(--primary-button, #3b82f6)',
                  color: isDeepSite ? '#ffc107' : '#ffffff',
                  border: isDeepSite ? '1px solid #ffc107' : 'none',
                  opacity: (!selectedPlan || currentTier === selectedPlan.tier || loading) ? 0.7 : 1
                }}
              >
                {loading ? 'Processing...' : 'Confirm Selection'}
              </button>
            </div>
          </>
        )}
      </div>
      
      {/* Stripe Payment Modal */}
      {showStripeModal && selectedPlan && (
        <Elements stripe={stripePromise}>
          <StripePaymentModal
            onClose={() => setShowStripeModal(false)}
            onPaymentSuccess={handlePaymentSuccess}
            amount={selectedPlan.price * 100} // Convert to cents
            currency={selectedPlan.currency.toLowerCase()}
            description={`Subscription to ${selectedPlan.name} plan`}
          />
        </Elements>
      )}
      
      {/* WebLN Deposit Modal */}
      {showDepositModal && selectedPlan && (
        <DepositModal
          onClose={() => setShowDepositModal(false)}
          onDeposit={handlePaymentSuccess}
          weblnAvailable={weblnAvailable}
        />
      )}
    </div>
  );
};

export default SubscriptionManager;
