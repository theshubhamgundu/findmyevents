import { RequestHandler } from "express";
import crypto from "crypto";

// In production, these would come from environment variables
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Mock Razorpay implementation for demo purposes
const mockRazorpay = {
  orders: {
    create: (options: any) => {
      return Promise.resolve({
        id: `order_${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
        entity: 'order',
        amount: options.amount,
        amount_paid: 0,
        amount_due: options.amount,
        currency: options.currency,
        receipt: options.receipt,
        status: 'created',
        created_at: Math.floor(Date.now() / 1000),
      });
    },
  },
};

export const createOrder: RequestHandler = async (req, res) => {
  try {
    const { amount, currency = 'INR', organizer_upi_id } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount is required'
      });
    }

    // In a real implementation, you would use the actual Razorpay SDK
    // const Razorpay = require('razorpay');
    // const razorpay = new Razorpay({
    //   key_id: RAZORPAY_KEY_ID,
    //   key_secret: RAZORPAY_KEY_SECRET,
    // });

    const options = {
      amount: amount, // amount in paise
      currency: currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        organizer_upi_id: organizer_upi_id,
      },
    };

    // For demo purposes, using mock implementation
    const order = await mockRazorpay.orders.create(options);
    
    res.json({
      success: true,
      order: order
    });

  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment order'
    });
  }
};

export const verifyPayment: RequestHandler = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing payment verification parameters'
      });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET || 'test_secret')
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      res.json({
        success: true,
        message: 'Payment verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Payment verification failed'
      });
    }

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      error: 'Payment verification failed'
    });
  }
};

export const getPaymentStatus: RequestHandler = async (req, res) => {
  try {
    const { payment_id } = req.params;

    if (!payment_id) {
      return res.status(400).json({
        success: false,
        error: 'Payment ID is required'
      });
    }

    // In a real implementation, you would fetch payment details from Razorpay
    // const payment = await razorpay.payments.fetch(payment_id);

    // Mock response for demo
    const mockPayment = {
      id: payment_id,
      entity: 'payment',
      amount: 50000, // amount in paise
      currency: 'INR',
      status: 'captured',
      method: 'upi',
      created_at: Math.floor(Date.now() / 1000),
    };

    res.json({
      success: true,
      payment: mockPayment
    });

  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment status'
    });
  }
};

// Webhook handler for payment notifications
export const handleWebhook: RequestHandler = async (req, res) => {
  try {
    const webhookBody = JSON.stringify(req.body);
    const webhookSignature = req.headers['x-razorpay-signature'] as string;

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET || 'test_secret')
      .update(webhookBody)
      .digest('hex');

    if (webhookSignature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook signature'
      });
    }

    const event = req.body;

    // Handle different event types
    switch (event.event) {
      case 'payment.captured':
        // Payment was successful
        console.log('Payment captured:', event.payload.payment.entity);
        // Update database, send notifications, etc.
        break;
      
      case 'payment.failed':
        // Payment failed
        console.log('Payment failed:', event.payload.payment.entity);
        // Handle failed payment
        break;
      
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Webhook processing failed'
    });
  }
};
