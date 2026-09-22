import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Printer, 
  Download, 
  CreditCard, 
  FileText, 
  Calculator, 
  Trash2, 
  Edit, 
  Eye, 
  TrendingUp, 
  UserPlus, 
  Banknote,
  ShieldCheck,
  Info
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import api from '../utils/api';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { exportToCSV } from '../utils/export';

interface EmployeeItem {
  id: number;
  emp_id: string;
  name: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  email: string;
  address: string;
  joining_date: string;
  department: 'Sales' | 'Accounts' | 'Store' | 'Administration' | 'Purchase' | 'Management';
  designation: string;
  employment_type: 'Full Time' | 'Part Time' | 'Temporary';
  salary_type: 'Monthly' | 'Daily' | 'Hourly';
  basic_salary: number;
  hra: number;
  travel_allowance: number;
  food_allowance: number;
  performance_bonus: number;
  other_allowance: number;
  overtime_rate: number;
  late_deduction: number;
  leave_deduction: number;
  other_deduction: number;
  bank_name: string;
  account_holder: string;
  account_number: string;
  masked_account: string;
  ifsc: string;
  status: 'Active' | 'Inactive';
}

interface PayrollRecordItem {
  id: number;
  salary_id: string;
  employee_id: number;
  employee_name: string;
  employee_code: string;
  department: string;
  designation: string;
  month: string;
  year: number;
  month_num: number;
  basic_salary: number;
  hra: number;
  travel_allowance: number;
  food_allowance: number;
  performance_bonus: number;
  other_allowance: number;
  overtime_amount: number;
  total_allowances: number;
  gross_salary: number;
  leave_deductions: number;
  late_deductions: number;
  loan_deductions: number;
  advance_recovery: number;
  other_deductions: number;
  total_deductions: number;
  net_salary: number;
  paid_amount: number;
  balance_amount: number;
  payment_status: 'Paid' | 'Pending' | 'Partially Paid';
  payment_date?: string;
  payment_method?: 'Cash' | 'UPI' | 'Bank Transfer';
  reference_no?: string;
  remarks?: string;
}

interface SalaryAdvanceItem {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_code: string;
  date: string;
  advance_amount: number;
  recovered_amount: number;
  balance_amount: number;
  reason: string;
  recovery_month: string;
  status: 'Pending' | 'Partially Recovered' | 'Fully Recovered';
}

interface DashboardData {
  totalEmployees: number;
  monthlyPayroll: number;
  salaryPaid: number;
  salaryPending: number;
  totalAdvances: number;
  totalDeductions: number;
  trendData: Array<{ month: string; payroll: number; paid: number; pending: number }>;
  upcomingPayments: PayrollRecordItem[];
  recentlyPaid: PayrollRecordItem[];
  pendingSalaries: PayrollRecordItem[];
}

const DEPARTMENTS = ['Sales', 'Accounts', 'Store', 'Administration', 'Purchase', 'Management'] as const;
const MONTHS_LIST = ['September 2026', 'August 2026', 'July 2026'];

