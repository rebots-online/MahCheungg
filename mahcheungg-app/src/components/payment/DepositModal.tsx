import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import WebLNService from '../../services/WebLNService';

interface DepositModalProps {
  onClose: () => void;
  onDeposit: (amount: number) => void;
  weblnAvailable: boolean;
}

const DepositModal: React.FC<DepositModalProps> = ({ onClose, onDeposit, weblnAvailable }) => {
  const [amount, setAmount] = useState('10');
  const [paymentMethod, setPaymentMethod] = useState('btcln');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [invoice, setInvoice] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [walletProvider, setWalletProvider] = useState<string | null>(null);
  const { style } = useTheme();
  const isDeepSite = style === 'deepsite';

  useEffect(() => {
    if (weblnAvailable) {
      const webLNService = WebLNService.getInstance();
      setWalletProvider(webLNService.getWalletProvider());
    }
  }, [weblnAvailable]);

  // Predefined amounts
  const amounts = ['5', '10', '20', '50', '100'];

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleAmountSelect = (value: string) => {
    setAmount(value);
  };

  const generateInvoice = async () => {
    // In a real app, this would call your backend API to generate a Lightning invoice
    const webLNService = WebLNService.getInstance();
    return await webLNService.generateInvoice(parseFloat(amount), 'MahCheungg Deposit');
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (paymentMethod === 'btcln') {
        if (weblnAvailable) {
          const webLNService = WebLNService.getInstance();
          
          // Generate invoice
          const { paymentRequest, amount: invoiceAmount } = await generateInvoice();
          setInvoice(paymentRequest);

          // Display wallet provider info
          const providerName = walletProvider === 'alby' ? 'Alby' : 
                              walletProvider === 'blink' ? 'Blink.sv' : 
                              'your Lightning wallet';
          setPaymentStatus(`Processing payment with ${providerName}...`);
          
          // Simulate payment processing
          setTimeout(() => {
            setPaymentStatus('Payment successful!');
            onDeposit(parseFloat(amount));
          }, 2000);
        } else {
          // Fallback for when WebLN is not available
          const { paymentRequest } = await generateInvoice();
          setInvoice(paymentRequest);
          setPaymentStatus('Please pay this invoice using your Lightning wallet');
        }
      } else {
        // Handle other payment methods
        // For demo purposes, we'll just simulate a successful payment
        setPaymentStatus('Processing payment...');
        
        // Simulate payment processing
        setTimeout(() => {
          setPaymentStatus('Payment successful!');
          onDeposit(parseFloat(amount));
        }, 2000);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
          Deposit Funds
        </h2>
        
        {/* Payment Method Selection */}
        <div className="mb-4">
          <label className="block mb-2 font-bold"
                 style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setPaymentMethod('btcln')}
              className={`p-3 rounded-lg flex items-center justify-center ${paymentMethod === 'btcln' ? 'ring-2' : ''}`}
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
              onClick={() => setPaymentMethod('card')}
              className={`p-3 rounded-lg flex items-center justify-center ${paymentMethod === 'card' ? 'ring-2' : ''}`}
              style={{ 
                backgroundColor: isDeepSite ? '#334155' : 'var(--accent-light, #f3f4f6)',
                color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)',
                ringColor: isDeepSite ? '#ffc107' : 'var(--accent, #3b82f6)'
              }}
            >
              <span className="mr-2">💳</span>
              Credit Card
            </button>
          </div>
        </div>
        
        {/* Amount Selection */}
        <div className="mb-4">
          <label className="block mb-2 font-bold"
                 style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
            Amount (USD)
          </label>
          <input 
            type="text"
            value={amount}
            onChange={handleAmountChange}
            className="w-full px-3 py-2 mb-2 border rounded-md focus:outline-none focus:ring-2"
            style={isDeepSite ? {
              backgroundColor: '#334155',
              color: '#ffffff',
              borderColor: '#475569',
              ringColor: '#ffc107'
            } : {}}
          />
          
          <div className="grid grid-cols-5 gap-2">
            {amounts.map((amt) => (
              <button 
                key={amt}
                onClick={() => handleAmountSelect(amt)}
                className={`p-2 rounded-lg ${amount === amt ? 'font-bold' : ''}`}
                style={{ 
                  backgroundColor: isDeepSite ? 
                    (amount === amt ? '#4a2545' : '#334155') : 
                    (amount === amt ? 'var(--accent, #3b82f6)' : 'var(--accent-light, #f3f4f6)'),
                  color: isDeepSite ? 
                    (amount === amt ? '#ffc107' : '#cbd5e1') : 
                    (amount === amt ? '#ffffff' : 'var(--text-color, #1f2937)')
                }}
              >
                ${amt}
              </button>
            ))}
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
            
            {invoice && paymentMethod === 'btcln' && !weblnAvailable && (
              <div className="mt-2">
                <p className="mb-2 font-bold"
                   style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
                  Lightning Invoice:
                </p>
                <div className="p-2 rounded bg-gray-100 dark:bg-gray-700 overflow-x-auto">
                  <code className="text-xs break-all">{invoice}</code>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100">
            {error}
          </div>
        )}
        
        {/* WebLN Status */}
        {paymentMethod === 'btcln' && (
          <div className="mb-4 flex items-center"
               style={{ color: isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)' }}>
            <div className={`w-3 h-3 rounded-full mr-2 ${weblnAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>
              {weblnAvailable ? 
                `WebLN is available. Using ${walletProvider === 'alby' ? 'Alby' : 
                                           walletProvider === 'blink' ? 'Blink.sv' : 
                                           'your browser wallet'}.` : 
                'WebLN is not available. You will need to pay the invoice manually.'}
            </span>
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
            onClick={handleDeposit}
            disabled={loading}
            className="px-4 py-2 rounded-lg font-bold"
            style={{
              backgroundColor: isDeepSite ? '#4a2545' : 'var(--primary-button, #3b82f6)',
              color: isDeepSite ? '#ffc107' : '#ffffff',
              border: isDeepSite ? '1px solid #ffc107' : 'none',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Processing...' : 'Deposit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositModal;
