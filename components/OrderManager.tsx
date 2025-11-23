import React, { useState, useEffect, useRef } from 'react';
import { Order, OrderStatus, OrderSource, OrderItem, VatRate } from '../types';
import { CheckCircle, Clock, XCircle, Truck, Plus, Phone, MessageCircle, Globe, Camera, Image as ImageIcon, FileText, Users, HelpCircle, Trash2 } from 'lucide-react';

const HOME_COOKED_OPTIONS = ['Dal Tadka', 'Jeera Rice', 'Roti', 'Aloo Gobi', 'Bhindi Masala', 'Rajma', 'Chawal'];
const RESTAURANT_OPTIONS = ['Butter Chicken', 'Paneer Tikka Masala', 'Chicken Biryani', 'Lamb Rogan Josh', 'Garlic Naan', 'Samosa'];

const DEFAULT_ORDERS: Order[] = [
    { 
      id: '101', 
      customerName: 'Anjali Gupta', 
      items: [{name: 'Butter Chicken', quantity: 1, type: 'Restaurant'}, {name: 'Naan', quantity: 2, type: 'Restaurant'}], 
      totalAmount: 24.50, 
      status: OrderStatus.PREPARING, 
      source: OrderSource.KOOKXTRA, 
      date: 'Today, 10:30', 
      isSubscription: false,
      isBulk: false,
      vatRate: 9
    },
    { 
      id: '102', 
      customerName: 'Mark de Vries', 
      items: [{name: 'Veg Thali', quantity: 1, type: 'Home Cooked'}], 
      totalAmount: 12.00, 
      status: OrderStatus.PENDING, 
      source: OrderSource.WEBSITE, 
      date: 'Today, 11:00', 
      isSubscription: true,
      isBulk: false,
      vatRate: 9
    },
    { 
        id: '103', 
        customerName: 'Corporate Event', 
        items: [{name: 'Samosa', quantity: 50, type: 'Restaurant'}, {name: 'Chai', quantity: 50, type: 'Drink'}], 
        totalAmount: 150.00, 
        status: OrderStatus.DELIVERED, 
        source: OrderSource.CALL, 
        date: 'Yesterday', 
        isSubscription: false,
        isBulk: true,
        vatRate: 9
      },
];