const SalaryPayroll: React.FC = () => {
  const { showToast } = useToast();

  // Tab Navigation: 'dashboard' | 'employees' | 'monthly' | 'advances' | 'history'
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'employees' | 'monthly' | 'advances' | 'history'>('dashboard');

  // Loading & Data States
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecordItem[]>([]);
  const [advances, setAdvances] = useState<SalaryAdvanceItem[]>([]);

  // Period / Filter States
  const [selectedMonth, setSelectedMonth] = useState('September 2026');
  const [deptFilter, setDeptFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isEditEmployeeModalOpen, setIsEditEmployeeModalOpen] = useState(false);
  const [isViewEmployeeModalOpen, setIsViewEmployeeModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeItem | null>(null);

  const [isCalculationModalOpen, setIsCalculationModalOpen] = useState(false);
  const [calculationRecord, setCalculationRecord] = useState<PayrollRecordItem | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentRecord, setPaymentRecord] = useState<PayrollRecordItem | null>(null);
  const [payMethod, setPayMethod] = useState<'Cash' | 'UPI' | 'Bank Transfer'>('Bank Transfer');
  const [payDate, setPayDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [payRefNo, setPayRefNo] = useState('');
  const [payRemarks, setPayRemarks] = useState('');

  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
  const [slipRecord, setSlipRecord] = useState<PayrollRecordItem | null>(null);

  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [advanceEmpId, setAdvanceEmpId] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceReason, setAdvanceReason] = useState('');
  const [advanceRecoveryMonth, setAdvanceRecoveryMonth] = useState('October 2026');

  // Add / Edit Employee Form State
  const [empForm, setEmpForm] = useState({
    name: '',
    dob: '1995-05-15',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    mobile: '',
    email: '',
    address: '',
    joining_date: () => new Date().toISOString().split('T')[0],
    department: 'Sales' as typeof DEPARTMENTS[number],
    designation: '',
    employment_type: 'Full Time' as 'Full Time' | 'Part Time' | 'Temporary',
    salary_type: 'Monthly' as 'Monthly' | 'Daily' | 'Hourly',
    basic_salary: '',
    hra: '',
    travel_allowance: '',
    food_allowance: '',
    performance_bonus: '',
    other_allowance: '',
    overtime_rate: '150',
    late_deduction: '0',
    leave_deduction: '0',
    other_deduction: '0',
    bank_name: 'HDFC Bank',
    account_holder: '',
    account_number: '',
    ifsc: 'HDFC0001234'
  });

  // Fetch initial data
  useEffect(() => {
    loadAllData();
  }, [selectedMonth]);

  const loadAllData = async () => {
    try {
      const [dashRes, empRes, payRes, advRes] = await Promise.all([
        api.get(`/payroll/dashboard?month=${encodeURIComponent(selectedMonth)}`),
        api.get('/employees'),
        api.get(`/payroll/monthly?month=${encodeURIComponent(selectedMonth)}`),
        api.get('/payroll/advances')
      ]);

      setDashboardData(dashRes.data);
      setEmployees(empRes.data);
      setPayrollRecords(payRes.data);
      setAdvances(advRes.data);
    } catch (err) {
      console.error('Failed to load payroll data:', err);
      showToast('Error loading payroll records', 'error');
    }
  };

  const formatCur = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
      const matchesSearch = 
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.emp_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.mobile.includes(searchQuery);
      return matchesDept && matchesSearch;
    });
  }, [employees, deptFilter, searchQuery]);

  // Filtered payroll history
  const filteredHistory = useMemo(() => {
    return payrollRecords.filter(rec => {
      const matchesMonth = selectedMonth === 'All' || rec.month === selectedMonth;
      const matchesStatus = statusFilter === 'All' || rec.payment_status === statusFilter;
      const matchesSearch = 
        rec.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.employee_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.department.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesMonth && matchesStatus && matchesSearch;
    });
  }, [payrollRecords, selectedMonth, statusFilter, searchQuery]);

  // Open Add Employee Modal
  const handleOpenAddEmployee = () => {
    setEmpForm({
      name: '',
      dob: '1995-05-15',
      gender: 'Male',
      mobile: '',
      email: '',
      address: 'Bengaluru, Karnataka',
      joining_date: () => new Date().toISOString().split('T')[0],
      department: 'Sales',
      designation: 'Sales Executive',
      employment_type: 'Full Time',
      salary_type: 'Monthly',
      basic_salary: '22000',
      hra: '2000',
      travel_allowance: '1000',
      food_allowance: '500',
      performance_bonus: '0',
      other_allowance: '0',
      overtime_rate: '150',
      late_deduction: '0',
      leave_deduction: '0',
      other_deduction: '0',
      bank_name: 'HDFC Bank',
      account_holder: '',
      account_number: '',
      ifsc: 'HDFC0001234'
    });
    setIsAddEmployeeModalOpen(true);
  };

  // Submit Add Employee
  const handleSaveNewEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empForm.name.trim() || !empForm.mobile.trim()) {
      showToast('Name and mobile number are required', 'error');
      return;
    }
    if (!empForm.account_number.trim()) {
      showToast('Bank account number is required', 'error');
      return;
    }

    try {
      const payload = {
        ...empForm,
        joining_date: typeof empForm.joining_date === 'function' ? empForm.joining_date() : empForm.joining_date,
        basic_salary: Number(empForm.basic_salary) || 20000,
        hra: Number(empForm.hra) || 0,
        travel_allowance: Number(empForm.travel_allowance) || 0,
        food_allowance: Number(empForm.food_allowance) || 0,
        performance_bonus: Number(empForm.performance_bonus) || 0,
        other_allowance: Number(empForm.other_allowance) || 0,
        overtime_rate: Number(empForm.overtime_rate) || 100,
        late_deduction: Number(empForm.late_deduction) || 0,
        leave_deduction: Number(empForm.leave_deduction) || 0,
        other_deduction: Number(empForm.other_deduction) || 0,
        account_holder: empForm.account_holder || empForm.name
      };

      const res = await api.post('/employees', payload);
      setEmployees(prev => [...prev, res.data]);
      setIsAddEmployeeModalOpen(false);
      showToast(`Employee ${res.data.name} created successfully`, 'success');
      loadAllData();
    } catch (err) {
      console.error(err);
      showToast('Failed to add employee profile', 'error');
    }
  };

  // Edit Employee
  const handleOpenEditEmployee = (emp: EmployeeItem) => {
    setSelectedEmployee(emp);
    setEmpForm({
      name: emp.name,
      dob: emp.dob,
      gender: emp.gender,
      mobile: emp.mobile,
      email: emp.email,
      address: emp.address,
      joining_date: () => emp.joining_date,
      department: emp.department,
      designation: emp.designation,
      employment_type: emp.employment_type,
      salary_type: emp.salary_type,
      basic_salary: String(emp.basic_salary),
      hra: String(emp.hra),
      travel_allowance: String(emp.travel_allowance),
      food_allowance: String(emp.food_allowance),
      performance_bonus: String(emp.performance_bonus),
      other_allowance: String(emp.other_allowance),
      overtime_rate: String(emp.overtime_rate),
      late_deduction: String(emp.late_deduction),
      leave_deduction: String(emp.leave_deduction),
      other_deduction: String(emp.other_deduction),
      bank_name: emp.bank_name,
      account_holder: emp.account_holder,
      account_number: emp.account_number,
      ifsc: emp.ifsc
    });
    setIsEditEmployeeModalOpen(true);
  };

  // Save Edit Employee
  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      const payload = {
        ...empForm,
        joining_date: typeof empForm.joining_date === 'function' ? empForm.joining_date() : empForm.joining_date,
        basic_salary: Number(empForm.basic_salary) || 20000,
        hra: Number(empForm.hra) || 0,
        travel_allowance: Number(empForm.travel_allowance) || 0,
        food_allowance: Number(empForm.food_allowance) || 0,
        performance_bonus: Number(empForm.performance_bonus) || 0,
        other_allowance: Number(empForm.other_allowance) || 0,
        overtime_rate: Number(empForm.overtime_rate) || 100,
        late_deduction: Number(empForm.late_deduction) || 0,
        leave_deduction: Number(empForm.leave_deduction) || 0,
        other_deduction: Number(empForm.other_deduction) || 0
      };

      const res = await api.put(`/employees/${selectedEmployee.id}`, payload);
      setEmployees(prev => prev.map(e => e.id === selectedEmployee.id ? res.data : e));
      setIsEditEmployeeModalOpen(false);
      showToast(`Updated employee ${res.data.name}`, 'success');
      loadAllData();
    } catch (err) {
      console.error(err);
      showToast('Failed to update employee', 'error');
    }
  };

  // Delete Employee
  const handleDeleteEmployee = async (empId: number, name: string) => {
    if (!window.confirm(`Are you sure you want to remove employee ${name}?`)) return;
    try {
      await api.delete(`/employees/${empId}`);
      setEmployees(prev => prev.filter(e => e.id !== empId));
      showToast(`Removed employee ${name}`, 'warning');
      loadAllData();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete employee', 'error');
    }
  };

  // Process Payroll for month
  const handleProcessPayroll = async () => {
    try {
      const res = await api.post('/payroll/process', {
        month: selectedMonth,
        year: 2026
      });
      showToast(`Payroll processed successfully for ${selectedMonth}! (${res.data.count} entries)`, 'success');
      loadAllData();
    } catch (err) {
      console.error(err);
      showToast('Failed to process payroll', 'error');
    }
  };

  // Open Salary Payment Modal
  const handleOpenPayment = (rec: PayrollRecordItem) => {
    setPaymentRecord(rec);
    setPayMethod('Bank Transfer');
    setPayDate(new Date().toISOString().split('T')[0]);
    setPayRefNo(`SAL-${Date.now().toString().slice(-6)}`);
    setPayRemarks(`Salary disbursement for ${rec.month} to ${rec.employee_name}`);
    setIsPaymentModalOpen(true);
  };

  // Execute Salary Payment (propagates to Expenses and Banking)
  const handleConfirmSalaryPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentRecord) return;

    try {
      await api.post('/payroll/pay', {
        salary_id: paymentRecord.id,
        payment_method: payMethod,
        payment_date: payDate,
        reference_no: payRefNo,
        remarks: payRemarks
      });

      showToast(`Marked salary as PAID for ${paymentRecord.employee_name} (${formatCur(paymentRecord.net_salary)})`, 'success');
      setIsPaymentModalOpen(false);
      loadAllData();
    } catch (err) {
      console.error(err);
      showToast('Failed to record salary payment', 'error');
    }
  };

  // Issue Salary Advance
  const handleSaveAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advanceEmpId || !advanceAmount) {
      showToast('Employee and advance amount are required', 'error');
      return;
    }

    try {
      await api.post('/payroll/advances', {
        employee_id: advanceEmpId,
        advance_amount: advanceAmount,
        reason: advanceReason || 'Personal advance',
        recovery_month: advanceRecoveryMonth,
        date: new Date().toISOString().split('T')[0]
      });

      showToast('Salary advance issued successfully', 'success');
      setIsAdvanceModalOpen(false);
      setAdvanceEmpId('');
      setAdvanceAmount('');
      setAdvanceReason('');
      loadAllData();
    } catch (err) {
      console.error(err);
      showToast('Failed to issue salary advance', 'error');
    }
  };

  // Download Salary Slip as PDF
  const handleDownloadSalarySlipPDF = (rec: PayrollRecordItem) => {
    try {
      const doc = new jsPDF();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('SHOPMANAGER ERP', 105, 18, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Sri Murugan Traders & Retailers', 105, 25, { align: 'center' });
      doc.text('Brigade Road, Commercial Area, Bengaluru - 560001 | GSTIN: 29ABCDE1234F1Z5', 105, 30, { align: 'center' });

      doc.setDrawColor(200, 200, 200);
      doc.line(14, 34, 196, 34);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(`PAYSLIP FOR ${rec.month.toUpperCase()}`, 105, 42, { align: 'center' });

      // Employee Details Grid
      autoTable(doc, {
        startY: 48,
        head: [['Employee Information', 'Employment Details']],
        body: [
          [`Employee Name: ${rec.employee_name}`, `Employee ID: ${rec.employee_code}`],
          [`Department: ${rec.department}`, `Designation: ${rec.designation}`],
          [`Payment Status: ${rec.payment_status}`, `Disbursement Date: ${rec.payment_date || 'Pending'}`],
          [`Payment Method: ${rec.payment_method || 'N/A'}`, `Reference No: ${rec.reference_no || 'N/A'}`]
        ],
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2.5 }
      });

      // Earnings vs Deductions Table
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 4,
        head: [['Earnings', 'Amount (INR)', 'Deductions', 'Amount (INR)']],
        body: [
          ['Basic Salary', `INR ${rec.basic_salary.toLocaleString('en-IN')}`, 'Leave Deduction', `INR ${rec.leave_deductions.toLocaleString('en-IN')}`],
          ['House Rent Allowance (HRA)', `INR ${rec.hra.toLocaleString('en-IN')}`, 'Late Deduction', `INR ${rec.late_deductions.toLocaleString('en-IN')}`],
          ['Travel Allowance', `INR ${rec.travel_allowance.toLocaleString('en-IN')}`, 'Advance Recovery', `INR ${rec.advance_recovery.toLocaleString('en-IN')}`],
          ['Food Allowance', `INR ${rec.food_allowance.toLocaleString('en-IN')}`, 'Other Deductions', `INR ${rec.other_deductions.toLocaleString('en-IN')}`],
          ['Performance Bonus', `INR ${rec.performance_bonus.toLocaleString('en-IN')}`, '-', '-'],
          ['Overtime Pay', `INR ${rec.overtime_amount.toLocaleString('en-IN')}`, '-', '-'],
          [
            { content: 'Gross Earnings', styles: { fontStyle: 'bold' } },
            { content: `INR ${rec.gross_salary.toLocaleString('en-IN')}`, styles: { fontStyle: 'bold' } },
            { content: 'Total Deductions', styles: { fontStyle: 'bold' } },
            { content: `INR ${rec.total_deductions.toLocaleString('en-IN')}`, styles: { fontStyle: 'bold' } }
          ]
        ],
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255] },
        styles: { fontSize: 9, cellPadding: 3 }
      });

      // Net Pay Box
      const finalY = (doc as any).lastAutoTable.finalY + 6;
      doc.setFillColor(243, 244, 246);
      doc.rect(14, finalY, 182, 18, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`NET PAYABLE SALARY: INR ${rec.net_salary.toLocaleString('en-IN')}`, 20, finalY + 11);

      // Signatures
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Employer Signature: __________________', 20, finalY + 40);
      doc.text('Employee Signature: __________________', 130, finalY + 40);

      doc.save(`Salary_Slip_${rec.employee_code}_${rec.month.replace(' ', '_')}.pdf`);
      showToast('Salary slip PDF downloaded successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to generate salary slip PDF', 'error');
    }
  };

  // Export Table to CSV
  const handleExportPayrollCSV = () => {
    const headers = [
      'Salary ID',
      'Employee Code',
      'Employee Name',
      'Department',
      'Designation',
      'Month',
      'Basic Salary',
      'Allowances',
      'Overtime',
      'Gross Salary',
      'Deductions',
      'Advance Recovery',
      'Net Salary',
      'Payment Status',
      'Payment Method',
      'Reference No'
    ];
    const rows = filteredHistory.map(r => [
      r.salary_id,
      r.employee_code,
      r.employee_name,
      r.department,
      r.designation,
      r.month,
      r.basic_salary,
      r.total_allowances,
      r.overtime_amount,
      r.gross_salary,
      r.total_deductions,
      r.advance_recovery,
      r.net_salary,
      r.payment_status,
      r.payment_method || '-',
      r.reference_no || '-'
    ]);
    exportToCSV(`Payroll_Report_${selectedMonth.replace(/\s+/g, '_')}`, headers, rows);
    showToast('Payroll data exported to CSV', 'success');
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto select-none">
      {/* Top Header & Sub-Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <Banknote className="w-4 h-4" />
            <span>Human Resources & Payroll</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
            Salary / Payroll Management
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage employee profiles, monthly payroll calculation, advances, salary disbursements, and tax slips.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 cursor-pointer shadow-sm"
          >
            {MONTHS_LIST.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <button
            onClick={handleProcessPayroll}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5" />
            Process Payroll
          </button>

          <button
            onClick={handleOpenAddEmployee}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-zinc-100 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'dashboard'
              ? 'bg-white dark:bg-[#0c0c0f] text-indigo-600 dark:text-indigo-400 shadow-sm border border-zinc-200 dark:border-zinc-800'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Payroll Dashboard</span>
        </button>

        <button
          onClick={() => setActiveSubTab('employees')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'employees'
              ? 'bg-white dark:bg-[#0c0c0f] text-indigo-600 dark:text-indigo-400 shadow-sm border border-zinc-200 dark:border-zinc-800'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Employees Directory ({employees.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('monthly')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'monthly'
              ? 'bg-white dark:bg-[#0c0c0f] text-indigo-600 dark:text-indigo-400 shadow-sm border border-zinc-200 dark:border-zinc-800'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Monthly Payroll Calculation</span>
        </button>

        <button
          onClick={() => setActiveSubTab('advances')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'advances'
              ? 'bg-white dark:bg-[#0c0c0f] text-indigo-600 dark:text-indigo-400 shadow-sm border border-zinc-200 dark:border-zinc-800'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Salary Advances</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'history'
              ? 'bg-white dark:bg-[#0c0c0f] text-indigo-600 dark:text-indigo-400 shadow-sm border border-zinc-200 dark:border-zinc-800'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Salary History & Slips</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. PAYROLL DASHBOARD TAB                                                 */}
      {/* ========================================================================= */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Summary KPI Cards (6 items as requested) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* 1. Total Employees */}
            <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Total Staff
                </span>
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-2">
                {dashboardData?.totalEmployees || 12}
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1">Active retail workforce</p>
            </div>

            {/* 2. Monthly Payroll */}
            <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Monthly Payroll
                </span>
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400">
                  <Banknote className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-2">
                {formatCur(dashboardData?.monthlyPayroll || 345000)}
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1">{selectedMonth}</p>
            </div>

            {/* 3. Salary Paid */}
            <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Salary Paid
                </span>
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                {formatCur(dashboardData?.salaryPaid || 285000)}
              </h3>
              <p className="text-[11px] text-emerald-500 mt-1">Disbursed successfully</p>
            </div>

            {/* 4. Salary Pending */}
            <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Salary Pending
                </span>
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">
                {formatCur(dashboardData?.salaryPending || 60000)}
              </h3>
              <p className="text-[11px] text-rose-400 mt-1">Awaiting disbursement</p>
            </div>

            {/* 5. Total Advances */}
            <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Total Advances
                </span>
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-2">
                {formatCur(dashboardData?.totalAdvances || 25000)}
              </h3>
              <p className="text-[11px] text-amber-500 mt-1">Outstanding advances</p>
            </div>

            {/* 6. Total Deductions */}
            <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Total Deductions
                </span>
                <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-2">
                {formatCur(dashboardData?.totalDeductions || 18500)}
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1">Recoveries & Leaves</p>
            </div>
          </div>

          {/* Monthly Payroll Trend Chart */}
          <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Quarterly Payroll Trend (July - September 2026)
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Gross monthly payroll liabilities vs actual paid amounts across quarters
                </p>
              </div>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/30">
                INR Currency
              </span>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData?.trendData || []}>
                  <defs>
                    <linearGradient id="payrollGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="paidGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} />
                  <Tooltip 
                    formatter={(val: any) => [formatCur(Number(val)), '']}
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="payroll" stroke="#6366f1" fillOpacity={1} fill="url(#payrollGrad)" name="Total Payroll Liability" strokeWidth={2} />
                  <Area type="monotone" dataKey="paid" stroke="#10b981" fillOpacity={1} fill="url(#paidGrad)" name="Disbursed Salary" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3 Activity Sections: Upcoming, Recently Paid, Pending */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Salary Payments */}
            <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    Upcoming Payments
                  </h4>
                </div>
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                  {dashboardData?.upcomingPayments.length || 0} Queued
                </span>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 mt-2">
                {dashboardData?.upcomingPayments.map(item => (
                  <div key={item.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {item.employee_name}
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        {item.designation} • {item.department}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                        {formatCur(item.net_salary)}
                      </p>
                      <button
                        onClick={() => handleOpenPayment(item)}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 underline cursor-pointer"
                      >
                        Disburse
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recently Paid Salaries */}
            <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    Recently Paid Salaries
                  </h4>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {dashboardData?.recentlyPaid.length || 0} Disbursed
                </span>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 mt-2">
                {dashboardData?.recentlyPaid.map(item => (
                  <div key={item.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {item.employee_name}
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        {item.payment_method} • {item.payment_date || 'Paid'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatCur(item.paid_amount)}
                      </p>
                      <button
                        onClick={() => {
                          setSlipRecord(item);
                          setIsSlipModalOpen(true);
                        }}
                        className="text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 cursor-pointer"
                      >
                        View Slip
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Salaries */}
            <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    Pending Salaries
                  </h4>
                </div>
                <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                  {dashboardData?.pendingSalaries.length || 0} Pending
                </span>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 mt-2">
                {dashboardData?.pendingSalaries.map(item => (
                  <div key={item.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {item.employee_name}
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        Net: {formatCur(item.net_salary)}
                      </p>
                    </div>
                    <div className="text-right">
                      <button
                        onClick={() => handleOpenPayment(item)}
                        className="px-2.5 py-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all cursor-pointer"
                      >
                        Pay Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. EMPLOYEES DIRECTORY TAB                                                */}
      {/* ========================================================================= */}
      {activeSubTab === 'employees' && (
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search staff by name, ID, or mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-zinc-400" />
              <span className="text-xs text-zinc-400">Department:</span>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 cursor-pointer"
              >
                <option value="All">All Departments</option>
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Employees Table */}
          <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-semibold">
                    <th className="py-3 px-4">Employee ID</th>
                    <th className="py-3 px-4">Employee Name</th>
                    <th className="py-3 px-4">Department & Role</th>
                    <th className="py-3 px-4">Mobile</th>
                    <th className="py-3 px-4">Joining Date</th>
                    <th className="py-3 px-4">Salary Type</th>
                    <th className="py-3 px-4 text-right">Basic Salary</th>
                    <th className="py-3 px-4">Masked Bank A/C</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                  {filteredEmployees.map(emp => (
                    <tr key={emp.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {emp.emp_id}
                      </td>
                      <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                        {emp.name}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-zinc-800 dark:text-zinc-200">{emp.designation}</div>
                        <div className="text-[10px] text-zinc-400">{emp.department}</div>
                      </td>
                      <td className="py-3 px-4 font-mono">{emp.mobile}</td>
                      <td className="py-3 px-4">{emp.joining_date}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                          {emp.salary_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-zinc-900 dark:text-zinc-100">
                        {formatCur(emp.basic_salary)}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">
                        {emp.masked_account}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          emp.status === 'Active'
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedEmployee(emp);
                              setIsViewEmployeeModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-indigo-400 cursor-pointer"
                            title="View Profile & Salary Structure"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditEmployee(emp)}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 cursor-pointer"
                            title="Edit Employee"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 cursor-pointer"
                            title="Delete Employee"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MONTHLY PAYROLL CALCULATION TAB                                       */}
      {/* ========================================================================= */}
      {activeSubTab === 'monthly' && (
        <div className="space-y-4">
          {/* Header Action Bar with Formula Highlight */}
          <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shrink-0">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Automatic Payroll Calculation Formula
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">Gross</span> = Basic + HRA + Allowances + Overtime • <span className="font-semibold text-rose-600 dark:text-rose-400">Net</span> = Gross - Deductions - Advance Recovery
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPayrollCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
              <button
                onClick={handleProcessPayroll}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5" />
                Recalculate Month
              </button>
            </div>
          </div>

          {/* Payroll Calculation Table */}
          <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-semibold">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4 text-right">Basic</th>
                    <th className="py-3 px-4 text-right">Allowances</th>
                    <th className="py-3 px-4 text-right">Overtime</th>
                    <th className="py-3 px-4 text-right font-bold text-indigo-600 dark:text-indigo-400">Gross Salary</th>
                    <th className="py-3 px-4 text-right text-rose-500">Deductions</th>
                    <th className="py-3 px-4 text-right text-amber-500">Advance Rec.</th>
                    <th className="py-3 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400">Net Salary</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                  {payrollRecords.map(rec => (
                    <tr key={rec.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100">{rec.employee_name}</div>
                        <div className="text-[10px] text-zinc-400">{rec.employee_code} • {rec.department}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono">{formatCur(rec.basic_salary)}</td>
                      <td className="py-3 px-4 text-right font-mono text-indigo-500">+{formatCur(rec.total_allowances)}</td>
                      <td className="py-3 px-4 text-right font-mono text-zinc-400">+{formatCur(rec.overtime_amount)}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {formatCur(rec.gross_salary)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-rose-500">-{formatCur(rec.total_deductions - rec.advance_recovery)}</td>
                      <td className="py-3 px-4 text-right font-mono text-amber-500">-{formatCur(rec.advance_recovery)}</td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatCur(rec.net_salary)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.payment_status === 'Paid'
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                        }`}>
                          {rec.payment_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setCalculationRecord(rec);
                              setIsCalculationModalOpen(true);
                            }}
                            className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-indigo-400 cursor-pointer"
                            title="Calculation Breakdown"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                          </button>

                          {rec.payment_status === 'Pending' ? (
                            <button
                              onClick={() => handleOpenPayment(rec)}
                              className="px-2.5 py-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all cursor-pointer shadow-sm"
                            >
                              Disburse
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSlipRecord(rec);
                                setIsSlipModalOpen(true);
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-all cursor-pointer"
                            >
                              Slip
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SALARY ADVANCES TAB                                                   */}
      {/* ========================================================================= */}
      {activeSubTab === 'advances' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Staff Salary Advance Tracker
              </h3>
              <p className="text-xs text-zinc-400">
                Record advances and track systematic monthly payroll recovery
              </p>
            </div>
            <button
              onClick={() => setIsAdvanceModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Issue Advance
            </button>
          </div>

          <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-semibold">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Date Issued</th>
                  <th className="py-3 px-4 text-right">Advance Amount</th>
                  <th className="py-3 px-4 text-right text-emerald-500">Recovered</th>
                  <th className="py-3 px-4 text-right text-rose-500 font-bold">Balance</th>
                  <th className="py-3 px-4">Recovery Month</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                {advances.map(adv => (
                  <tr key={adv.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">{adv.employee_name}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{adv.employee_code}</div>
                    </td>
                    <td className="py-3 px-4">{adv.date}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {formatCur(adv.advance_amount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-500">
                      {formatCur(adv.recovered_amount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-rose-600 dark:text-rose-400">
                      {formatCur(adv.balance_amount)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-indigo-600 dark:text-indigo-400">
                      {adv.recovery_month}
                    </td>
                    <td className="py-3 px-4 text-zinc-400">{adv.reason}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        adv.status === 'Fully Recovered'
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                      }`}>
                        {adv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SALARY HISTORY & SLIPS TAB                                            */}
      {/* ========================================================================= */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search history by employee name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200"
              >
                <option value="All">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>

              <button
                onClick={handleExportPayrollCSV}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-semibold">
                  <th className="py-3 px-4">Salary ID</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Month</th>
                  <th className="py-3 px-4 text-right">Gross</th>
                  <th className="py-3 px-4 text-right">Deductions</th>
                  <th className="py-3 px-4 text-right font-bold">Net Salary</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4">Disbursed Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Salary Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                {filteredHistory.map(rec => (
                  <tr key={rec.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {rec.salary_id}
                    </td>
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                      {rec.employee_name}
                    </td>
                    <td className="py-3 px-4">{rec.month}</td>
                    <td className="py-3 px-4 text-right font-mono">{formatCur(rec.gross_salary)}</td>
                    <td className="py-3 px-4 text-right font-mono text-rose-500">-{formatCur(rec.total_deductions)}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {formatCur(rec.net_salary)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-500">
                      {formatCur(rec.paid_amount)}
                    </td>
                    <td className="py-3 px-4">{rec.payment_date || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rec.payment_status === 'Paid'
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                      }`}>
                        {rec.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSlipRecord(rec);
                          setIsSlipModalOpen(true);
                        }}
                        className="flex items-center gap-1 ml-auto px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT EMPLOYEE                                             */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAddEmployeeModalOpen || isEditEmployeeModalOpen}
        onClose={() => {
          setIsAddEmployeeModalOpen(false);
          setIsEditEmployeeModalOpen(false);
        }}
        title={isEditEmployeeModalOpen ? `Edit Employee - ${empForm.name}` : 'Add New Employee Profile'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={isEditEmployeeModalOpen ? handleUpdateEmployee : handleSaveNewEmployee} className="space-y-5 text-xs">
          {/* Section 1: Personal Details */}
          <div>
            <h5 className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px] pb-1.5 border-b border-zinc-200 dark:border-zinc-800">
              1. Personal Information
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              <div>
                <label className="block text-zinc-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={empForm.name}
                  onChange={(e) => setEmpForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Arun Kumar"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={empForm.dob}
                  onChange={(e) => setEmpForm(prev => ({ ...prev, dob: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Gender</label>
                <select
                  value={empForm.gender}
                  onChange={(e) => setEmpForm(prev => ({ ...prev, gender: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={empForm.mobile}
                  onChange={(e) => setEmpForm(prev => ({ ...prev, mobile: e.target.value }))}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={empForm.email}
                  onChange={(e) => setEmpForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="name@shopmanager.in"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={empForm.address}
                  onChange={(e) => setEmpForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="City, State"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Employment Information */}
          <div>
            <h5 className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px] pb-1.5 border-b border-zinc-200 dark:border-zinc-800">
              2. Employment Information
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
              <div>
                <label className="block text-zinc-400 mb-1">Department</label>
                <select
                  value={empForm.department}
                  onChange={(e) => setEmpForm(prev => ({ ...prev, department: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Designation</label>
                <input
                  type="text"
                  required
                  value={empForm.designation}
                  onChange={(e) => setEmpForm(prev => ({ ...prev, designation: e.target.value }))}
                  placeholder="e.g. Sales Executive"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Employment Type</label>
                <select
                  value={empForm.employment_type}
                  onChange={(e) => setEmpForm(prev => ({ ...prev, employment_type: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Temporary">Temporary</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Salary Type</label>
                <select
                  value={empForm.salary_type}
                  onChange={(e) => setEmpForm(prev => ({ ...prev, salary_type: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Daily">Daily</option>
                  <option value="Hourly">Hourly</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Salary & Allowances */}
          <div>
            <h5 className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px] pb-1.5 border-b border-zinc-200 dark:border-zinc-800">
              3. Salary & Allowance Structure (INR ₹)
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-3">
              <div>
                <label className="block text-zinc-400 mb-1">Basic Salary *</label>
                <input
                  type="number"
                  required
                  value={empForm.basic_salary}
                  onChange={(e) => setEmpForm(prev => ({ ...prev, basic_salary: e.target.value }))}
                  placeholder="25000"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">HRA (₹)</label>
                <input
                  type="number"
                  value={empForm.hra}
                  onChange={(e) => setEmpForm(prev => ({ ...prev, hra: e.target.value }))}
                  placeholder="2000"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Travel (₹)</label>
                <input
                  type="number"
                  value={empForm.travel_allowance}
                  onChange={(e) => setEmpForm(prev => ({ ...prev, travel_allowance: e.target.value }))}
                  placeholder="1000"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Food (₹)</label>
                <input
                  type="number"
                  value={empForm.food_allowance}
                  onChange={(e) => setEmpForm(prev => ({ ...prev, food_allowance: e.target.value }))}
                  placeholder="500"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Bonus (₹)</label>
                <input
                  type="number"
                  value={empForm.performance_bonus}
                  onChange={(e) => setEmpForm(prev => ({ ...prev, performance_bonus: e.target.value }))}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Overtime (₹/hr)</label>
                <input
                  type="number"
                  value={empForm.overtime_rate}
                  onChange={(e) => setEmpForm(prev => ({ ...prev, overtime_rate: e.target.value }))}
                  placeholder="150"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Bank Information */}
          <div>
            <h5 className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px] pb-1.5 border-b border-zinc-200 dark:border-zinc-800">
              4. Bank Information (Confidential & Masked in UI)
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
              <div>
                <label className="block text-zinc-400 mb-1">Bank Name *</label>
                <input
                  type="text"
                  required
                  value={empForm.bank_name}
                  onChange={(e) => setEmpForm(prev => ({ ...prev, bank_name: e.target.value }))}
                  placeholder="HDFC Bank"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Account Holder</label>
                <input
                  type="text"
                  value={empForm.account_holder}
                  onChange={(e) => setEmpForm(prev => ({ ...prev, account_holder: e.target.value }))}
                  placeholder="Holder Name"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Account Number *</label>
                <input
                  type="text"
                  required
                  value={empForm.account_number}
                  onChange={(e) => setEmpForm(prev => ({ ...prev, account_number: e.target.value }))}
                  placeholder="Full Account Number"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={empForm.ifsc}
                  onChange={(e) => setEmpForm(prev => ({ ...prev, ifsc: e.target.value }))}
                  placeholder="HDFC0001234"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono uppercase"
                />
              </div>
            </div>
            <p className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Account numbers are automatically masked as <strong>XXXX XXXX 4587</strong> across all tables.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setIsAddEmployeeModalOpen(false);
                setIsEditEmployeeModalOpen(false);
              }}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm cursor-pointer"
            >
              {isEditEmployeeModalOpen ? 'Update Employee' : 'Save Employee Profile'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: VIEW EMPLOYEE PROFILE & SALARY STRUCTURE                        */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isViewEmployeeModalOpen}
        onClose={() => setIsViewEmployeeModalOpen(false)}
        title={`Employee Profile — ${selectedEmployee?.name}`}
        maxWidth="max-w-2xl"
      >
        {selectedEmployee && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-extrabold text-base">
                {selectedEmployee.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {selectedEmployee.name}
                </h4>
                <p className="text-zinc-400">
                  {selectedEmployee.emp_id} • {selectedEmployee.designation} ({selectedEmployee.department})
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div><span className="text-zinc-400">Mobile:</span> <span className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedEmployee.mobile}</span></div>
              <div><span className="text-zinc-400">Email:</span> <span className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedEmployee.email}</span></div>
              <div><span className="text-zinc-400">Joined:</span> <span className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedEmployee.joining_date}</span></div>
              <div><span className="text-zinc-400">Employment:</span> <span className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedEmployee.employment_type}</span></div>
              <div><span className="text-zinc-400">Bank:</span> <span className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedEmployee.bank_name}</span></div>
              <div><span className="text-zinc-400">Account:</span> <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">{selectedEmployee.masked_account}</span></div>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <h6 className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px] mb-2">
                Monthly Salary Structure
              </h6>
              <div className="space-y-1.5">
                <div className="flex justify-between"><span>Basic Salary</span><span className="font-bold">{formatCur(selectedEmployee.basic_salary)}</span></div>
                <div className="flex justify-between text-indigo-500"><span>HRA</span><span>+{formatCur(selectedEmployee.hra)}</span></div>
                <div className="flex justify-between text-indigo-500"><span>Travel Allowance</span><span>+{formatCur(selectedEmployee.travel_allowance)}</span></div>
                <div className="flex justify-between text-indigo-500"><span>Food Allowance</span><span>+{formatCur(selectedEmployee.food_allowance)}</span></div>
                <div className="flex justify-between text-indigo-500"><span>Performance Bonus</span><span>+{formatCur(selectedEmployee.performance_bonus)}</span></div>
                <div className="flex justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800 font-extrabold text-zinc-900 dark:text-zinc-50">
                  <span>Gross Monthly Total</span>
                  <span>{formatCur(selectedEmployee.basic_salary + selectedEmployee.hra + selectedEmployee.travel_allowance + selectedEmployee.food_allowance + selectedEmployee.performance_bonus)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: CALCULATION BREAKDOWN                                           */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isCalculationModalOpen}
        onClose={() => setIsCalculationModalOpen(false)}
        title="Salary Calculation Breakdown"
        maxWidth="max-w-md"
      >
        {calculationRecord && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <h5 className="font-bold text-zinc-900 dark:text-zinc-100">
                {calculationRecord.employee_name} ({calculationRecord.employee_code})
              </h5>
              <p className="text-zinc-400">{calculationRecord.month}</p>
            </div>

            <div className="space-y-2 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl">
              <h6 className="font-bold text-emerald-700 dark:text-emerald-300 uppercase text-[10px]">Earnings (+)</h6>
              <div className="flex justify-between"><span>Basic Salary</span><span>{formatCur(calculationRecord.basic_salary)}</span></div>
              <div className="flex justify-between"><span>HRA</span><span>{formatCur(calculationRecord.hra)}</span></div>
              <div className="flex justify-between"><span>Travel Allowance</span><span>{formatCur(calculationRecord.travel_allowance)}</span></div>
              <div className="flex justify-between"><span>Food Allowance</span><span>{formatCur(calculationRecord.food_allowance)}</span></div>
              <div className="flex justify-between"><span>Performance Bonus</span><span>{formatCur(calculationRecord.performance_bonus)}</span></div>
              <div className="flex justify-between"><span>Overtime Pay</span><span>{formatCur(calculationRecord.overtime_amount)}</span></div>
              <div className="flex justify-between pt-1 border-t border-emerald-300 dark:border-emerald-900/40 font-bold text-emerald-800 dark:text-emerald-200">
                <span>Gross Salary</span>
                <span>{formatCur(calculationRecord.gross_salary)}</span>
              </div>
            </div>

            <div className="space-y-2 p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-xl">
              <h6 className="font-bold text-rose-700 dark:text-rose-300 uppercase text-[10px]">Deductions (-)</h6>
              <div className="flex justify-between"><span>Leave Deduction</span><span>{formatCur(calculationRecord.leave_deductions)}</span></div>
              <div className="flex justify-between"><span>Late Deduction</span><span>{formatCur(calculationRecord.late_deductions)}</span></div>
              <div className="flex justify-between"><span>Advance Recovery</span><span>{formatCur(calculationRecord.advance_recovery)}</span></div>
              <div className="flex justify-between pt-1 border-t border-rose-300 dark:border-rose-900/40 font-bold text-rose-800 dark:text-rose-200">
                <span>Total Deductions</span>
                <span>{formatCur(calculationRecord.total_deductions)}</span>
              </div>
            </div>

            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase">Net Payable</span>
                <h3 className="text-xl font-extrabold text-indigo-900 dark:text-indigo-100">
                  {formatCur(calculationRecord.net_salary)}
                </h3>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                calculationRecord.payment_status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {calculationRecord.payment_status}
              </span>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 4: DISBURSE / SALARY PAYMENT                                       */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Salary Payment Disbursement"
        maxWidth="max-w-md"
      >
        {paymentRecord && (
          <form onSubmit={handleConfirmSalaryPayment} className="space-y-4 text-xs">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-400">Employee:</p>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                {paymentRecord.employee_name} ({paymentRecord.employee_code})
              </h4>
              <p className="text-zinc-400 mt-1">
                Month: <strong>{paymentRecord.month}</strong> • Net Amount: <strong className="text-emerald-500 font-mono">{formatCur(paymentRecord.net_salary)}</strong>
              </p>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Disbursement Date</label>
              <input
                type="date"
                required
                value={payDate}
                onChange={(e) => setPayDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Payment Method *</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold"
              >
                <option value="Bank Transfer">Bank Transfer (Withdrawal in Banking Ledger)</option>
                <option value="UPI">UPI (Instant settlement)</option>
                <option value="Cash">Cash (Deducts counter cash balance)</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Reference / UTR / Voucher Number</label>
              <input
                type="text"
                required
                value={payRefNo}
                onChange={(e) => setPayRefNo(e.target.value)}
                placeholder="UTR92044810239"
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Remarks</label>
              <textarea
                value={payRemarks}
                onChange={(e) => setPayRemarks(e.target.value)}
                rows={2}
                placeholder="Optional payment remarks..."
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl text-[11px] text-zinc-500">
              <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                <Info className="w-3.5 h-3.5" />
                <span>Automatic Inter-Module Integration:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Records a corresponding <strong>Salary Expense</strong> of {formatCur(paymentRecord.net_salary)} under Expenses.</li>
                {payMethod === 'Bank Transfer' ? (
                  <li>Creates a <strong>Withdrawal entry</strong> in Banking ledger for HDFC Bank.</li>
                ) : payMethod === 'Cash' ? (
                  <li>Reflects immediately in dashboard counter cash deductions.</li>
                ) : null}
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm cursor-pointer"
              >
                Mark Salary as Paid
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 5: SALARY SLIP PREVIEW & PDF DOWNLOAD                               */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isSlipModalOpen}
        onClose={() => setIsSlipModalOpen(false)}
        title="Official Retail Salary Slip"
        maxWidth="max-w-2xl"
      >
        {slipRecord && (
          <div className="space-y-4 text-xs">
            {/* Printable Container */}
            <div className="p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
              {/* Header */}
              <div className="text-center border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <h3 className="text-base font-extrabold text-indigo-600 tracking-wider">SHOPMANAGER ERP</h3>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                  Sri Murugan Traders & Retailers
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Shop #12, Brigade Road, Commercial Plaza, Bengaluru - 560001
                </p>
                <p className="text-[11px] text-zinc-400 font-mono">
                  GSTIN: 29ABCDE1234F1Z5 • State Code: 29 (Karnataka)
                </p>
                <div className="inline-block mt-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full font-bold text-zinc-800 dark:text-zinc-200 text-xs">
                  SALARY SLIP FOR {slipRecord.month.toUpperCase()}
                </div>
              </div>

              {/* Employee Summary Grid */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl text-zinc-700 dark:text-zinc-300">
                <div><span className="text-zinc-400">Employee Name:</span> <strong className="text-zinc-900 dark:text-zinc-100">{slipRecord.employee_name}</strong></div>
                <div><span className="text-zinc-400">Employee Code:</span> <strong className="font-mono text-zinc-900 dark:text-zinc-100">{slipRecord.employee_code}</strong></div>
                <div><span className="text-zinc-400">Designation:</span> {slipRecord.designation}</div>
                <div><span className="text-zinc-400">Department:</span> {slipRecord.department}</div>
                <div><span className="text-zinc-400">Payment Date:</span> {slipRecord.payment_date || 'Pending'}</div>
                <div><span className="text-zinc-400">Payment Mode:</span> {slipRecord.payment_method || 'Bank Transfer'}</div>
              </div>

              {/* Earnings & Deductions Table */}
              <div className="grid grid-cols-2 gap-4">
                {/* Earnings column */}
                <div className="p-3 border border-emerald-100 dark:border-emerald-950/40 rounded-xl bg-emerald-50/20 dark:bg-emerald-950/10 space-y-1.5">
                  <h6 className="font-bold text-emerald-700 dark:text-emerald-400 uppercase text-[10px] pb-1 border-b border-emerald-200 dark:border-emerald-900/40">
                    Earnings
                  </h6>
                  <div className="flex justify-between"><span>Basic Salary</span><span>{formatCur(slipRecord.basic_salary)}</span></div>
                  <div className="flex justify-between"><span>HRA</span><span>{formatCur(slipRecord.hra)}</span></div>
                  <div className="flex justify-between"><span>Travel Allowance</span><span>{formatCur(slipRecord.travel_allowance)}</span></div>
                  <div className="flex justify-between"><span>Food Allowance</span><span>{formatCur(slipRecord.food_allowance)}</span></div>
                  <div className="flex justify-between"><span>Bonus</span><span>{formatCur(slipRecord.performance_bonus)}</span></div>
                  <div className="flex justify-between"><span>Overtime</span><span>{formatCur(slipRecord.overtime_amount)}</span></div>
                  <div className="flex justify-between pt-1 border-t border-emerald-300 dark:border-emerald-900/40 font-bold text-emerald-800 dark:text-emerald-200">
                    <span>Gross Salary</span>
                    <span>{formatCur(slipRecord.gross_salary)}</span>
                  </div>
                </div>

                {/* Deductions column */}
                <div className="p-3 border border-rose-100 dark:border-rose-950/40 rounded-xl bg-rose-50/20 dark:bg-rose-950/10 space-y-1.5">
                  <h6 className="font-bold text-rose-700 dark:text-rose-400 uppercase text-[10px] pb-1 border-b border-rose-200 dark:border-rose-900/40">
                    Deductions
                  </h6>
                  <div className="flex justify-between"><span>Leave Deductions</span><span>{formatCur(slipRecord.leave_deductions)}</span></div>
                  <div className="flex justify-between"><span>Late Deductions</span><span>{formatCur(slipRecord.late_deductions)}</span></div>
                  <div className="flex justify-between"><span>Advance Recovery</span><span>{formatCur(slipRecord.advance_recovery)}</span></div>
                  <div className="flex justify-between"><span>Other Deductions</span><span>{formatCur(slipRecord.other_deductions)}</span></div>
                  <div className="flex justify-between pt-1 border-t border-rose-300 dark:border-rose-900/40 font-bold text-rose-800 dark:text-rose-200">
                    <span>Total Deductions</span>
                    <span>{formatCur(slipRecord.total_deductions)}</span>
                  </div>
                </div>
              </div>

              {/* Net Pay Highlight Banner */}
              <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-between font-bold">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase">Net Salary Payable</span>
                  <p className="text-base text-zinc-900 dark:text-zinc-50 font-extrabold">{formatCur(slipRecord.net_salary)}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 uppercase">Reference</span>
                  <p className="font-mono text-zinc-600 dark:text-zinc-300">{slipRecord.reference_no || 'N/A'}</p>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-6 flex justify-between text-zinc-400 text-[11px]">
                <div>
                  <div className="w-36 border-b border-zinc-400 mb-1" />
                  <p>Authorized Signatory</p>
                </div>
                <div>
                  <div className="w-36 border-b border-zinc-400 mb-1" />
                  <p>Employee Signature</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Slip
              </button>
              <button
                onClick={() => handleDownloadSalarySlipPDF(slipRecord)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 6: ISSUE SALARY ADVANCE                                            */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAdvanceModalOpen}
        onClose={() => setIsAdvanceModalOpen(false)}
        title="Issue Staff Salary Advance"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveAdvance} className="space-y-4 text-xs">
          <div>
            <label className="block text-zinc-400 mb-1">Select Employee *</label>
            <select
              required
              value={advanceEmpId}
              onChange={(e) => setAdvanceEmpId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
            >
              <option value="">-- Choose Employee --</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.emp_id} - {e.department})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Advance Amount (INR ₹) *</label>
            <input
              type="number"
              required
              value={advanceAmount}
              onChange={(e) => setAdvanceAmount(e.target.value)}
              placeholder="5000"
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Recovery Month</label>
            <select
              value={advanceRecoveryMonth}
              onChange={(e) => setAdvanceRecoveryMonth(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
            >
              <option value="September 2026">September 2026</option>
              <option value="October 2026">October 2026</option>
              <option value="November 2026">November 2026</option>
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Reason / Purpose</label>
            <textarea
              value={advanceReason}
              onChange={(e) => setAdvanceReason(e.target.value)}
              rows={2}
              placeholder="e.g. Festival advance, medical emergency..."
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsAdvanceModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm cursor-pointer"
            >
              Issue Advance
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SalaryPayroll;
