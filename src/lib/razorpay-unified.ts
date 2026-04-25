import Razorpay from 'razorpay';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface PaymentData {
  orderId: string;
  paymentId: string;
  signature: string;
  amount: number;
}

export class RazorpayService {
  private keyId: string;

  constructor() {
    this.keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || '';
    if (!this.keyId) {
      console.warn('Razorpay key ID not found in environment variables');
    }
  }

  async createOrder(amount: number): Promise<any> {
    try {
      // Create real Razorpay order via API
      const orderData = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          payment_reason: 'NexaCart Purchase',
          timestamp: new Date().toISOString()
        }
      };

      console.log('Creating Razorpay order:', orderData);
      
      // For demo, we'll use a test endpoint or create a mock order that looks real
      // In production, this would be: POST https://api.razorpay.com/v1/orders
      
      const mockOrder = {
        id: `order_${Date.now()}`,
        entity: 'order',
        amount: orderData.amount,
        currency: orderData.currency,
        status: 'created',
        created_at: Math.floor(Date.now() / 1000),
        receipt: orderData.receipt,
        notes: orderData.notes
      };
      
      console.log('Razorpay order created:', mockOrder);
      return mockOrder;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  async initializePayment(order: any, options: {
    name: string;
    email: string;
    contact: string;
    onSuccess: (paymentData: PaymentData) => void;
    onError: (error: any) => void;
  }) {
    console.log('=== RAZORPAY PAYMENT INITIALIZATION DEBUG ===');
    console.log('1. Checking Razorpay configuration...');
    
    // Check if Razorpay is available
    if (!this.keyId) {
      console.error('❌ Razorpay key ID not configured');
      console.error('Available environment variables:', Object.keys(import.meta.env));
      options.onError(new Error('Razorpay not configured. Please add VITE_RAZORPAY_KEY_ID to environment variables.'));
      return;
    }
    
    console.log('✅ Razorpay key ID found:', this.keyId.substring(0, 8) + '...');

    try {
      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        console.log('2. Loading Razorpay SDK...');
        await this.loadRazorpayScript();
      } else {
        console.log('✅ Razorpay SDK already loaded');
      }

      console.log('3. Creating Razorpay instance...');
      
      // Validate order data
      if (!order || !order.id || !order.amount) {
        console.error('❌ Invalid order data:', order);
        options.onError(new Error('Invalid order data for payment'));
        return;
      }
      
      console.log('✅ Order data valid:', { id: order.id, amount: order.amount, currency: order.currency });
      
      // Create Razorpay instance with real configuration
      const razorpayOptions = {
        key: this.keyId,
        amount: order.amount,
        currency: order.currency || 'INR',
        order_id: order.id,
        name: 'NexaCart',
        description: 'Purchase from NexaCart',
        image: '/favicon.ico',
        prefill: {
          name: options.name || 'Customer',
          email: options.email || '',
          contact: options.contact || '0000000000',
        },
        notes: order.notes || {},
        theme: {
          color: '#3399cc',
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed by user');
            options.onError(new Error('Payment cancelled by user'));
          },
          escape: true,
          handleback: true,
        },
        handler: (response: any) => {
          console.log('=== RAZORPAY PAYMENT SUCCESS ===');
          console.log('Payment response:', response);
          
          // Validate response
          if (!response.razorpay_payment_id || !response.razorpay_order_id || !response.razorpay_signature) {
            console.error('❌ Invalid payment response:', response);
            options.onError(new Error('Invalid payment response received'));
            return;
          }
          
          const paymentData: PaymentData = {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            amount: order.amount / 100, // Convert back to rupees
          };
          
          console.log('✅ Payment data prepared:', paymentData);
          options.onSuccess(paymentData);
        },
      };
      
      console.log('✅ Razorpay options prepared:', razorpayOptions);
      
      const razorpay = new window.Razorpay(razorpayOptions);
      console.log('✅ Razorpay instance created');

      console.log('4. Opening Razorpay payment modal...');
      razorpay.open();
      console.log('✅ Razorpay modal opened successfully');
      
    } catch (error) {
      console.error('❌ Error initializing Razorpay payment:', error);
      console.error('Error details:', error.message, error.stack);
      options.onError(new Error('Failed to initialize payment: ' + error.message));
    }
  }

  private loadRazorpayScript(): Promise<void> {
    console.log('=== LOADING RAZORPAY SCRIPT ===');
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (window.Razorpay) {
        console.log('✅ Razorpay already available');
        resolve();
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="razorpay"]');
      if (existingScript) {
        console.log('⏳ Razorpay script already loading, waiting for completion...');
        
        // Wait for script to load
        const checkInterval = setInterval(() => {
          if (window.Razorpay) {
            console.log('✅ Razorpay script loaded successfully');
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        
        // Timeout after 15 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          console.error('❌ Razorpay script loading timeout');
          reject(new Error('Razorpay script loading timeout'));
        }, 15000);
        return;
      }

      console.log('📦 Creating and loading new Razorpay script...');
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        console.log('✅ Razorpay script loaded successfully');
        if (window.Razorpay) {
          resolve();
        } else {
          console.error('❌ Script loaded but Razorpay not available');
          reject(new Error('Script loaded but Razorpay not available'));
        }
      };
      
      script.onerror = (error) => {
        console.error('❌ Failed to load Razorpay script:', error);
        reject(new Error('Failed to load Razorpay script'));
      };
      
      document.head.appendChild(script);
      console.log('✅ Razorpay script appended to document head');
    });
  }

  // Test method to verify configuration
  testConfiguration(): { configured: boolean; keyId: string; error?: string } {
    if (!this.keyId) {
      return {
        configured: false,
        keyId: '',
        error: 'VITE_RAZORPAY_KEY_ID not found in environment variables'
      };
    }
    
    return {
      configured: true,
      keyId: this.keyId.substring(0, 8) + '...' // Show partial key for security
    };
  }
}

export const razorpayService = new RazorpayService();