const OrderManager: React.FC = () => {
  // Initialize from localStorage or defaults
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('kitchen_orders');
    return saved ? JSON.parse(saved) : DEFAULT_ORDERS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<{name: string, quantity: number, type: 'Home Cooked' | 'Restaurant'}>({name: HOME_COOKED_OPTIONS[0], quantity: 1, type: 'Home Cooked'});
  
  const [newOrder, setNewOrder] = useState<Partial<Order> & { items: OrderItem[] }>({
    customerName: '',
    items: [],
    totalAmount: 0,
    source: OrderSource.CALL,
    isSubscription: false,
    isBulk: false,
    platformFee: 0,
    vatRate: 9,
    attachmentUrl: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persist changes to localStorage
  useEffect(() => {
    localStorage.setItem('kitchen_orders', JSON.stringify(orders));
  }, [orders]);

  const updateStatus = (id: string, newStatus: OrderStatus) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const deleteOrder = (id: string) => {
    if (window.confirm("Are you sure you want to PERMANENTLY delete this order?")) {
        setOrders(prev => prev.filter(o => o.id !== id));
    }
  };

  const handleAddItem = () => {
    setNewOrder({
        ...newOrder,
        items: [...newOrder.items, { name: newItem.name, quantity: newItem.quantity, type: newItem.type }]
    });
  };

  const handleAddOrder = () => {
    if (!newOrder.customerName || !newOrder.totalAmount) return;
    
    const order: Order = {
      id: (Math.floor(Math.random() * 900) + 100).toString(),
      customerName: newOrder.customerName!,
      items: newOrder.items,
      totalAmount: Number(newOrder.totalAmount),
      status: OrderStatus.PENDING,
      source: newOrder.source!,
      date: new Date().toLocaleString('en-NL', { weekday: 'short', hour: '2-digit', minute: '2-digit' }),
      isSubscription: newOrder.isSubscription || false,
      isBulk: newOrder.isBulk || false,
      platformFee: newOrder.platformFee,
      vatRate: newOrder.vatRate,
      attachmentUrl: newOrder.attachmentUrl
    };

    setOrders([order, ...orders]);
    setIsModalOpen(false);
    // Reset
    setNewOrder({ customerName: '', items: [], totalAmount: 0, source: OrderSource.CALL, isSubscription: false, isBulk: false, platformFee: 0, vatRate: 9, attachmentUrl: '' });
  };

  const handleGenerateInvoice = (order: Order) => {
      alert(`Generating Invoice for ${order.customerName}...\n\nTotal: €${order.totalAmount}\nVAT (${order.vatRate}%): €${(order.totalAmount - (order.totalAmount / (1 + (order.vatRate || 0)/100))).toFixed(2)}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
         const reader = new FileReader();
         reader.onloadend = () => {
             setNewOrder(prev => ({...prev, attachmentUrl: reader.result as string}));
         };
         reader.readAsDataURL(file);
     }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-700';
      case OrderStatus.PREPARING: return 'bg-blue-100 text-blue-700';
      case OrderStatus.DELIVERED: return 'bg-green-100 text-green-700';
      case OrderStatus.CANCELLED: return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Orders & Kitchen</h2>
          <p className="text-gray-500">Manage Kookxtra, Uber Eats, Bulk & Direct Orders</p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm shadow-teal-200">
             <Plus size={16} /> Add Order
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-medium text-gray-500">ID & Source</th>
              <th className="px-6 py-4 font-medium text-gray-500">Customer</th>
              <th className="px-6 py-4 font-medium text-gray-500">Items</th>
              <th className="px-6 py-4 font-medium text-gray-500">Type</th>
              <th className="px-6 py-4 font-medium text-gray-500">Amount</th>
              <th className="px-6 py-4 font-medium text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
                <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No orders found. Add a new order to get started.
                    </td>
                </tr>
            ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-gray-900 font-medium">#{order.id}</span>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 border border-gray-200">{order.source}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{order.date}</div>
                    {order.platformFee && order.platformFee > 0 ? (
                         <div className="text-[10px] text-orange-600 mt-1">Fee: €{order.platformFee}</div>
                    ) : null}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{order.customerName}</div>
                    <div className="flex gap-1 mt-1">
                        {order.isSubscription && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] rounded-full">Sub</span>}
                        {order.isBulk && <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] rounded-full">Bulk</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    €{order.totalAmount.toFixed(2)}
                    <div className="text-[10px] text-gray-400 font-normal">Inc. {order.vatRate}% VAT</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                        <button 
                            onClick={() => deleteOrder(order.id)} 
                            className="text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 p-2 rounded-lg transition-colors" 
                            title="Delete Order"
                        >
                            <Trash2 size={16} />
                        </button>
                        {(order.source === OrderSource.CALL || order.source === OrderSource.WHATSAPP || order.source === OrderSource.OTHER) && (
                            <button onClick={() => handleGenerateInvoice(order)} className="text-gray-400 hover:text-teal-600 bg-gray-50 hover:bg-teal-50 p-2 rounded-lg" title="Generate Invoice">
                                <FileText size={16} />
                            </button>
                        )}
                        {order.status === OrderStatus.PENDING && (
                          <button onClick={() => updateStatus(order.id, OrderStatus.PREPARING)} className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium">
                            Cook
                          </button>
                        )}
                         {order.status === OrderStatus.PREPARING && (
                          <button onClick={() => updateStatus(order.id, OrderStatus.DELIVERED)} className="text-xs bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1.5 rounded-lg font-medium">
                            Done
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Add Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h3 className="text-lg font-bold text-gray-800">Create New Order</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Source & Customer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Order Source</label>
                    <select 
                        value={newOrder.source}
                        onChange={(e) => setNewOrder({...newOrder, source: e.target.value as OrderSource})}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-teal-500 outline-none"
                    >
                        {Object.values(OrderSource).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {newOrder.source === OrderSource.OTHER && (
                        <div className="mt-2">
                            <label className="block text-[10px] font-bold text-gray-500 mb-1">Platform Charge (€)</label>
                            <input 
                                type="number" 
                                value={newOrder.platformFee}
                                onChange={(e) => setNewOrder({...newOrder, platformFee: parseFloat(e.target.value)})}
                                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                                placeholder="0.00"
                            />
                        </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Customer Name</label>
                    <input 
                        type="text" 
                        value={newOrder.customerName}
                        onChange={(e) => setNewOrder({...newOrder, customerName: e.target.value})}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-teal-500 outline-none"
                        placeholder="e.g. Jan Smit or Company Name"
                    />
                    <div className="flex gap-4 mt-2">
                         <label className="flex items-center gap-2 text-xs cursor-pointer text-gray-600">
                            <input 
                                type="checkbox" 
                                checked={newOrder.isBulk} 
                                onChange={e => setNewOrder({...newOrder, isBulk: e.target.checked})}
                                className="text-teal-600 rounded focus:ring-teal-500"
                            />
                            <Users size={14} className="text-indigo-500"/> Bulk Order
                         </label>
                         <label className="flex items-center gap-2 text-xs cursor-pointer text-gray-600">
                            <input 
                                type="checkbox" 
                                checked={newOrder.isSubscription} 
                                onChange={e => setNewOrder({...newOrder, isSubscription: e.target.checked})}
                                className="text-teal-600 rounded focus:ring-teal-500"
                            />
                            Subscription
                         </label>
                    </div>
                  </div>
              </div>

              {/* Item Selector */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">Add Items</h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                      <div className="flex-1 min-w-[120px]">
                          <select 
                            value={newItem.type}
                            onChange={(e) => setNewItem({...newItem, type: e.target.value as any, name: e.target.value === 'Home Cooked' ? HOME_COOKED_OPTIONS[0] : RESTAURANT_OPTIONS[0]})}
                            className="w-full border border-gray-200 rounded px-2 py-2 text-sm"
                          >
                              <option value="Home Cooked">Home Cooked</option>
                              <option value="Restaurant">Restaurant Style</option>
                          </select>
                      </div>
                      <div className="flex-[2] min-w-[150px]">
                          <select 
                             value={newItem.name}
                             onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                             className="w-full border border-gray-200 rounded px-2 py-2 text-sm"
                          >
                              {(newItem.type === 'Home Cooked' ? HOME_COOKED_OPTIONS : RESTAURANT_OPTIONS).map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                              ))}
                          </select>
                      </div>
                      <div className="w-20">
                          <input 
                             type="number" 
                             value={newItem.quantity}
                             onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                             className="w-full border border-gray-200 rounded px-2 py-2 text-sm"
                             min="1"
                          />
                      </div>
                      <button onClick={handleAddItem} className="bg-teal-600 text-white rounded px-3 hover:bg-teal-700 transition-colors">
                          <Plus size={18} />
                      </button>
                  </div>
                  
                  {/* Selected Items List */}
                  {newOrder.items.length > 0 && (
                      <div className="space-y-1 mt-2">
                          {newOrder.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-xs bg-white p-2 rounded border border-gray-200">
                                  <span>{item.quantity}x {item.name} <span className="text-gray-400 ml-1">({item.type})</span></span>
                                  <button onClick={() => setNewOrder({...newOrder, items: newOrder.items.filter((_, i) => i !== idx)})} className="text-red-500 hover:text-red-700">Remove</button>
                              </div>
                          ))}
                      </div>
                  )}
              </div>

              {/* Financials */}
              <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Total Amount (€)</label>
                    <input 
                      type="number" 
                      value={newOrder.totalAmount}
                      onChange={(e) => setNewOrder({...newOrder, totalAmount: parseFloat(e.target.value)})}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-teal-500 outline-none font-bold"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                        VAT Rate <span title="9% for Food/Water, 21% for Alcohol/Service"><HelpCircle size={12} className="text-gray-400" /></span>
                    </label>
                    <select
                       value={newOrder.vatRate}
                       onChange={(e) => setNewOrder({...newOrder, vatRate: parseFloat(e.target.value)})}
                       className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-teal-500 outline-none bg-white"
                    >
                        <option value={9}>9% (Food / Water)</option>
                        <option value={21}>21% (Alcohol / Service)</option>
                        <option value={0}>0% (Exempt)</option>
                    </select>
                  </div>
              </div>

              {/* Attachment */}
              <div className="flex items-center gap-2 border-t border-gray-100 pt-4">
                    <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileUpload}
                    />
                    <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-gray-500 hover:text-teal-600 text-sm flex items-center gap-2"
                    >
                        <Camera size={18} /> {newOrder.attachmentUrl ? 'Change Ticket Photo' : 'Scan/Upload Ticket'}
                    </button>
                    {newOrder.attachmentUrl && <span className="text-xs text-green-600 font-medium">Attached</span>}
              </div>

              <button 
                onClick={handleAddOrder}
                className="w-full bg-teal-800 text-white py-3 rounded-xl font-bold hover:bg-teal-900 transition-colors"
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManager;