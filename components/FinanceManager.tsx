import React, { useState, useRef, useEffect } from 'react';
import { Expense, ExpenseCategory, VatRate, Invoice, InvoiceItem } from '../types';
import { analyzeFinances, analyzeInvoiceImage } from '../services/geminiService';
import { Plus, FileText, PieChart as PieIcon, Download, Trash2, Sparkles, Camera, Upload, Calculator, Building, Bell, Share2, MessageCircle, Mail, Image as ImageIcon, Calendar, AlertTriangle, CheckCircle, XCircle, Scan } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const DEFAULT_EXPENSES: Expense[] = [
    { id: '1', description: 'Basmati Rice (25kg)', amount: 45.00, category: ExpenseCategory.INGREDIENTS, date: '2023-10-25', vatRate: 9, taxAmount: 3.71, invoiceImageUrl: 'https://via.placeholder.com/150' },
    { id: '2', description: 'Eco-friendly Containers', amount: 120.00, category: ExpenseCategory.PACKAGING, date: '2023-10-26', vatRate: 21, taxAmount: 20.82 },
];

const DEFAULT_INVOICES: Invoice[] = [
    { id: 'INV-001', clientName: 'Corporate Event A', items: [{description: 'Catering Service', amount: 450}], subtotal: 450, vatRate: 21, vatAmount: 94.50, total: 544.50, date: '2023-10-20', dueDate: '2023-11-20', status: 'Sent' }
];

const FinanceManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'invoices' | 'tax-report'>('overview');
  
  // Expense State with Persistence
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('kitchen_expenses');
    return saved ? JSON.parse(saved) : DEFAULT_EXPENSES;
  });

  // Invoice State with Persistence
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('kitchen_invoices');
    return saved ? JSON.parse(saved) : DEFAULT_INVOICES;
  });

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({ 
    description: '', 
    amount: 0, 
    category: ExpenseCategory.INGREDIENTS,
    vatRate: 9,
    date: new Date().toISOString().split('T')[0]
  });

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState<Partial<Invoice> & { items: InvoiceItem[] }>({
      clientName: '',
      items: [],
      vatRate: 9,
      date: new Date().toISOString().split('T')[0],
      dueDate: ''
  });
  const [currentInvoiceItem, setCurrentInvoiceItem] = useState({ description: '', amount: 0 });

  // Analysis State
  const [dateRange, setDateRange] = useState({ start: '2023-10-01', end: '2023-10-31' });
  const [monthlyRevenue, setMonthlyRevenue] = useState('3500');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [complianceVerified, setComplianceVerified] = useState(false);
  const [taxInfo, setTaxInfo] = useState({ quarter: '', deadline: '', reminderDate: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const invoiceScanInputRef = useRef<HTMLInputElement>(null);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('kitchen_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('kitchen_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    const now = new Date();
    const month = now.getMonth(); 
    const year = now.getFullYear();
    
    let qName = '';
    let deadlineStr = '';
    
    if (month < 3) { qName = 'Q1 (Jan-Mar)'; deadlineStr = `April 30, ${year}`; }
    else if (month < 6) { qName = 'Q2 (Apr-Jun)'; deadlineStr = `July 31, ${year}`; }
    else if (month < 9) { qName = 'Q3 (Jul-Sep)'; deadlineStr = `October 31, ${year}`; }
    else { qName = 'Q4 (Oct-Dec)'; deadlineStr = `January 31, ${year + 1}`; }
    setTaxInfo({ quarter: qName, deadline: deadlineStr, reminderDate: '' });
  }, []);

  // Helpers
  const filteredExpenses = expenses.filter(e => e.date >= dateRange.start && e.date <= dateRange.end);
  const totalExpenses = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
  
  const totalReclaimableVat = filteredExpenses.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
  const salesAmount = parseFloat(monthlyRevenue) || 0;
  const salesVat = salesAmount - (salesAmount / 1.09); 
  const netVatToPay = salesVat - totalReclaimableVat;

  const handleSaveExpense = () => {
    if (!newExpense.description || !newExpense.amount) return;
    
    const amount = Number(newExpense.amount);
    const rate = Number(newExpense.vatRate);
    const tax = amount - (amount / (1 + rate / 100));

    const expense: Expense = {
      id: Date.now().toString(),
      description: newExpense.description,
      amount: amount,
      category: newExpense.category as ExpenseCategory,
      date: newExpense.date || new Date().toISOString().split('T')[0],
      vatRate: rate,
      taxAmount: parseFloat(tax.toFixed(2))
    };
    setExpenses([expense, ...expenses]);
    setIsExpenseModalOpen(false);
    setNewExpense({ description: '', amount: 0, category: ExpenseCategory.INGREDIENTS, vatRate: 9, date: new Date().toISOString().split('T')[0] });
  };

  const deleteExpense = (id: string) => {
      if (window.confirm("Are you sure you want to PERMANENTLY delete this expense record?")) {
          setExpenses(prev => prev.filter(e => e.id !== id));
      }
  };

  const deleteInvoice = (id: string) => {
      if (window.confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) {
          setInvoices(prev => prev.filter(i => i.id !== id));
      }
  };

  const handleAddInvoiceItem = () => {
      if(!currentInvoiceItem.description || !currentInvoiceItem.amount) return;
      setNewInvoice({
          ...newInvoice,
          items: [...newInvoice.items, { ...currentInvoiceItem }]
      });
      setCurrentInvoiceItem({ description: '', amount: 0 });
  };

  const handleSaveInvoice = () => {
      if(!newInvoice.clientName || newInvoice.items.length === 0) return;
      
      const subtotal = newInvoice.items.reduce((sum, item) => sum + item.amount, 0);
      const vatAmt = subtotal * (newInvoice.vatRate! / 100);
      
      const invoice: Invoice = {
          id: `INV-${Math.floor(Math.random() * 1000)}`,
          clientName: newInvoice.clientName!,
          items: newInvoice.items,
          subtotal: subtotal,
          vatRate: newInvoice.vatRate!,
          vatAmount: parseFloat(vatAmt.toFixed(2)),
          total: subtotal + vatAmt,
          date: newInvoice.date!,
          dueDate: newInvoice.dueDate || newInvoice.date!,
          status: 'Draft'
      };
      
      setInvoices([invoice, ...invoices]);
      setIsInvoiceModalOpen(false);
      setNewInvoice({ clientName: '', items: [], vatRate: 9, date: new Date().toISOString().split('T')[0], dueDate: '' });
  };

  const handleAIAnalysis = async () => {
    setAnalyzing(true);
    const expenseString = filteredExpenses.map(e => `${e.description}: €${e.amount}`).join(', ');
    const result = await analyzeFinances(expenseString, `Revenue: €${monthlyRevenue}`);
    setAnalysis(result);
    setAnalyzing(false);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setScanning(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      const imageUrl = reader.result as string;
      const result = await analyzeInvoiceImage(base64String);
      
      if (result) {
        const amount = parseFloat(result.amount?.toString() || '0');
        const rate = result.vatRate || 21;
        const tax = amount - (amount / (1 + rate / 100));
        
        const expense: Expense = {
            id: Date.now().toString(),
            description: result.description || 'Scanned Receipt',
            amount: amount,
            category: (result.category as ExpenseCategory) || ExpenseCategory.OTHER,
            vatRate: rate,
            taxAmount: parseFloat(tax.toFixed(2)),
            date: new Date().toISOString().split('T')[0],
            invoiceImageUrl: imageUrl
        };
        setExpenses([expense, ...expenses]);
        alert("Receipt Scanned & Added to Expenses Successfully!");
      } else {
        alert("Could not scan receipt. Please enter manually.");
      }
      setScanning(false);
    };
    reader.readAsDataURL(file);
  };

  const chartData = Object.values(ExpenseCategory).map(cat => {
    const value = filteredExpenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
    return { name: cat, value };
  }).filter(d => d.value > 0);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#14b8a6'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Finance & Taxes</h2>
          <p className="text-gray-500">Manage expenses, analyze costs, and file compliant returns</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex overflow-x-auto">
        {[
            { id: 'overview', label: 'Overview', icon: PieIcon },
            { id: 'expenses', label: 'Expenses', icon: FileText },
            { id: 'invoices', label: 'Invoices', icon: Scan },
            { id: 'tax-report', label: 'Tax Report', icon: Building },
        ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-4 min-w-[100px] text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                activeTab === tab.id 
                  ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
          <div className="space-y-6">
               <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
                   <div className="flex items-center gap-2 text-sm text-gray-600">
                       <Calendar size={16} /> Filter Range:
                   </div>
                   <input 
                        type="date" 
                        value={dateRange.start} 
                        onChange={e => setDateRange({...dateRange, start: e.target.value})}
                        className="border border-gray-200 rounded px-2 py-1 text-sm"
                   />
                   <span className="text-gray-400">-</span>
                   <input 
                        type="date" 
                        value={dateRange.end} 
                        onChange={e => setDateRange({...dateRange, end: e.target.value})}
                        className="border border-gray-200 rounded px-2 py-1 text-sm"
                   />
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-800">Cost Breakdown</h3>
                            <button onClick={handleAIAnalysis} className="text-teal-600 flex items-center gap-1 text-xs font-medium">
                                {analyzing ? <Sparkles size={12} className="animate-spin"/> : <Sparkles size={12}/>} AI Audit
                            </button>
                        </div>
                        {analysis && (
                            <div className="bg-teal-50 p-3 rounded-lg mb-4 text-xs text-teal-800 border border-teal-100">
                                {analysis}
                            </div>
                        )}
                        <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                            <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4">Financial Summary</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                <span className="text-gray-500">Total Expenses</span>
                                <span className="font-bold text-lg text-gray-900">€{totalExpenses.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                <span className="text-gray-500">VAT Reclaimable (Input)</span>
                                <span className="font-bold text-lg text-green-600">€{totalReclaimableVat.toFixed(2)}</span>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg mt-4">
                                <p className="text-xs text-blue-800 font-medium mb-1">Profit Margin (Estimate)</p>
                                <p className="text-2xl font-bold text-blue-900">
                                    €{(salesAmount - salesVat - (totalExpenses - totalReclaimableVat)).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
               </div>
          </div>
      )}

      {/* INVOICES TAB (Outgoing & Receipts) */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
             <div className="flex justify-between items-center gap-3">
                <h3 className="font-bold text-gray-800 hidden md:block">Client Invoices (Outgoing)</h3>
                <div className="flex gap-2 w-full md:w-auto">
                    {/* Add Camera Button Here */}
                    <button 
                        onClick={() => invoiceScanInputRef.current?.click()} 
                        className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold shadow-md shadow-indigo-200 transition-colors"
                    >
                         <input 
                            type="file" 
                            ref={invoiceScanInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            capture="environment"
                            onChange={handleFileChange} 
                         />
                        <Camera size={16} /> Scan Bill
                    </button>
                    <button onClick={() => setIsInvoiceModalOpen(true)} className="flex-1 md:flex-none bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold shadow-md shadow-teal-200 transition-colors">
                        <Plus size={16} /> Create Invoice
                    </button>
                </div>
             </div>
             
             {/* Outgoing Invoice List */}
             {invoices.length === 0 ? (
                 <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                     No outgoing invoices. Create one to get paid.
                 </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {invoices.map(inv => (
                        <div key={inv.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative group">
                            <button 
                                onClick={() => deleteInvoice(inv.id)} 
                                className="absolute top-4 right-4 text-gray-300 hover:text-red-600 transition-colors p-2 bg-gray-50 rounded-full hover:bg-red-50 z-10"
                                title="Delete Invoice"
                            >
                                <Trash2 size={16} />
                            </button>
                            <div className="flex justify-between items-start mb-2 pr-6">
                                <div>
                                    <div className="font-bold text-gray-900">{inv.clientName}</div>
                                    <div className="text-xs text-gray-500">{inv.id} • Due {inv.dueDate}</div>
                                </div>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">{inv.status}</span>
                            </div>
                            <div className="my-3 space-y-1">
                                {inv.items.map((item, i) => (
                                    <div key={i} className="flex justify-between text-xs text-gray-600">
                                        <span>{item.description}</span>
                                        <span>€{item.amount.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-xs text-gray-500">Total (Inc VAT)</span>
                                <span className="font-bold text-teal-700">€{inv.total.toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                </div>
             )}

             <h3 className="font-bold text-gray-800 mt-8">Received Invoices & Receipts (Expenses)</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {expenses.filter(e => e.invoiceImageUrl).length === 0 && (
                     <div className="col-span-2 text-sm text-gray-400 italic">No scanned receipts yet. Click 'Scan Bill' above.</div>
                 )}
                 {expenses.filter(e => e.invoiceImageUrl).map(exp => (
                     <div key={exp.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group">
                        <button 
                            onClick={() => deleteExpense(exp.id)} 
                            className="absolute top-2 right-2 z-10 bg-white/90 p-1.5 rounded-full text-gray-500 hover:text-red-600 shadow-sm border border-gray-100"
                            title="Delete Receipt"
                        >
                            <Trash2 size={14} />
                        </button>
                        <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-2 overflow-hidden relative cursor-pointer">
                            <img src={exp.invoiceImageUrl} alt="Invoice" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Download size={20} />
                            </div>
                        </div>
                        <div className="truncate">
                             <p className="text-xs font-bold text-gray-800 truncate">{exp.description}</p>
                             <p className="text-[10px] text-gray-500">{exp.date}</p>
                        </div>
                     </div>
                 ))}
             </div>
        </div>
      )}

      {/* EXPENSES TAB */}
      {activeTab === 'expenses' && (
            <div className="space-y-6">
              <div className="flex gap-4">
                   {/* Add Expense Button */}
                   <button 
                     onClick={() => setIsExpenseModalOpen(true)}
                     className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-dashed border-teal-300 flex items-center justify-center gap-3 hover:bg-teal-50 transition-colors"
                   >
                      <div className="bg-teal-100 p-3 rounded-full text-teal-600">
                          <Plus size={24} />
                      </div>
                      <div className="text-left">
                          <h4 className="font-bold text-gray-800">Add Manual Expense</h4>
                          <p className="text-xs text-gray-500">Enter details, tax, and supplier</p>
                      </div>
                   </button>

                   {/* Upload Button */}
                  <div className="bg-teal-50 border border-teal-100 p-6 rounded-xl flex flex-col items-center justify-center text-center w-1/3 cursor-pointer hover:bg-teal-100 transition-colors" onClick={() => fileInputRef.current?.click()}>
                       <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                       <Camera size={32} className="text-teal-600 mb-2" />
                       <h4 className="font-bold text-teal-900 text-sm">Upload Receipt</h4>
                       <p className="text-[10px] text-teal-700 mt-1">AI Auto-Scan</p>
                  </div>
              </div>

              {/* Expenses Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-6 py-3 font-medium">Date</th>
                      <th className="px-6 py-3 font-medium">Description</th>
                      <th className="px-6 py-3 font-medium">Category</th>
                      <th className="px-6 py-3 font-medium text-right">VAT %</th>
                      <th className="px-6 py-3 font-medium text-right">Amount</th>
                      <th className="px-6 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {expenses.length === 0 ? (
                        <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-400">No expenses recorded.</td></tr>
                    ) : expenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-gray-500">{expense.date}</td>
                        <td className="px-6 py-3 font-medium text-gray-900 flex items-center gap-2">
                            {expense.invoiceImageUrl && <ImageIcon size={14} className="text-teal-500" />}
                            {expense.description}
                        </td>
                        <td className="px-6 py-3">
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{expense.category}</span>
                        </td>
                        <td className="px-6 py-3 text-right text-gray-500">{expense.vatRate}%</td>
                        <td className="px-6 py-3 text-right font-medium text-gray-900">€{expense.amount.toFixed(2)}</td>
                        <td className="px-6 py-3 text-right">
                          <button 
                            onClick={() => deleteExpense(expense.id)} 
                            className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                            title="Delete Expense"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
      )}

      {/* TAX REPORT TAB */}
      {activeTab === 'tax-report' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="text-orange-600 mt-1" size={20} />
                <div>
                  <h4 className="font-bold text-orange-900">Quarterly Deadline: {taxInfo.quarter}</h4>
                  <p className="text-sm text-orange-800 mt-1">Submit by {taxInfo.deadline}. Ensure all expenses are categorized correctly.</p>
                </div>
             </div>

             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calculator size={20} className="text-teal-600"/> BTW Calculation
                </h3>
                <div className="space-y-4">
                   <div className="flex justify-between p-3 bg-gray-50 rounded">
                      <span className="text-gray-600">Sales (Ex VAT estimate)</span>
                      <span className="font-bold">€{(salesAmount / 1.09).toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between p-3 bg-white border border-gray-100 rounded">
                      <span className="text-gray-600">VAT Output (To Pay)</span>
                      <span className="font-bold text-red-600">+ €{salesVat.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between p-3 bg-white border border-gray-100 rounded">
                      <span className="text-gray-600">VAT Input (To Reclaim)</span>
                      <span className="font-bold text-green-600">- €{totalReclaimableVat.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between p-4 bg-gray-900 text-white rounded-lg mt-2">
                      <span className="font-bold">Net VAT Position</span>
                      <span className="font-bold text-xl">€{Math.abs(netVatToPay).toFixed(2)} {netVatToPay > 0 ? 'Pay' : 'Refund'}</span>
                   </div>
                </div>
             </div>
             
             {/* Compliance Verification */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                 <h3 className="font-bold text-gray-800 mb-3">Verification</h3>
                 <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" checked={complianceVerified} onChange={e => setComplianceVerified(e.target.checked)} className="mt-1 w-5 h-5 text-teal-600 rounded" />
                    <div>
                        <p className="text-sm font-bold text-gray-800">I verify this data is accurate.</p>
                        <p className="text-xs text-gray-500 mt-1">
                            By checking this, you confirm that all invoices are valid and comply with Dutch Tax Administration (Belastingdienst) regulations.
                        </p>
                    </div>
                 </label>
             </div>
          </div>

          <div className="space-y-6">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 opacity-100">
                <button 
                    disabled={!complianceVerified}
                    className="w-full bg-teal-600 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                    <Share2 size={18} /> Submit Report
                </button>
                <p className="text-xs text-center text-gray-400 mt-2">verify above to enable submission</p>
             </div>
          </div>
        </div>
      )}

      {/* ADD EXPENSE MODAL */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Add New Expense</h3>
                    <button onClick={() => setIsExpenseModalOpen(false)}><XCircle className="text-gray-400" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Description / Supplier</label>
                        <input type="text" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. Albert Heijn, Sligro" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Total Amount (€)</label>
                            <input type="number" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: parseFloat(e.target.value)})} className="w-full border rounded-lg px-3 py-2" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">VAT Rate</label>
                            <select value={newExpense.vatRate} onChange={e => setNewExpense({...newExpense, vatRate: parseInt(e.target.value)})} className="w-full border rounded-lg px-3 py-2 bg-white">
                                <option value={9}>9% (Food/Water)</option>
                                <option value={21}>21% (Services/Goods)</option>
                                <option value={0}>0% (Exempt)</option>
                            </select>
                        </div>
                    </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                        <select value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value as ExpenseCategory})} className="w-full border rounded-lg px-3 py-2 bg-white">
                            {Object.values(ExpenseCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Date</label>
                        <input type="date" value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                    </div>
                    <button onClick={handleSaveExpense} className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 mt-2">
                        Save Expense
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* CREATE INVOICE MODAL */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Create Outgoing Invoice</h3>
                    <button onClick={() => setIsInvoiceModalOpen(false)}><XCircle className="text-gray-400" /></button>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Client Name</label>
                            <input type="text" value={newInvoice.clientName} onChange={e => setNewInvoice({...newInvoice, clientName: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="Client or Company" />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-700 mb-1">Due Date</label>
                            <input type="date" value={newInvoice.dueDate} onChange={e => setNewInvoice({...newInvoice, dueDate: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                        </div>
                    </div>
                    
                    {/* Line Items */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <h4 className="text-xs font-bold text-gray-600 mb-2">Line Items</h4>
                        {newInvoice.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm mb-1 bg-white p-2 rounded border border-gray-200">
                                <span>{item.description}</span>
                                <span>€{item.amount}</span>
                            </div>
                        ))}
                        <div className="flex gap-2 mt-3">
                             <input 
                                type="text" 
                                placeholder="Description" 
                                className="flex-[2] border rounded px-2 py-1 text-sm"
                                value={currentInvoiceItem.description}
                                onChange={e => setCurrentInvoiceItem({...currentInvoiceItem, description: e.target.value})}
                             />
                             <input 
                                type="number" 
                                placeholder="Amount" 
                                className="flex-1 border rounded px-2 py-1 text-sm"
                                value={currentInvoiceItem.amount}
                                onChange={e => setCurrentInvoiceItem({...currentInvoiceItem, amount: parseFloat(e.target.value)})}
                             />
                             <button onClick={handleAddInvoiceItem} className="bg-gray-800 text-white px-3 py-1 rounded text-sm"><Plus size={16}/></button>
                        </div>
                    </div>

                     <div className="flex items-center justify-between bg-teal-50 p-3 rounded-lg">
                         <span className="text-sm font-bold text-teal-900">Total (Est.)</span>
                         <span className="font-bold text-teal-900">
                             €{(newInvoice.items.reduce((a,b)=>a+b.amount,0) * (1 + (newInvoice.vatRate||9)/100)).toFixed(2)}
                         </span>
                     </div>

                    <button onClick={handleSaveInvoice} className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700">
                        Generate Invoice
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default FinanceManager;