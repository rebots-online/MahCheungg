import { getWebln, WebLNProvider } from 'webln';

interface InvoiceResponse {
  paymentRequest: string;
  amount: number;
  expiry: number;
}

interface PaymentResponse {
  preimage: string;
  paymentHash?: string;
}

class WebLNService {
  private static instance: WebLNService;
  private webln: WebLNProvider | null = null;
  private available = false;
  private walletProvider: 'alby' | 'blink' | 'other' | null = null;

  private constructor() {}

  public static getInstance(): WebLNService {
    if (!WebLNService.instance) {
      WebLNService.instance = new WebLNService();
    }
    return WebLNService.instance;
  }

  public async initialize(): Promise<boolean> {
    try {
      this.webln = await getWebln();
      await this.webln.enable();
      this.available = true;

      // Detect wallet provider
      this.detectWalletProvider();

      console.log(`WebLN initialized successfully with provider: ${this.walletProvider}`);
      return true;
    } catch (error) {
      console.error('Failed to initialize WebLN:', error);
      this.available = false;
      return false;
    }
  }

  private detectWalletProvider(): void {
    if (!this.webln) return;

    // Check for Alby
    if (
      typeof window !== 'undefined' &&
      window.webln &&
      window.webln.provider &&
      window.webln.provider.includes('alby')
    ) {
      this.walletProvider = 'alby';
      return;
    }

    // Check for Blink.sv
    if (
      typeof window !== 'undefined' &&
      window.webln &&
      window.webln.provider &&
      window.webln.provider.includes('blink')
    ) {
      this.walletProvider = 'blink';
      return;
    }

    this.walletProvider = 'other';
  }

  public isAvailable(): boolean {
    return this.available;
  }

  public getWalletProvider(): string | null {
    return this.walletProvider;
  }

  public async generateInvoice(amount: number, memo: string = 'MahCheungg Deposit'): Promise<InvoiceResponse> {
    // In a real app, this would call your backend API to generate a Lightning invoice
    // For demo purposes, we'll just simulate it

    // Convert amount to satoshis (1 USD ≈ 2000 satoshis at $50,000/BTC)
    const satoshis = Math.round(amount * 2000);

    return {
      paymentRequest: `lnbc${satoshis}m1pvjluezpp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdpl2pkx2ctnv5sxxmmwwd5kgetjypeh2ursdae8g6twvus8g6rfwvs8qun0dfjkxaq8rkx3yf5tcsyz3d73gafnh3cax9rn449d9p5uxz9ezhhypd0elx87sjle52x86fux2ypatgddc6k63n7erqz25le42c4u4ecky03ylcqca784w`,
      amount: satoshis,
      expiry: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
    };
  }

  public async makePayment(paymentRequest: string): Promise<PaymentResponse> {
    if (!this.available || !this.webln) {
      throw new Error('WebLN not available');
    }

    try {
      // Send payment using WebLN
      const response = await this.webln.sendPayment(paymentRequest);
      return response;
    } catch (error) {
      console.error('Payment failed:', error);
      throw error;
    }
  }

  public async getInvoice(amount: number, memo: string = 'MahCheungg Deposit'): Promise<string> {
    if (!this.available || !this.webln) {
      throw new Error('WebLN not available');
    }

    try {
      // Request invoice using WebLN
      const satoshis = Math.round(amount * 2000); // Convert USD to satoshis
      const response = await this.webln.makeInvoice({
        amount: satoshis,
        defaultMemo: memo
      });
      return response.paymentRequest;
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      throw error;
    }
  }

  public async getBalance(): Promise<number | null> {
    if (!this.available || !this.webln) {
      throw new Error('WebLN not available');
    }

    try {
      // Get node info
      const nodeInfo = await this.webln.getInfo();

      // Note: Not all WebLN providers expose balance information
      if (this.walletProvider === 'alby') {
        // Alby-specific balance request
        try {
          const response = await this.webln.request('getBalance');
          return response.balance;
        } catch (e) {
          console.log('Alby balance request failed:', e);
          return null;
        }
      } else if (this.walletProvider === 'blink') {
        // Blink.sv might have a different method
        try {
          const response = await this.webln.request('getBalance');
          return response.balance;
        } catch (e) {
          console.log('Blink balance request failed:', e);
          return null;
        }
      }

      return null;
    } catch (error) {
      console.error('Failed to get balance:', error);
      return null;
    }
  }

  // Alby-specific methods
  public async getAlbyUserInfo(): Promise<any | null> {
    if (!this.available || !this.webln || this.walletProvider !== 'alby') {
      return null;
    }

    try {
      // This is an Alby-specific method
      const response = await this.webln.request('getAlbyUserInfo');
      return response;
    } catch (error) {
      console.error('Failed to get Alby user info:', error);
      return null;
    }
  }

  // Blink.sv-specific methods
  public async getBlinkUserInfo(): Promise<any | null> {
    if (!this.available || !this.webln || this.walletProvider !== 'blink') {
      return null;
    }

    try {
      // This would be a Blink.sv-specific method if they have one
      const response = await this.webln.request('getUserInfo');
      return response;
    } catch (error) {
      console.error('Failed to get Blink user info:', error);
      return null;
    }
  }
}

export default WebLNService;
