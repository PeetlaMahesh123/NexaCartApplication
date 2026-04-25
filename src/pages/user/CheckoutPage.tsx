import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  CreditCard,
  ShieldCheck,
  ChevronRight,
  Lock,
  Loader2,
  IndianRupee,
  User,
  Phone
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import { apiWrapper } from '../../lib/api-wrapper';
import { razorpayService, RazorpayPaymentData } from '../../lib/razorpay-service';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { items, total, clearCart } = useCartStore();
  const { user, profile } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const navigate = useNavigate();

  const [shippingDetails, setShippingDetails] = useState({
    fullName: profile?.full_name || '',
    address: profile?.address || '',
    city: profile?.city || '',
    state: profile?.state || '',
    pincode: profile?.pincode || '',
    phone: profile?.phone || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingDetails(prev => ({ ...prev, [name]: value }));
  };

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please login');
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setPaymentProcessing(true);
    setLoading(true);

    try {
      // Get authenticated user from Supabase Auth
      const { data: authUser } = await supabase.auth.getUser();
      
      if (!authUser.user) {
        toast.error('User not authenticated');
        return;
      }

      console.log('Creating order for user:', authUser.user.id);

      // Create Order with correct user_id
      const { data: orderData, error: orderError } =
        await supabase
          .from('orders')
          .insert({
            user_id: authUser.user.id, // Use auth.uid() not user.id
            status: 'pending',
            total_price: total,
            shipping_address: JSON.stringify(shippingDetails)
          })
          .select()
          .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error(orderError.message || 'Order creation failed');
      }
      
      if (!orderData)
        throw new Error('Order creation failed - no data returned');

      const createdOrder = orderData;

      // Create Order Items with correct column names
      console.log('=== DEBUGGING CART DATA STRUCTURE ===');
      console.log('Cart items before processing:', items);
      console.log('First cart item structure:', items[0]);
      console.log('Available keys in first item:', Object.keys(items[0] || {}));
      
      const orderItems = items.map((item, index) => {
        // Get product ID from cart item (CartItem uses 'id' field)
        const productId = item.id;
        console.log('Processing item:', item);
        console.log('Using product_id:', productId);
        
        // Validate product ID exists
        if (!productId) {
          throw new Error(`Product ID missing for item: ${item.name || 'Unknown'}. Please ensure products have valid IDs.`);
        }
        
        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(productId)) {
          throw new Error(`Invalid product ID format: ${productId}. Expected UUID format. Please check product setup.`);
        }
        
        return {
          order_id: createdOrder.id,
          product_id: productId,
          quantity: item.quantity || 1,
          price: item.price || 0,
          product_name: item.name || 'Product',
          product_image: item.image_url || null
        };
      });

      console.log('Final order_items to insert:', orderItems);

      const { data: itemsData, error: itemsError } =
        await supabase
          .from('order_items')
          .insert(orderItems)
          .select();

      if (itemsError) {
        console.error('Order items error:', itemsError);
        console.error('Order items data:', orderItems);
        throw new Error(itemsError.message || 'Failed to create order items');
      } else {
        console.log('Order items created successfully:', itemsData);
      }

      // Create Razorpay Order
      const razorpayOrder = await razorpayService.createOrder(total);

      // Process Payment with Razorpay
      await razorpayService.processPayment(razorpayOrder, {
        name: shippingDetails.fullName || 'Customer',
        email: user.email || '',
        phone: shippingDetails.phone || '',
        description: `Payment for order ${createdOrder.id}`,

        onSuccess: async (paymentData: RazorpayPaymentData) => {
          try {
            // Update Order
            const { error: updateError } =
              await supabase
                .from('orders')
                .update({
                  status: 'processing',
                  payment_id: paymentData.paymentId,
                  payment_status: 'paid'
                })
                .eq('id', createdOrder.id);

            if (updateError) throw new Error(updateError.message);

            // Save Payment
            await supabase
              .from('payments')
              .insert({
                order_id: createdOrder.id,
                payment_id: paymentData.paymentId,
                amount: paymentData.amount,
                currency: 'INR',
                status: 'success',
                payment_method: 'razorpay',
                razorpay_signature: paymentData.signature
              });

            clearCart();
            toast.success('Payment successful! Order placed successfully!');

            navigate('/payment-success', {
              state: {
                orderId: createdOrder.id,
                paymentId: paymentData.paymentId,
                amount: paymentData.amount
              }
            });

          } catch (err: any) {
            console.error(err);
            toast.error('Payment succeeded but update failed');
          } finally {
            setPaymentProcessing(false);
            setLoading(false);
          }
        },

        onError: (err: any) => {
          console.error(err);
          toast.error('Payment failed. Please try again.');
          setPaymentProcessing(false);
          setLoading(false);
        }
      });

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Something went wrong');
      setPaymentProcessing(false);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-primary' : 'text-slate-600'}`}>
            <MapPin className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Shipping</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-800" />
          <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-primary' : 'text-slate-600'}`}>
            <CreditCard className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Payment</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-800" />
          <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-primary' : 'text-slate-600'}`}>
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Confirm</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Form */}
        <div className="lg:col-span-8 space-y-8">
          {step === 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-10"
            >
              <div className="flex items-center space-x-3 mb-8">
                <MapPin className="text-primary w-6 h-6" />
                <h2 className="text-2xl font-bold text-white">Delivery Coordinates</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      name="fullName"
                      value={shippingDetails.fullName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="tel"
                      name="phone"
                      value={shippingDetails.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-slate-300">Street Address</label>
                  <input
                    type="text"
                    name="address"
                    value={shippingDetails.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                    placeholder="123, Main Street, Apartment 4B"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">City</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingDetails.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                    placeholder="Mumbai"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">State</label>
                  <input
                    type="text"
                    name="state"
                    value={shippingDetails.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                    placeholder="Maharashtra"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">PIN Code</label>
                  <input
                    type="text"
                    name="pincode"
                    value={shippingDetails.pincode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                    placeholder="400001"
                    required
                  />
                </div>
              </div>
              
              <button
                onClick={() => setStep(2)}
                className="w-full bg-primary py-4 rounded-xl text-white font-bold hover:bg-primary/90 transition-all duration-300 transform hover:scale-[1.02] mt-8"
              >
                Continue to Payment
              </button>
            </motion.div>
          )}
          
          {step === 2 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-10"
            >
              <div className="flex items-center space-x-3 mb-8">
                <CreditCard className="text-primary w-6 h-6" />
                <h2 className="text-2xl font-bold text-white">Payment Details</h2>
              </div>
              
              <div className="space-y-6">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-300">Payment Method</span>
                    <div className="flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-sm">Secure</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">RZ</span>
                    </div>
                    <span className="text-white font-medium">Razorpay</span>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                  <h3 className="text-white font-semibold mb-4">Order Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-slate-300">
                      <span>Subtotal ({items.length} items)</span>
                      <span>₹{total}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Tax</span>
                      <span>Included</span>
                    </div>
                    <div className="border-t border-slate-700 pt-3">
                      <div className="flex justify-between text-white font-bold text-lg">
                        <span>Total</span>
                        <span>₹{total}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handlePayment}
                  disabled={paymentProcessing}
                  className="w-full bg-primary py-4 rounded-xl text-white font-bold hover:bg-primary/90 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {paymentProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Pay with Razorpay - ₹{total}</span>
                    </>
                  )}
                </button>
                
                <div className="flex items-center justify-center space-x-4 text-xs text-slate-400">
                  <div className="flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>SSL Encrypted</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-8 sticky top-8"
          >
            <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>
            
            <div className="space-y-4 mb-6">
              {items.map((item, index) => (
                <div key={item.id || index} className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                        <span className="text-slate-500 text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium text-sm truncate">{item.name}</h4>
                    <p className="text-slate-400 text-xs">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-white font-bold flex-shrink-0">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-slate-700 pt-4 space-y-3">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal</span>
                <span>₹{total}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-slate-700">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;