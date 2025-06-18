// Define available languages
export type Language = 'en' | 'zh-HK' | 'zh-CN' | 'ja';

// Define translation structure
interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

// Translations for the application
export const translations: Translations = {
  // Navigation and UI
  'app.title': {
    'en': 'MahCheungg - Multiplayer Mahjong',
    'zh-HK': '麻雀 - 多人麻將遊戲',
    'zh-CN': '麻将 - 多人麻将游戏',
    'ja': 'マージャン - マルチプレイヤー麻雀'
  },
  'nav.home': {
    'en': 'Home',
    'zh-HK': '主頁',
    'zh-CN': '主页',
    'ja': 'ホーム'
  },
  'nav.play': {
    'en': 'Play',
    'zh-HK': '開始遊戲',
    'zh-CN': '开始游戏',
    'ja': 'プレイ'
  },
  'nav.learn': {
    'en': 'Learn',
    'zh-HK': '學習',
    'zh-CN': '学习',
    'ja': '学ぶ'
  },
  'nav.settings': {
    'en': 'Settings',
    'zh-HK': '設定',
    'zh-CN': '设置',
    'ja': '設定'
  },

  // Game Hub
  'hub.playVsAi': {
    'en': 'Play vs AI',
    'zh-HK': '對戰電腦',
    'zh-CN': '对战电脑',
    'ja': 'AIと対戦'
  },
  'hub.playVsAi.desc': {
    'en': 'Challenge our intelligent AI opponent with adaptive difficulty that learns your play style.',
    'zh-HK': '挑戰我們智能的AI對手，它會適應您的遊戲風格。',
    'zh-CN': '挑战我们智能的AI对手，它会适应您的游戏风格。',
    'ja': 'あなたのプレイスタイルを学習する適応型AIに挑戦しましょう。'
  },
  'hub.playerVsPlayer': {
    'en': 'Player vs Player',
    'zh-HK': '玩家對戰',
    'zh-CN': '玩家对战',
    'ja': 'プレイヤー対プレイヤー'
  },
  'hub.playerVsPlayer.desc': {
    'en': 'Compete against real players from around the world in intense head-to-head matches.',
    'zh-HK': '與來自世界各地的真實玩家進行激烈的對戰。',
    'zh-CN': '与来自世界各地的真实玩家进行激烈的对战。',
    'ja': '世界中の実際のプレイヤーと対戦しましょう。'
  },
  'hub.tournaments': {
    'en': 'Tournaments',
    'zh-HK': '錦標賽',
    'zh-CN': '锦标赛',
    'ja': 'トーナメント'
  },
  'hub.tournaments.desc': {
    'en': 'Join competitive tournaments with amazing prizes and prove you\'re the best.',
    'zh-HK': '參加競爭激烈的錦標賽，贏取豐厚獎品，證明你是最棒的。',
    'zh-CN': '参加竞争激烈的锦标赛，赢取丰厚奖品，证明你是最棒的。',
    'ja': '素晴らしい賞品のある競争力のあるトーナメントに参加して、あなたが最高であることを証明しましょう。'
  },
  'hub.getSchooled': {
    'en': 'Get Schooled',
    'zh-HK': '學習課堂',
    'zh-CN': '学习课堂',
    'ja': '麻雀教室'
  },
  'hub.getSchooled.desc': {
    'en': 'Learn Cantonese Mahjong rules, strategies, and terminology in our comprehensive learning center.',
    'zh-HK': '在我們全面的學習中心學習廣東麻將規則、策略和術語。',
    'zh-CN': '在我们全面的学习中心学习广东麻将规则、策略和术语。',
    'ja': '広東麻雀のルール、戦略、用語を総合的な学習センターで学びましょう。'
  },

  // Buttons
  'button.playNow': {
    'en': 'Play Now',
    'zh-HK': '立即遊戲',
    'zh-CN': '立即游戏',
    'ja': '今すぐプレイ'
  },
  'button.joinNow': {
    'en': 'Join Now',
    'zh-HK': '立即加入',
    'zh-CN': '立即加入',
    'ja': '今すぐ参加'
  },
  'button.startLearning': {
    'en': 'Start Learning',
    'zh-HK': '開始學習',
    'zh-CN': '开始学习',
    'ja': '学習を始める'
  },
  'button.addFunds': {
    'en': 'Add Funds',
    'zh-HK': '增加資金',
    'zh-CN': '增加资金',
    'ja': '資金を追加'
  },
  'button.login': {
    'en': 'Login',
    'zh-HK': '登入',
    'zh-CN': '登录',
    'ja': 'ログイン'
  },
  'button.back': {
    'en': 'Back',
    'zh-HK': '返回',
    'zh-CN': '返回',
    'ja': '戻る'
  },
  'button.readLesson': {
    'en': 'Read Lesson',
    'zh-HK': '閱讀課程',
    'zh-CN': '阅读课程',
    'ja': 'レッスンを読む'
  },

  // Learning Center
  'learn.title': {
    'en': 'Get Schooled: Mahjong Learning Center',
    'zh-HK': '學習課堂：麻將學習中心',
    'zh-CN': '学习课堂：麻将学习中心',
    'ja': '麻雀教室：麻雀学習センター'
  },
  'learn.searchPlaceholder': {
    'en': 'Search lessons...',
    'zh-HK': '搜索課程...',
    'zh-CN': '搜索课程...',
    'ja': 'レッスンを検索...'
  },
  'learn.category.all': {
    'en': 'All',
    'zh-HK': '全部',
    'zh-CN': '全部',
    'ja': 'すべて'
  },
  'learn.category.rules': {
    'en': 'Rules',
    'zh-HK': '規則',
    'zh-CN': '规则',
    'ja': 'ルール'
  },
  'learn.category.strategy': {
    'en': 'Strategy',
    'zh-HK': '策略',
    'zh-CN': '策略',
    'ja': '戦略'
  },
  'learn.category.terminology': {
    'en': 'Terminology',
    'zh-HK': '術語',
    'zh-CN': '术语',
    'ja': '用語'
  },
  'learn.difficulty.beginner': {
    'en': 'Beginner',
    'zh-HK': '初學者',
    'zh-CN': '初学者',
    'ja': '初心者'
  },
  'learn.difficulty.intermediate': {
    'en': 'Intermediate',
    'zh-HK': '中級',
    'zh-CN': '中级',
    'ja': '中級者'
  },
  'learn.difficulty.advanced': {
    'en': 'Advanced',
    'zh-HK': '高級',
    'zh-CN': '高级',
    'ja': '上級者'
  },
  'learn.noResults': {
    'en': 'No lessons found matching your search criteria.',
    'zh-HK': '沒有找到符合您搜索條件的課程。',
    'zh-CN': '没有找到符合您搜索条件的课程。',
    'ja': '検索条件に一致するレッスンが見つかりませんでした。'
  },
  'learn.adjustSearch': {
    'en': 'Try adjusting your search or category filters.',
    'zh-HK': '嘗試調整您的搜索或類別過濾器。',
    'zh-CN': '尝试调整您的搜索或类别过滤器。',
    'ja': '検索またはカテゴリフィルターを調整してみてください。'
  },
  'learn.backToLessons': {
    'en': 'Back to Lessons',
    'zh-HK': '返回課程',
    'zh-CN': '返回课程',
    'ja': 'レッスンに戻る'
  }
};

// Function to get a translation
export const getTranslation = (key: string, language: Language = 'en'): string => {
  if (!translations[key]) {
    console.warn(`Translation key not found: ${key}`);
    return key;
  }

  return translations[key][language] || translations[key]['en'];
};
