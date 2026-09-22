import React, { useState, useEffect } from 'react';
import { 
  CircleDollarSign, 
  ShoppingCart, 
  Clock, 
  TrendingUp, 
  Download, 
  Printer, 
  Search, 
  FileText, 
  Package, 
  RotateCcw, 
  Receipt, 
  Percent, 
  AlertTriangle, 
  DollarSign,
  Banknote,
  Users,
  CreditCard,
  UserCheck
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import api from '../utils/api';
import { useToast } from '../components/Toast';
import { exportToCSV } from '../utils/export';

type ReportSection = 
  | 'overview'
  | 'sales'
  | 'purchase'
  | 'inventory'
  | 'stock-valuation'
  | 'low-stock'
  | 'sales-return'
  | 'purchase-return'
  | 'expense'
  | 'customer-outstanding'
  | 'vendor-outstanding'
  | 'profit-loss'
  | 'gst-summary'
  | 'monthly-salary'
  | 'employee-salary'
  | 'salary-payment'
  | 'pending-salary'
  | 'salary-advance'
  | 'deduction-report'
  | 'department-payroll'
  | 'yearly-payroll';

interface SummaryStats {
  totalSales: number;
  totalPurchase: number;
  totalExpenses: number;
  bankDeposit: number;
  cashReceived: number;
  cashPaid: number;
  pendingCollection: number;
  pendingPayable: number;
  profit: number;
  grossProfit: number;
  salesReturnsTotal: number;
  purchaseReturnsTotal: number;
  outputGst: number;
  inputGst: number;
  netGstPayable: number;
  totalStockVal: number;
  totalRetailVal: number;
  potentialProfit: number;
}

interface TrendPoint {
  date: string;
  sales: number;
  purchases: number;
  expenses: number;
}

interface EntityBreakdown {
  name: string;
  total: number;
  paid: number;
  balance: number;
}

const Reports: React.FC = () => {
  const { showToast } = useToast();

  const [activeSection, setActiveSection] = useState<ReportSection>('overview');
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'this_week' | 'this_month' | 'custom'>('this_month');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [customerBreakdown, setCustomerBreakdown] = useState<EntityBreakdown[]>([]);
  const [vendorBreakdown, setVendorBreakdown] = useState<EntityBreakdown[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<Array<{ category: string; amount: number }>>([]);
  
  // Datasets for specific reports
  const [products, setProducts] = useState<any[]>([]);
  const [returnsList, setReturnsList] = useState<any[]>([]);
  const [pendingSales, setPendingSales] = useState<any[]>([]);
  const [pendingPurchases, setPendingPurchases] = useState<any[]>([]);

  // Payroll datasets and filters
  const [payrollRecords, setPayrollRecords] = useState<any[]>([]);
  const [payrollEmployees, setPayrollEmployees] = useState<any[]>([]);
  const [payrollAdvances, setPayrollAdvances] = useState<any[]>([]);

  const [pMonthFilter, setPMonthFilter] = useState('September 2026');
  const [pYearFilter, setPYearFilter] = useState('2026');
  const [pEmpFilter, setPEmpFilter] = useState('All');
  const [pDeptFilter, setPDeptFilter] = useState('All');
  const [pStatusFilter, setPStatusFilter] = useState('All');

  const [loading, setLoading] = useState(true);

  // Map filterPeriod to api report type
  const reportType = filterPeriod === 'today' ? 'daily' : filterPeriod === 'this_week' ? 'weekly' : 'monthly';

  useEffect(() => {
    fetchReport();
  }, [filterPeriod, selectedDate]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const [sumRes, prodRes, retRes, pendRes, payRes, empRes, advRes] = await Promise.all([
        api.get(`/reports/summary?type=${reportType}&date=${selectedDate}`),
        api.get('/products'),
        api.get('/returns'),
        api.get('/reports/pending'),
        api.get('/payroll/history'),
        api.get('/employees'),
        api.get('/payroll/advances')
      ]);

      setSummary(sumRes.data.summary);
      setTrendData(sumRes.data.trend || []);
      setCustomerBreakdown(sumRes.data.customerBreakdown || []);
      setVendorBreakdown(sumRes.data.vendorBreakdown || []);
      setExpenseBreakdown(sumRes.data.expenseBreakdown || []);
      setProducts(prodRes.data || []);
      setReturnsList(retRes.data || []);
      setPendingSales(pendRes.data.salesPending || []);
      setPendingPurchases(pendRes.data.purchasesPending || []);
      setPayrollRecords(payRes.data || []);
      setPayrollEmployees(empRes.data || []);
      setPayrollAdvances(advRes.data || []);
    } catch (error) {
      console.error('Failed to load report data:', error);
      showToast('Error loading report statistics', 'error');
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

  // CSV Export
  const handleExportCSV = () => {
    if (!summary) {
      showToast('No report data available to export', 'warning');
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    let filename = `ShopManager_${activeSection}_${timestamp}`;
    let headers: string[] = [];
    let rows: any[][] = [];

    switch (activeSection) {
      case 'sales':
        headers = ['Date', 'Sales (Rs.)'];
        rows = trendData.map(t => [t.date, t.sales]);
        rows.push([]);
        rows.push(['Total Sales', summary.totalSales]);
        rows.push(['Cash Received', summary.cashReceived]);
        rows.push(['Pending Collection', summary.pendingCollection]);
        break;

      case 'purchase':
        headers = ['Date', 'Purchases (Rs.)'];
        rows = trendData.map(t => [t.date, t.purchases]);
        rows.push([]);
        rows.push(['Total Purchases', summary.totalPurchase]);
        rows.push(['Cash Paid', summary.cashPaid]);
        rows.push(['Pending Payables', summary.pendingPayable]);
        break;

      case 'inventory':
      case 'stock-valuation':
        headers = ['SKU', 'Product Name', 'Category', 'Stock Qty', 'Purchase Cost', 'Total Valuation (Cost)', 'Selling Price', 'Retail Valuation'];
        rows = products.map(p => [
          p.sku,
          p.name,
          p.category,
          p.current_stock,
          p.purchase_price,
          p.current_stock * p.purchase_price,
          p.selling_price,
          p.current_stock * p.selling_price
        ]);
        break;

      case 'low-stock':
        headers = ['SKU', 'Product Name', 'Category', 'Current Stock', 'Min Threshold', 'Deficit'];
        rows = products.filter(p => p.current_stock <= p.minimum_stock).map(p => [
          p.sku,
          p.name,
          p.category,
          p.current_stock,
          p.minimum_stock,
          Math.max(0, p.minimum_stock - p.current_stock)
        ]);
        break;

      case 'expense':
        headers = ['Category', 'Expense Amount (Rs.)'];
        rows = expenseBreakdown.map(e => [e.category, e.amount]);
        rows.push([]);
        rows.push(['Total Expenses', summary.totalExpenses]);
        break;

      case 'customer-outstanding':
        headers = ['Invoice No', 'Date', 'Customer Name', 'Mobile', 'Total Amount', 'Paid', 'Balance Due', 'Due Date'];
        rows = pendingSales.map(s => [s.bill_no, s.date, s.customer_name, s.customer_mobile, s.total_amount, s.paid_amount, s.balance_amount, s.due_date || 'N/A']);
        break;

      case 'vendor-outstanding':
        headers = ['Bill No', 'Date', 'Vendor Name', 'Total Amount', 'Paid', 'Balance Due', 'Due Date'];
        rows = pendingPurchases.map(p => [p.bill_no, p.date, p.vendor_name, p.total_amount, p.paid_amount, p.balance_amount, p.due_date || 'N/A']);
        break;

      case 'gst-summary':
        headers = ['GST Component', 'Amount (Rs.)'];
        rows = [
          ['Total Output Tax (Sales GST)', summary.outputGst],
          ['Total Input Tax Credit (Purchase GST)', summary.inputGst],
          ['Net GST Liability Payable', summary.netGstPayable]
        ];
        break;

      case 'profit-loss':
        headers = ['P&L Metric', 'Amount (Rs.)'];
        rows = [
          ['Gross Sales Revenue', summary.totalSales],
          ['Cost of Goods Purchased', summary.totalPurchase],
          ['Gross Profit', summary.grossProfit],
          ['Operating Expenses', summary.totalExpenses],
          ['Net Operating Profit / (Loss)', summary.profit]
        ];
        break;

      case 'monthly-salary':
        headers = ['Employee Code', 'Employee Name', 'Department', 'Month', 'Basic', 'Allowances', 'Overtime', 'Gross Salary', 'Deductions', 'Advance Recovery', 'Net Salary', 'Status'];
        rows = payrollRecords.map(r => [r.employee_code, r.employee_name, r.department, r.month, r.basic_salary, r.total_allowances, r.overtime_amount, r.gross_salary, r.total_deductions, r.advance_recovery, r.net_salary, r.payment_status]);
        break;

      case 'employee-salary':
        headers = ['Employee Code', 'Employee Name', 'Department', 'Designation', 'Month', 'Basic Salary', 'Gross Salary', 'Net Salary', 'Paid Amount', 'Status'];
        rows = payrollRecords.map(r => [r.employee_code, r.employee_name, r.department, r.designation, r.month, r.basic_salary, r.gross_salary, r.net_salary, r.paid_amount, r.payment_status]);
        break;

      case 'salary-payment':
        headers = ['Salary ID', 'Employee Name', 'Month', 'Net Amount', 'Payment Date', 'Payment Method', 'Reference No'];
        rows = payrollRecords.filter(r => r.payment_status === 'Paid').map(r => [r.salary_id, r.employee_name, r.month, r.net_salary, r.payment_date || '-', r.payment_method || '-', r.reference_no || '-']);
        break;

      case 'pending-salary':
        headers = ['Employee Code', 'Employee Name', 'Department', 'Month', 'Net Salary', 'Balance Due', 'Status'];
        rows = payrollRecords.filter(r => r.payment_status === 'Pending').map(r => [r.employee_code, r.employee_name, r.department, r.month, r.net_salary, r.balance_amount, r.payment_status]);
        break;

      case 'salary-advance':
        headers = ['Employee Code', 'Employee Name', 'Advance Date', 'Advance Amount', 'Recovered', 'Balance', 'Recovery Month', 'Status'];
        rows = payrollAdvances.map(a => [a.employee_code, a.employee_name, a.date, a.advance_amount, a.recovered_amount, a.balance_amount, a.recovery_month, a.status]);
        break;

      case 'deduction-report':
        headers = ['Employee Name', 'Department', 'Month', 'Leave Deduction', 'Late Deduction', 'Advance Recovery', 'Other Deduction', 'Total Deductions'];
        rows = payrollRecords.map(r => [r.employee_name, r.department, r.month, r.leave_deductions, r.late_deductions, r.advance_recovery, r.other_deductions, r.total_deductions]);
        break;

      case 'department-payroll':
        {
          headers = ['Department', 'Active Staff', 'Monthly Gross Payroll', 'Total Deductions', 'Net Payable'];
          const depts = ['Sales', 'Accounts', 'Store', 'Administration', 'Purchase', 'Management'];
          rows = depts.map(d => {
            const dRecs = payrollRecords.filter(r => r.department === d && r.month === 'September 2026');
            const headcount = dRecs.length;
            const gross = dRecs.reduce((sum, r) => sum + r.gross_salary, 0);
            const ded = dRecs.reduce((sum, r) => sum + r.total_deductions, 0);
            const net = dRecs.reduce((sum, r) => sum + r.net_salary, 0);
            return [d, headcount, gross, ded, net];
          });
        }
        break;

      case 'yearly-payroll':
        headers = ['Payroll Month', 'Year', 'Processed Staff', 'Total Gross (Rs.)', 'Total Disbursed (Rs.)', 'Pending Balance (Rs.)'];
        rows = [
          ['September 2026', 2026, 12, 385000, 285000, 60000],
          ['August 2026', 2026, 12, 360000, 360000, 0],
          ['July 2026', 2026, 12, 350000, 350000, 0]
        ];
        break;

      default:
        headers = ['Date', 'Sales (Rs.)', 'Purchases (Rs.)', 'Expenses (Rs.)'];
        rows = trendData.map(t => [t.date, t.sales, t.purchases, t.expenses]);
        rows.push([]);
        rows.push(['Net Profit', summary.profit]);
    }

    exportToCSV(filename, headers, rows);
    showToast(`${activeSection.toUpperCase()} report exported to CSV!`, 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !summary) {
    return (
      <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-pulse">
        <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
      </div>
    );
  }

  // Filtered rows for active tables
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockItems = filteredProducts.filter(p => p.current_stock <= p.minimum_stock);

  const isPayrollSection = [
    'monthly-salary',
    'employee-salary',
    'salary-payment',
    'pending-salary',
    'salary-advance',
    'deduction-report',
    'department-payroll',
    'yearly-payroll'
  ].includes(activeSection);

  // Filtered Payroll Records for Reports
  const filteredPayrollRecords = payrollRecords.filter(r => {
    const matchesMonth = pMonthFilter === 'All' || r.month === pMonthFilter;
    const matchesYear = pYearFilter === 'All' || String(r.year) === String(pYearFilter);
    const matchesEmp = pEmpFilter === 'All' || r.employee_name === pEmpFilter || String(r.employee_id) === pEmpFilter;
    const matchesDept = pDeptFilter === 'All' || r.department === pDeptFilter;
    const matchesStatus = pStatusFilter === 'All' || r.payment_status === pStatusFilter;
    const matchesSearch = 
      r.employee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.employee_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.department?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMonth && matchesYear && matchesEmp && matchesDept && matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Financial & Operations Reports
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Analyze sales performance, purchasing volume, inventory valuation, GST summaries, payroll and profit/loss.
          </p>
        </div>

        {/* Global Filter Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Period Selector */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
            {[
              { id: 'today', label: 'Today' },
              { id: 'this_week', label: 'This Week' },
              { id: 'this_month', label: 'This Month' },
              { id: 'custom', label: 'Custom' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setFilterPeriod(p.id as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  filterPeriod === p.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {filterPeriod === 'custom' && (
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100"
            />
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Export Excel / CSV
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
        </div>
      </div>

      {/* Report Section Navigation Chips */}
      <div className="space-y-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'overview', label: 'Executive Overview', icon: TrendingUp },
            { id: 'sales', label: 'Sales Report', icon: CircleDollarSign },
            { id: 'purchase', label: 'Purchase Report', icon: ShoppingCart },
            { id: 'inventory', label: 'Inventory Report', icon: Package },
            { id: 'stock-valuation', label: 'Stock Valuation', icon: DollarSign },
            { id: 'low-stock', label: 'Low Stock Report', icon: AlertTriangle },
            { id: 'sales-return', label: 'Sales Returns', icon: RotateCcw },
            { id: 'purchase-return', label: 'Purchase Returns', icon: RotateCcw },
            { id: 'expense', label: 'Expense Report', icon: Receipt },
            { id: 'customer-outstanding', label: 'Customer Outstanding', icon: Clock },
            { id: 'vendor-outstanding', label: 'Vendor Outstanding', icon: Clock },
            { id: 'profit-loss', label: 'Profit / Loss Estimate', icon: TrendingUp },
            { id: 'gst-summary', label: 'GST Summary', icon: Percent },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as ReportSection)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Payroll Reports Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-150 dark:border-zinc-850">
          <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider pr-1 flex items-center gap-1">
            <Banknote className="w-3.5 h-3.5" />
            Payroll Reports:
          </span>
          {[
            { id: 'monthly-salary', label: 'Monthly Salary Report', icon: Banknote },
            { id: 'employee-salary', label: 'Employee Salary Report', icon: Users },
            { id: 'salary-payment', label: 'Salary Payment Report', icon: CreditCard },
            { id: 'pending-salary', label: 'Pending Salary Report', icon: Clock },
            { id: 'salary-advance', label: 'Salary Advance Report', icon: DollarSign },
            { id: 'deduction-report', label: 'Deduction Report', icon: Receipt },
            { id: 'department-payroll', label: 'Department-wise Payroll', icon: UserCheck },
            { id: 'yearly-payroll', label: 'Yearly Payroll Summary', icon: TrendingUp },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as ReportSection)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 hover:text-purple-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Special Payroll Filters Bar when a Payroll Report is active */}
      {isPayrollSection && (
        <div className="bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-0.5">Payroll Month</label>
              <select
                value={pMonthFilter}
                onChange={(e) => setPMonthFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200"
              >
                <option value="All">All Months</option>
                <option value="September 2026">September 2026</option>
                <option value="August 2026">August 2026</option>
                <option value="July 2026">July 2026</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-0.5">Year</label>
              <select
                value={pYearFilter}
                onChange={(e) => setPYearFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200"
              >
                <option value="All">All Years</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-0.5">Department</label>
              <select
                value={pDeptFilter}
                onChange={(e) => setPDeptFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200"
              >
                <option value="All">All Departments</option>
                {['Sales', 'Accounts', 'Store', 'Administration', 'Purchase', 'Management'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-0.5">Employee</label>
              <select
                value={pEmpFilter}
                onChange={(e) => setPEmpFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200"
              >
                <option value="All">All Employees</option>
                {payrollEmployees.map(e => (
                  <option key={e.id} value={e.name}>{e.name} ({e.emp_id})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-0.5">Payment Status</label>
              <select
                value={pStatusFilter}
                onChange={(e) => setPStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200"
              >
                <option value="All">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300">
              {filteredPayrollRecords.length} records matched
            </span>
          </div>
        </div>
      )}

      {/* Search Filter for Sub-tables */}
      {activeSection !== 'overview' && activeSection !== 'profit-loss' && activeSection !== 'gst-summary' && (
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder={`Search in ${activeSection.replace('-', ' ')}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none"
            />
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            {filterPeriod.replace('_', ' ').toUpperCase()} VIEW
          </span>
        </div>
      )}

      {/* SECTION 1: EXECUTIVE OVERVIEW */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Executive KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Sales Revenue</p>
              <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">
                {formatCur(summary.totalSales)}
              </h3>
              <p className="text-xs text-emerald-600 mt-1">Cash Inflow: {formatCur(summary.cashReceived)}</p>
            </div>

            <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Purchase Volume</p>
              <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">
                {formatCur(summary.totalPurchase)}
              </h3>
              <p className="text-xs text-zinc-500 mt-1">Cash Outflow: {formatCur(summary.cashPaid)}</p>
            </div>

            <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Operating Expenses</p>
              <h3 className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                {formatCur(summary.totalExpenses)}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">Rent, power, logistics & staff</p>
            </div>

            <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Estimated Net Profit</p>
              <h3 className={`text-2xl font-extrabold mt-1 ${summary.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                {formatCur(summary.profit)}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">After deducting purchases & expenses</p>
            </div>
          </div>

          {/* Combined Area Trend Chart */}
          <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Sales, Purchases & Expenses Trend</h3>
                <p className="text-xs text-zinc-500">Comparative financial timeline for the selected period.</p>
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="purGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.4} />
                  <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 11 }} tickFormatter={v => `₹${v / 1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                    formatter={(val: any) => [formatCur(Number(val)), '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="sales" name="Sales Revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#salesGrad)" />
                  <Area type="monotone" dataKey="purchases" name="Purchases" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#purGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: SALES REPORT */}
      {activeSection === 'sales' && (
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Customer Sales Performance Breakdown</h3>
            <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
              Total: {formatCur(summary.totalSales)}
            </span>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase">
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4 text-right">Total Invoiced</th>
                <th className="py-3 px-4 text-right">Paid Amount</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Settlement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800/60">
              {customerBreakdown.map(c => (
                <tr key={c.name} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20">
                  <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">{c.name}</td>
                  <td className="py-3 px-4 text-right font-extrabold text-zinc-900 dark:text-zinc-50">{formatCur(c.total)}</td>
                  <td className="py-3 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">{formatCur(c.paid)}</td>
                  <td className="py-3 px-4 text-right font-bold text-rose-600 dark:text-rose-400">{formatCur(c.balance)}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      c.balance === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {c.balance === 0 ? 'Settled' : 'Pending Due'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SECTION 3: PURCHASE REPORT */}
      {activeSection === 'purchase' && (
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Vendor Purchases & Consignments</h3>
            <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Total: {formatCur(summary.totalPurchase)}
            </span>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase">
                <th className="py-3 px-4">Vendor Supplier</th>
                <th className="py-3 px-4 text-right">Total Orders</th>
                <th className="py-3 px-4 text-right">Amount Paid</th>
                <th className="py-3 px-4 text-right">Payable Balance</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800/60">
              {vendorBreakdown.map(v => (
                <tr key={v.name} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20">
                  <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">{v.name}</td>
                  <td className="py-3 px-4 text-right font-extrabold text-zinc-900 dark:text-zinc-50">{formatCur(v.total)}</td>
                  <td className="py-3 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">{formatCur(v.paid)}</td>
                  <td className="py-3 px-4 text-right font-bold text-rose-600 dark:text-rose-400">{formatCur(v.balance)}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      v.balance === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {v.balance === 0 ? 'Paid' : 'Unpaid Balance'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SECTION 4: INVENTORY REPORT */}
      {activeSection === 'inventory' && (
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Complete Stock Inventory Audit</h3>
            <span className="text-xs text-zinc-400 font-mono">
              {filteredProducts.length} items listed
            </span>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase">
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Current Stock</th>
                <th className="py-3 px-4 text-right">Cost Price</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800/60">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20">
                  <td className="py-3 px-4 font-mono text-zinc-500">{p.sku}</td>
                  <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">{p.name}</td>
                  <td className="py-3 px-4 text-zinc-500">{p.category}</td>
                  <td className="py-3 px-4 text-center font-bold text-indigo-600 dark:text-indigo-400">{p.current_stock} {p.unit}</td>
                  <td className="py-3 px-4 text-right text-zinc-500">{formatCur(p.purchase_price)}</td>
                  <td className="py-3 px-4 text-right font-bold text-zinc-900 dark:text-zinc-50">{formatCur(p.selling_price)}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      p.current_stock === 0 ? 'bg-rose-100 text-rose-700' :
                      p.current_stock <= p.minimum_stock ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {p.current_stock === 0 ? 'Out of Stock' : p.current_stock <= p.minimum_stock ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SECTION 5: STOCK VALUATION */}
      {activeSection === 'stock-valuation' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4.5 shadow-sm">
              <span className="text-[11px] font-bold text-zinc-400 uppercase">Valuation at Cost</span>
              <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">{formatCur(summary.totalStockVal)}</h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">Capital invested in stock</p>
            </div>
            <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4.5 shadow-sm">
              <span className="text-[11px] font-bold text-zinc-400 uppercase">Valuation at Retail Price</span>
              <h3 className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{formatCur(summary.totalRetailVal)}</h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">Expected total gross revenue</p>
            </div>
            <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4.5 shadow-sm">
              <span className="text-[11px] font-bold text-zinc-400 uppercase">Unrealized Gross Margin</span>
              <h3 className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{formatCur(summary.potentialProfit)}</h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">Potential profit in warehouse</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase">
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4 text-center">Stock</th>
                  <th className="py-3 px-4 text-right">Cost Rate</th>
                  <th className="py-3 px-4 text-right">Cost Total</th>
                  <th className="py-3 px-4 text-right">Retail Rate</th>
                  <th className="py-3 px-4 text-right">Retail Total</th>
                  <th className="py-3 px-4 text-right">Margin (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800/60">
                {filteredProducts.map(p => {
                  const costTot = p.current_stock * p.purchase_price;
                  const retailTot = p.current_stock * p.selling_price;
                  const margin = retailTot - costTot;
                  return (
                    <tr key={p.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20">
                      <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">{p.name}</td>
                      <td className="py-3 px-4 text-center font-bold text-zinc-600 dark:text-zinc-400">{p.current_stock}</td>
                      <td className="py-3 px-4 text-right text-zinc-500">{formatCur(p.purchase_price)}</td>
                      <td className="py-3 px-4 text-right font-semibold text-zinc-900 dark:text-zinc-50">{formatCur(costTot)}</td>
                      <td className="py-3 px-4 text-right text-zinc-500">{formatCur(p.selling_price)}</td>
                      <td className="py-3 px-4 text-right font-semibold text-indigo-600 dark:text-indigo-400">{formatCur(retailTot)}</td>
                      <td className="py-3 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400">{formatCur(margin)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 6: LOW STOCK REPORT */}
      {activeSection === 'low-stock' && (
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center bg-amber-50/50 dark:bg-amber-950/20">
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300">Critical Low Stock Reorder Report</h3>
              <p className="text-xs text-amber-700 dark:text-amber-400">Products requiring emergency replenishment from vendors.</p>
            </div>
            <span className="text-xs font-bold text-amber-600">
              {lowStockItems.length} Products Alerted
            </span>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Current Stock</th>
                <th className="py-3 px-4 text-center">Min Threshold</th>
                <th className="py-3 px-4 text-center">Deficit</th>
                <th className="py-3 px-4 text-right">Reorder Cost (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800/60">
              {lowStockItems.map(p => {
                const deficit = Math.max(0, p.minimum_stock - p.current_stock);
                const reorderCost = deficit * p.purchase_price;
                return (
                  <tr key={p.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20">
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">{p.name}</td>
                    <td className="py-3 px-4 text-zinc-500">{p.category}</td>
                    <td className="py-3 px-4 text-center font-extrabold text-rose-600">{p.current_stock} {p.unit}</td>
                    <td className="py-3 px-4 text-center text-zinc-500">{p.minimum_stock} {p.unit}</td>
                    <td className="py-3 px-4 text-center font-bold text-amber-600">-{deficit}</td>
                    <td className="py-3 px-4 text-right font-bold text-zinc-900 dark:text-zinc-100">{formatCur(reorderCost)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* SECTION 7 & 8: SALES / PURCHASE RETURNS REPORT */}
      {(activeSection === 'sales-return' || activeSection === 'purchase-return') && (
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
              {activeSection === 'sales-return' ? 'Customer Sales Returns Log' : 'Vendor Purchase Returns Log'}
            </h3>
            <span className="font-mono text-xs font-bold text-indigo-600">
              {formatCur(activeSection === 'sales-return' ? summary.salesReturnsTotal : summary.purchaseReturnsTotal)}
            </span>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase">
                <th className="py-3 px-4">Return ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Party</th>
                <th className="py-3 px-4">Product Returned</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800/60">
              {returnsList
                .filter(r => (activeSection === 'sales-return' ? r.type === 'Sales Return' : r.type === 'Purchase Return'))
                .map(r => (
                  <tr key={r.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{r.return_no}</td>
                    <td className="py-3 px-4 text-zinc-500 font-mono text-[11px]">{r.date}</td>
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">{r.party_name}</td>
                    <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">{r.product_name}</td>
                    <td className="py-3 px-4 text-center font-bold">{r.quantity}</td>
                    <td className="py-3 px-4 text-zinc-400">{r.reason}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-zinc-900 dark:text-zinc-100">{formatCur(r.amount)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SECTION 9: EXPENSE REPORT */}
      {activeSection === 'expense' && (
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Category-wise Overhead & Operating Expenses</h3>
            <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
              Total Expenses: {formatCur(summary.totalExpenses)}
            </span>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase">
                <th className="py-3 px-4">Expense Category</th>
                <th className="py-3 px-4 text-right">Total Disbursed</th>
                <th className="py-3 px-4 text-right">% of Total Costs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800/60">
              {expenseBreakdown.map(e => {
                const pct = summary.totalExpenses > 0 ? ((e.amount / summary.totalExpenses) * 100).toFixed(1) : '0';
                return (
                  <tr key={e.category} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20">
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">{e.category}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-rose-600 dark:text-rose-400">{formatCur(e.amount)}</td>
                    <td className="py-3 px-4 text-right font-mono text-zinc-500">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* SECTION 10 & 11: OUTSTANDING BALANCES */}
      {(activeSection === 'customer-outstanding' || activeSection === 'vendor-outstanding') && (
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
              {activeSection === 'customer-outstanding' ? 'Customer Outstanding Receivables' : 'Vendor Outstanding Payables'}
            </h3>
            <span className="font-mono text-xs font-bold text-rose-600">
              {formatCur(activeSection === 'customer-outstanding' ? summary.pendingCollection : summary.pendingPayable)}
            </span>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase">
                <th className="py-3 px-4">Invoice / Bill</th>
                <th className="py-3 px-4">Party Name</th>
                <th className="py-3 px-4 text-right">Total Bill</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800/60">
              {(activeSection === 'customer-outstanding' ? pendingSales : pendingPurchases).map((it: any) => (
                <tr key={it.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600">{it.bill_no}</td>
                  <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">{it.customer_name || it.vendor_name}</td>
                  <td className="py-3 px-4 text-right font-medium">{formatCur(it.total_amount)}</td>
                  <td className="py-3 px-4 text-right text-emerald-600">{formatCur(it.paid_amount)}</td>
                  <td className="py-3 px-4 text-right font-extrabold text-rose-600">{formatCur(it.balance_amount)}</td>
                  <td className="py-3 px-4 text-center font-mono text-zinc-500">{it.due_date || 'Immediate'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SECTION 12: PROFIT / LOSS ESTIMATE */}
      {activeSection === 'profit-loss' && (
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6 max-w-2xl mx-auto">
          <div className="border-b border-zinc-150 dark:border-zinc-800 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">Profit & Loss Statement (Estimate)</h3>
              <p className="text-xs text-zinc-500">Retail sales revenue minus purchases and operating overhead.</p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800">
              {filterPeriod.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">1. Gross Revenue from Retail Sales (+)</span>
              <span className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400">{formatCur(summary.totalSales)}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
              <span>2. Cost of Wholesale Goods Purchased (-)</span>
              <span className="font-semibold">{formatCur(summary.totalPurchase)}</span>
            </div>

            <div className="flex justify-between py-2 border-b-2 border-zinc-200 dark:border-zinc-700 font-bold text-zinc-900 dark:text-zinc-100">
              <span>Gross Profit Margin</span>
              <span>{formatCur(summary.grossProfit)}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 text-rose-600 dark:text-rose-400">
              <span>3. Total Operating & Store Expenses (-)</span>
              <span className="font-semibold">-{formatCur(summary.totalExpenses)}</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Estimated Net Profit / (Loss)</p>
                <span className="text-xs text-zinc-400">After all cost deductions</span>
              </div>
              <h3 className={`text-2xl font-black ${summary.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                {formatCur(summary.profit)}
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 13: GST SUMMARY */}
      {activeSection === 'gst-summary' && (
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6 max-w-2xl mx-auto">
          <div className="border-b border-zinc-150 dark:border-zinc-800 pb-3">
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">Goods & Services Tax (GST) Liability Summary</h3>
            <p className="text-xs text-zinc-500">Output tax on sales vs Input tax credit (ITC) on procurement.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 flex justify-between items-center">
              <div>
                <p className="font-bold text-zinc-800 dark:text-zinc-200">Output GST (Collected on Sales)</p>
                <span className="text-zinc-400 text-[11px]">Tax liability on outward goods supply</span>
              </div>
              <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">{formatCur(summary.outputGst)}</span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex justify-between items-center">
              <div>
                <p className="font-bold text-zinc-800 dark:text-zinc-200">Input Tax Credit / ITC (Paid on Purchases)</p>
                <span className="text-zinc-400 text-[11px]">Eligible tax offset from registered suppliers</span>
              </div>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{formatCur(summary.inputGst)}</span>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900 text-white flex justify-between items-center shadow-lg">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Net Tax Liability</span>
                <h4 className="text-sm font-bold mt-0.5">Net GST Payable to Govt</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">Output GST minus Input Tax Credit</p>
              </div>
              <h3 className="text-2xl font-black text-amber-400">
                {formatCur(summary.netGstPayable)}
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* PAYROLL REPORT 1: MONTHLY SALARY REPORT */}
      {activeSection === 'monthly-salary' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4.5 shadow-sm">
              <span className="text-[11px] font-bold text-zinc-400 uppercase">Filtered Records</span>
              <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">{filteredPayrollRecords.length} Staff</h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">For selected criteria</p>
            </div>
            <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4.5 shadow-sm">
              <span className="text-[11px] font-bold text-zinc-400 uppercase">Total Gross Salary</span>
              <h3 className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                {formatCur(filteredPayrollRecords.reduce((sum, r) => sum + r.gross_salary, 0))}
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">Basic + allowances + OT</p>
            </div>
            <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4.5 shadow-sm">
              <span className="text-[11px] font-bold text-zinc-400 uppercase">Total Deductions</span>
              <h3 className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                {formatCur(filteredPayrollRecords.reduce((sum, r) => sum + r.total_deductions, 0))}
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">Leaves + advances</p>
            </div>
            <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4.5 shadow-sm">
              <span className="text-[11px] font-bold text-zinc-400 uppercase">Total Net Payable</span>
              <h3 className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCur(filteredPayrollRecords.reduce((sum, r) => sum + r.net_salary, 0))}
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">Final take-home pool</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Monthly Staff Salary Calculation Sheet</h3>
                <p className="text-xs text-zinc-500">Comprehensive breakdown of earnings, statutory deductions, and net disbursements.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50/50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase">
                    <th className="py-3 px-4">Emp Code</th>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Month</th>
                    <th className="py-3 px-4 text-right">Basic</th>
                    <th className="py-3 px-4 text-right">Allowances</th>
                    <th className="py-3 px-4 text-right">OT</th>
                    <th className="py-3 px-4 text-right">Gross</th>
                    <th className="py-3 px-4 text-right">Deductions</th>
                    <th className="py-3 px-4 text-right">Adv Rec.</th>
                    <th className="py-3 px-4 text-right">Net Salary</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800/60">
                  {filteredPayrollRecords.map(r => (
                    <tr key={r.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20">
                      <td className="py-3 px-4 font-mono font-bold text-purple-600">{r.employee_code}</td>
                      <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">{r.employee_name}</td>
                      <td className="py-3 px-4 text-zinc-500">{r.department}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">{r.month}</td>
                      <td className="py-3 px-4 text-right text-zinc-600 dark:text-zinc-400">{formatCur(r.basic_salary)}</td>
                      <td className="py-3 px-4 text-right text-zinc-600 dark:text-zinc-400">{formatCur(r.total_allowances)}</td>
                      <td className="py-3 px-4 text-right text-zinc-600 dark:text-zinc-400">{formatCur(r.overtime_amount)}</td>
                      <td className="py-3 px-4 text-right font-semibold text-zinc-900 dark:text-zinc-100">{formatCur(r.gross_salary)}</td>
                      <td className="py-3 px-4 text-right text-rose-600">-{formatCur(r.total_deductions)}</td>
                      <td className="py-3 px-4 text-right text-amber-600">-{formatCur(r.advance_recovery)}</td>
                      <td className="py-3 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400">{formatCur(r.net_salary)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.payment_status === 'Paid'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}>
                          {r.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PAYROLL REPORT 2: EMPLOYEE SALARY REPORT */}
      {activeSection === 'employee-salary' && (
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Employee-wise Compensation & Historical Track</h3>
              <p className="text-xs text-zinc-500">Track individual compensation levels, role designations, and historical pay.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase">
                  <th className="py-3 px-4">Emp Code</th>
                  <th className="py-3 px-4">Employee Name</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4 text-right">Basic Pay</th>
                  <th className="py-3 px-4 text-right">Gross Pay</th>
                  <th className="py-3 px-4 text-right">Net Payable</th>
                  <th className="py-3 px-4 text-right">Disbursed</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800/60">
                {filteredPayrollRecords.map(r => (
                  <tr key={r.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20">
                    <td className="py-3 px-4 font-mono font-bold text-purple-600">{r.employee_code}</td>
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">{r.employee_name}</td>
                    <td className="py-3 px-4 text-zinc-500">{r.designation}</td>
                    <td className="py-3 px-4 text-zinc-400">{r.department}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">{r.month}</td>
                    <td className="py-3 px-4 text-right text-zinc-600 dark:text-zinc-300">{formatCur(r.basic_salary)}</td>
                    <td className="py-3 px-4 text-right font-medium text-zinc-900 dark:text-zinc-100">{formatCur(r.gross_salary)}</td>
                    <td className="py-3 px-4 text-right font-bold text-indigo-600 dark:text-indigo-400">{formatCur(r.net_salary)}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400">{formatCur(r.paid_amount)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.payment_status === 'Paid'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                        {r.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAYROLL REPORT 3: SALARY PAYMENT REPORT */}
      {activeSection === 'salary-payment' && (
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Disbursed Salary Payment Audit Log</h3>
              <p className="text-xs text-zinc-500">Record of executed bank transfers, UPI transactions, and cash disbursements.</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600">
              Total Disbursed: {formatCur(filteredPayrollRecords.filter(r => r.payment_status === 'Paid').reduce((sum, r) => sum + r.paid_amount, 0))}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase">
                  <th className="py-3 px-4">Salary ID</th>
                  <th className="py-3 px-4">Employee Name</th>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4 text-right">Net Amount</th>
                  <th className="py-3 px-4 text-center">Payment Date</th>
                  <th className="py-3 px-4 text-center">Method</th>
                  <th className="py-3 px-4">UTR / Ref Number</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800/60">
                {filteredPayrollRecords
                  .filter(r => r.payment_status === 'Paid')
                  .map(r => (
                    <tr key={r.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20">
                      <td className="py-3 px-4 font-mono font-bold text-purple-600">{r.salary_id}</td>
                      <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">{r.employee_name}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">{r.month}</td>
                      <td className="py-3 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400">{formatCur(r.net_salary)}</td>
                      <td className="py-3 px-4 text-center font-mono text-zinc-500">{r.payment_date || '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-[11px]">
                          {r.payment_method || 'Bank Transfer'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-500 text-[11px]">{r.reference_no || '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                          Disbursed
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAYROLL REPORT 4: PENDING SALARY REPORT */}
      {activeSection === 'pending-salary' && (
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center bg-rose-50/50 dark:bg-rose-950/20">
            <div>
              <h3 className="text-sm font-bold text-rose-900 dark:text-rose-300">Outstanding Unpaid Salaries Queue</h3>
              <p className="text-xs text-rose-700 dark:text-rose-400">Salaries processed and approved awaiting fund disbursement.</p>
            </div>
            <span className="text-xs font-mono font-bold text-rose-600">
              Total Outstanding: {formatCur(filteredPayrollRecords.filter(r => r.payment_status === 'Pending').reduce((sum, r) => sum + r.balance_amount, 0))}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase">
                  <th className="py-3 px-4">Emp Code</th>
                  <th className="py-3 px-4">Employee Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4 text-right">Gross Salary</th>
                  <th className="py-3 px-4 text-right">Deductions</th>
                  <th className="py-3 px-4 text-right">Net Payable</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800/60">
                {filteredPayrollRecords
                  .filter(r => r.payment_status === 'Pending')
                  .map(r => (
                    <tr key={r.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20">
                      <td className="py-3 px-4 font-mono font-bold text-rose-600">{r.employee_code}</td>
                      <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">{r.employee_name}</td>
                      <td className="py-3 px-4 text-zinc-500">{r.department}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">{r.month}</td>
                      <td className="py-3 px-4 text-right font-medium text-zinc-700 dark:text-zinc-300">{formatCur(r.gross_salary)}</td>
                      <td className="py-3 px-4 text-right text-rose-500">-{formatCur(r.total_deductions)}</td>
                      <td className="py-3 px-4 text-right font-bold text-zinc-900 dark:text-zinc-100">{formatCur(r.net_salary)}</td>
                      <td className="py-3 px-4 text-right font-extrabold text-rose-600 dark:text-rose-400">{formatCur(r.balance_amount)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600">
                          Pending Payment
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAYROLL REPORT 5: SALARY ADVANCE REPORT */}
      {activeSection === 'salary-advance' && (
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Employee Salary Advances & Recovery Schedule</h3>
              <p className="text-xs text-zinc-500">Advances issued against future earnings and month-wise recovery status.</p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-600">
              Outstanding Advances: {formatCur(payrollAdvances.reduce((sum, a) => sum + a.balance_amount, 0))}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase">
                  <th className="py-3 px-4">Emp Code</th>
                  <th className="py-3 px-4">Employee Name</th>
                  <th className="py-3 px-4 text-center">Advance Date</th>
                  <th className="py-3 px-4 text-right">Advance Amount</th>
                  <th className="py-3 px-4 text-right">Recovered</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-center">Recovery Month</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800/60">
                {payrollAdvances
                  .filter(a => {
                    const matchSearch = a.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) || a.employee_code.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchEmp = pEmpFilter === 'All' || a.employee_name === pEmpFilter;
                    return matchSearch && matchEmp;
                  })
                  .map(a => (
                    <tr key={a.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20">
                      <td className="py-3 px-4 font-mono font-bold text-purple-600">{a.employee_code}</td>
                      <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">{a.employee_name}</td>
                      <td className="py-3 px-4 text-center font-mono text-[11px] text-zinc-400">{a.date}</td>
                      <td className="py-3 px-4 text-right font-medium text-zinc-900 dark:text-zinc-100">{formatCur(a.advance_amount)}</td>
                      <td className="py-3 px-4 text-right text-emerald-600">{formatCur(a.recovered_amount)}</td>
                      <td className="py-3 px-4 text-right font-extrabold text-amber-600">{formatCur(a.balance_amount)}</td>
                      <td className="py-3 px-4 text-center font-mono text-[11px] text-zinc-500">{a.recovery_month}</td>
                      <td className="py-3 px-4 text-zinc-500 max-w-[200px] truncate">{a.reason}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          a.status === 'Deducted'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAYROLL REPORT 6: DEDUCTION REPORT */}
      {activeSection === 'deduction-report' && (
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Staff Deductions & Penalties Audit</h3>
              <p className="text-xs text-zinc-500">Unpaid leaves, late arrival penalties, advance recovery, and other statutory withholdings.</p>
            </div>
            <span className="text-xs font-mono font-bold text-rose-600">
              Total Withheld: {formatCur(filteredPayrollRecords.reduce((sum, r) => sum + r.total_deductions, 0))}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase">
                  <th className="py-3 px-4">Emp Code</th>
                  <th className="py-3 px-4">Employee Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4 text-right">Leave Deduction</th>
                  <th className="py-3 px-4 text-right">Late Penalty</th>
                  <th className="py-3 px-4 text-right">Advance Recovery</th>
                  <th className="py-3 px-4 text-right">Other Deductions</th>
                  <th className="py-3 px-4 text-right font-bold">Total Deductions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800/60">
                {filteredPayrollRecords.map(r => (
                  <tr key={r.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20">
                    <td className="py-3 px-4 font-mono font-bold text-purple-600">{r.employee_code}</td>
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">{r.employee_name}</td>
                    <td className="py-3 px-4 text-zinc-500">{r.department}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">{r.month}</td>
                    <td className="py-3 px-4 text-right text-zinc-600 dark:text-zinc-400">{formatCur(r.leave_deductions)}</td>
                    <td className="py-3 px-4 text-right text-zinc-600 dark:text-zinc-400">{formatCur(r.late_deductions)}</td>
                    <td className="py-3 px-4 text-right text-amber-600">{formatCur(r.advance_recovery)}</td>
                    <td className="py-3 px-4 text-right text-zinc-600 dark:text-zinc-400">{formatCur(r.other_deductions)}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-rose-600 dark:text-rose-400">{formatCur(r.total_deductions)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAYROLL REPORT 7: DEPARTMENT-WISE PAYROLL */}
      {activeSection === 'department-payroll' && (
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Department-wise Payroll Cost Allocation</h3>
              <p className="text-xs text-zinc-500">Breakdown of gross salary commitments, deductions, and average cost per department.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase">
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-center">Active Staff</th>
                  <th className="py-3 px-4 text-right">Monthly Gross Payroll</th>
                  <th className="py-3 px-4 text-right">Total Deductions</th>
                  <th className="py-3 px-4 text-right">Net Payable</th>
                  <th className="py-3 px-4 text-right">Avg Salary / Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800/60">
                {['Sales', 'Accounts', 'Store', 'Administration', 'Purchase', 'Management'].map(dept => {
                  const deptRecs = payrollRecords.filter(r => r.department === dept && r.month === 'September 2026');
                  const count = deptRecs.length;
                  const gross = deptRecs.reduce((sum, r) => sum + r.gross_salary, 0);
                  const ded = deptRecs.reduce((sum, r) => sum + r.total_deductions, 0);
                  const net = deptRecs.reduce((sum, r) => sum + r.net_salary, 0);
                  const avg = count > 0 ? net / count : 0;
                  return (
                    <tr key={dept} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20">
                      <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">{dept}</td>
                      <td className="py-3 px-4 text-center font-bold text-purple-600">{count} Staff</td>
                      <td className="py-3 px-4 text-right font-medium text-zinc-900 dark:text-zinc-100">{formatCur(gross)}</td>
                      <td className="py-3 px-4 text-right text-rose-500">-{formatCur(ded)}</td>
                      <td className="py-3 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400">{formatCur(net)}</td>
                      <td className="py-3 px-4 text-right font-mono text-zinc-500">{formatCur(avg)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAYROLL REPORT 8: YEARLY PAYROLL SUMMARY */}
      {activeSection === 'yearly-payroll' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4.5 shadow-sm">
              <span className="text-[11px] font-bold text-zinc-400 uppercase">Quarterly Gross Processed</span>
              <h3 className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">{formatCur(1095000)}</h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">July - September 2026</p>
            </div>
            <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4.5 shadow-sm">
              <span className="text-[11px] font-bold text-zinc-400 uppercase">Quarterly Disbursed</span>
              <h3 className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{formatCur(995000)}</h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">Paid via Bank / Cash / UPI</p>
            </div>
            <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4.5 shadow-sm">
              <span className="text-[11px] font-bold text-zinc-400 uppercase">Pending Current Balance</span>
              <h3 className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">{formatCur(60000)}</h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">September unpaid salaries</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Yearly & Quarterly Payroll Progression</h3>
                <p className="text-xs text-zinc-500">Historical trend across payroll cycles in Financial Year 2026.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50/50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase">
                    <th className="py-3 px-4">Payroll Cycle</th>
                    <th className="py-3 px-4 text-center">Year</th>
                    <th className="py-3 px-4 text-center">Processed Headcount</th>
                    <th className="py-3 px-4 text-right">Total Gross Committed</th>
                    <th className="py-3 px-4 text-right">Total Disbursed</th>
                    <th className="py-3 px-4 text-right">Pending Balance</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800/60">
                  <tr className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20">
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">September 2026</td>
                    <td className="py-3 px-4 text-center font-mono">2026</td>
                    <td className="py-3 px-4 text-center font-bold text-purple-600">12 Staff</td>
                    <td className="py-3 px-4 text-right font-medium text-zinc-900 dark:text-zinc-100">{formatCur(385000)}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">{formatCur(285000)}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-rose-600">{formatCur(60000)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600">
                        Partially Paid
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20">
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">August 2026</td>
                    <td className="py-3 px-4 text-center font-mono">2026</td>
                    <td className="py-3 px-4 text-center font-bold text-purple-600">12 Staff</td>
                    <td className="py-3 px-4 text-right font-medium text-zinc-900 dark:text-zinc-100">{formatCur(360000)}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">{formatCur(360000)}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-zinc-400">₹0</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                        Fully Paid
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20">
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">July 2026</td>
                    <td className="py-3 px-4 text-center font-mono">2026</td>
                    <td className="py-3 px-4 text-center font-bold text-purple-600">12 Staff</td>
                    <td className="py-3 px-4 text-right font-medium text-zinc-900 dark:text-zinc-100">{formatCur(350000)}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">{formatCur(350000)}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-zinc-400">₹0</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                        Fully Paid
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
