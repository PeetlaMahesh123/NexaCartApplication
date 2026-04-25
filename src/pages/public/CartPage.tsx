// src/pages/cart/CartPage.tsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { useCartStore } from "../../store/useCartStore";
import { useAuthStore } from "../../store/useAuthStore";

const CartPage = () => {
  const navigate = useNavigate();

  const { items, removeItem, updateQuantity, total, clearCart } =
    useCartStore();

  const { user } = useAuthStore();

  
  const handleCheckout = () => {
    // Login check
    if (!user) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    // Cart check
    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    // Validate cart items
    const invalidItems = items.filter(item => 
      !item.id || !item.price || item.price <= 0 || !item.quantity || item.quantity <= 0
    );
    
    if (invalidItems.length > 0) {
      toast.error("Invalid items in cart. Please remove and add again.");
      console.error("Invalid cart items:", invalidItems);
      return;
    }

    // Navigate to checkout page
    navigate("/checkout");
  };

  // -----------------------------------
  // EMPTY CART
  // -----------------------------------
  if (items.length === 0) {
    return (
      <div className="text-center mt-20">
        <h1 className="text-3xl font-bold text-white">Cart is Empty</h1>

        <Link
          to="/products"
          className="mt-5 inline-block bg-blue-600 px-6 py-3 rounded"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  // -----------------------------------
  // UI
  // -----------------------------------
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid lg:grid-cols-3 gap-10">
        {/* LEFT */}
        <div className="lg:col-span-2">
          <div className="flex justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">
              Shopping Cart ({items.length})
            </h1>

            <button
              onClick={() => {
                clearCart();
                toast.success("Cart cleared");
              }}
              className="text-red-400"
            >
              Clear Cart
            </button>
          </div>

          <div className="space-y-5">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  className="bg-slate-900 p-5 rounded-xl flex gap-5"
                >
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />

                  <div className="flex-1">
                    <h2 className="text-white font-bold">{item.name}</h2>

                    <p className="text-slate-400 mt-2">
                      ₹{item.price} each
                    </p>

                    <div className="flex items-center gap-3 mt-4">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        <Minus />
                      </button>

                      <span className="text-white">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus />
                      </button>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 ml-5"
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </div>

                  <div className="text-white font-bold">
                    ₹{item.price * item.quantity}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-slate-900 p-8 rounded-xl h-fit">
          <h2 className="text-2xl font-bold text-white mb-8">
            Order Summary
          </h2>

          <div className="space-y-4 text-slate-300">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{total}</span>
            </div>

            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>

            <hr />

            <div className="flex justify-between text-xl text-white font-bold">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full bg-blue-600 py-4 rounded-xl mt-8 text-white font-bold hover:bg-blue-700 transition-colors"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;