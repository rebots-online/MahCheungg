import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import StripeService from '../../services/StripeService';

interface StripePaymentModalProps {
  onClose: () => void;
  onPaymentSuccess: (amount: number) => void;
  amount: number;
  currency?: string;
  description?: string;
}

const StripePaymentModal: React.FC<StripePaymentModalProps> = ({
  onClose,
  onPaymentSuccess,
  amount,
  currency = 'usd',
  description = 'Payment for MahCheungg'
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const { style } = useTheme();
  const isDeepSite = style === 'deepsite';

  const stripe = useStripe();
  const elements = useElements();
  const stripeService = StripeService.getInstance();

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        setLoading(true);
        const { clientSecret } = await stripeService.createPaymentIntent(amount, currency);
        setClientSecret(clientSecret);
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError('Failed to initialize payment. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentIntent();
  }, [amount, currency]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setLoading(true);
    setError(null);
    setPaymentStatus('Processing payment...');

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'MahCheungg User', // This would typically come from a form
          },
        },
        receipt_email: 'user@example.com', // This would typically come from a form
      });

      if (error) {
        setError(error.message || 'Payment failed. Please try again.');
        setPaymentStatus(null);
      } else if (paymentIntent.status === 'succeeded') {
        setPaymentStatus('Payment successful!');

        // Simulate a delay before closing the modal
        setTimeout(() => {
          onPaymentSuccess(amount);
        }, 2000);
      } else {
        setError(`Payment status: ${paymentIntent.status}. Please try again.`);
        setPaymentStatus(null);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment failed. Please try again.');
      setPaymentStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: isDeepSite ? '#ffffff' : '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        '::placeholder': {
          color: isDeepSite ? '#aab7c4' : '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="relative w-full max-w-md p-6 rounded-lg shadow-lg"
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

        <h2 className="text-xl font-bold mb-4"
            style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
          Card Payment
        </h2>

        <div className="mb-4">
          <p className="text-lg font-bold"
             style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
            Amount: ${(amount / 100).toFixed(2)} {currency.toUpperCase()}
          </p>
          <p className="text-sm"
             style={{ color: isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)' }}>
            {description}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 font-bold"
                   style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
              Card Details
            </label>
            <div className="p-3 rounded-md"
                 style={{
                   backgroundColor: isDeepSite ? '#334155' : 'var(--accent-light, #f3f4f6)',
                   border: isDeepSite ? '1px solid #475569' : '1px solid #e5e7eb'
                 }}>
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          {/* Payment Status */}
          {paymentStatus && (
            <div className="mb-4 p-3 rounded-lg"
                 style={{
                   backgroundColor: isDeepSite ? '#334155' : 'var(--accent-light, #f3f4f6)',
                   color: isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)'
                 }}>
              <p>{paymentStatus}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
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
              type="submit"
              disabled={loading || !stripe || !elements || !clientSecret}
              className="px-4 py-2 rounded-lg font-bold"
              style={{
                backgroundColor: isDeepSite ? '#4a2545' : 'var(--primary-button, #3b82f6)',
                color: isDeepSite ? '#ffc107' : '#ffffff',
                border: isDeepSite ? '1px solid #ffc107' : 'none',
                opacity: (loading || !stripe || !elements || !clientSecret) ? 0.7 : 1
              }}
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StripePaymentModal;
