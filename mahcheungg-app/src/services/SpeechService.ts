// This service handles speech recognition and synthesis
// In a real implementation, you would integrate with actual TTS APIs like Orpheus or Kokoro

declare var webkitSpeechRecognition: any;
declare var SpeechRecognition: any;

class SpeechService {
  private static instance: SpeechService;
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening: boolean = false;
  private onResultCallback: ((text: string) => void) | null = null;
  private onStartListeningCallback: (() => void) | null = null;
  private onStopListeningCallback: (() => void) | null = null;
  private language: string = 'en-US';
  
  private constructor() {
    this.initSpeechRecognition();
    this.initSpeechSynthesis();
  }

  public static getInstance(): SpeechService {
    if (!SpeechService.instance) {
      SpeechService.instance = new SpeechService();
    }
    return SpeechService.instance;
  }

  private initSpeechRecognition(): void {
    if (typeof window !== 'undefined' && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      // Use the browser's SpeechRecognition API
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionAPI();
      
      if (this.recognition) {
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = this.language;
        
        this.recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          if (this.onResultCallback) {
            this.onResultCallback(transcript);
          }
        };
        
        this.recognition.onend = () => {
          this.isListening = false;
          if (this.onStopListeningCallback) {
            this.onStopListeningCallback();
          }
        };
      }
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  }

  private initSpeechSynthesis(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    } else {
      console.warn('Speech synthesis not supported in this browser');
    }
  }

  public setLanguage(language: string): void {
    this.language = language;
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  public startListening(): void {
    if (!this.recognition) {
      console.warn('Speech recognition not available');
      return;
    }
    
    if (this.isListening) {
      this.stopListening();
    }
    
    try {
      this.recognition.start();
      this.isListening = true;
      
      if (this.onStartListeningCallback) {
        this.onStartListeningCallback();
      }
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
    }
  }

  public stopListening(): void {
    if (!this.recognition || !this.isListening) {
      return;
    }
    
    try {
      this.recognition.stop();
      this.isListening = false;
      
      if (this.onStopListeningCallback) {
        this.onStopListeningCallback();
      }
    } catch (error) {
      console.error('Failed to stop speech recognition:', error);
    }
  }

  public speak(text: string, voice: string = 'default'): void {
    if (!this.synthesis) {
      console.warn('Speech synthesis not available');
      return;
    }
    
    // Cancel any ongoing speech
    this.synthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language based on current language
    utterance.lang = this.language;
    
    // Set voice if specified and available
    if (voice !== 'default') {
      const voices = this.synthesis.getVoices();
      const selectedVoice = voices.find(v => v.name === voice || v.voiceURI === voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }
    
    // Speak the text
    this.synthesis.speak(utterance);
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) {
      return [];
    }
    
    return this.synthesis.getVoices();
  }

  public isSupported(): boolean {
    return !!this.recognition && !!this.synthesis;
  }

  public isCurrentlyListening(): boolean {
    return this.isListening;
  }

  public setOnResultCallback(callback: (text: string) => void): void {
    this.onResultCallback = callback;
  }

  public setOnStartListeningCallback(callback: () => void): void {
    this.onStartListeningCallback = callback;
  }

  public setOnStopListeningCallback(callback: () => void): void {
    this.onStopListeningCallback = callback;
  }
}

// Add type definitions for browsers that don't have them
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default SpeechService;
