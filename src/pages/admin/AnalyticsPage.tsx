import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Target, 
  Users, 
  DollarSign, 
  Calendar,
  ChevronDown,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Award
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { format, startOfMonth, endOfMonth, subMonths, eachMonthOfInterval } from 'date-fns';

const COLORS = ['#2563EB', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

const MetricCard = ({ title, value, subtext, icon: Icon, trend, trendValue }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="sleek-container"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 rounded-lg bg-primary/10 text-primary">
        <Icon className="w-5 h-5" />
      </div>
      {trend && (
        <div className={`flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${trend === 'up' ? 'bg-accent/10 text-accent' : 'bg-error/10 text-error'}`}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
          {trendValue}%
        </div>
      )}
    </div>
    <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-2xl font-black text-white mb-1">{value}</h3>
    <p className="text-[11px] text-slate-500 italic">{subtext}</p>
  </motion.div>
);

const AnalyticsPage = () => {
  const [range, setRange] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    mrr: 0,
    cac: 15.50, // Mocked fixed CAC for demo
    clv: 0,
    totalUsers: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Orders for Revenue and CLV
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_price, created_at, user_id');
      
      if (ordersError) throw ordersError;

      // 2. Fetch Users for Metrics
      const { count: userCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (usersError) throw usersError;

      // Calculate Revenue by Month
      const monthlyRevenue: Record<string, number> = {};
      const now = new Date();
      const monthsToShow = range === 'monthly' ? 6 : range === 'quarterly' ? 12 : 24;
      
      const interval = eachMonthOfInterval({
        start: subMonths(now, monthsToShow - 1),
        end: now
      });

      interval.forEach(date => {
        const key = format(date, 'MMM yy');
        monthlyRevenue[key] = 0;
      });

      let totalOverallRevenue = 0;
      orders?.forEach(order => {
        const date = new Date(order.created_at);
        const key = format(date, 'MMM yy');
        if (monthlyRevenue.hasOwnProperty(key)) {
          monthlyRevenue[key] += Number(order.total_price);
        }
        totalOverallRevenue += Number(order.total_price);
      });

      const formattedRevenue = Object.entries(monthlyRevenue).map(([name, value]) => ({
        name,
        revenue: value
      }));

      // Calculate CLV
      const uniqueUsers = new Set(orders?.map(o => o.user_id)).size;
      const clv = uniqueUsers > 0 ? totalOverallRevenue / uniqueUsers : 0;

      // MRR estimation (Current month revenue)
      const currentMonthKey = format(now, 'MMM yy');
      const mrr = monthlyRevenue[currentMonthKey] || 0;

      setRevenueData(formattedRevenue);
      setMetrics({
        mrr,
        cac: 15.50, // Static for demo
        clv,
        totalUsers: userCount || 0
      });

    } catch (err) {
      console.error('Analytics fetch error:', err);
      // Fallback
      setRevenueData([
        { name: 'Jan', revenue: 4000 },
        { name: 'Feb', revenue: 3000 },
        { name: 'Mar', revenue: 5000 },
        { name: 'Apr', revenue: 4500 },
        { name: 'May', revenue: 6000 },
        { name: 'Jun', revenue: 8000 },
      ]);
      setMetrics({ mrr: 8000, cac: 12.40, clv: 450.50, totalUsers: 8420 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-white italic underline decoration-primary decoration-4 underline-offset-8 uppercase tracking-widest">Business Intelligence</h1>
          <p className="text-slate-500 mt-2">Deep dive into NexaCart's economic performance and growth vectors.</p>
        </div>
        
        <div className="flex items-center space-x-3 bg-slate-900 border border-white/5 p-1 rounded-2xl">
          {(['monthly', 'quarterly', 'yearly'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-tighter ${range === r ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Monthly Revenue" 
          value={`$${metrics.mrr.toLocaleString()}`} 
          subtext="Total revenue logged this period"
          icon={DollarSign}
          trend="up"
          trendValue="14.2"
        />
        <MetricCard 
          title="Acquisition Cost" 
          value={`$${metrics.cac.toFixed(2)}`} 
          subtext="Avg. spend to acquire 1 new node"
          icon={Target}
          trend="down"
          trendValue="3.1"
        />
        <MetricCard 
          title="Lifetime Value" 
          value={`$${metrics.clv.toFixed(2)}`} 
          subtext="Avg. revenue per customer node"
          icon={TrendingUp}
          trend="up"
          trendValue="8.7"
        />
        <MetricCard 
          title="Active Profiles" 
          value={metrics.totalUsers.toLocaleString()} 
          subtext="Total registered ecosystem nodes"
          icon={Users}
          trend="up"
          trendValue="12.4"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 sleek-container overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span>Revenue Trajectory</span>
            </h2>
            <div className="flex items-center space-x-2 opacity-50">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-xs text-white">Gross Credits</span>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#2563EB" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#revenueGradient)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="sleek-container">
          <h2 className="text-lg font-bold text-white mb-8 flex items-center space-x-2">
            <Filter className="w-5 h-5 text-secondary" />
            <span>Economic Distribution</span>
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Hardware', value: 45 },
                    { name: 'Software', value: 25 },
                    { name: 'Services', value: 20 },
                    { name: 'Other', value: 10 },
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[0,1,2,3].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-4">
             <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 italic">Profit Margin</span>
                <span className="text-emerald-500 font-bold">24.5%</span>
             </div>
             <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 italic">Churn Probability</span>
                <span className="text-error font-bold">4.2%</span>
             </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="sleek-container">
            <h2 className="text-lg font-bold text-white mb-6">Unit Economics Analysis</h2>
            <div className="space-y-6">
               <div className="space-y-2">
                  <div className="flex justify-between text-xs mb-1">
                     <span className="text-slate-400 font-bold uppercase tracking-wider">LTV / CAC Ratio</span>
                     <span className="text-primary font-bold">29.1x</span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '85%' }}
                        className="h-full bg-primary"
                     />
                  </div>
                  <p className="text-[10px] text-slate-500 italic">Industry Benchmark: 3.0x</p>
               </div>

               <div className="space-y-2">
                  <div className="flex justify-between text-xs mb-1">
                     <span className="text-slate-400 font-bold uppercase tracking-wider">Payback Period</span>
                     <span className="text-secondary font-bold">1.2 Months</span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '40%' }}
                        className="h-full bg-secondary"
                     />
                  </div>
                  <p className="text-[10px] text-slate-500 italic">Industry Benchmark: 6-12 Months</p>
               </div>
            </div>
         </div>

         <div className="sleek-container bg-primary/5 border-primary/20 flex flex-col justify-center text-center p-12">
            <Award className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-2xl font-black text-white italic mb-4 uppercase tracking-widest">Growth Threshold Detected</h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto mb-8">
               Your unit economics are currently in the top 1% of the sector. Scaling activity is recommended for peak outcome.
            </p>
            <button className="gradient-button px-8 py-3 rounded-xl font-bold text-sm mx-auto">
               Generate Strategy Payload
            </button>
         </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
