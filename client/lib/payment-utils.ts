// Payment utilities for Razorpay integration

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface PaymentData {
  amount: number;
  currency: string;
  orderId: string;
  organizerUpiId: string;
  eventTitle: string;
  userEmail: string;
  userPhone?: string;
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const createRazorpayOrder = async (paymentData: PaymentData) => {
  // In a real implementation, this would call your backend API
  // which would create a Razorpay order and return the order details
  
  const response = await fetch('/api/payments/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: paymentData.amount * 100, // Razorpay expects amount in paise
      currency: paymentData.currency,
      organizer_upi_id: paymentData.organizerUpiId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create payment order');
  }

  return response.json();
};

export const initiatePayment = async (
  paymentData: PaymentData,
  onSuccess: (response: any) => void,
  onError: (error: any) => void
) => {
  try {
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      throw new Error('Failed to load Razorpay SDK');
    }

    // Create order
    const order = await createRazorpayOrder(paymentData);

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: paymentData.amount * 100, // Amount in paise
      currency: paymentData.currency,
      name: 'FindMyEvent',
      description: `Registration for ${paymentData.eventTitle}`,
      order_id: order.id,
      handler: (response: any) => {
        // Payment successful
        onSuccess({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      prefill: {
        email: paymentData.userEmail,
        contact: paymentData.userPhone || '',
      },
      notes: {
        event_title: paymentData.eventTitle,
        organizer_upi: paymentData.organizerUpiId,
      },
      theme: {
        color: '#007BFF', // FindMyEvent blue
      },
      modal: {
        ondismiss: () => {
          onError(new Error('Payment cancelled by user'));
        },
      },
      config: {
        display: {
          blocks: {
            banks: {
              name: 'Pay using UPI',
              instruments: [
                {
                  method: 'upi',
                },
              ],
            },
          },
          sequence: ['block.banks'],
          preferences: {
            show_default_blocks: false,
          },
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    onError(error);
  }
};

export const verifyPayment = async (paymentDetails: any) => {
  // Verify payment on server
  const response = await fetch('/api/payments/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentDetails),
  });

  if (!response.ok) {
    throw new Error('Payment verification failed');
  }

  return response.json();
};

export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const calculateServiceFee = (amount: number): number => {
  // FindMyEvent has zero commission, but Razorpay has fees
  // This is just for transparency in UI
  const razorpayFee = Math.max(2, amount * 0.02); // 2% or minimum ₹2
  return Math.round(razorpayFee * 100) / 100;
};
