import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface PaymentData {
  orderId: string;
  paymentId: string;
  amount: number;
  timestamp: string;
}

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(3);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  useEffect(() => {
    // Get payment data from location state or create mock data
    const data = location.state as PaymentData || {
      orderId: `order_${Date.now()}`,
      paymentId: `pay_${Date.now()}`,
      amount: 15235,
      timestamp: new Date().toLocaleString()
    };
    
    setPaymentData(data);

    // Countdown timer for redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/orders');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, location.state]);

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Success Overlay */}
        <div className="bg-emerald-500 text-white rounded-t-2xl p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Check className="w-10 h-10 text-emerald-500" />
          </motion.div>
          <h1 className="text-2xl font-bold mb-2">Payment Successful</h1>
          <p className="text-emerald-100">You will be redirected in {countdown} seconds</p>
        </div>

        {/* Payment Details Card */}
        <div className="bg-white rounded-b-2xl shadow-xl p-6">
          <div className="border-b pb-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">GlobalMart</span>
              <span className="text-sm text-gray-500">
                {formatDate(paymentData.timestamp)}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              UPI ID: pay_{paymentData.paymentId.slice(-12)}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount</span>
              <span className="text-2xl font-bold text-gray-900">
                {formatAmount(paymentData.amount)}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Order ID</span>
              <span className="text-gray-700 font-mono">
                #{paymentData.orderId.slice(-8).toUpperCase()}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Payment ID</span>
              <span className="text-gray-700 font-mono text-xs">
                {paymentData.paymentId.slice(-12)}
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t text-center">
            <p className="text-xs text-gray-500 mb-3">
              Visit razorpay.com/support for queries
            </p>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xs text-gray-500">Secured by</span>
              <span className="text-xs font-bold text-blue-600">Razorpay</span>
            </div>
          </div>

          <div className="mt-6 flex space-x-3">
            <button
              onClick={() => navigate('/orders')}
              className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>View Orders</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/products')}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccessPage;
