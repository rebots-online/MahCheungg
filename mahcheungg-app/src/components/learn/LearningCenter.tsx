import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import AIChatbot from './AIChatbot';
import CantoneseCharacter from './CantoneseCharacter';

interface LearningCenterProps {
  onBack: () => void;
}

// Define the lesson structure
interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'rules' | 'strategy' | 'terminology';
}

const LearningCenter: React.FC<LearningCenterProps> = ({ onBack }) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showChatbot, setShowChatbot] = useState(false);
  const { style } = useTheme();
  const { t } = useLanguage();
  const isDeepSite = style === 'deepsite';

  // Sample lessons data
  const lessons: Lesson[] = [
    {
      id: 'basic-rules',
      title: 'Basic Rules of Cantonese Mahjong',
      description: 'Learn the fundamental rules and gameplay of Cantonese Mahjong.',
      content: `
        <h2>Basic Rules of Cantonese Mahjong</h2>

        <p>Cantonese Mahjong is played with 144 tiles, including:</p>
        <ul>
          <li>36 Character tiles (筒子)</li>
          <li>36 Bamboo tiles (索子)</li>
          <li>36 Circle tiles (萬子)</li>
          <li>16 Wind tiles (風牌): East, South, West, North</li>
          <li>12 Dragon tiles (箭牌): Red, Green, White</li>
          <li>8 Flower tiles (花牌)</li>
        </ul>

        <h3>Game Setup</h3>
        <p>The game begins with players drawing 13 tiles each. The dealer (East Wind) draws 14 tiles. Players take turns drawing and discarding tiles until someone forms a winning hand.</p>

        <h3>Winning Hand</h3>
        <p>A winning hand consists of 14 tiles arranged in four sets and one pair. A set can be:</p>
        <ul>
          <li>Pung (碰): Three identical tiles</li>
          <li>Kong (槓): Four identical tiles</li>
          <li>Chow (吃/上): Three consecutive tiles of the same suit</li>
        </ul>

        <h3>Calling Tiles</h3>
        <p>When another player discards a tile, you can call it to form a set:</p>
        <ul>
          <li>"Pung" (碰): Call to form a triplet</li>
          <li>"Kong" (槓): Call to form a quadruplet</li>
          <li>"Chow" (吃/上): Call to form a sequence (only from the player to your left)</li>
          <li>"Huu" (和/糊): Call to win the game</li>
        </ul>
      `,
      difficulty: 'beginner',
      category: 'rules'
    },
    {
      id: 'cantonese-terminology',
      title: 'Cantonese Mahjong Terminology',
      description: 'Essential Cantonese terms used in Mahjong gameplay.',
      content: `
        <h2>Cantonese Mahjong Terminology</h2>

        <h3>Basic Terms</h3>
        <ul>
          <li><strong>Pung (碰)</strong>: Three identical tiles</li>
          <li><strong>Kong (槓)</strong>: Four identical tiles</li>
          <li><strong>Chow/Sreung (吃/上)</strong>: Three consecutive tiles of the same suit</li>
          <li><strong>Huu (和/糊)</strong>: Winning call</li>
          <li><strong>Tin (天和)</strong>: Heavenly hand - dealer wins with initial tiles</li>
          <li><strong>Dei (地和)</strong>: Earthly hand - non-dealer wins on first discard</li>
        </ul>

        <h3>Tile Names</h3>
        <ul>
          <li><strong>Tong (筒子)</strong>: Character tiles</li>
          <li><strong>Sok (索子)</strong>: Bamboo tiles</li>
          <li><strong>Man (萬子)</strong>: Circle tiles</li>
          <li><strong>Fung (風牌)</strong>: Wind tiles</li>
          <li><strong>Jin (箭牌)</strong>: Dragon tiles</li>
          <li><strong>Fa (花牌)</strong>: Flower tiles</li>
        </ul>

        <h3>Game Flow Terms</h3>
        <ul>
          <li><strong>Zap Saam (執三)</strong>: Drawing three tiles at the beginning</li>
          <li><strong>Heung Gong (香港)</strong>: Hong Kong style rules</li>
          <li><strong>Sik Wu (食糊)</strong>: To win a hand</li>
          <li><strong>Faan (番)</strong>: Points multiplier</li>
        </ul>
      `,
      difficulty: 'beginner',
      category: 'terminology'
    },
    {
      id: 'basic-strategy',
      title: 'Basic Strategy for Beginners',
      description: 'Learn fundamental strategies to improve your Mahjong game.',
      content: `
        <h2>Basic Strategy for Beginners</h2>

        <h3>Hand Building</h3>
        <p>When building your hand, focus on these principles:</p>
        <ul>
          <li><strong>Flexibility</strong>: Keep your hand flexible in the early game</li>
          <li><strong>Efficiency</strong>: Discard isolated tiles first</li>
          <li><strong>Observation</strong>: Pay attention to discarded tiles</li>
          <li><strong>Balance</strong>: Balance between speed and points</li>
        </ul>

        <h3>Defensive Play</h3>
        <p>When playing defensively:</p>
        <ul>
          <li>Avoid discarding tiles that could help opponents win</li>
          <li>Track discarded tiles to identify safe discards</li>
          <li>Pay attention to what tiles opponents need</li>
          <li>Consider folding your hand if someone is close to winning</li>
        </ul>

        <h3>Timing</h3>
        <p>Timing is crucial in Mahjong:</p>
        <ul>
          <li>Know when to switch from building to defending</li>
          <li>Recognize when to sacrifice points for speed</li>
          <li>Understand when to call for tiles and when to wait</li>
        </ul>
      `,
      difficulty: 'beginner',
      category: 'strategy'
    },
    {
      id: 'intermediate-strategy',
      title: 'Intermediate Strategy Concepts',
      description: 'Advanced techniques for experienced players.',
      content: `
        <h2>Intermediate Strategy Concepts</h2>

        <h3>Reading Opponents</h3>
        <p>Learn to read your opponents' hands by:</p>
        <ul>
          <li>Tracking their discards and calls</li>
          <li>Noticing hesitation when drawing or discarding</li>
          <li>Identifying their hand patterns</li>
          <li>Recognizing when they're close to winning</li>
        </ul>

        <h3>Tile Efficiency</h3>
        <p>Improve your tile efficiency with these techniques:</p>
        <ul>
          <li><strong>Shanten Counting</strong>: Calculate how many tiles away you are from winning</li>
          <li><strong>Ukeire</strong>: Count the number of tiles that can improve your hand</li>
          <li><strong>Taatsu</strong>: Prioritize proto-runs (e.g., 3-4 or 4-5)</li>
          <li><strong>Furiten Awareness</strong>: Avoid discarding tiles you need</li>
        </ul>

        <h3>Strategic Calling</h3>
        <p>Make strategic decisions about when to call tiles:</p>
        <ul>
          <li>Call for speed when appropriate</li>
          <li>Stay concealed for higher points</li>
          <li>Use calls to block opponents</li>
          <li>Consider the value of revealed vs. concealed sets</li>
        </ul>
      `,
      difficulty: 'intermediate',
      category: 'strategy'
    },
    {
      id: 'advanced-tactics',
      title: 'Advanced Tactics and Techniques',
      description: 'Master-level strategies for competitive play.',
      content: `
        <h2>Advanced Tactics and Techniques</h2>

        <h3>Yaku Hunting</h3>
        <p>Strategically pursue valuable hand patterns:</p>
        <ul>
          <li>Recognize when to pivot to high-value hands</li>
          <li>Balance risk vs. reward when pursuing rare patterns</li>
          <li>Know when to abandon a yaku pursuit</li>
        </ul>

        <h3>Psychological Play</h3>
        <p>Use psychology to gain an edge:</p>
        <ul>
          <li>Mislead opponents with deceptive discards</li>
          <li>Create false tells and patterns</li>
          <li>Manipulate the pace of play</li>
          <li>Use hesitation (or lack thereof) strategically</li>
        </ul>

        <h3>Situational Awareness</h3>
        <p>Adapt your strategy based on the game situation:</p>
        <ul>
          <li>Adjust based on your position (dealer/non-dealer)</li>
          <li>Consider the score and round number</li>
          <li>Adapt to table dynamics and player styles</li>
          <li>Know when to take risks vs. play safely</li>
        </ul>
      `,
      difficulty: 'advanced',
      category: 'strategy'
    },
    {
      id: 'scoring-system',
      title: 'Cantonese Mahjong Scoring System',
      description: 'Learn how points are calculated in Cantonese Mahjong.',
      content: `
        <h2>Cantonese Mahjong Scoring System</h2>

        <h3>Basic Scoring</h3>
        <p>In Cantonese Mahjong, scoring is based on:</p>
        <ul>
          <li><strong>Faan (番)</strong>: Points multiplier based on hand patterns</li>
          <li><strong>Tai (台)</strong>: Another unit of scoring in some variants</li>
          <li><strong>Base points</strong>: Starting value before multipliers</li>
        </ul>

        <h3>Common Scoring Patterns</h3>
        <ul>
          <li><strong>Ping Wu (平糊)</strong>: Basic winning hand (1 faan)</li>
          <li><strong>Pung Pung Wu (碰碰糊)</strong>: All pungs (3 faan)</li>
          <li><strong>Sik Tsz (食字)</strong>: All one suit plus honors (3 faan)</li>
          <li><strong>Ching Yat Sik (清一色)</strong>: Pure one suit (5 faan)</li>
          <li><strong>Dai Saam Yuen (大三元)</strong>: Three dragon pungs (8 faan)</li>
          <li><strong>Dai Sei Hei (大四喜)</strong>: Four wind pungs (13 faan)</li>
        </ul>

        <h3>Special Situations</h3>
        <ul>
          <li><strong>Zimo (自摸)</strong>: Self-draw bonus</li>
          <li><strong>Gong (槓)</strong>: Kong bonus</li>
          <li><strong>Huu on replacement tile</strong>: Winning on a replacement tile after declaring a kong</li>
          <li><strong>Last tile win</strong>: Winning on the last tile of the wall</li>
        </ul>
      `,
      difficulty: 'intermediate',
      category: 'rules'
    }
  ];

  // Filter lessons based on search query and category
  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = searchQuery === '' ||
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === null || lesson.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    setSelectedLesson(null);
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  const handleBack = () => {
    if (selectedLesson) {
      setSelectedLesson(null);
    } else {
      onBack();
    }
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
          <button
            onClick={handleBack}
            className="mr-4 p-2 rounded-full transition-all hover:scale-105"
            style={{
              backgroundColor: isDeepSite ? '#334155' : 'var(--accent-light, #f3f4f6)',
              color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)',
              boxShadow: isDeepSite ? '0 2px 4px rgba(0, 0, 0, 0.5)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            <span>←</span>
          </button>
          <h1 className="text-2xl font-bold flex items-center"
              style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
            <span className="mr-2">📚</span>
            {t('learn.title')}
          </h1>
        </div>
        <div className="flex items-center">
          <button
            onClick={() => setShowChatbot(!showChatbot)}
            className="px-4 py-2 rounded-lg font-bold flex items-center transition-all hover:scale-105"
            style={{
              backgroundColor: isDeepSite ? '#4a2545' : 'var(--primary-button, #3b82f6)',
              color: isDeepSite ? '#ffc107' : '#ffffff',
              border: isDeepSite ? '2px solid #ffc107' : 'none',
              boxShadow: isDeepSite ? '0 4px 6px rgba(0, 0, 0, 0.5)' : '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            <span className="mr-2">🤖</span>
            {showChatbot ? 'Hide AI Tutor' : 'Ask AI Tutor'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6">
        <div className="max-w-6xl mx-auto">

          {selectedLesson ? (
            // Lesson Detail View
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                 style={{
                   backgroundColor: isDeepSite ? '#1e293b' : 'var(--card-bg, #ffffff)',
                   border: isDeepSite ? '1px solid #334155' : 'none'
                 }}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold"
                      style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
                    {selectedLesson.title}
                  </h2>
                  <div className="flex items-center">
                    <span className="px-3 py-1 rounded-full text-sm"
                          style={{
                            backgroundColor: isDeepSite ? '#334155' : 'var(--accent-light, #f3f4f6)',
                            color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)'
                          }}>
                      {selectedLesson.difficulty}
                    </span>
                  </div>
                </div>

                <div className="prose prose-lg max-w-none"
                     style={{ color: isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)' }}
                     dangerouslySetInnerHTML={{ __html: selectedLesson.content }}>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setSelectedLesson(null)}
                    className="px-4 py-2 rounded-lg font-bold"
                    style={{
                      backgroundColor: isDeepSite ? '#4a2545' : 'var(--primary-button, #3b82f6)',
                      color: isDeepSite ? '#ffc107' : '#ffffff',
                      border: isDeepSite ? '1px solid #ffc107' : 'none'
                    }}
                  >
                    {t('learn.backToLessons')}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Lesson List View
            <>
              <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Search Bar */}
                <div className="relative flex-grow max-w-md">
                  <input
                    type="text"
                    placeholder={t('learn.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2"
                    style={isDeepSite ? {
                      backgroundColor: '#334155',
                      color: '#ffffff',
                      borderColor: '#475569',
                      ringColor: '#ffc107'
                    } : {}}
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2"
                        style={{ color: isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)' }}>
                    🔍
                  </span>
                </div>

                {/* Category Filters */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCategorySelect(null)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${selectedCategory === null ? 'font-bold' : ''}`}
                    style={{
                      backgroundColor: isDeepSite ?
                        (selectedCategory === null ? '#4a2545' : '#334155') :
                        (selectedCategory === null ? 'var(--accent, #3b82f6)' : 'var(--accent-light, #f3f4f6)'),
                      color: isDeepSite ?
                        (selectedCategory === null ? '#ffc107' : '#cbd5e1') :
                        (selectedCategory === null ? '#ffffff' : 'var(--text-color, #1f2937)')
                    }}
                  >
                    {t('learn.category.all')}
                  </button>
                  <button
                    onClick={() => handleCategorySelect('rules')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${selectedCategory === 'rules' ? 'font-bold' : ''}`}
                    style={{
                      backgroundColor: isDeepSite ?
                        (selectedCategory === 'rules' ? '#4a2545' : '#334155') :
                        (selectedCategory === 'rules' ? 'var(--accent, #3b82f6)' : 'var(--accent-light, #f3f4f6)'),
                      color: isDeepSite ?
                        (selectedCategory === 'rules' ? '#ffc107' : '#cbd5e1') :
                        (selectedCategory === 'rules' ? '#ffffff' : 'var(--text-color, #1f2937)')
                    }}
                  >
                    {t('learn.category.rules')}
                  </button>
                  <button
                    onClick={() => handleCategorySelect('strategy')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${selectedCategory === 'strategy' ? 'font-bold' : ''}`}
                    style={{
                      backgroundColor: isDeepSite ?
                        (selectedCategory === 'strategy' ? '#4a2545' : '#334155') :
                        (selectedCategory === 'strategy' ? 'var(--accent, #3b82f6)' : 'var(--accent-light, #f3f4f6)'),
                      color: isDeepSite ?
                        (selectedCategory === 'strategy' ? '#ffc107' : '#cbd5e1') :
                        (selectedCategory === 'strategy' ? '#ffffff' : 'var(--text-color, #1f2937)')
                    }}
                  >
                    {t('learn.category.strategy')}
                  </button>
                  <button
                    onClick={() => handleCategorySelect('terminology')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${selectedCategory === 'terminology' ? 'font-bold' : ''}`}
                    style={{
                      backgroundColor: isDeepSite ?
                        (selectedCategory === 'terminology' ? '#4a2545' : '#334155') :
                        (selectedCategory === 'terminology' ? 'var(--accent, #3b82f6)' : 'var(--accent-light, #f3f4f6)'),
                      color: isDeepSite ?
                        (selectedCategory === 'terminology' ? '#ffc107' : '#cbd5e1') :
                        (selectedCategory === 'terminology' ? '#ffffff' : 'var(--text-color, #1f2937)')
                    }}
                  >
                    {t('learn.category.terminology')}
                  </button>
                </div>
              </div>

              {/* Lessons Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLessons.map(lesson => (
                  <div
                    key={lesson.id}
                    className="rounded-lg overflow-hidden shadow-lg cursor-pointer transition-transform hover:scale-105"
                    style={{
                      backgroundColor: isDeepSite ? '#1e293b' : 'var(--card-bg, #ffffff)',
                      border: isDeepSite ? '1px solid #334155' : 'none'
                    }}
                    onClick={() => handleLessonSelect(lesson)}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold"
                            style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
                          {lesson.title}
                        </h3>
                        <span className="px-2 py-1 rounded-full text-xs"
                              style={{
                                backgroundColor: isDeepSite ? '#334155' : 'var(--accent-light, #f3f4f6)',
                                color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)'
                              }}>
                          {lesson.difficulty}
                        </span>
                      </div>
                      <p className="mb-4"
                         style={{ color: isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)' }}>
                        {lesson.description}
                      </p>
                      <div className="flex justify-end">
                        <button
                          className="px-3 py-1 rounded-lg text-sm font-bold"
                          style={{
                            backgroundColor: isDeepSite ? '#4a2545' : 'var(--primary-button, #3b82f6)',
                            color: isDeepSite ? '#ffc107' : '#ffffff',
                            border: isDeepSite ? '1px solid #ffc107' : 'none'
                          }}
                        >
                          Read Lesson
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredLessons.length === 0 && (
                <div className="text-center py-12"
                     style={{ color: isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)' }}>
                  <p className="text-xl">{t('learn.noResults')}</p>
                  <p className="mt-2">{t('learn.adjustSearch')}</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center"
              style={{
                backgroundColor: isDeepSite ? '#1e293b' : 'var(--header-bg, #ffffff)',
                borderTop: isDeepSite ? '1px solid #334155' : '1px solid #e5e7eb',
                color: isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)'
              }}>
        <p>© 2025 MahCheungg - The Ultimate Mahjong Learning Experience</p>
      </footer>

      {/* AI Chatbot */}
      <AIChatbot isOpen={showChatbot} onClose={() => setShowChatbot(false)} />
    </div>
  );
};

export default LearningCenter;
