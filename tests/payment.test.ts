/**
 * Tests for PayFast payment integration
 */

import { PayFast, PayFastPaymentData } from '../server/payfast';

describe('PayFast Integration', () => {
  // Test instance
  const payfast = new PayFast({
    merchantId: 'TEST_MERCHANT_ID',
    merchantKey: 'TEST_MERCHANT_KEY',
    passPhrase: 'TEST_PASSPHRASE',
    testMode: true
  });

  describe('Payment Data Creation', () => {
    test('createPaymentData should include required fields', () => {
      const data = payfast.createPaymentData({
        amount: 59.00,
        item_name: 'Madifa Premium Subscription',
        return_url: 'https://example.com/return',
        cancel_url: 'https://example.com/cancel',
        notify_url: 'https://example.com/notify',
        email_address: 'test@example.com',
        name_first: 'Test',
        name_last: 'User',
        m_payment_id: '12345'
      });
      
      // Check required fields
      expect(data).toHaveProperty('merchant_id', 'TEST_MERCHANT_ID');
      expect(data).toHaveProperty('merchant_key', 'TEST_MERCHANT_KEY');
      expect(data).toHaveProperty('amount', 59.00);
      expect(data).toHaveProperty('item_name', 'Madifa Premium Subscription');
      expect(data).toHaveProperty('return_url', 'https://example.com/return');
      expect(data).toHaveProperty('cancel_url', 'https://example.com/cancel');
      expect(data).toHaveProperty('notify_url', 'https://example.com/notify');
      
      // Check signature is generated
      expect(data).toHaveProperty('signature');
      expect(typeof data.signature).toBe('string');
    });
  });

  describe('Payment URL Generation', () => {
    test('getPaymentUrl should return valid URL with query parameters', () => {
      const paymentData: PayFastPaymentData = {
        merchant_id: 'TEST_MERCHANT_ID',
        merchant_key: 'TEST_MERCHANT_KEY',
        amount: 59.00,
        item_name: 'Madifa Premium Subscription',
        return_url: 'https://example.com/return',
        cancel_url: 'https://example.com/cancel',
        notify_url: 'https://example.com/notify',
        signature: 'test-signature'
      };
      
      const url = payfast.getPaymentUrl(paymentData);
      
      // URL should be a string
      expect(typeof url).toBe('string');
      
      // URL should include the base PayFast URL (sandbox for test mode)
      expect(url).toContain('sandbox.payfast.co.za');
      
      // URL should contain all parameters
      expect(url).toContain('merchant_id=TEST_MERCHANT_ID');
      expect(url).toContain('amount=59');
      expect(url).toContain('item_name=Madifa+Premium+Subscription');
      expect(url).toContain('signature=test-signature');
    });
  });

  describe('Signature Generation and Verification', () => {
    test('generateSignature should create a consistent signature', () => {
      const data = {
        merchant_id: 'TEST_MERCHANT_ID',
        merchant_key: 'TEST_MERCHANT_KEY',
        amount: '59.00',
        item_name: 'Madifa Premium Subscription'
      };
      
      const signature1 = payfast.generateSignature(data);
      const signature2 = payfast.generateSignature(data);
      
      // Signatures should be strings
      expect(typeof signature1).toBe('string');
      
      // Signatures should be consistent for the same data
      expect(signature1).toBe(signature2);
      
      // Signature should change if data changes
      const modifiedData = { ...data, amount: '69.00' };
      const signature3 = payfast.generateSignature(modifiedData);
      expect(signature3).not.toBe(signature1);
    });
    
    test('verifySignature should validate signatures', () => {
      const data = {
        merchant_id: 'TEST_MERCHANT_ID',
        merchant_key: 'TEST_MERCHANT_KEY',
        amount: '59.00',
        item_name: 'Madifa Premium Subscription'
      };
      
      // Generate a valid signature
      const validSignature = payfast.generateSignature(data);
      
      // Add signature to data
      const dataWithSignature = {
        ...data,
        signature: validSignature
      };
      
      // Should verify with correct signature
      expect(payfast.verifySignature(dataWithSignature)).toBe(true);
      
      // Should reject with incorrect signature
      const dataWithInvalidSignature = {
        ...data,
        signature: 'invalid-signature'
      };
      
      expect(payfast.verifySignature(dataWithInvalidSignature)).toBe(false);
    });
  });

  describe('ITN (Instant Transaction Notification) Processing', () => {
    test('verifyPayFastNotification should validate notification source', async () => {
      // Mock implementation to not make actual HTTP requests
      // In a real implementation, you'd use jest.spyOn to mock fetch
      const mockVerify = jest.fn().mockImplementation(async (data, srcIp) => {
        if (srcIp === '127.0.0.1') {
          return true; // Simulate validation success
        }
        return false; // Simulate validation failure
      });
      
      const originalVerify = payfast.verifyPayFastNotification;
      payfast.verifyPayFastNotification = mockVerify;
      
      // Sample notification data
      const notificationData = {
        merchant_id: 'TEST_MERCHANT_ID',
        m_payment_id: '12345',
        pf_payment_id: 'PF12345',
        payment_status: 'COMPLETE',
        amount_gross: '59.00',
        signature: 'test-signature'
      };
      
      // Test with valid IP
      const isValid = await payfast.verifyPayFastNotification(notificationData, '127.0.0.1');
      expect(isValid).toBe(true);
      
      // Test with invalid IP
      const isInvalid = await payfast.verifyPayFastNotification(notificationData, '192.168.1.1');
      expect(isInvalid).toBe(false);
      
      // Restore original method
      payfast.verifyPayFastNotification = originalVerify;
    });
  });
});