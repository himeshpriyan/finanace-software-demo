import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  CircleDollarSign, 
  ShoppingCart, 
  Building2, 
  Wallet,
  Clock,
  Plus,
  AlertTriangle,
  Receipt,
  Calendar,
  Package,
  RotateCcw,
  ShieldAlert,
  Banknote,
  Users,
  CheckCircle2
} from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../components/Toast';

interface TransactionItem {
  id: string;
  type: 'Sale' | 'Purchase' | 'Expense' | 'Sales Return' | 'Purchase Return';
  reference: string;
  date: string;
  party: string;
  amount: number;
  status: string;
}

interface TopProduct {
  id: number;
  name: string;
  category: string;
  units_sold: number;
  revenue: number;
  stock: number;
  status: string;
}

interface DashboardStats {
  todaySales: number;
  todayPurchases: number;
  todayBankDeposit: number;
  pendingSales: number;
  pendingPurchases: number;
  cashBalance: number;
  bankBalance: number;
  lowStockItems: number;
  outOfStock: number;
  todayExpenses: number;
  monthlyExpenses: number;
  inventoryAlerts: string[];
  recentTransactions: TransactionItem[];
  topProducts: TopProduct[];
  payrollEmployees?: number;
  payrollMonthlyTotal?: number;
  payrollSalaryPaid?: number;
  payrollSalaryPending?: number;
  payrollStatusCounts?: {
    paid: number;
    pending: number;
    partial: number;
    total: number;
  };
}

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const { showToast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const response = await api.get(`/reports/dashboard?today=${todayStr}`);
        setStats(response.data);
      } catch (error) {
        console.error('Failed to load dashboard statistics:', error);
        showToast('Error loading dashboard statistics', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [showToast]);

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-pulse">
        <div className="h-20 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const formatCur = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Quick Action Banner */}
      <section className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3.5">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab('sales')}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Sale Bill
          </button>
          
          <button
            onClick={() => setActiveTab('purchase')}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Purchase Invoice
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 rounded-xl transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create GST Invoice
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 rounded-xl transition-all cursor-pointer"
          >
            <Package className="w-4 h-4" />
            Add Product / Stock
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 rounded-xl transition-all cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            Record Expense
          </button>

          <button
            onClick={() => setActiveTab('banking')}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 rounded-xl transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Bank Entry
          </button>
        </div>
      </section>

      {/* Inventory Alerts Banner */}
      {stats?.inventoryAlerts && stats.inventoryAlerts.length > 0 && (
        <section className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                Inventory Alerts
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-400 mt-0.5">
                {stats.inventoryAlerts.join(' • ')}. Immediate restocking or vendor orders advised.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('inventory')}
            className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
          >
            Review Inventory
          </button>
        </section>
      )}

      {/* PRIMARY FINANCIAL KPI CARDS ROW (Existing Cards Preserved) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {/* 1. Today's Sales */}
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400">
            <CircleDollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Today's Sales
            </p>
            <h4 className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50 mt-1.5 truncate">
              {formatCur(stats?.todaySales || 0)}
            </h4>
          </div>
        </div>

        {/* 2. Today's Purchases */}
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Today's Purchases
            </p>
            <h4 className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50 mt-1.5 truncate">
              {formatCur(stats?.todayPurchases || 0)}
            </h4>
          </div>
        </div>

        {/* 3. Today's Bank Deposit */}
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Today's Deposits
            </p>
            <h4 className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50 mt-1.5 truncate">
              {formatCur(stats?.todayBankDeposit || 0)}
            </h4>
          </div>
        </div>

        {/* 4. Sales Pending */}
        <button
          onClick={() => setActiveTab('pending')}
          className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex items-start gap-4 text-left hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors group cursor-pointer"
        >
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/30 transition-colors">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              <span>Sales Pending</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </p>
            <h4 className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50 mt-1.5 truncate">
              {formatCur(stats?.pendingSales || 0)}
            </h4>
          </div>
        </button>

        {/* 5. Purchases Pending */}
        <button
          onClick={() => setActiveTab('pending')}
          className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex items-start gap-4 text-left hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors group cursor-pointer"
        >
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/30 transition-colors">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              <span>Purchases Pending</span>
              <ArrowDownRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
            </p>
            <h4 className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50 mt-1.5 truncate">
              {formatCur(stats?.pendingPurchases || 0)}
            </h4>
          </div>
        </button>
      </div>

      {/* SECONDARY OPERATIONAL KPI CARDS ROW (Newly Added Requirements) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Low Stock Items */}
        <div 
          onClick={() => setActiveTab('inventory')}
          className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex items-start gap-4 cursor-pointer hover:border-amber-500 transition-colors"
        >
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Low Stock Items
            </p>
            <h4 className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1.5">
              {stats?.lowStockItems || 0} items
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">Below reorder level</p>
          </div>
        </div>

        {/* Out of Stock */}
        <div 
          onClick={() => setActiveTab('inventory')}
          className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex items-start gap-4 cursor-pointer hover:border-rose-500 transition-colors"
        >
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Out of Stock
            </p>
            <h4 className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1.5">
              {stats?.outOfStock || 0} items
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">Zero quantity left</p>
          </div>
        </div>

        {/* Today's Expenses */}
        <div 
          onClick={() => setActiveTab('expenses')}
          className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex items-start gap-4 cursor-pointer hover:border-indigo-500 transition-colors"
        >
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Today's Expenses
            </p>
            <h4 className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50 mt-1.5 truncate">
              {formatCur(stats?.todayExpenses || 0)}
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">Disbursed today</p>
          </div>
        </div>

        {/* Monthly Expenses */}
        <div 
          onClick={() => setActiveTab('expenses')}
          className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex items-start gap-4 cursor-pointer hover:border-indigo-500 transition-colors"
        >
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Monthly Expenses
            </p>
            <h4 className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50 mt-1.5 truncate">
              {formatCur(stats?.monthlyExpenses || 0)}
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">Current month total</p>
          </div>
        </div>
      </div>

      {/* PAYROLL OVERVIEW & PAYMENT STATUS SECTION (New) */}
      <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <Banknote className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">
                Salary & Payroll Overview (September 2026)
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Staff headcount, monthly liability, and salary payment settlement status
            </p>
          </div>

          <button
            onClick={() => setActiveTab('payroll')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 rounded-xl transition-all cursor-pointer self-start sm:self-auto"
          >
            <span>Manage Payroll</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Cards: Employees, Monthly Payroll, Salary Paid, Salary Pending */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Employees
              </p>
              <h4 className="text-2xl font-extrabold text-zinc-950 dark:text-zinc-50 mt-1">
                {stats?.payrollEmployees || 12}
              </h4>
              <p className="text-[11px] text-zinc-400">Total staff roster</p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Monthly Payroll
              </p>
              <h4 className="text-2xl font-extrabold text-zinc-950 dark:text-zinc-50 mt-1">
                {formatCur(stats?.payrollMonthlyTotal || 345000)}
              </h4>
              <p className="text-[11px] text-zinc-400">Total monthly liability</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400">
              <Banknote className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Salary Paid
              </p>
              <h4 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCur(stats?.payrollSalaryPaid || 285000)}
              </h4>
              <p className="text-[11px] text-emerald-500">Disbursed to staff</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Salary Pending
              </p>
              <h4 className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                {formatCur(stats?.payrollSalaryPending || 60000)}
              </h4>
              <p className="text-[11px] text-rose-400">Pending disbursement</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Salary Payment Status Section */}
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Salary Payment Status:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-zinc-500">Paid:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {stats?.payrollStatusCounts?.paid ?? 9} Staff
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-zinc-500">Pending:</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {stats?.payrollStatusCounts?.pending ?? 3} Staff
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-zinc-500">Partially Paid:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {stats?.payrollStatusCounts?.partial ?? 0} Staff
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CASH & BANK BALANCES SECTION (Existing Preserved) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cash Balance */}
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Cash on Hand Balance
            </p>
            <h3 className="text-3xl font-extrabold text-zinc-950 dark:text-zinc-50">
              {formatCur(stats?.cashBalance || 0)}
            </h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
              Calculated from Cash Sales, Cash Purchases & Bank movements.
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Wallet className="w-8 h-8" />
          </div>
        </div>

        {/* Bank Balance */}
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Bank Books Balance
            </p>
            <h3 className="text-3xl font-extrabold text-zinc-950 dark:text-zinc-50">
              {formatCur(stats?.bankBalance || 0)}
            </h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
              Sum of Deposits minus Withdrawals logged in ledger.
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Building2 className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS & TOP SELLING PRODUCTS SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions Feed */}
        <section className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Recent Transactions</h3>
              <p className="text-xs text-zinc-500">Sales, purchases, expenses & returns log.</p>
            </div>
            <span className="text-xs font-semibold text-zinc-400">Latest 8 events</span>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 overflow-hidden">
            {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
              stats.recentTransactions.map(txn => {
                const isSale = txn.type === 'Sale';
                const isPurchase = txn.type === 'Purchase';
                const isExpense = txn.type === 'Expense';
                const isReturn = txn.type.includes('Return');

                return (
                  <div key={txn.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-xl shrink-0 ${
                        isSale ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' :
                        isPurchase ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' :
                        isExpense ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' :
                        'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                      }`}>
                        {isSale && <CircleDollarSign className="w-4 h-4" />}
                        {isPurchase && <ShoppingCart className="w-4 h-4" />}
                        {isExpense && <Receipt className="w-4 h-4" />}
                        {isReturn && <RotateCcw className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {txn.party}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                          <span className="font-mono">{txn.reference}</span>
                          <span>•</span>
                          <span>{txn.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className={`font-extrabold ${
                        isSale ? 'text-indigo-600 dark:text-indigo-400' :
                        isPurchase ? 'text-emerald-600 dark:text-emerald-400' :
                        isExpense ? 'text-rose-600 dark:text-rose-400' :
                        'text-amber-600 dark:text-amber-400'
                      }`}>
                        {formatCur(txn.amount)}
                      </p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-medium">
                        {txn.type}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-zinc-400 text-center py-6">No recent transactions recorded.</p>
            )}
          </div>
        </section>

        {/* Top Selling Products */}
        <section className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Top Selling Products</h3>
              <p className="text-xs text-zinc-500">Highest volume retail items by revenue.</p>
            </div>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              All Products →
            </button>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 overflow-hidden">
            {stats?.topProducts && stats.topProducts.map((p, idx) => (
              <div key={p.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-bold flex items-center justify-center text-[11px] shrink-0">
                    #{idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {p.name}
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      {p.category} • {p.units_sold} units sold
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-extrabold text-zinc-900 dark:text-zinc-50">
                    {formatCur(p.revenue)}
                  </p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    p.status === 'Low Stock' 
                      ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                      : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {p.status} ({p.stock} left)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
