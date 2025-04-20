import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: { name: string }) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { style } = useTheme();
  const isDeepSite = style === 'deepsite';

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // In a real app, this would call your authentication API
      // For demo purposes, we'll just simulate a successful login
      setTimeout(() => {
        onLogin({ name: email.split('@')[0] });
      }, 1000);
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      // In a real app, this would use Firebase Authentication or similar
      // For demo purposes, we'll just simulate a successful login
      setTimeout(() => {
        onLogin({ name: 'Google User' });
      }, 1000);
    } catch (err) {
      console.error('Google login error:', err);
      setError('Google login failed. Please try again.');
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
          {isSignUp ? 'Create Account' : 'Login'}
        </h2>
        
        {/* Google Login Button */}
        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full mb-4 py-2 rounded-lg font-bold flex items-center justify-center"
          style={{
            backgroundColor: isDeepSite ? '#334155' : '#ffffff',
            color: isDeepSite ? '#ffffff' : '#4285F4',
            border: isDeepSite ? '1px solid #475569' : '1px solid #dadce0',
            opacity: loading ? 0.7 : 1
          }}
        >
          <span className="mr-2" style={{ color: '#4285F4' }}>G</span>
          Continue with Google
        </button>
        
        <div className="flex items-center mb-4">
          <div className="flex-grow h-px" style={{ backgroundColor: isDeepSite ? '#475569' : '#e5e7eb' }}></div>
          <span className="px-3" style={{ color: isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)' }}>or</span>
          <div className="flex-grow h-px" style={{ backgroundColor: isDeepSite ? '#475569' : '#e5e7eb' }}></div>
        </div>
        
        {/* Email Login Form */}
        <form onSubmit={handleEmailLogin}>
          {isSignUp && (
            <div className="mb-4">
              <label className="block mb-2 font-bold"
                     style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
                Name
              </label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                style={isDeepSite ? {
                  backgroundColor: '#334155',
                  color: '#ffffff',
                  borderColor: '#475569',
                  ringColor: '#ffc107'
                } : {}}
              />
            </div>
          )}
          
          <div className="mb-4">
            <label className="block mb-2 font-bold"
                   style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
              Email
            </label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
              style={isDeepSite ? {
                backgroundColor: '#334155',
                color: '#ffffff',
                borderColor: '#475569',
                ringColor: '#ffc107'
              } : {}}
            />
          </div>
          
          <div className="mb-6">
            <label className="block mb-2 font-bold"
                   style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
              Password
            </label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
              style={isDeepSite ? {
                backgroundColor: '#334155',
                color: '#ffffff',
                borderColor: '#475569',
                ringColor: '#ffc107'
              } : {}}
            />
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100">
              {error}
            </div>
          )}
          
          {/* Action Buttons */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg font-bold mb-4"
            style={{
              backgroundColor: isDeepSite ? '#4a2545' : 'var(--primary-button, #3b82f6)',
              color: isDeepSite ? '#ffc107' : '#ffffff',
              border: isDeepSite ? '1px solid #ffc107' : 'none',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Login')}
          </button>
          
          <div className="text-center">
            <button 
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm"
              style={{ color: isDeepSite ? '#ffc107' : 'var(--accent, #3b82f6)' }}
            >
              {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
