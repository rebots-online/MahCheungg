/**
 * GameSettings
 *
 * This service manages game settings, including debug mode, theme, and other preferences.
 */

import MessageDisplayController from '../../components/chat/MessageDisplayController';

// Available themes
export type Theme = 'deepsite' | 'brutalist' | 'skeuomorphic' | 'retro';

// Settings change handler
type SettingsChangeHandler = (settings: GameSettings) => void;

/**
 * GameSettings class
 */
class GameSettings {
  private static instance: GameSettings;
  private debugMode: boolean = false;
  private theme: Theme = 'deepsite';
  private turnTimeout: number = 30000; // 30 seconds default
  private includeBonus: boolean = true;
  private messageDisplay: MessageDisplayController | null = null;
  private settingsChangeHandlers: Set<SettingsChangeHandler> = new Set();

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Load settings from localStorage
    this.loadSettings();
  }

  /**
   * Get the singleton instance of GameSettings
   */
  public static getInstance(): GameSettings {
    if (!GameSettings.instance) {
      GameSettings.instance = new GameSettings();
    }
    return GameSettings.instance;
  }

  /**
   * Set the message display controller
   * @param display The message display controller
   */
  public setMessageDisplay(display: MessageDisplayController): void {
    this.messageDisplay = display;

    // Sync debug mode
    if (this.messageDisplay) {
      this.messageDisplay.setDebugMode(this.debugMode);
    }
  }

  /**
   * Toggle debug mode
   */
  public toggleDebugMode(): void {
    this.debugMode = !this.debugMode;

    // Update message display
    if (this.messageDisplay) {
      this.messageDisplay.setDebugMode(this.debugMode);
    }

    // Save settings
    this.saveSettings();

    // Notify handlers
    this.notifySettingsChangeHandlers();
  }

  /**
   * Set debug mode
   * @param enabled Whether debug mode is enabled
   */
  public setDebugMode(enabled: boolean): void {
    if (this.debugMode !== enabled) {
      this.debugMode = enabled;

      // Update message display
      if (this.messageDisplay) {
        this.messageDisplay.setDebugMode(this.debugMode);
      }

      // Save settings
      this.saveSettings();

      // Notify handlers
      this.notifySettingsChangeHandlers();
    }
  }

  /**
   * Check if debug mode is enabled
   * @returns Whether debug mode is enabled
   */
  public isDebugMode(): boolean {
    return this.debugMode;
  }

  /**
   * Set the theme
   * @param theme The theme to set
   */
  public setTheme(theme: Theme): void {
    if (this.theme !== theme) {
      this.theme = theme;

      // Apply theme to document
      this.applyTheme();

      // Save settings
      this.saveSettings();

      // Notify handlers
      this.notifySettingsChangeHandlers();
    }
  }

  /**
   * Get the current theme
   * @returns The current theme
   */
  public getTheme(): Theme {
    return this.theme;
  }

  /**
   * Set the turn timeout
   * @param timeout The timeout in milliseconds
   */
  public setTurnTimeout(timeout: number): void {
    if (this.turnTimeout !== timeout) {
      this.turnTimeout = timeout;

      // Save settings
      this.saveSettings();

      // Notify handlers
      this.notifySettingsChangeHandlers();
    }
  }

  /**
   * Get the turn timeout
   * @returns The turn timeout in milliseconds
   */
  public getTurnTimeout(): number {
    return this.turnTimeout;
  }

  /**
   * Set whether to include bonus tiles
   * @param include Whether to include bonus tiles
   */
  public setIncludeBonus(include: boolean): void {
    if (this.includeBonus !== include) {
      this.includeBonus = include;

      // Save settings
      this.saveSettings();

      // Notify handlers
      this.notifySettingsChangeHandlers();
    }
  }

  /**
   * Check if bonus tiles are included
   * @returns Whether bonus tiles are included
   */
  public isIncludeBonus(): boolean {
    return this.includeBonus;
  }

  /**
   * Register a handler for settings changes
   * @param handler The handler function
   */
  public onSettingsChange(handler: SettingsChangeHandler): void {
    this.settingsChangeHandlers.add(handler);
  }

  /**
   * Unregister a handler for settings changes
   * @param handler The handler function to remove
   */
  public offSettingsChange(handler: SettingsChangeHandler): void {
    this.settingsChangeHandlers.delete(handler);
  }

  /**
   * Notify all settings change handlers
   */
  private notifySettingsChangeHandlers(): void {
    for (const handler of this.settingsChangeHandlers) {
      try {
        handler(this);
      } catch (error) {
        console.error('Error in settings change handler:', error);
      }
    }
  }

  /**
   * Apply the current theme to the document
   */
  private applyTheme(): void {
    // Remove all theme classes
    document.body.classList.remove('theme-deepsite', 'theme-brutalist', 'theme-skeuomorphic', 'theme-retro');

    // Add the current theme class
    document.body.classList.add(`theme-${this.theme}`);
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    const settings = {
      debugMode: this.debugMode,
      theme: this.theme,
      turnTimeout: this.turnTimeout,
      includeBonus: this.includeBonus
    };

    localStorage.setItem('mahcheungg_settings', JSON.stringify(settings));
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): void {
    const savedSettings = localStorage.getItem('mahcheungg_settings');

    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);

        if (settings.debugMode !== undefined) {
          this.debugMode = settings.debugMode;
        }

        if (settings.theme !== undefined) {
          this.theme = settings.theme;
        }

        if (settings.turnTimeout !== undefined) {
          this.turnTimeout = settings.turnTimeout;
        }

        if (settings.includeBonus !== undefined) {
          this.includeBonus = settings.includeBonus;
        }

        // Apply theme
        this.applyTheme();
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }
}

export default GameSettings;
