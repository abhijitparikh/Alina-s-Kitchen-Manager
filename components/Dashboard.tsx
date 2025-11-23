import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { TrendingUp, Users, ShoppingBag, AlertCircle } from 'lucide-react';
import { Order, Expense } from '../types';

const COLORS = ['#14b8a6', '#f59e0b', '#0f766e']; // Teal 500, Spice 500, Teal 700

const StatCard: React.FC<{ title: string; value: string; trend: string; icon: React.ElementType; color: string }> = ({ title, value, trend, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
      </div>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      <span className="text-green-500 font-medium flex items-center">
        <TrendingUp size={14} className="mr-1" />
        {trend}
      </span>
      <span className="text-gray-400 ml-2">vs last month</span>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    activeOrders: 0,
    subscriptionCount: 0
  });

  const [graphData, setGraphData] = useState<any[]>([]);

  useEffect(() => {
    // Load real data from storage
    const storedOrders = localStorage.getItem('kitchen_orders');
    const orders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];
    
    const storedExpenses = localStorage.getItem('kitchen_expenses');
    const expenses: Expense[] = storedExpenses ? JSON.parse(storedExpenses) : [];

    const totalRev = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalExp = expenses.reduce((sum, e) => sum + e.amount, 0);
    const active = orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length;
    const subs = orders.filter(o => o.isSubscription).length;

    setStats({
      totalRevenue: totalRev,
      totalExpenses: totalExp,
      activeOrders: active,
      subscriptionCount: subs
    });

    // Mock Graph Data (static for visual structure, but could be dynamic)
    setGraphData([
      { name: 'Mon', sales: totalRev * 0.1, expenses: totalExp * 0.2 },
      { name: 'Tue', sales: totalRev * 0.15, expenses: totalExp * 0.1 },
      { name: 'Wed', sales: totalRev * 0.2, expenses: totalExp * 0.4 }, 
      { name: 'Thu', sales: totalRev * 0.15, expenses: totalExp * 0.1 },
      { name: 'Fri', sales: totalRev * 0.25, expenses: totalExp * 0.1 },
      { name: 'Sat', sales: totalRev * 0.1, expenses: totalExp * 0.05 },
      { name: 'Sun', sales: totalRev * 0.05, expenses: totalExp * 0.05 },
    ]);

  }, []);

  const categoryData = [
    { name: 'Subscription (Tiffin)', value: 60 },
    { name: 'A La Carte', value: 30 },
    { name: 'Catering', value: 10 },
  ];

  const netProfit = stats.totalRevenue - stats.totalExpenses;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-gray-500">Overview of your Cloud Kitchen performance</p>
        </div>
        <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Download Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`€${stats.totalRevenue.toFixed(2)}`} trend="+12.5%" icon={ShoppingBag} color="bg-teal-500" />
        <StatCard title="Total Expenses" value={`€${stats.totalExpenses.toFixed(2)}`} trend="+5%" icon={AlertCircle} color="bg-gray-500" />
        <StatCard title="Net Profit" value={`€${netProfit.toFixed(2)}`} trend={netProfit > 0 ? "+8.1%" : "-2%"} icon={TrendingUp} color={netProfit >= 0 ? "bg-green-500" : "bg-red-500"} />
        <StatCard title="Active Orders" value={stats.activeOrders.toString()} trend="-2.5%" icon={AlertCircle} color="bg-spice-500" />
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue vs Expenses (Weekly Est.)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={graphData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} unit="€" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
                <Bar dataKey="sales" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Sales" />
                <Bar dataKey="expenses" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue Source</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;