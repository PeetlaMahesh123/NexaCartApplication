import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Home, Package, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    // Get order details from location state
    if (location.state) {
      setOrderDetails(location.state);
    } else {
      // If no state, redirect to home
      toast.error('No order details found');
      navigate('/');
    }
  }, [location.state, navigate]);

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handleViewOrders = () => {
    navigate('/orders');
  };

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="glass-card p-8 text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </motion.div>

          {/* Success Message */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-white mb-4"
          >
            Payment Successful!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-slate-300 mb-8"
          >
            Your order has been placed successfully. Thank you for shopping with NexaCart!
          </motion.p>

          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-800/50 rounded-xl p-6 mb-8 text-left"
          >
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Order Details
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Order ID:</span>
                <span className="text-white font-mono text-sm">{orderDetails.orderId}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Payment ID:</span>
                <span className="text-white font-mono text-sm">{orderDetails.paymentId}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="text-white font-bold">₹{orderDetails.amount}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Method:</span>
                <span className="text-white">Razorpay</span>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <button
              onClick={handleViewOrders}
              className="w-full bg-primary py-3 rounded-xl text-white font-bold hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              View My Orders
            </button>
            
            <button
              onClick={handleContinueShopping}
              className="w-full bg-slate-800 border border-slate-700 py-3 rounded-xl text-white font-bold hover:bg-slate-700 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Continue Shopping
            </button>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 text-xs text-slate-400"
          >
            <p>A confirmation email has been sent to your registered email address.</p>
            <p className="mt-2">For any queries, contact our support team.</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
