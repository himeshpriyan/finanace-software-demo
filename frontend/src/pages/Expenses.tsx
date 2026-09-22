import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  PieChart as PieIcon, 
  Building,
  Zap,
  Briefcase,
  Truck,
  Wrench,
  Wifi,
  Package,
  Megaphone,
  MoreHorizontal
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import api from '../utils/api';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';

interface ExpenseItem {
  id: number;
  date: string;
  category: string;
  description: string;
  amount: number;
  payment_method: string;
  reference_no: string;
  notes: string;
}

interface ExpenseSummary {
  todayExpenses: number;
  monthExpenses: number;
  totalExpenses: number;
  highestCategory: string;
  highestCatAmount: number;
  categoryData: Array<{ name: string; value: number; amount: number }>;
}

const EXPENSE_CATEGORIES = [
  'Rent',
  'Electricity',
  'Salary',
  'Transport',
  'Maintenance',
  'Internet',
  'Office Supplies',
  'Marketing',
  'Other'
];

const CATEGORY_COLORS: Record<string, string> = {
  Rent: '#6366f1',
  Electricity: '#f59e0b',
  Salary: '#10b981',
  Transport: '#06b6d4',
  Maintenance: '#8b5cf6',
  Internet: '#3b82f6',
  'Office Supplies': '#ec4899',
  Marketing: '#f43f5e',
  Other: '#71717a'
};

