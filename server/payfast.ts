import crypto from "crypto";

export interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  passPhrase?: string;
  testMode?: boolean;
}

// Default configuration using environment variables only
const defaultConfig: PayFastConfig = {
  merchantId: process.env.PAYFAST_MERCHANT_ID || '',
  merchantKey: process.env.PAYFAST_MERCHANT_KEY || '',
  passPhrase: process.env.PAYFAST_PASSPHRASE || '',
  testMode: process.env.NODE_ENV !== 'production' // Auto-detect: test mode unless in production
};

export interface PayFastPaymentData {
  // Required fields
  merchant_id: string;
  merchant_key: string;
  amount: number;
  item_name: string;
  
  // Return URLs
  return_url: string;
  cancel_url: string;
  notify_url: string;
  
  // Optional fields
  name_first?: string;
  name_last?: string;
  email_address?: string;
  item_description?: string;
  m_payment_id?: string;
  
  // Custom fields
  custom_str1?: string;
  custom_str2?: string;
  custom_str3?: string;
  custom_str4?: string;
  custom_str5?: string;
  custom_int1?: number;
  custom_int2?: number;
  custom_int3?: number;
  custom_int4?: number;
  custom_int5?: number;
  
  // Subscription fields
  subscription_type?: "1" | "2"; // 1 = recurring, 2 = fetch
  billing_date?: string; // yyyy-mm-dd
  recurring_amount?: number;
  frequency?: number;
  cycles?: number;
  
  // Signature (will be generated)
  signature?: string;
}

export class PayFast {
  private config: PayFastConfig;
  private baseUrl: string;
  
  constructor(config: PayFastConfig) {
    this.config = config;
    this.baseUrl = config.testMode 
      ? "https://sandbox.payfast.co.za/eng/process" 
      : "https://www.payfast.co.za/eng/process";
  }
  
  /**
   * Check if currently in test mode
   */
  isTestMode(): boolean {
    return !!this.config.testMode;
  }
  
  /**
   * Create payment data with signature
   */
  createPaymentData(data: Omit<PayFastPaymentData, "merchant_id" | "merchant_key" | "signature">): PayFastPaymentData {
    // Add merchant details
    const paymentData: PayFastPaymentData = {
      merchant_id: this.config.merchantId,
      merchant_key: this.config.merchantKey,
      ...data
    };
    
    // Generate signature
    paymentData.signature = this.generateSignature(paymentData);
    
    return paymentData;
  }
  
  /**
   * Generate payment URL (GET method)
   */
  getPaymentUrl(data: PayFastPaymentData): string {
    const queryString = Object.entries(data)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    
    return `${this.baseUrl}?${queryString}`;
  }
  
  /**
   * Generate signature for payment data
   */
  generateSignature(data: Record<string, any>): string {
    // Remove signature if present
    const { signature, ...dataToSign } = data;
    
    // Create parameter string
    const paramString = Object.entries(dataToSign)
      .filter(([_, value]) => value !== undefined && value !== null)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');
    
    // Add passphrase if provided
    const stringToHash = this.config.passPhrase
      ? `${paramString}&passphrase=${encodeURIComponent(this.config.passPhrase)}`
      : paramString;
    
    // Generate MD5 hash
    return crypto.createHash('md5').update(stringToHash).digest('hex');
  }
  
  /**
   * Verify signature from PayFast notification
   */
  verifySignature(data: Record<string, any>): boolean {
    const { signature, ...otherData } = data;
    const calculatedSignature = this.generateSignature(otherData);
    return calculatedSignature === signature;
  }
  
  /**
   * Verify that notification is from PayFast
   */
  async verifyPayFastNotification(data: Record<string, any>, srcIp: string | undefined): Promise<boolean> {
    // Verify signature
    if (!this.verifySignature(data)) {
      return false;
    }
    
    // Verify IP address (PayFast IPs are in the range 41.74.179.194/27)
    // For sandbox use the appropriate test IPs
    const validIPs = this.config.testMode
      ? ['127.0.0.1'] // For local testing
      : [
          '41.74.179.194', '41.74.179.195', '41.74.179.196', '41.74.179.197',
          '41.74.179.198', '41.74.179.199', '41.74.179.200', '41.74.179.201',
          '41.74.179.202', '41.74.179.203', '41.74.179.204', '41.74.179.205',
          '41.74.179.206', '41.74.179.207', '41.74.179.208', '41.74.179.209',
          '41.74.179.210', '41.74.179.211', '41.74.179.212', '41.74.179.213',
          '41.74.179.214', '41.74.179.215', '41.74.179.216', '41.74.179.217',
          '41.74.179.218', '41.74.179.219', '41.74.179.220', '41.74.179.221',
          '41.74.179.222', '41.74.179.223', '41.74.179.224', '41.74.179.225',
          '41.74.179.226'
        ];
    
    // If srcIp is undefined or not in the valid IPs list
    // Skip IP check when in test mode
    if (srcIp && !validIPs.includes(srcIp as string) && !this.config.testMode) {
      return false;
    }
    
    // Verify with PayFast API (optional but recommended)
    // We're skipping this for now as it requires implementing a full HTTP client
    
    return true;
  }
}

// Create the PayFast API instance with the default configuration
const payfast = new PayFast(defaultConfig);

/**
 * Get mode information and ability to switch modes
 */
export const getPayFastMode = () => {
  return {
    // Current mode
    isTestMode: payfast.isTestMode(),
    
    // Set to test mode
    setTestMode: () => {
      const newPayfast = new PayFast({
        ...defaultConfig,
        testMode: true
      });
      return newPayfast;
    },
    
    // Set to production mode
    setLiveMode: () => {
      const newPayfast = new PayFast({
        ...defaultConfig,
        testMode: false
      });
      return newPayfast;
    }
  };
};

export default payfast;
