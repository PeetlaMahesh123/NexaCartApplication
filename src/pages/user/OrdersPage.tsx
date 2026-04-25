import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import { Package, Truck, CheckCircle, Clock, XCircle, IndianRupee, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_price: number;
  shipping_address: string;
  payment_status?: string;
  payment_id?: string;
  created_at: string;
  order_items?: OrderItem[];
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: {
    name: string;
    image_url: string;
  };
}

const OrdersPage = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching orders with product images...');
      
      // Validate user exists
      if (!user?.id) {
        console.error('No user ID found');
        setOrders([]);
        return;
      }
      
      // Fetch orders with items and product images using a more reliable query
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          user_id,
          status,
          total_price,
          shipping_address,
          payment_status,
          payment_id,
          created_at,
          order_items (
            id,
            order_id,
            product_id,
            quantity,
            price,
            products (
              id,
              name,
              image_url,
              description,
              price
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Orders fetch error:', ordersError);
        toast.error('Failed to fetch orders');
        setOrders([]);
        return;
      }
      
      console.log('Orders fetched:', ordersData?.length, 'orders');
      
      // Validate and process orders data
      const validOrders = (ordersData || []).map(order => {
        // Process order items to ensure product data is properly structured
        const processedItems = (order.order_items || []).map(item => {
          return {
            ...item,
            product: item.products || {
              id: item.product_id,
              name: 'Unknown Product',
              image_url: null,
              description: '',
              price: item.price
            }
          };
        });
        
        return {
          ...order,
          order_items: processedItems
        };
      }).filter(order => {
        if (!order.id) {
          console.warn('Order missing ID:', order);
          return false;
        }
        if (!order.order_items || !Array.isArray(order.order_items)) {
          console.warn('Order missing order_items:', order.id);
          return false;
        }
        return true;
      });
      
      // Log product images for debugging
      validOrders.forEach((order, orderIndex) => {
        console.log(`Order ${orderIndex + 1}:`, order.id);
        order.order_items?.forEach((item, itemIndex) => {
          const product = item.product;
          console.log(`  Item ${itemIndex + 1}:`, {
            productId: item.product_id,
            name: product?.name || 'Unknown Product',
            image_url: product?.image_url || null,
            hasImage: !!product?.image_url,
            price: item.price || 0,
            quantity: item.quantity || 1
          });
        });
      });
      
      setOrders(validOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error loading orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-500 bg-green-500/10';
      case 'shipped':
        return 'text-blue-500 bg-blue-500/10';
      case 'processing':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'cancelled':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'processing':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">Please Login</h1>
          <p className="text-gray-400">You need to login to view your orders</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Orders</h1>
        <p className="text-gray-400">Track and manage your orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl text-white mb-2">No orders yet</h2>
          <p className="text-gray-400 mb-6">You haven't placed any orders yet</p>
          <a
            href="/products"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Shopping
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              {/* Order Header - Simplified */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              {/* Order Items - Only Image, Name, Price */}
              <div className="space-y-3">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 bg-slate-800 rounded-lg p-4">
                    {/* Product Image - Improved handling */}
                    <div className="relative">
                      {item.product?.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name || 'Product'}
                          className="w-20 h-20 rounded-lg object-cover"
                          onError={(e) => {
                            console.error('Product image failed to load:', item.product.image_url);
                            console.error('Product details:', {
                              id: item.product_id,
                              name: item.product.name,
                              imageUrl: item.product.image_url
                            });
                            // Create a consistent fallback based on product name
                            const productName = item.product.name || 'product';
                            const fallbackUrl = `https://picsum.photos/seed/${productName.replace(/\s+/g, '').toLowerCase()}/80/80`;
                            console.log('Using fallback image:', fallbackUrl);
                            (e.target as HTMLImageElement).src = fallbackUrl;
                          }}
                          onLoad={() => {
                            console.log('Product image loaded successfully:', item.product.image_url);
                          }}
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-slate-700 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl mb-1">📦</div>
                            <div className="text-xs text-gray-400">No Image</div>
                          </div>
                        </div>
                      )}
                      {/* Debug indicator */}
                      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500"></div>
                    </div>
                    
                    <div className="flex-1">
                      <h5 className="text-white font-medium text-lg">
                        {item.product?.name || 'Product'}
                      </h5>
                      <p className="text-gray-400 text-sm">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.product?.image_url ? '✓ Product Image' : '⚠ No Image Available'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold text-lg">
                        <IndianRupee className="w-5 h-5 inline" />
                        {item.price * item.quantity}
                      </div>
                      <p className="text-sm text-gray-400">
                        <IndianRupee className="w-3 h-3 inline" />{item.price} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-slate-800 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Amount</span>
                  <div className="text-white font-bold text-xl">
                    <IndianRupee className="w-5 h-5 inline" />
                    {order.total_price}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