const Expenses: React.FC = () => {
  const { showToast } = useToast();

  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseItem | null>(null);

  // Form State
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formCategory, setFormCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState('UPI');
  const [formRefNo, setFormRefNo] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadExpenseData();
  }, []);

  const loadExpenseData = async () => {
    setLoading(true);
    try {
      const [listRes, sumRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/expenses/summary')
      ]);
      setExpenses(listRes.data);
      setSummary(sumRes.data);
    } catch (err) {
      console.error(err);
      showToast('Error loading expense records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatCur = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  const openAddModal = () => {
    setEditingExpense(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormCategory('Office Supplies');
    setFormDescription('');
    setFormAmount('');
    setFormPaymentMethod('UPI');
    setFormRefNo(`EXP-${Date.now().toString().slice(-4)}`);
    setFormNotes('');
    setErrors({});
    setIsExpenseModalOpen(true);
  };

  const openEditModal = (exp: ExpenseItem) => {
    setEditingExpense(exp);
    setFormDate(exp.date);
    setFormCategory(exp.category);
    setFormDescription(exp.description);
    setFormAmount(exp.amount.toString());
    setFormPaymentMethod(exp.payment_method);
    setFormRefNo(exp.reference_no);
    setFormNotes(exp.notes);
    setErrors({});
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = async () => {
    const errs: Record<string, string> = {};
    if (!formDescription.trim()) errs.description = 'Description is required';
    if (!formAmount || Number(formAmount) <= 0) errs.amount = 'Valid amount greater than 0 required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const payload = {
      date: formDate,
      category: formCategory,
      description: formDescription.trim(),
      amount: Number(formAmount),
      payment_method: formPaymentMethod,
      reference_no: formRefNo || `EXP-${Date.now().toString().slice(-4)}`,
      notes: formNotes.trim()
    };

    try {
      if (editingExpense) {
        await api.put(`/expenses/${editingExpense.id}`, payload);
        showToast('Expense updated successfully!', 'success');
      } else {
        await api.post('/expenses', payload);
        showToast(`Expense of ${formatCur(payload.amount)} recorded!`, 'success');
      }
      setIsExpenseModalOpen(false);
      loadExpenseData();
    } catch (err) {
      console.error(err);
      showToast('Failed to save expense', 'error');
    }
  };

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;
    try {
      await api.delete(`/expenses/${expenseToDelete.id}`);
      showToast('Expense entry deleted', 'success');
      setIsDeleteModalOpen(false);
      setExpenseToDelete(null);
      loadExpenseData();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete expense', 'error');
    }
  };

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.reference_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || exp.category === categoryFilter;
    const matchesDate = !dateFilter || exp.date === dateFilter;
    return matchesSearch && matchesCategory && matchesDate;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Rent': return <Building className="w-4 h-4 text-indigo-500" />;
      case 'Electricity': return <Zap className="w-4 h-4 text-amber-500" />;
      case 'Salary': return <Briefcase className="w-4 h-4 text-emerald-500" />;
      case 'Transport': return <Truck className="w-4 h-4 text-cyan-500" />;
      case 'Maintenance': return <Wrench className="w-4 h-4 text-purple-500" />;
      case 'Internet': return <Wifi className="w-4 h-4 text-blue-500" />;
      case 'Office Supplies': return <Package className="w-4 h-4 text-pink-500" />;
      case 'Marketing': return <Megaphone className="w-4 h-4 text-rose-500" />;
      default: return <MoreHorizontal className="w-4 h-4 text-zinc-400" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-pulse">
        <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Operating Expenses & Overhead Ledger
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Track daily shop disbursements, rent, electricity, staff salaries, logistic costs and category analytics.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4.5 shadow-sm flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Today's Expenses</p>
            <h4 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">
              {formatCur(summary?.todayExpenses || 0)}
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">Disbursed today</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4.5 shadow-sm flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">This Month</p>
            <h4 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">
              {formatCur(summary?.monthExpenses || 0)}
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">Current billing cycle</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4.5 shadow-sm flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Recorded</p>
            <h4 className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
              {formatCur(summary?.totalExpenses || 0)}
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">All time expenses</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4.5 shadow-sm flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Highest Category</p>
            <h4 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50 mt-1 truncate">
              {summary?.highestCategory || 'N/A'}
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">{formatCur(summary?.highestCatAmount || 0)}</p>
          </div>
        </div>
      </div>

      {/* Category Expense Summary Chart & Breakdown */}
      {summary && summary.categoryData.length > 0 && (
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-150 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Expense Distribution by Category</h3>
              <p className="text-xs text-zinc-500">Visual comparison of operating cost centers.</p>
            </div>
            <span className="text-xs font-bold text-zinc-500 font-mono">
              Total: {formatCur(summary.totalExpenses)}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Chart */}
            <div className="lg:col-span-2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.categoryData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#71717a', fontSize: 10 }}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={v => `₹${v / 1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                    formatter={(val: any) => [formatCur(Number(val)), 'Amount']}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {summary.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Breakdown List */}
            <div className="space-y-2 text-xs border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-800 lg:pl-6 pt-4 lg:pt-0">
              {summary.categoryData.slice(0, 5).map(cat => {
                const pct = summary.totalExpenses > 0 ? ((cat.amount / summary.totalExpenses) * 100).toFixed(1) : '0';
                return (
                  <div key={cat.name} className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat.name] || '#71717a' }} />
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{formatCur(cat.amount)}</span>
                      <span className="text-[10px] text-zinc-400 ml-1.5 font-mono">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Expense History Table */}
      <div className="space-y-4">
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search expenses by description, ref..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-700 dark:text-zinc-300"
            >
              <option value="">All Categories</option>
              {EXPENSE_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-700 dark:text-zinc-300"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-xs text-zinc-400 hover:text-zinc-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Payment Mode</th>
                  <th className="py-3.5 px-4">Reference No</th>
                  <th className="py-3.5 px-4">Notes</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-400">
                      No expenses found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-500">{exp.date}</td>
                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
                          {getCategoryIcon(exp.category)}
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                        {exp.description}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-rose-600 dark:text-rose-400">
                        {formatCur(exp.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-medium text-zinc-600 dark:text-zinc-400">
                        {exp.payment_method}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-500">
                        {exp.reference_no}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400 max-w-xs truncate">
                        {exp.notes || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(exp)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
                            title="Edit Expense"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setExpenseToDelete(exp);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg cursor-pointer"
                            title="Delete Expense"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: ADD / EDIT EXPENSE */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title={editingExpense ? 'Edit Expense Record' : 'Record New Operating Expense'}
        onConfirm={handleSaveExpense}
        confirmLabel={editingExpense ? 'Save Changes' : 'Record Expense'}
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Expense Date *
              </label>
              <input
                type="date"
                value={formDate}
                onChange={e => setFormDate(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Category *
              </label>
              <select
                value={formCategory}
                onChange={e => setFormCategory(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100 font-semibold"
              >
                {EXPENSE_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Description / Payee *
            </label>
            <input
              type="text"
              value={formDescription}
              onChange={e => setFormDescription(e.target.value)}
              placeholder="e.g. BESCOM Power Bill, Monthly Store Rent, Packaging Materials"
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
            />
            {errors.description && <p className="text-rose-500 text-[11px] mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                value={formAmount}
                onChange={e => setFormAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-rose-600 dark:text-rose-400"
              />
              {errors.amount && <p className="text-rose-500 text-[11px] mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Payment Method
              </label>
              <select
                value={formPaymentMethod}
                onChange={e => setFormPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
              >
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer / NEFT</option>
                <option value="Cheque">Cheque</option>
                <option value="Card">Card</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Reference / Voucher Number
            </label>
            <input
              type="text"
              value={formRefNo}
              onChange={e => setFormRefNo(e.target.value)}
              placeholder="e.g. UPI-TXN-12390, CHQ-44102"
              className="w-full px-3 py-2 font-mono bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              value={formNotes}
              onChange={e => setFormNotes(e.target.value)}
              placeholder="Additional internal audit notes or invoice reference..."
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>
      </Modal>

      {/* MODAL: DELETE CONFIRMATION */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Expense Entry"
        type="danger"
        confirmLabel="Confirm Delete"
        onConfirm={handleDeleteExpense}
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Are you sure you want to remove the expense entry for <strong>"{expenseToDelete?.description}" ({formatCur(expenseToDelete?.amount || 0)})</strong>?
        </p>
      </Modal>
    </div>
  );
};

export default Expenses;
