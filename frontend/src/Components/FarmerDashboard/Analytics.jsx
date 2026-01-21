import React, { useEffect, useState } from 'react';
import { BarChart2, TrendingUp, DollarSign, Package, ShoppingBag, PieChart, LineChart, ArrowUpRight, Users } from 'lucide-react';
import { LineChart as RLineChart, Line, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, CartesianGrid, BarChart as RBarChart, Bar, PieChart as RPieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#10b981', '#06b6d4', '#f59e42', '#6366f1', '#f43f5e', '#fbbf24', '#a3e635', '#f472b6'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:8000/api/farmer-analytics/', {
          headers: token ? { 'Authorization': 'Token ' + token } : {},
        });
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message || 'Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [token]);

  if (loading) return <div className="text-center text-gray-500 animate-pulse mt-16">Loading analytics...</div>;
  if (error) return <div className="text-center text-rose-500 animate-fade-in-up mt-16">{error}</div>;
  if (!data) return null;

  // Stats cards
  const stats = [
    { label: 'Total Orders', value: data.total_orders, icon: <ShoppingBag className="w-6 h-6 text-yellow-500" /> },
    { label: 'Total Quantity Sold', value: data.total_sales_quantity, icon: <TrendingUp className="w-6 h-6 text-emerald-500" /> },
    { label: 'Revenue', value: `रु${Number(data.total_revenue).toLocaleString()}`, icon: <DollarSign className="w-6 h-6 text-blue-500" /> },
    { label: 'Best Seller', value: data.best_seller || 'N/A', icon: <Package className="w-6 h-6 text-emerald-500" /> },
    { label: 'Active Listings', value: data.active_listings, icon: <Package className="w-6 h-6 text-emerald-500" /> },
    { label: 'Customers', value: data.customer_count, icon: <Users className="w-6 h-6 text-emerald-500" /> },
  ];

  // Chart data
  const salesOverTime = data.sales_over_time || [];
  const bestSellingProducts = data.best_selling_products?.map((item, i) => ({
    name: item['product__name'],
    quantity: item.qty,
    fill: COLORS[i % COLORS.length],
  })) || [];
  const revenueByCategory = data.revenue_by_category?.map((item, i) => ({
    name: item['product__category'] || 'Other',
    value: Number(item.revenue),
    fill: COLORS[i % COLORS.length],
  })) || [];
  const growth = data.growth_metrics || {};

  return (
    <div className="animate-fade-in-up mt-[2rem]">
      <h1 className="text-2xl md:text-3xl font-bold text-emerald-800 dark:text-emerald-300 drop-shadow mb-8">Analytics</h1>
      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-lg border border-emerald-100 dark:border-gray-600 p-6 flex flex-col items-center text-center hover:shadow-emerald-200 dark:hover:shadow-gray-700 transition-all animate-fade-in-up">
            <div className="mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{stat.value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
        {/* Sales Over Time Chart */}
        <section className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl border border-emerald-100 dark:border-gray-600 p-6 animate-fade-in-up flex flex-col items-center mb-2">
          <div className="flex items-center gap-2 mb-4">
            <LineChart className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">Sales Over Time</h2>
          </div>
          <div className="w-full h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <RLineChart data={salesOverTime} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} tick={{ fill: '#059669' }} />
                <YAxis fontSize={12} tick={{ fill: '#059669' }} allowDecimals={false} />
                <RTooltip />
                <Line type="monotone" dataKey="quantity" stroke="#10b981" strokeWidth={3} dot={false} />
              </RLineChart>
            </ResponsiveContainer>
          </div>
        </section>
        {/* Best Selling Products Chart */}
        <section className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl border border-emerald-100 dark:border-gray-600 p-6 animate-fade-in-up flex flex-col items-center mb-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">Best Selling Products</h2>
          </div>
          <div className="w-full h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <RBarChart data={bestSellingProducts} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} tick={{ fill: '#059669' }} />
                <YAxis fontSize={12} tick={{ fill: '#059669' }} allowDecimals={false} />
                <RTooltip />
                <Bar dataKey="quantity">
                  {bestSellingProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </RBarChart>
            </ResponsiveContainer>
          </div>
        </section>
        {/* Revenue by Category Chart */}
        <section className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl border border-emerald-100 dark:border-gray-600 p-6 animate-fade-in-up flex flex-col items-center mb-2">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">Revenue by Category</h2>
          </div>
          <div className="w-full h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <RPieChart>
                <Pie data={revenueByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                  {revenueByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend />
                <RTooltip />
              </RPieChart>
            </ResponsiveContainer>
          </div>
        </section>
        {/* Growth Metrics Chart */}
        <section className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl border border-emerald-100 dark:border-gray-600 p-6 animate-fade-in-up flex flex-col items-center mb-2">
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpRight className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">Growth Metrics</h2>
          </div>
          <div className="w-full h-48 flex flex-col items-center justify-center gap-2">
            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">Sales (last 30d):</span>
                <span>{growth.sales_last_30}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">Sales (prev 30d):</span>
                <span>{growth.sales_prev_30}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">Sales Growth:</span>
                <span className={growth.sales_growth > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  {growth.sales_growth !== null ? `${growth.sales_growth.toFixed(1)}%` : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">Revenue (last 30d):</span>
                <span>रु{Number(growth.revenue_last_30).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">Revenue (prev 30d):</span>
                <span>रु{Number(growth.revenue_prev_30).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">Revenue Growth:</span>
                <span className={growth.revenue_growth > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  {growth.revenue_growth !== null ? `${growth.revenue_growth.toFixed(1)}%` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 