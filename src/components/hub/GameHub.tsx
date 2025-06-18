import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import DepositModal from '../payment/DepositModal';
import AuthModal from '../auth/AuthModal';
import { getWebln } from 'webln';

interface GameHubProps {
  onStartGame: (playerName: string, playerCount: number, aiDifficulty: any) => void;
}

const GameHub: React.FC<GameHubProps> = ({ onStartGame }) => {
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('Guest');
  const [userBalance, setUserBalance] = useState(0);
  const [activeTab, setActiveTab] = useState('home');
  const { style } = useTheme();
  const isDeepSite = style === 'deepsite';

  // Check if WebLN is available
  const [weblnAvailable, setWeblnAvailable] = useState(false);

  useEffect(() => {
    const checkWebln = async () => {
      try {
        const webln = await getWebln();
        setWeblnAvailable(!!webln);
      } catch (error) {
        console.error('WebLN not available:', error);
        setWeblnAvailable(false);
      }
    };

    checkWebln();
  }, []);

  const handleLogin = (user: { name: string }) => {
    setIsLoggedIn(true);
    setUserName(user.name);
    setShowAuthModal(false);
  };

  const handleDeposit = (amount: number) => {
    setUserBalance(prev => prev + amount);
    setShowDepositModal(false);
  };

  const handleStartGame = (mode: string) => {
    // For now, we'll just use default values
    onStartGame('Player 1', 4, 'MEDIUM');
  };

  return (
    <div className="min-h-screen flex flex-col"
         style={{ backgroundColor: isDeepSite ? '#0f172a' : 'var(--bg-color, #f3f4f6)' }}>

      {/* Header */}
      <header className="p-4 flex justify-between items-center"
              style={{
                backgroundColor: isDeepSite ? '#1e293b' : 'var(--header-bg, #ffffff)',
                borderBottom: isDeepSite ? '1px solid #334155' : '1px solid #e5e7eb'
              }}>
        <div className="flex items-center">
          <span className="text-2xl mr-2">🀄</span>
          <h1 className="text-2xl font-bold"
              style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
            MahCheungg
          </h1>
        </div>

        <div className="flex items-center">
          {isLoggedIn ? (
            <>
              <div className="mr-4 px-3 py-1 rounded-full"
                   style={{
                     backgroundColor: isDeepSite ? '#334155' : 'var(--accent-light, #f3f4f6)',
                     color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)'
                   }}>
                <span className="font-bold">{userBalance.toFixed(2)}</span> Points
              </div>
              <div className="flex items-center"
                   style={{ color: isDeepSite ? '#ffffff' : 'var(--text-color, #1f2937)' }}>
                <span className="mr-2">👤</span>
                {userName}
              </div>
            </>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 rounded-lg font-bold"
              style={{
                backgroundColor: isDeepSite ? '#4a2545' : 'var(--primary-button, #3b82f6)',
                color: isDeepSite ? '#ffc107' : '#ffffff',
                border: isDeepSite ? '1px solid #ffc107' : 'none'
              }}
            >
              Login
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6">
        <div className="max-w-6xl mx-auto">

          {/* Game Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Play vs AI Card */}
            <div className="rounded-lg overflow-hidden shadow-lg"
                 style={{
                   backgroundColor: isDeepSite ? '#1e293b' : 'var(--card-bg, #ffffff)',
                   border: isDeepSite ? '1px solid #334155' : 'none'
                 }}>
              <div className="p-6 flex flex-col items-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full mb-4"
                     style={{
                       backgroundColor: isDeepSite ? '#334155' : 'var(--accent-light, #f3f4f6)',
                       color: isDeepSite ? '#ffc107' : 'var(--accent, #3b82f6)'
                     }}>
                  <span className="text-3xl">🤖</span>
                </div>
                <h3 className="text-xl font-bold mb-2"
                    style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
                  Play vs AI
                </h3>
                <p className="text-center mb-4"
                   style={{ color: isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)' }}>
                  Challenge our intelligent AI opponent with adaptive difficulty that learns your play style.
                </p>
                <button
                  onClick={() => handleStartGame('ai')}
                  className="w-full py-2 rounded-lg font-bold"
                  style={{
                    backgroundColor: isDeepSite ? '#4a2545' : 'var(--primary-button, #3b82f6)',
                    color: isDeepSite ? '#ffc107' : '#ffffff',
                    border: isDeepSite ? '1px solid #ffc107' : 'none'
                  }}
                >
                  Play Now
                </button>
              </div>
            </div>

            {/* Player vs Player Card */}
            <div className="rounded-lg overflow-hidden shadow-lg"
                 style={{
                   backgroundColor: isDeepSite ? '#1e293b' : 'var(--card-bg, #ffffff)',
                   border: isDeepSite ? '1px solid #334155' : 'none'
                 }}>
              <div className="p-6 flex flex-col items-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full mb-4"
                     style={{
                       backgroundColor: isDeepSite ? '#334155' : 'var(--accent-light, #f3f4f6)',
                       color: isDeepSite ? '#ffc107' : 'var(--accent, #3b82f6)'
                     }}>
                  <span className="text-3xl">👥</span>
                </div>
                <h3 className="text-xl font-bold mb-2"
                    style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
                  Player vs Player
                </h3>
                <p className="text-center mb-4"
                   style={{ color: isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)' }}>
                  Compete against real players from around the world in intense head-to-head matches.
                </p>
                <button
                  onClick={() => handleStartGame('pvp')}
                  className="w-full py-2 rounded-lg font-bold"
                  style={{
                    backgroundColor: isDeepSite ? '#4a2545' : 'var(--primary-button, #3b82f6)',
                    color: isDeepSite ? '#ffc107' : '#ffffff',
                    border: isDeepSite ? '1px solid #ffc107' : 'none'
                  }}
                >
                  Play Now
                </button>
              </div>
            </div>

            {/* Tournaments Card */}
            <div className="rounded-lg overflow-hidden shadow-lg"
                 style={{
                   backgroundColor: isDeepSite ? '#1e293b' : 'var(--card-bg, #ffffff)',
                   border: isDeepSite ? '1px solid #334155' : 'none'
                 }}>
              <div className="p-6 flex flex-col items-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full mb-4"
                     style={{
                       backgroundColor: isDeepSite ? '#334155' : 'var(--accent-light, #f3f4f6)',
                       color: isDeepSite ? '#ffc107' : 'var(--accent, #3b82f6)'
                     }}>
                  <span className="text-3xl">🏆</span>
                </div>
                <h3 className="text-xl font-bold mb-2"
                    style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
                  Tournaments
                </h3>
                <p className="text-center mb-4"
                   style={{ color: isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)' }}>
                  Join competitive tournaments with amazing prizes and prove you're the best.
                </p>
                <button
                  className="w-full py-2 rounded-lg font-bold"
                  style={{
                    backgroundColor: isDeepSite ? '#4a2545' : 'var(--primary-button, #3b82f6)',
                    color: isDeepSite ? '#ffc107' : '#ffffff',
                    border: isDeepSite ? '1px solid #ffc107' : 'none'
                  }}
                >
                  Join Now
                </button>
              </div>
            </div>
          </div>

          {/* Deposit Section */}
          <div className="rounded-lg overflow-hidden shadow-lg mb-8"
               style={{
                 backgroundColor: isDeepSite ? '#1e293b' : 'var(--card-bg, #ffffff)',
                 border: isDeepSite ? '1px solid #334155' : 'none'
               }}>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center"
                  style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
                <span className="mr-2">💰</span>
                Deposit Points
              </h2>
              <p className="mb-6"
                 style={{ color: isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)' }}>
                Choose your preferred payment method to add points to your account:
              </p>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {/* Bitcoin Lightning */}
                <div className="rounded-lg p-4 flex flex-col items-center"
                     style={{
                       backgroundColor: isDeepSite ? '#334155' : 'var(--accent-light, #f3f4f6)',
                       border: isDeepSite ? '1px solid #475569' : 'none'
                     }}>
                  <div className="w-12 h-12 flex items-center justify-center rounded-full mb-2"
                       style={{
                         backgroundColor: isDeepSite ? '#1e293b' : 'var(--card-bg, #ffffff)',
                         color: isDeepSite ? '#ffc107' : '#f7931a'
                       }}>
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h4 className="font-bold mb-2"
                      style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
                    Bitcoin Lightning
                  </h4>
                  <button
                    onClick={() => setShowDepositModal(true)}
                    className="w-full py-1 px-2 rounded text-sm font-bold"
                    style={{
                      backgroundColor: isDeepSite ? '#4a2545' : 'var(--primary-button, #3b82f6)',
                      color: isDeepSite ? '#ffc107' : '#ffffff',
                      border: isDeepSite ? '1px solid #ffc107' : 'none'
                    }}
                  >
                    Add Funds
                  </button>
                </div>

                {/* Google Pay */}
                <div className="rounded-lg p-4 flex flex-col items-center"
                     style={{
                       backgroundColor: isDeepSite ? '#334155' : 'var(--accent-light, #f3f4f6)',
                       border: isDeepSite ? '1px solid #475569' : 'none'
                     }}>
                  <div className="w-12 h-12 flex items-center justify-center rounded-full mb-2"
                       style={{
                         backgroundColor: isDeepSite ? '#1e293b' : 'var(--card-bg, #ffffff)',
                         color: isDeepSite ? '#ffc107' : '#4285F4'
                       }}>
                    <span className="text-2xl">G</span>
                  </div>
                  <h4 className="font-bold mb-2"
                      style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
                    Google Pay
                  </h4>
                  <button
                    className="w-full py-1 px-2 rounded text-sm font-bold"
                    style={{
                      backgroundColor: isDeepSite ? '#4a2545' : 'var(--primary-button, #3b82f6)',
                      color: isDeepSite ? '#ffc107' : '#ffffff',
                      border: isDeepSite ? '1px solid #ffc107' : 'none'
                    }}
                  >
                    Add Funds
                  </button>
                </div>

                {/* Credit Card */}
                <div className="rounded-lg p-4 flex flex-col items-center"
                     style={{
                       backgroundColor: isDeepSite ? '#334155' : 'var(--accent-light, #f3f4f6)',
                       border: isDeepSite ? '1px solid #475569' : 'none'
                     }}>
                  <div className="w-12 h-12 flex items-center justify-center rounded-full mb-2"
                       style={{
                         backgroundColor: isDeepSite ? '#1e293b' : 'var(--card-bg, #ffffff)',
                         color: isDeepSite ? '#ffc107' : '#ff6b6b'
                       }}>
                    <span className="text-2xl">💳</span>
                  </div>
                  <h4 className="font-bold mb-2"
                      style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
                    Credit Card
                  </h4>
                  <button
                    className="w-full py-1 px-2 rounded text-sm font-bold"
                    style={{
                      backgroundColor: isDeepSite ? '#4a2545' : 'var(--primary-button, #3b82f6)',
                      color: isDeepSite ? '#ffc107' : '#ffffff',
                      border: isDeepSite ? '1px solid #ffc107' : 'none'
                    }}
                  >
                    Add Funds
                  </button>
                </div>

                {/* PayPal */}
                <div className="rounded-lg p-4 flex flex-col items-center"
                     style={{
                       backgroundColor: isDeepSite ? '#334155' : 'var(--accent-light, #f3f4f6)',
                       border: isDeepSite ? '1px solid #475569' : 'none'
                     }}>
                  <div className="w-12 h-12 flex items-center justify-center rounded-full mb-2"
                       style={{
                         backgroundColor: isDeepSite ? '#1e293b' : 'var(--card-bg, #ffffff)',
                         color: isDeepSite ? '#ffc107' : '#003087'
                       }}>
                    <span className="text-2xl">P</span>
                  </div>
                  <h4 className="font-bold mb-2"
                      style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
                    PayPal
                  </h4>
                  <button
                    className="w-full py-1 px-2 rounded text-sm font-bold"
                    style={{
                      backgroundColor: isDeepSite ? '#4a2545' : 'var(--primary-button, #3b82f6)',
                      color: isDeepSite ? '#ffc107' : '#ffffff',
                      border: isDeepSite ? '1px solid #ffc107' : 'none'
                    }}
                  >
                    Add Funds
                  </button>
                </div>

                {/* Apple Pay */}
                <div className="rounded-lg p-4 flex flex-col items-center"
                     style={{
                       backgroundColor: isDeepSite ? '#334155' : 'var(--accent-light, #f3f4f6)',
                       border: isDeepSite ? '1px solid #475569' : 'none'
                     }}>
                  <div className="w-12 h-12 flex items-center justify-center rounded-full mb-2"
                       style={{
                         backgroundColor: isDeepSite ? '#1e293b' : 'var(--card-bg, #ffffff)',
                         color: isDeepSite ? '#ffc107' : '#000000'
                       }}>
                    <span className="text-2xl">🍎</span>
                  </div>
                  <h4 className="font-bold mb-2"
                      style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
                    Apple Pay
                  </h4>
                  <button
                    className="w-full py-1 px-2 rounded text-sm font-bold"
                    style={{
                      backgroundColor: isDeepSite ? '#4a2545' : 'var(--primary-button, #3b82f6)',
                      color: isDeepSite ? '#ffc107' : '#ffffff',
                      border: isDeepSite ? '1px solid #ffc107' : 'none'
                    }}
                  >
                    Add Funds
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Info */}
          <div className="rounded-lg overflow-hidden shadow-lg"
               style={{
                 backgroundColor: isDeepSite ? '#1e293b' : 'var(--card-bg, #ffffff)',
                 border: isDeepSite ? '1px solid #334155' : 'none'
               }}>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center"
                  style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
                <span className="mr-2">✨</span>
                Subscription Plans
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Free Tier */}
                <div className="rounded-lg p-6"
                     style={{
                       backgroundColor: isDeepSite ? '#334155' : 'var(--accent-light, #f3f4f6)',
                       border: isDeepSite ? '1px solid #475569' : 'none'
                     }}>
                  <h3 className="text-lg font-bold mb-2"
                      style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
                    Free Trial
                  </h3>
                  <p className="text-3xl font-bold mb-4"
                     style={{ color: isDeepSite ? '#ffffff' : 'var(--text-color, #1f2937)' }}>
                    $0
                  </p>
                  <ul className="mb-6 space-y-2">
                    <li className="flex items-center"
                        style={{ color: isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)' }}>
                      <span className="mr-2">✓</span> Teaching Mode
                    </li>
                    <li className="flex items-center"
                        style={{ color: isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)' }}>
                      <span className="mr-2">✓</span> Basic AI Opponents
                    </li>
                    <li className="flex items-center"
                        style={{ color: isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)' }}>
                      <span className="mr-2">✓</span> Limited Game Modes
                    </li>
                  </ul>
                  <button
                    className="w-full py-2 rounded-lg font-bold"
                    style={{
                      backgroundColor: isDeepSite ? '#4a2545' : 'var(--primary-button, #3b82f6)',
                      color: isDeepSite ? '#ffc107' : '#ffffff',
                      border: isDeepSite ? '1px solid #ffc107' : 'none'
                    }}
                  >
                    Current Plan
                  </button>
                </div>

                {/* Standard Tier */}
                <div className="rounded-lg p-6"
                     style={{
                       backgroundColor: isDeepSite ? '#334155' : 'var(--accent-light, #f3f4f6)',
                       border: isDeepSite ? '1px solid #475569' : 'none'
                     }}>
                  <h3 className="text-lg font-bold mb-2"
                      style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
                    Standard
                  </h3>
                  <p className="text-3xl font-bold mb-4"
                     style={{ color: isDeepSite ? '#ffffff' : 'var(--text-color, #1f2937)' }}>
                    $4.99<span className="text-sm">/mo</span>
                  </p>
                  <ul className="mb-6 space-y-2">
                    <li className="flex items-center"
                        style={{ color: isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)' }}>
                      <span className="mr-2">✓</span> All Free Features
                    </li>
                    <li className="flex items-center"
                        style={{ color: isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)' }}>
                      <span className="mr-2">✓</span> Local LAN Play
                    </li>
                    <li className="flex items-center"
                        style={{ color: isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)' }}>
                      <span className="mr-2">✓</span> Advanced AI Opponents
                    </li>
                  </ul>
                  <button
                    className="w-full py-2 rounded-lg font-bold"
                    style={{
                      backgroundColor: isDeepSite ? '#4a2545' : 'var(--primary-button, #3b82f6)',
                      color: isDeepSite ? '#ffc107' : '#ffffff',
                      border: isDeepSite ? '1px solid #ffc107' : 'none'
                    }}
                  >
                    Upgrade
                  </button>
                </div>

                {/* Premium Tier */}
                <div className="rounded-lg p-6"
                     style={{
                       backgroundColor: isDeepSite ? '#334155' : 'var(--accent-light, #f3f4f6)',
                       border: isDeepSite ? '1px solid #475569' : 'none'
                     }}>
                  <h3 className="text-lg font-bold mb-2"
                      style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
                    Premium
                  </h3>
                  <p className="text-3xl font-bold mb-4"
                     style={{ color: isDeepSite ? '#ffffff' : 'var(--text-color, #1f2937)' }}>
                    $9.99<span className="text-sm">/mo</span>
                  </p>
                  <ul className="mb-6 space-y-2">
                    <li className="flex items-center"
                        style={{ color: isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)' }}>
                      <span className="mr-2">✓</span> All Standard Features
                    </li>
                    <li className="flex items-center"
                        style={{ color: isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)' }}>
                      <span className="mr-2">✓</span> Online Matchmaking
                    </li>
                    <li className="flex items-center"
                        style={{ color: isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)' }}>
                      <span className="mr-2">✓</span> Tournament Access
                    </li>
                  </ul>
                  <button
                    className="w-full py-2 rounded-lg font-bold"
                    style={{
                      backgroundColor: isDeepSite ? '#4a2545' : 'var(--primary-button, #3b82f6)',
                      color: isDeepSite ? '#ffc107' : '#ffffff',
                      border: isDeepSite ? '1px solid #ffc107' : 'none'
                    }}
                  >
                    Upgrade
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center"
              style={{
                backgroundColor: isDeepSite ? '#1e293b' : 'var(--header-bg, #ffffff)',
                borderTop: isDeepSite ? '1px solid #334155' : '1px solid #e5e7eb',
                color: isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)'
              }}>
        <p>© 2025 MahCheungg - The Ultimate Mahjong Experience</p>
      </footer>

      {/* Modals */}
      {showDepositModal && (
        <DepositModal
          onClose={() => setShowDepositModal(false)}
          onDeposit={handleDeposit}
          weblnAvailable={weblnAvailable}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
        />
      )}
    </div>
  );
};

export default GameHub;
