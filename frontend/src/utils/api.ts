// Client-side localStorage Mock API Client
// This replaces the backend server for a zero-server browser-only deployment.

import {
  defaultProducts,
  defaultCategories,
  defaultBrands,
  defaultUnits,
  defaultStockHistory,
  defaultInvoices,
  defaultReturns,
  defaultExpenses,
  defaultUserAccounts,
  defaultRoles,
  defaultRolePermissions,
  defaultActivityLogs,
  defaultSettings,
  defaultEmployees,
  defaultPayrollRecords,
  defaultAdvances
} from './mockData';

const getRelativeDate = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const getStorageItem = (key: string, defaultVal: any) => {
  const val = localStorage.getItem(key);
  if (!val) {
    localStorage.setItem(key, JSON.stringify(defaultVal));
    return defaultVal;
  }
  try {
    const parsed = JSON.parse(val);
    if (Array.isArray(parsed) && parsed.length === 0 && Array.isArray(defaultVal) && defaultVal.length > 0) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return parsed;
  } catch {
    return defaultVal;
  }
};

const setStorageItem = (key: string, val: any) => {
  localStorage.setItem(key, JSON.stringify(val));
};

const defaultUsers = [
  { id: 1, username: 'admin', password: 'admin123', role: 'Admin' },
  { id: 2, username: 'staff', password: 'staff123', role: 'Staff' },
  { id: 3, username: 'sunil.manager', password: 'manager123', role: 'Manager' },
  { id: 4, username: 'amit.sales', password: 'sales123', role: 'Sales Staff' },
  { id: 5, username: 'suresh.purchase', password: 'purchase123', role: 'Purchase Staff' },
  { id: 6, username: 'kavita.accounts', password: 'acc123', role: 'Accountant' }
];

const defaultCustomers = [
  { id: 1, name: 'Apex Retailers', mobile: '9876543210', address: '104 Market Road, Commercial Complex, Mumbai', gst_number: '27AAAAA1111A1Z1' },
  { id: 2, name: 'Sharma Enterprises', mobile: '8765432109', address: '45 MG Road, Gandhi Nagar, Bengaluru', gst_number: '29ABCDE1234F1Z5' },
  { id: 3, name: 'Priya Supermarket', mobile: '9123456789', address: '12 Temple Street, T. Nagar, Chennai', gst_number: '33AABCP9999P1ZZ' },
  { id: 4, name: 'Metro General Stores', mobile: '9988776655', address: '88 Station View, Sector 18, Noida', gst_number: '07AAECR5544R1Z0' },
  { id: 5, name: 'Venkatesh Traders', mobile: '9445566778', address: '22 Ring Road, Surat', gst_number: '' }
];

const defaultVendors = [
  { id: 1, name: 'Wholesale Distributors Corp', mobile: '9998887776', address: '789 Industrial Area, Phase II, New Delhi', gst_number: '07BBBBB2222B2Z2' },
  { id: 2, name: 'National FMCG Suppliers Ltd', mobile: '8887776665', address: '101 Trade Plaza, Ring Road, Ahmedabad', gst_number: '24AAACN1234Q1Z8' },
  { id: 3, name: 'TechSource Components Pvt', mobile: '9871122334', address: '55 Electronic City, Phase 1, Bengaluru', gst_number: '29AABBT6789G1Z2' },
  { id: 4, name: 'Global Paper & Packaging Co', mobile: '9765431289', address: '404 MIDC Industrial Zone, Pune', gst_number: '27AABCG4321H1Z9' }
];

const getDefaultSales = () => [
  {
    id: 1,
    bill_no: 'SALE-00001',
    date: getRelativeDate(0),
    customer_id: 1,
    payment_type: 'Cash',
    total_amount: 14500,
    payment_status: 'Paid',
    paid_amount: 14500,
    balance_amount: 0,
    notes: 'Delivered in full, counter cash payment',
    due_date: null
  },
  {
    id: 2,
    bill_no: 'SALE-00002',
    date: getRelativeDate(0),
    customer_id: 2,
    payment_type: 'Credit',
    total_amount: 28000,
    payment_status: 'Partial',
    paid_amount: 10000,
    balance_amount: 18000,
    notes: 'Initial token received, remainder pending settlement',
    due_date: getRelativeDate(7)
  },
  {
    id: 3,
    bill_no: 'SALE-00003',
    date: getRelativeDate(-1),
    customer_id: 3,
    payment_type: 'Cash',
    total_amount: 19200,
    payment_status: 'Paid',
    paid_amount: 19200,
    balance_amount: 0,
    notes: 'Cash invoice cleared at store',
    due_date: null
  },
  {
    id: 4,
    bill_no: 'SALE-00004',
    date: getRelativeDate(-2),
    customer_id: 4,
    payment_type: 'Credit',
    total_amount: 34500,
    payment_status: 'Pending',
    paid_amount: 0,
    balance_amount: 34500,
    notes: 'Bulk stock delivery, invoice on 15 days credit',
    due_date: getRelativeDate(5)
  },
  {
    id: 5,
    bill_no: 'SALE-00005',
    date: getRelativeDate(-4),
    customer_id: 1,
    payment_type: 'Cash',
    total_amount: 8750,
    payment_status: 'Paid',
    paid_amount: 8750,
    balance_amount: 0,
    notes: 'Express parcel checkout',
    due_date: null
  },
  {
    id: 6,
    bill_no: 'SALE-00006',
    date: getRelativeDate(-6),
    customer_id: 5,
    payment_type: 'Credit',
    total_amount: 15600,
    payment_status: 'Partial',
    paid_amount: 5600,
    balance_amount: 10000,
    notes: 'Advance deposit received',
    due_date: getRelativeDate(3)
  }
];

const getDefaultPurchases = () => [
  {
    id: 1,
    bill_no: 'PUR-00001',
    date: getRelativeDate(0),
    vendor_id: 1,
    purchase_type: 'Cash',
    total_amount: 8500,
    payment_status: 'Paid',
    paid_amount: 8500,
    balance_amount: 0,
    due_date: null
  },
  {
    id: 2,
    bill_no: 'PUR-00002',
    date: getRelativeDate(-1),
    vendor_id: 2,
    purchase_type: 'Credit',
    total_amount: 22000,
    payment_status: 'Pending',
    paid_amount: 0,
    balance_amount: 22000,
    due_date: getRelativeDate(10)
  },
  {
    id: 3,
    bill_no: 'PUR-00003',
    date: getRelativeDate(-3),
    vendor_id: 3,
    purchase_type: 'Cash',
    total_amount: 12400,
    payment_status: 'Paid',
    paid_amount: 12400,
    balance_amount: 0,
    due_date: null
  },
  {
    id: 4,
    bill_no: 'PUR-00004',
    date: getRelativeDate(-5),
    vendor_id: 4,
    purchase_type: 'Credit',
    total_amount: 18900,
    payment_status: 'Partial',
    paid_amount: 8900,
    balance_amount: 10000,
    due_date: getRelativeDate(4)
  }
];

const getDefaultBankEntries = () => [
  {
    id: 1,
    date: getRelativeDate(0),
    bank_name: 'HDFC Bank',
    account_name: 'Main Business Current A/C',
    amount: 15000,
    transaction_type: 'Deposit',
    reference_no: 'DEP-HDFC-99120',
    remarks: 'Daily counter cash deposit'
  },
  {
    id: 2,
    date: getRelativeDate(-1),
    bank_name: 'State Bank of India',
    account_name: 'Operations Reserve A/C',
    amount: 5000,
    transaction_type: 'Withdrawal',
    reference_no: 'ATM-SBI-44321',
    remarks: 'Petty cash refill for shop register'
  },
  {
    id: 3,
    date: getRelativeDate(-3),
    bank_name: 'HDFC Bank',
    account_name: 'Main Business Current A/C',
    amount: 25000,
    transaction_type: 'Deposit',
    reference_no: 'NEFT-CR-88712',
    remarks: 'Client bulk payment settlement'
  },
  {
    id: 4,
    date: getRelativeDate(-5),
    bank_name: 'ICICI Bank',
    account_name: 'Vendor Clearing Account',
    amount: 12000,
    transaction_type: 'Withdrawal',
    reference_no: 'RTGS-ICICI-11092',
    remarks: 'Vendor raw material consignment clearance'
  }
];

// Helper to log stock movements
const logStockMovement = (
  productId: number,
  type: 'Purchase' | 'Sale' | 'Sales Return' | 'Purchase Return' | 'Stock Adjustment',
  qtyIn: number,
  qtyOut: number,
  ref: string,
  remarks: string = ''
) => {
  const products = getStorageItem('shop_products', defaultProducts);
  const prod = products.find((p: any) => p.id === productId);
  if (prod) {
    prod.current_stock = Math.max(0, prod.current_stock + qtyIn - qtyOut);
    setStorageItem('shop_products', products);

    const history = getStorageItem('shop_stock_history', defaultStockHistory);
    const newEntry = {
      id: history.length > 0 ? Math.max(...history.map((h: any) => h.id)) + 1 : 1,
      date: new Date().toISOString().split('T')[0],
      product_id: prod.id,
      product_name: prod.name,
      transaction_type: type,
      reference: ref,
      quantity_in: qtyIn,
      quantity_out: qtyOut,
      balance: prod.current_stock,
      remarks
    };
    history.unshift(newEntry);
    setStorageItem('shop_stock_history', history);
  }
};

// Helper to log audit activities
const logActivity = (action: string, module: string, status: 'Success' | 'Warning' | 'Info' = 'Success') => {
  const userSession = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = userSession.username || 'Admin';
  const logs = getStorageItem('shop_activity_log', defaultActivityLogs);
  const now = new Date();
  const timeStr = `Today, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  const newLog = {
    id: logs.length > 0 ? Math.max(...logs.map((l: any) => l.id)) + 1 : 1,
    user: userName.charAt(0).toUpperCase() + userName.slice(1),
    action,
    module,
    timestamp: timeStr,
    status
  };
  logs.unshift(newLog);
  setStorageItem('shop_activity_log', logs);
};

// Seed default data if not present
export const seedData = (forceReset: boolean = false) => {
  if (forceReset) {
    setStorageItem('shop_users', defaultUsers);
    setStorageItem('shop_customers', defaultCustomers);
    setStorageItem('shop_vendors', defaultVendors);
    setStorageItem('shop_sales', getDefaultSales());
    setStorageItem('shop_purchases', getDefaultPurchases());
    setStorageItem('shop_bank_entries', getDefaultBankEntries());
    setStorageItem('shop_products', defaultProducts);
    setStorageItem('shop_categories', defaultCategories);
    setStorageItem('shop_brands', defaultBrands);
    setStorageItem('shop_units', defaultUnits);
    setStorageItem('shop_stock_history', defaultStockHistory);
    setStorageItem('shop_invoices', defaultInvoices);
    setStorageItem('shop_returns', defaultReturns);
    setStorageItem('shop_expenses', defaultExpenses);
    setStorageItem('shop_users_mgmt', defaultUserAccounts);
    setStorageItem('shop_roles', defaultRoles);
    setStorageItem('shop_permissions', defaultRolePermissions);
    setStorageItem('shop_activity_log', defaultActivityLogs);
    setStorageItem('shop_settings', defaultSettings);
    return;
  }

  getStorageItem('shop_users', defaultUsers);
  getStorageItem('shop_customers', defaultCustomers);
  getStorageItem('shop_vendors', defaultVendors);
  getStorageItem('shop_sales', getDefaultSales());
  getStorageItem('shop_purchases', getDefaultPurchases());
  getStorageItem('shop_bank_entries', getDefaultBankEntries());
  getStorageItem('shop_products', defaultProducts);
  getStorageItem('shop_categories', defaultCategories);
  getStorageItem('shop_brands', defaultBrands);
  getStorageItem('shop_units', defaultUnits);
  getStorageItem('shop_stock_history', defaultStockHistory);
  getStorageItem('shop_invoices', defaultInvoices);
  getStorageItem('shop_returns', defaultReturns);
  getStorageItem('shop_expenses', defaultExpenses);
  getStorageItem('shop_users_mgmt', defaultUserAccounts);
  getStorageItem('shop_roles', defaultRoles);
  getStorageItem('shop_permissions', defaultRolePermissions);
  getStorageItem('shop_activity_log', defaultActivityLogs);
  getStorageItem('shop_settings', defaultSettings);
};
seedData();

if (typeof window !== 'undefined') {
  (window as any).resetShopMockData = () => {
    seedData(true);
    window.location.reload();
  };
}

// Date helpers for reports
const getWeekRange = (refDateStr: string) => {
  const ref = new Date(refDateStr);
  const day = ref.getDay(); // 0 is Sunday, 1 is Monday...
  const diff = ref.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(ref.setDate(diff));
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
};

const getMonthRange = (refDateStr: string) => {
  const parts = refDateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const start = `${parts[0]}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${parts[0]}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { start, end };
};

const api = {
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} }
  },
  defaults: {
    headers: {
      common: {}
    }
  },

  get: async <T = any>(url: string): Promise<{ data: T }> => {
    const [path, queryPart] = url.split('?');
    const queryParams: Record<string, string> = {};
    if (queryPart) {
      queryPart.split('&').forEach(pair => {
        const [k, v] = pair.split('=');
        queryParams[k] = decodeURIComponent(v);
      });
    }

    await new Promise(r => setTimeout(r, 60));

    const checkAuth = () => {
      if (!localStorage.getItem('token')) {
        const err: any = new Error('Unauthorized');
        err.response = { status: 401, data: { error: 'Unauthorized' } };
        throw err;
      }
    };

    if (path === '/auth/me') {
      checkAuth();
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return { data: { user, ...user } } as any;
    }

    if (path === '/customers') {
      checkAuth();
      return { data: getStorageItem('shop_customers', []) } as any;
    }

    if (path === '/vendors') {
      checkAuth();
      return { data: getStorageItem('shop_vendors', []) } as any;
    }

    if (path === '/sales/next-bill-no') {
      checkAuth();
      const sales = getStorageItem('shop_sales', []);
      let maxNum = 0;
      sales.forEach((sale: any) => {
        const match = sale.bill_no.match(/SALE-(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      });
      const nextNum = maxNum + 1;
      return { data: { nextBillNo: `SALE-${String(nextNum).padStart(5, '0')}` } } as any;
    }

    if (path === '/purchases/next-bill-no') {
      checkAuth();
      const purchases = getStorageItem('shop_purchases', []);
      let maxNum = 0;
      purchases.forEach((pur: any) => {
        const match = pur.bill_no.match(/PUR-(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      });
      const nextNum = maxNum + 1;
      return { data: { nextBillNo: `PUR-${String(nextNum).padStart(5, '0')}` } } as any;
    }

    if (path === '/sales') {
      checkAuth();
      const sales = getStorageItem('shop_sales', []);
      const customers = getStorageItem('shop_customers', []);
      const mapped = sales.map((s: any) => {
        const c = customers.find((cust: any) => cust.id === s.customer_id);
        return {
          ...s,
          customer_name: c ? c.name : 'Unknown',
          customer_mobile: c ? c.mobile : '',
          customer_address: c ? c.address : ''
        };
      });
      return { data: mapped } as any;
    }

    if (path === '/purchases') {
      checkAuth();
      const purchases = getStorageItem('shop_purchases', []);
      const vendors = getStorageItem('shop_vendors', []);
      const mapped = purchases.map((p: any) => {
        const v = vendors.find((vend: any) => vend.id === p.vendor_id);
        return {
          ...p,
          vendor_name: v ? v.name : 'Unknown',
          vendor_mobile: v ? v.mobile : ''
        };
      });
      return { data: mapped } as any;
    }

    if (path === '/banking') {
      checkAuth();
      return { data: getStorageItem('shop_bank_entries', []) } as any;
    }

    // Customer history: /customers/:id/history
    if (path.startsWith('/customers/') && path.endsWith('/history')) {
      checkAuth();
      const id = parseInt(path.split('/')[2], 10);
      const sales = getStorageItem('shop_sales', []);
      const history = sales.filter((s: any) => s.customer_id === id).map((s: any) => ({
        id: s.id,
        bill_no: s.bill_no,
        date: s.date,
        payment_type: s.payment_type,
        total_amount: s.total_amount,
        payment_status: s.payment_status,
        paid_amount: s.paid_amount,
        balance_amount: s.balance_amount,
        due_date: s.due_date,
        notes: s.notes
      }));
      return { data: { history } } as any;
    }

    // Vendor history: /vendors/:id/history
    if (path.startsWith('/vendors/') && path.endsWith('/history')) {
      checkAuth();
      const id = parseInt(path.split('/')[2], 10);
      const purchases = getStorageItem('shop_purchases', []);
      const history = purchases.filter((p: any) => p.vendor_id === id).map((p: any) => ({
        id: p.id,
        bill_no: p.bill_no,
        date: p.date,
        purchase_type: p.purchase_type,
        total_amount: p.total_amount,
        payment_status: p.payment_status,
        paid_amount: p.paid_amount,
        balance_amount: p.balance_amount,
        due_date: p.due_date
      }));
      return { data: { history } } as any;
    }

    // Products / Inventory Endpoints
    if (path === '/products') {
      checkAuth();
      return { data: getStorageItem('shop_products', defaultProducts) } as any;
    }

    if (path === '/categories') {
      checkAuth();
      const categories = getStorageItem('shop_categories', defaultCategories);
      const products = getStorageItem('shop_products', defaultProducts);
      // update dynamic counts
      const mapped = categories.map((cat: any) => ({
        ...cat,
        product_count: products.filter((p: any) => p.category.toLowerCase() === cat.name.toLowerCase()).length
      }));
      return { data: mapped } as any;
    }

    if (path === '/brands') {
      checkAuth();
      const brands = getStorageItem('shop_brands', defaultBrands);
      const products = getStorageItem('shop_products', defaultProducts);
      const mapped = brands.map((b: any) => ({
        ...b,
        product_count: products.filter((p: any) => p.brand.toLowerCase() === b.name.toLowerCase()).length
      }));
      return { data: mapped } as any;
    }

    if (path === '/units') {
      checkAuth();
      return { data: getStorageItem('shop_units', defaultUnits) } as any;
    }

    if (path === '/inventory/overview') {
      checkAuth();
      const products = getStorageItem('shop_products', defaultProducts);
      const totalProducts = products.length;
      const totalStockQuantity = products.reduce((acc: number, p: any) => acc + (p.current_stock || 0), 0);
      const lowStockItems = products.filter((p: any) => p.current_stock <= p.minimum_stock && p.current_stock > 0).length;
      const outOfStock = products.filter((p: any) => (p.current_stock || 0) === 0).length;
      const totalStockValue = products.reduce((acc: number, p: any) => acc + (p.current_stock || 0) * (p.purchase_price || 0), 0);
      const totalRetailValue = products.reduce((acc: number, p: any) => acc + (p.current_stock || 0) * (p.selling_price || 0), 0);
      return {
        data: {
          totalProducts,
          totalStockQuantity,
          lowStockItems,
          outOfStock,
          totalStockValue,
          totalRetailValue
        }
      } as any;
    }

    if (path === '/inventory/low-stock') {
      checkAuth();
      const products = getStorageItem('shop_products', defaultProducts);
      const lowStock = products.filter((p: any) => p.current_stock <= p.minimum_stock);
      return { data: lowStock } as any;
    }

    if (path === '/inventory/history') {
      checkAuth();
      return { data: getStorageItem('shop_stock_history', defaultStockHistory) } as any;
    }

    // Invoices Endpoints
    if (path === '/invoices/next-no') {
      checkAuth();
      const settings = getStorageItem('shop_settings', defaultSettings);
      const prefix = settings.invoice_prefix || 'INV-';
      const invoices = getStorageItem('shop_invoices', defaultInvoices);
      let maxNum = settings.invoice_next_num || 1000;
      invoices.forEach((inv: any) => {
        const match = inv.invoice_no.match(/(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num >= maxNum) maxNum = num + 1;
        }
      });
      return { data: { nextInvoiceNo: `${prefix}${String(maxNum).padStart(5, '0')}` } } as any;
    }

    if (path === '/invoices') {
      checkAuth();
      return { data: getStorageItem('shop_invoices', defaultInvoices) } as any;
    }

    // Returns Endpoints
    if (path === '/returns') {
      checkAuth();
      return { data: getStorageItem('shop_returns', defaultReturns) } as any;
    }

    // Expenses Endpoints
    if (path === '/expenses') {
      checkAuth();
      return { data: getStorageItem('shop_expenses', defaultExpenses) } as any;
    }

    if (path === '/expenses/summary') {
      checkAuth();
      const expenses = getStorageItem('shop_expenses', defaultExpenses);
      const today = new Date().toISOString().split('T')[0];
      const monthPrefix = today.substring(0, 7);

      const todayExpenses = expenses.filter((e: any) => e.date === today).reduce((sum: number, e: any) => sum + e.amount, 0);
      const monthExpenses = expenses.filter((e: any) => e.date.startsWith(monthPrefix)).reduce((sum: number, e: any) => sum + e.amount, 0);
      const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);

      const categoryMap: Record<string, number> = {};
      expenses.forEach((e: any) => {
        categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
      });

      let highestCategory = 'N/A';
      let highestCatAmount = 0;
      Object.entries(categoryMap).forEach(([cat, amt]) => {
        if (amt > highestCatAmount) {
          highestCatAmount = amt;
          highestCategory = cat;
        }
      });

      const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
        name,
        value,
        amount: value
      })).sort((a, b) => b.value - a.value);

      return {
        data: {
          todayExpenses,
          monthExpenses,
          totalExpenses,
          highestCategory,
          highestCatAmount,
          categoryData
        }
      } as any;
    }

    // Users & Roles
    if (path === '/users') {
      checkAuth();
      return { data: getStorageItem('shop_users_mgmt', defaultUserAccounts) } as any;
    }

    if (path === '/roles') {
      checkAuth();
      return { data: getStorageItem('shop_roles', defaultRoles) } as any;
    }

    if (path === '/permissions') {
      checkAuth();
      return { data: getStorageItem('shop_permissions', defaultRolePermissions) } as any;
    }

    if (path === '/activity-logs') {
      checkAuth();
      return { data: getStorageItem('shop_activity_log', defaultActivityLogs) } as any;
    }

    // Settings
    if (path === '/settings') {
      checkAuth();
      return { data: getStorageItem('shop_settings', defaultSettings) } as any;
    }

    // Employees & Payroll Endpoints
    if (path === '/employees') {
      checkAuth();
      const list = getStorageItem('shop_employees', defaultEmployees);
      const dept = queryParams.department;
      const search = queryParams.search?.toLowerCase();
      let filtered = list;
      if (dept && dept !== 'All') filtered = filtered.filter((e: any) => e.department === dept);
      if (search) {
        filtered = filtered.filter((e: any) => 
          e.name.toLowerCase().includes(search) || 
          e.emp_id.toLowerCase().includes(search) || 
          e.designation.toLowerCase().includes(search)
        );
      }
      return { data: filtered } as any;
    }

    if (path.startsWith('/employees/')) {
      checkAuth();
      const id = parseInt(path.split('/')[2], 10);
      const list = getStorageItem('shop_employees', defaultEmployees);
      const emp = list.find((e: any) => e.id === id);
      if (!emp) {
        const err: any = new Error('Employee not found');
        err.response = { status: 404, data: { error: 'Employee not found' } };
        throw err;
      }
      return { data: emp } as any;
    }

    if (path === '/payroll/dashboard') {
      checkAuth();
      const month = queryParams.month || 'September 2026';
      const employees = getStorageItem('shop_employees', defaultEmployees);
      const payrollRecords = getStorageItem('shop_payroll_records', defaultPayrollRecords);
      const advances = getStorageItem('shop_salary_advances', defaultAdvances);

      const activeEmployees = employees.filter((e: any) => e.status === 'Active');
      const monthRecords = payrollRecords.filter((r: any) => r.month === month);

      const monthlyPayroll = monthRecords.reduce((sum: number, r: any) => sum + r.net_salary, 0) || 345000;
      const salaryPaid = monthRecords.filter((r: any) => r.payment_status === 'Paid').reduce((sum: number, r: any) => sum + r.paid_amount, 0);
      const salaryPending = monthRecords.filter((r: any) => r.payment_status === 'Pending').reduce((sum: number, r: any) => sum + r.balance_amount, 0);
      const totalAdvances = advances.reduce((sum: number, a: any) => sum + a.advance_amount, 0);
      const totalDeductions = monthRecords.reduce((sum: number, r: any) => sum + r.total_deductions, 0);

      const trendData = [
        { month: 'July 2026', payroll: 320000, paid: 320000, pending: 0 },
        { month: 'August 2026', payroll: 335000, paid: 335000, pending: 0 },
        { month: 'September 2026', payroll: 345000, paid: 285000, pending: 60000 }
      ];

      const upcomingPayments = monthRecords.filter((r: any) => r.payment_status === 'Pending').slice(0, 5);
      const recentlyPaid = monthRecords.filter((r: any) => r.payment_status === 'Paid').slice(0, 5);
      const pendingSalaries = monthRecords.filter((r: any) => r.payment_status === 'Pending');

      return {
        data: {
          totalEmployees: activeEmployees.length,
          monthlyPayroll,
          salaryPaid,
          salaryPending,
          totalAdvances,
          totalDeductions,
          trendData,
          upcomingPayments,
          recentlyPaid,
          pendingSalaries
        }
      } as any;
    }

    if (path === '/payroll/monthly') {
      checkAuth();
      const month = queryParams.month || 'September 2026';
      const payrollRecords = getStorageItem('shop_payroll_records', defaultPayrollRecords);
      const records = payrollRecords.filter((r: any) => r.month === month);
      return { data: records } as any;
    }

    if (path === '/payroll/advances') {
      checkAuth();
      return { data: getStorageItem('shop_salary_advances', defaultAdvances) } as any;
    }

    if (path === '/payroll/history') {
      checkAuth();
      const records = getStorageItem('shop_payroll_records', defaultPayrollRecords);
      const empId = queryParams.employee_id;
      const month = queryParams.month;
      const year = queryParams.year;
      const status = queryParams.status;
      let filtered = records;
      if (empId) filtered = filtered.filter((r: any) => r.employee_id === Number(empId));
      if (month && month !== 'All') filtered = filtered.filter((r: any) => r.month === month);
      if (year && year !== 'All') filtered = filtered.filter((r: any) => String(r.year) === String(year));
      if (status && status !== 'All') filtered = filtered.filter((r: any) => r.payment_status === status);
      return { data: filtered } as any;
    }

    // Enhanced Dashboard Overview
    if (path === '/reports/dashboard') {
      checkAuth();
      const today = queryParams.today || new Date().toISOString().split('T')[0];
      const sales = getStorageItem('shop_sales', []);
      const purchases = getStorageItem('shop_purchases', []);
      const bankEntries = getStorageItem('shop_bank_entries', []);
      const products = getStorageItem('shop_products', defaultProducts);
      const expenses = getStorageItem('shop_expenses', defaultExpenses);
      const returns = getStorageItem('shop_returns', defaultReturns);
      const payrollRecords = getStorageItem('shop_payroll_records', defaultPayrollRecords);
      const employeesList = getStorageItem('shop_employees', defaultEmployees);

      const todaySales = sales.filter((s: any) => s.date === today).reduce((sum: number, s: any) => sum + s.total_amount, 0);
      const todayPurchases = purchases.filter((p: any) => p.date === today).reduce((sum: number, p: any) => sum + p.total_amount, 0);
      const todayBankDeposits = bankEntries.filter((b: any) => b.date === today && b.transaction_type === 'Deposit').reduce((sum: number, b: any) => sum + b.amount, 0);
      
      const pendingSales = sales.reduce((sum: number, s: any) => sum + s.balance_amount, 0);
      const pendingPurchases = purchases.reduce((sum: number, p: any) => sum + p.balance_amount, 0);

      const cashSalesPaid = sales.filter((s: any) => s.payment_type === 'Cash').reduce((sum: number, s: any) => sum + s.paid_amount, 0);
      const cashPurchasesPaid = purchases.filter((p: any) => p.purchase_type === 'Cash').reduce((sum: number, p: any) => sum + p.paid_amount, 0);
      const bankWithdrawals = bankEntries.filter((b: any) => b.transaction_type === 'Withdrawal').reduce((sum: number, b: any) => sum + b.amount, 0);
      const bankDeposits = bankEntries.filter((b: any) => b.transaction_type === 'Deposit').reduce((sum: number, b: any) => sum + b.amount, 0);

      const cashBalance = parseFloat((cashSalesPaid + bankWithdrawals - cashPurchasesPaid - bankDeposits).toFixed(2));
      const bankBalance = parseFloat((bankDeposits - bankWithdrawals).toFixed(2));

      // Enhanced stats
      const lowStockItems = products.filter((p: any) => p.current_stock <= p.minimum_stock && p.current_stock > 0).length;
      const outOfStock = products.filter((p: any) => (p.current_stock || 0) === 0).length;
      
      const currentMonth = today.substring(0, 7);
      const todayExpenses = expenses.filter((e: any) => e.date === today).reduce((sum: number, e: any) => sum + e.amount, 0);
      const monthlyExpenses = expenses.filter((e: any) => e.date.startsWith(currentMonth)).reduce((sum: number, e: any) => sum + e.amount, 0);

      // Payroll stats for Dashboard
      const septRecords = payrollRecords.filter((r: any) => r.month === 'September 2026');
      const totalEmployeesCount = employeesList.length;
      const monthlyPayrollTotal = septRecords.reduce((sum: number, r: any) => sum + r.net_salary, 0) || 345000;
      const salaryPaidTotal = septRecords.filter((r: any) => r.payment_status === 'Paid').reduce((sum: number, r: any) => sum + r.paid_amount, 0);
      const salaryPendingTotal = septRecords.filter((r: any) => r.payment_status === 'Pending').reduce((sum: number, r: any) => sum + r.balance_amount, 0);
      const salaryStatusCounts = {
        paid: septRecords.filter((r: any) => r.payment_status === 'Paid').length,
        pending: septRecords.filter((r: any) => r.payment_status === 'Pending').length,
        partial: septRecords.filter((r: any) => r.payment_status === 'Partially Paid').length,
        total: septRecords.length
      };

      const inventoryAlerts: string[] = [];
      if (lowStockItems > 0) inventoryAlerts.push(`${lowStockItems} products are below minimum stock`);
      if (outOfStock > 0) inventoryAlerts.push(`${outOfStock} products are out of stock`);

      // Recent multi-category transactions
      const recentTxns: any[] = [];
      sales.slice(0, 4).forEach((s: any) => {
        recentTxns.push({
          id: `sale-${s.id}`,
          type: 'Sale',
          reference: s.bill_no,
          date: s.date,
          party: s.customer_name || 'Counter Customer',
          amount: s.total_amount,
          status: s.payment_status
        });
      });
      purchases.slice(0, 3).forEach((p: any) => {
        recentTxns.push({
          id: `pur-${p.id}`,
          type: 'Purchase',
          reference: p.bill_no,
          date: p.date,
          party: p.vendor_name || 'Wholesale Supplier',
          amount: p.total_amount,
          status: p.payment_status
        });
      });
      expenses.slice(0, 3).forEach((e: any) => {
        recentTxns.push({
          id: `exp-${e.id}`,
          type: 'Expense',
          reference: e.reference_no || 'EXP',
          date: e.date,
          party: e.category,
          amount: e.amount,
          status: 'Completed'
        });
      });
      returns.slice(0, 2).forEach((r: any) => {
        recentTxns.push({
          id: `ret-${r.id}`,
          type: r.type,
          reference: r.return_no,
          date: r.date,
          party: r.party_name,
          amount: r.amount,
          status: r.status
        });
      });
      recentTxns.sort((a, b) => b.date.localeCompare(a.date));

      // Top selling products calculated
      const topProducts = [
        { id: 1, name: 'Samsung 25W Fast Charger Type-C', category: 'Electronics', units_sold: 48, revenue: 62352, stock: 24, status: 'In Stock' },
        { id: 6, name: 'JK Copier A4 Paper 75 GSM', category: 'Stationery', units_sold: 42, revenue: 15120, stock: 42, status: 'In Stock' },
        { id: 2, name: 'HP Wireless Optical Mouse 250', category: 'Computer Accessories', units_sold: 29, revenue: 26071, stock: 18, status: 'In Stock' },
        { id: 4, name: 'Philips LED Bulb 12W Cool Daylight', category: 'Lighting & Electrical', units_sold: 28, revenue: 4480, stock: 5, status: 'Low Stock' },
        { id: 10, name: 'SanDisk Ultra Dual Drive Go 64GB', category: 'Computer Accessories', units_sold: 26, revenue: 16874, stock: 22, status: 'In Stock' }
      ];

      return {
        data: {
          todaySales,
          todayPurchases,
          todayBankDeposit: todayBankDeposits,
          pendingSales,
          pendingPurchases,
          cashBalance,
          bankBalance,
          lowStockItems,
          outOfStock,
          todayExpenses,
          monthlyExpenses,
          inventoryAlerts,
          recentTransactions: recentTxns.slice(0, 8),
          topProducts,
          payrollEmployees: totalEmployeesCount,
          payrollMonthlyTotal: monthlyPayrollTotal,
          payrollSalaryPaid: salaryPaidTotal,
          payrollSalaryPending: salaryPendingTotal,
          payrollStatusCounts: salaryStatusCounts
        }
      } as any;
    }

    if (path === '/reports/summary') {
      checkAuth();
      const type = queryParams.type; // daily, weekly, monthly
      const date = queryParams.date;

      let start = '';
      let end = '';
      let trendStart = '';

      if (type === 'daily') {
        start = date;
        end = date;
        const ref = new Date(date);
        ref.setDate(ref.getDate() - 6);
        trendStart = ref.toISOString().split('T')[0];
      } else if (type === 'weekly') {
        const range = getWeekRange(date);
        start = range.start;
        end = range.end;
        trendStart = start;
      } else {
        const range = getMonthRange(date);
        start = range.start;
        end = range.end;
        trendStart = start;
      }

      const sales = getStorageItem('shop_sales', []);
      const purchases = getStorageItem('shop_purchases', []);
      const bankEntries = getStorageItem('shop_bank_entries', []);
      const customers = getStorageItem('shop_customers', []);
      const vendors = getStorageItem('shop_vendors', []);
      const expenses = getStorageItem('shop_expenses', defaultExpenses);
      const returns = getStorageItem('shop_returns', defaultReturns);
      const products = getStorageItem('shop_products', defaultProducts);

      // Summary stats in [start, end]
      const rangeSales = sales.filter((s: any) => s.date >= start && s.date <= end);
      const rangePurchases = purchases.filter((p: any) => p.date >= start && p.date <= end);
      const rangeBank = bankEntries.filter((b: any) => b.date >= start && b.date <= end);
      const rangeExpenses = expenses.filter((e: any) => e.date >= start && e.date <= end);
      const rangeReturns = returns.filter((r: any) => r.date >= start && r.date <= end);

      const totalSales = rangeSales.reduce((sum: number, s: any) => sum + s.total_amount, 0);
      const totalPurchase = rangePurchases.reduce((sum: number, p: any) => sum + p.total_amount, 0);
      const totalExpenseAmt = rangeExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
      const bankDeposit = rangeBank.filter((b: any) => b.transaction_type === 'Deposit').reduce((sum: number, b: any) => sum + b.amount, 0);
      const cashReceived = rangeSales.filter((s: any) => s.payment_type === 'Cash').reduce((sum: number, s: any) => sum + s.paid_amount, 0);
      const cashPaid = rangePurchases.filter((p: any) => p.purchase_type === 'Cash').reduce((sum: number, p: any) => sum + p.paid_amount, 0);
      const pendingCollection = rangeSales.reduce((sum: number, s: any) => sum + s.balance_amount, 0);
      const pendingPayable = rangePurchases.reduce((sum: number, p: any) => sum + p.balance_amount, 0);

      // Trend data in [trendStart, end]
      const trendMap: Record<string, { sales: number; purchases: number; expenses: number }> = {};
      sales.filter((s: any) => s.date >= trendStart && s.date <= end).forEach((s: any) => {
        if (!trendMap[s.date]) trendMap[s.date] = { sales: 0, purchases: 0, expenses: 0 };
        trendMap[s.date].sales += s.total_amount;
      });
      purchases.filter((p: any) => p.date >= trendStart && p.date <= end).forEach((p: any) => {
        if (!trendMap[p.date]) trendMap[p.date] = { sales: 0, purchases: 0, expenses: 0 };
        trendMap[p.date].purchases += p.total_amount;
      });
      expenses.filter((e: any) => e.date >= trendStart && e.date <= end).forEach((e: any) => {
        if (!trendMap[e.date]) trendMap[e.date] = { sales: 0, purchases: 0, expenses: 0 };
        trendMap[e.date].expenses += e.amount;
      });

      const trend = [];
      let curr = new Date(trendStart);
      const stop = new Date(end);
      while (curr <= stop) {
        const dStr = curr.toISOString().split('T')[0];
        trend.push({
          date: dStr,
          sales: trendMap[dStr]?.sales || 0,
          purchases: trendMap[dStr]?.purchases || 0,
          expenses: trendMap[dStr]?.expenses || 0
        });
        curr.setDate(curr.getDate() + 1);
      }

      // Customer breakdown
      const custMap: Record<number, { name: string; total: number; paid: number; balance: number }> = {};
      rangeSales.forEach((s: any) => {
        if (!custMap[s.customer_id]) {
          const c = customers.find((cust: any) => cust.id === s.customer_id);
          custMap[s.customer_id] = { name: c ? c.name : 'Unknown', total: 0, paid: 0, balance: 0 };
        }
        custMap[s.customer_id].total += s.total_amount;
        custMap[s.customer_id].paid += s.paid_amount;
        custMap[s.customer_id].balance += s.balance_amount;
      });
      const customerBreakdown = Object.values(custMap).sort((a, b) => b.total - a.total);

      // Vendor breakdown
      const vendMap: Record<number, { name: string; total: number; paid: number; balance: number }> = {};
      rangePurchases.forEach((p: any) => {
        if (!vendMap[p.vendor_id]) {
          const v = vendors.find((vend: any) => vend.id === p.vendor_id);
          vendMap[p.vendor_id] = { name: v ? v.name : 'Unknown', total: 0, paid: 0, balance: 0 };
        }
        vendMap[p.vendor_id].total += p.total_amount;
        vendMap[p.vendor_id].paid += p.paid_amount;
        vendMap[p.vendor_id].balance += p.balance_amount;
      });
      const vendorBreakdown = Object.values(vendMap).sort((a, b) => b.total - a.total);

      // Category-wise expenses
      const expenseCatMap: Record<string, number> = {};
      rangeExpenses.forEach((e: any) => {
        expenseCatMap[e.category] = (expenseCatMap[e.category] || 0) + e.amount;
      });
      const expenseBreakdown = Object.entries(expenseCatMap).map(([category, amount]) => ({
        category,
        amount
      })).sort((a, b) => b.amount - a.amount);

      // Returns breakdown
      const salesReturnsTotal = rangeReturns.filter((r: any) => r.type === 'Sales Return').reduce((sum: number, r: any) => sum + r.amount, 0);
      const purchaseReturnsTotal = rangeReturns.filter((r: any) => r.type === 'Purchase Return').reduce((sum: number, r: any) => sum + r.amount, 0);

      // GST estimations (assuming avg 18% standard GST for simplified simulation)
      const outputGst = parseFloat(((totalSales * 0.18) / 1.18).toFixed(2));
      const inputGst = parseFloat(((totalPurchase * 0.18) / 1.18).toFixed(2));
      const netGstPayable = parseFloat(Math.max(0, outputGst - inputGst).toFixed(2));

      // Inventory valuation
      const totalStockVal = products.reduce((acc: number, p: any) => acc + (p.current_stock || 0) * (p.purchase_price || 0), 0);
      const totalRetailVal = products.reduce((acc: number, p: any) => acc + (p.current_stock || 0) * (p.selling_price || 0), 0);
      const potentialProfit = totalRetailVal - totalStockVal;

      return {
        data: {
          summary: {
            totalSales,
            totalPurchase,
            totalExpenses: totalExpenseAmt,
            bankDeposit,
            cashReceived,
            cashPaid,
            pendingCollection,
            pendingPayable,
            profit: parseFloat((totalSales - totalPurchase - totalExpenseAmt).toFixed(2)),
            grossProfit: parseFloat((totalSales - totalPurchase).toFixed(2)),
            salesReturnsTotal,
            purchaseReturnsTotal,
            outputGst,
            inputGst,
            netGstPayable,
            totalStockVal,
            totalRetailVal,
            potentialProfit
          },
          trend,
          customerBreakdown,
          vendorBreakdown,
          expenseBreakdown,
          rangeReturns
        }
      } as any;
    }

    if (path === '/reports/pending') {
      checkAuth();
      const filter = queryParams.filter;
      const today = new Date().toISOString().split('T')[0];

      let start = '';
      let end = '';
      let hasFilter = false;

      if (filter === 'today') {
        start = today;
        end = today;
        hasFilter = true;
      } else if (filter === 'week') {
        const range = getWeekRange(today);
        start = range.start;
        end = range.end;
        hasFilter = true;
      } else if (filter === 'month') {
        const range = getMonthRange(today);
        start = range.start;
        end = range.end;
        hasFilter = true;
      }

      const sales = getStorageItem('shop_sales', []);
      const purchases = getStorageItem('shop_purchases', []);
      const customers = getStorageItem('shop_customers', []);
      const vendors = getStorageItem('shop_vendors', []);

      let salesPending = sales.filter((s: any) => s.balance_amount > 0);
      let purchasesPending = purchases.filter((p: any) => p.balance_amount > 0);

      if (hasFilter) {
        salesPending = salesPending.filter((s: any) => s.due_date >= start && s.due_date <= end);
        purchasesPending = purchasesPending.filter((p: any) => p.due_date >= start && p.due_date <= end);
      }

      const salesPendingMapped = salesPending.map((s: any) => {
        const c = customers.find((cust: any) => cust.id === s.customer_id);
        return {
          id: s.id,
          bill_no: s.bill_no,
          date: s.date,
          total_amount: s.total_amount,
          paid_amount: s.paid_amount,
          balance_amount: s.balance_amount,
          due_date: s.due_date,
          customer_name: c ? c.name : 'Unknown',
          customer_mobile: c ? c.mobile : ''
        };
      });

      const purchasesPendingMapped = purchasesPending.map((p: any) => {
        const v = vendors.find((vend: any) => vend.id === p.vendor_id);
        return {
          id: p.id,
          bill_no: p.bill_no,
          date: p.date,
          total_amount: p.total_amount,
          paid_amount: p.paid_amount,
          balance_amount: p.balance_amount,
          due_date: p.due_date,
          vendor_name: v ? v.name : 'Unknown',
          vendor_mobile: v ? v.mobile : ''
        };
      });

      return {
        data: {
          salesPending: salesPendingMapped,
          purchasesPending: purchasesPendingMapped
        }
      } as any;
    }

    const err: any = new Error('Not Found');
    err.response = { status: 404, data: { error: 'Endpoint not found: ' + path } };
    throw err;
  },

  post: async <T = any>(url: string, body?: any): Promise<{ data: T }> => {
    const [path] = url.split('?');
    await new Promise(r => setTimeout(r, 60));

    const checkAuth = () => {
      if (!localStorage.getItem('token')) {
        const err: any = new Error('Unauthorized');
        err.response = { status: 401, data: { error: 'Unauthorized' } };
        throw err;
      }
    };

    if (path === '/auth/login') {
      const { username, password } = body || {};
      const users = getStorageItem('shop_users', defaultUsers);
      const user = users.find((u: any) => u.username === username && u.password === password);
      if (user) {
        localStorage.setItem('token', 'mock-token-' + Date.now());
        const userSession = { username: user.username, role: user.role };
        localStorage.setItem('user', JSON.stringify(userSession));
        return { data: { token: 'mock-token', user: userSession } } as any;
      } else {
        const err: any = new Error('Invalid credentials');
        err.response = { status: 401, data: { error: 'Invalid username or password' } };
        throw err;
      }
    }

    if (path === '/customers') {
      checkAuth();
      const list = getStorageItem('shop_customers', []);
      const newCust = {
        id: list.length > 0 ? Math.max(...list.map((c: any) => c.id)) + 1 : 1,
        name: body.name,
        mobile: body.mobile,
        address: body.address,
        gst_number: body.gst_number || ''
      };
      list.push(newCust);
      setStorageItem('shop_customers', list);
      logActivity(`Created customer profile "${newCust.name}"`, 'Customers');
      return { data: newCust } as any;
    }

    if (path === '/vendors') {
      checkAuth();
      const list = getStorageItem('shop_vendors', []);
      const newVend = {
        id: list.length > 0 ? Math.max(...list.map((v: any) => v.id)) + 1 : 1,
        name: body.name,
        mobile: body.mobile,
        address: body.address,
        gst_number: body.gst_number || ''
      };
      list.push(newVend);
      setStorageItem('shop_vendors', list);
      logActivity(`Created vendor record "${newVend.name}"`, 'Vendors');
      return { data: newVend } as any;
    }

    if (path === '/sales') {
      checkAuth();
      const list = getStorageItem('shop_sales', []);
      const newSale = {
        id: list.length > 0 ? Math.max(...list.map((s: any) => s.id)) + 1 : 1,
        bill_no: body.bill_no,
        date: body.date,
        customer_id: body.customer_id,
        payment_type: body.payment_type,
        total_amount: body.total_amount,
        payment_status: body.payment_status,
        paid_amount: body.paid_amount,
        balance_amount: body.balance_amount,
        notes: body.notes || '',
        due_date: body.due_date || null
      };
      list.push(newSale);
      setStorageItem('shop_sales', list);
      logActivity(`Created Sale Bill ${newSale.bill_no} (₹${newSale.total_amount})`, 'Sales');
      return { data: newSale } as any;
    }

    if (path === '/purchases') {
      checkAuth();
      const list = getStorageItem('shop_purchases', []);
      const newPurchase = {
        id: list.length > 0 ? Math.max(...list.map((p: any) => p.id)) + 1 : 1,
        bill_no: body.bill_no,
        date: body.date,
        vendor_id: body.vendor_id,
        purchase_type: body.purchase_type,
        total_amount: body.total_amount,
        payment_status: body.payment_status,
        paid_amount: body.paid_amount,
        balance_amount: body.balance_amount,
        due_date: body.due_date || null
      };
      list.push(newPurchase);
      setStorageItem('shop_purchases', list);
      logActivity(`Added Purchase Bill ${newPurchase.bill_no} (₹${newPurchase.total_amount})`, 'Purchase');
      return { data: newPurchase } as any;
    }

    if (path === '/banking') {
      checkAuth();
      const list = getStorageItem('shop_bank_entries', []);
      const newEntry = {
        id: list.length > 0 ? Math.max(...list.map((b: any) => b.id)) + 1 : 1,
        date: body.date,
        bank_name: body.bank_name,
        account_name: body.account_name,
        amount: body.amount,
        transaction_type: body.transaction_type,
        reference_no: body.reference_no || '',
        remarks: body.remarks || ''
      };
      list.push(newEntry);
      setStorageItem('shop_bank_entries', list);
      logActivity(`Logged bank entry ${newEntry.transaction_type} of ₹${newEntry.amount}`, 'Banking');
      return { data: newEntry } as any;
    }

    // Products / Inventory
    if (path === '/products') {
      checkAuth();
      const list = getStorageItem('shop_products', defaultProducts);
      const newProduct = {
        id: list.length > 0 ? Math.max(...list.map((p: any) => p.id)) + 1 : 1,
        sku: body.sku || `SKU-${Date.now().toString().slice(-4)}`,
        barcode: body.barcode || `${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
        name: body.name,
        category: body.category || 'General',
        brand: body.brand || 'Generic',
        unit: body.unit || 'Piece',
        purchase_price: Number(body.purchase_price) || 0,
        selling_price: Number(body.selling_price) || 0,
        current_stock: Number(body.current_stock || body.opening_stock) || 0,
        minimum_stock: Number(body.minimum_stock) || 5,
        gst_percent: Number(body.gst_percent) || 18,
        description: body.description || '',
        status: body.status || 'Active'
      };
      list.unshift(newProduct);
      setStorageItem('shop_products', list);

      if (newProduct.current_stock > 0) {
        logStockMovement(newProduct.id, 'Stock Adjustment', newProduct.current_stock, 0, 'INIT-STOCK', 'Opening Stock Entry');
      }

      logActivity(`Added new product "${newProduct.name}" (${newProduct.sku})`, 'Products / Inventory');
      return { data: newProduct } as any;
    }

    if (path === '/categories') {
      checkAuth();
      const list = getStorageItem('shop_categories', defaultCategories);
      const newCat = {
        id: list.length > 0 ? Math.max(...list.map((c: any) => c.id)) + 1 : 1,
        name: body.name,
        product_count: 0,
        status: body.status || 'Active'
      };
      list.push(newCat);
      setStorageItem('shop_categories', list);
      logActivity(`Added category "${newCat.name}"`, 'Products / Inventory');
      return { data: newCat } as any;
    }

    if (path === '/brands') {
      checkAuth();
      const list = getStorageItem('shop_brands', defaultBrands);
      const newBrand = {
        id: list.length > 0 ? Math.max(...list.map((b: any) => b.id)) + 1 : 1,
        name: body.name,
        product_count: 0,
        status: body.status || 'Active'
      };
      list.push(newBrand);
      setStorageItem('shop_brands', list);
      logActivity(`Added brand "${newBrand.name}"`, 'Products / Inventory');
      return { data: newBrand } as any;
    }

    if (path === '/units') {
      checkAuth();
      const list = getStorageItem('shop_units', defaultUnits);
      const newUnit = {
        id: list.length > 0 ? Math.max(...list.map((u: any) => u.id)) + 1 : 1,
        name: body.name,
        short_code: body.short_code || body.name.slice(0, 3),
        description: body.description || ''
      };
      list.push(newUnit);
      setStorageItem('shop_units', list);
      return { data: newUnit } as any;
    }

    if (path === '/inventory/adjust') {
      checkAuth();
      const { product_id, adjustment_type, quantity, reason, date: _date } = body;
      const qtyNum = Number(quantity);
      const isAdd = adjustment_type === 'Add';
      logStockMovement(
        product_id,
        'Stock Adjustment',
        isAdd ? qtyNum : 0,
        isAdd ? 0 : qtyNum,
        `ADJ-${Date.now().toString().slice(-4)}`,
        reason || 'Manual Adjustment'
      );
      logActivity(`Stock adjustment: ${adjustment_type} ${qtyNum} pcs for Product #${product_id}`, 'Products / Inventory');
      return { data: { success: true } } as any;
    }

    // Invoices
    if (path === '/invoices') {
      checkAuth();
      const invoices = getStorageItem('shop_invoices', defaultInvoices);
      const newInv = {
        id: invoices.length > 0 ? Math.max(...invoices.map((i: any) => i.id)) + 1 : 1,
        invoice_no: body.invoice_no,
        date: body.date,
        customer_id: body.customer_id,
        customer_name: body.customer_name,
        customer_mobile: body.customer_mobile || '',
        customer_address: body.customer_address || '',
        customer_gstin: body.customer_gstin || '',
        payment_type: body.payment_type || 'Cash',
        items: body.items || [],
        subtotal: Number(body.subtotal) || 0,
        discount: Number(body.discount) || 0,
        cgst: Number(body.cgst) || 0,
        sgst: Number(body.sgst) || 0,
        igst: Number(body.igst) || 0,
        grand_total: Number(body.grand_total) || 0,
        paid_amount: Number(body.paid_amount) || 0,
        balance_amount: Number(body.balance_amount) || 0,
        payment_status: body.payment_status || 'Paid',
        terms: body.terms || 'Thank you for your business!'
      };
      invoices.unshift(newInv);
      setStorageItem('shop_invoices', invoices);

      // Inventory deduction: decrease stock for billed items
      if (Array.isArray(body.items)) {
        body.items.forEach((item: any) => {
          if (item.product_id && item.quantity) {
            logStockMovement(
              item.product_id,
              'Sale',
              0,
              Number(item.quantity),
              newInv.invoice_no,
              `Invoiced to ${newInv.customer_name}`
            );
          }
        });
      }

      // Sync with shop_sales so sales ledger and pending reports update too!
      const sales = getStorageItem('shop_sales', []);
      const newSaleEntry = {
        id: sales.length > 0 ? Math.max(...sales.map((s: any) => s.id)) + 1 : 1,
        bill_no: newInv.invoice_no,
        date: newInv.date,
        customer_id: newInv.customer_id,
        payment_type: newInv.payment_type,
        total_amount: newInv.grand_total,
        payment_status: newInv.payment_status,
        paid_amount: newInv.paid_amount,
        balance_amount: newInv.balance_amount,
        notes: `Invoice ${newInv.invoice_no}`,
        due_date: newInv.balance_amount > 0 ? getRelativeDate(15) : null
      };
      sales.unshift(newSaleEntry);
      setStorageItem('shop_sales', sales);

      logActivity(`Created Retail Invoice ${newInv.invoice_no} for ${newInv.customer_name} (₹${newInv.grand_total})`, 'Invoices');
      return { data: newInv } as any;
    }

    // Returns
    if (path === '/returns/sales') {
      checkAuth();
      const returns = getStorageItem('shop_returns', defaultReturns);
      const newRet = {
        id: returns.length > 0 ? Math.max(...returns.map((r: any) => r.id)) + 1 : 1,
        return_no: body.return_no || `RET-S-${String(returns.length + 1).padStart(5, '0')}`,
        type: 'Sales Return',
        date: body.date,
        reference_bill: body.reference_bill,
        party_name: body.customer_name,
        party_id: body.customer_id,
        product_id: body.product_id,
        product_name: body.product_name,
        quantity: Number(body.quantity),
        reason: body.reason,
        amount: Number(body.amount),
        refund_method: body.refund_method || 'Cash',
        status: body.status || 'Completed',
        remarks: body.remarks || ''
      };
      returns.unshift(newRet);
      setStorageItem('shop_returns', returns);

      // Stock impact: Sales Return INCREASES stock!
      logStockMovement(
        newRet.product_id,
        'Sales Return',
        newRet.quantity,
        0,
        newRet.return_no,
        `Returned by ${newRet.party_name} (${newRet.reason})`
      );

      logActivity(`Logged Sales Return ${newRet.return_no} for ${newRet.product_name} (+${newRet.quantity} stock)`, 'Returns');
      return { data: newRet } as any;
    }

    if (path === '/returns/purchase') {
      checkAuth();
      const returns = getStorageItem('shop_returns', defaultReturns);
      const newRet = {
        id: returns.length > 0 ? Math.max(...returns.map((r: any) => r.id)) + 1 : 1,
        return_no: body.return_no || `RET-P-${String(returns.length + 1).padStart(5, '0')}`,
        type: 'Purchase Return',
        date: body.date,
        reference_bill: body.reference_bill,
        party_name: body.vendor_name,
        party_id: body.vendor_id,
        product_id: body.product_id,
        product_name: body.product_name,
        quantity: Number(body.quantity),
        reason: body.reason,
        amount: Number(body.amount),
        refund_method: 'Debit Note / Bank',
        status: body.status || 'Completed',
        remarks: body.remarks || ''
      };
      returns.unshift(newRet);
      setStorageItem('shop_returns', returns);

      // Stock impact: Purchase Return DECREASES stock!
      logStockMovement(
        newRet.product_id,
        'Purchase Return',
        0,
        newRet.quantity,
        newRet.return_no,
        `Supplier return to ${newRet.party_name} (${newRet.reason})`
      );

      logActivity(`Logged Purchase Return ${newRet.return_no} for ${newRet.product_name} (-${newRet.quantity} stock)`, 'Returns');
      return { data: newRet } as any;
    }

    // Expenses
    if (path === '/expenses') {
      checkAuth();
      const expenses = getStorageItem('shop_expenses', defaultExpenses);
      const newExp = {
        id: expenses.length > 0 ? Math.max(...expenses.map((e: any) => e.id)) + 1 : 1,
        date: body.date,
        category: body.category,
        description: body.description,
        amount: Number(body.amount),
        payment_method: body.payment_method || 'Cash',
        reference_no: body.reference_no || `EXP-${Date.now().toString().slice(-4)}`,
        notes: body.notes || ''
      };
      expenses.unshift(newExp);
      setStorageItem('shop_expenses', expenses);
      logActivity(`Recorded ${newExp.category} expense of ₹${newExp.amount}`, 'Expenses');
      return { data: newExp } as any;
    }

    // Users
    if (path === '/users') {
      checkAuth();
      const users = getStorageItem('shop_users_mgmt', defaultUserAccounts);
      const newUser = {
        id: users.length > 0 ? Math.max(...users.map((u: any) => u.id)) + 1 : 1,
        username: body.username,
        email: body.email,
        mobile: body.mobile,
        role: body.role || 'Staff',
        status: body.status || 'Active',
        last_login: 'Never logged in'
      };
      users.push(newUser);
      setStorageItem('shop_users_mgmt', users);
      logActivity(`Created user profile "${newUser.username}" (${newUser.role})`, 'Users & Roles');
      return { data: newUser } as any;
    }

    // Permissions
    if (path === '/permissions') {
      checkAuth();
      setStorageItem('shop_permissions', body);
      logActivity('Updated role permission configurations', 'Users & Roles');
      return { data: body } as any;
    }

    // Employees
    if (path === '/employees') {
      checkAuth();
      const list = getStorageItem('shop_employees', defaultEmployees);
      const newId = list.length > 0 ? Math.max(...list.map((e: any) => e.id)) + 1 : 1;
      const empCode = body.emp_id || `EMP-${String(newId).padStart(3, '0')}`;
      const rawAcc = String(body.account_number || '');
      const maskedAcc = rawAcc.length >= 4 
        ? `XXXX XXXX ${rawAcc.slice(-4)}` 
        : 'XXXX XXXX 4587';

      const newEmp = {
        id: newId,
        emp_id: empCode,
        name: body.name,
        dob: body.dob || '1995-01-01',
        gender: body.gender || 'Male',
        mobile: body.mobile,
        email: body.email || `${empCode.toLowerCase()}@shopmanager.in`,
        address: body.address || 'Bengaluru, Karnataka',
        joining_date: body.joining_date || new Date().toISOString().split('T')[0],
        department: body.department || 'Sales',
        designation: body.designation || 'Staff',
        employment_type: body.employment_type || 'Full Time',
        salary_type: body.salary_type || 'Monthly',
        basic_salary: Number(body.basic_salary) || 20000,
        hra: Number(body.hra) || 0,
        travel_allowance: Number(body.travel_allowance) || 0,
        food_allowance: Number(body.food_allowance) || 0,
        performance_bonus: Number(body.performance_bonus) || 0,
        other_allowance: Number(body.other_allowance) || 0,
        overtime_rate: Number(body.overtime_rate) || 100,
        late_deduction: Number(body.late_deduction) || 0,
        leave_deduction: Number(body.leave_deduction) || 0,
        other_deduction: Number(body.other_deduction) || 0,
        bank_name: body.bank_name || 'HDFC Bank',
        account_holder: body.account_holder || body.name,
        account_number: rawAcc,
        masked_account: maskedAcc,
        ifsc: body.ifsc || 'HDFC0001234',
        status: body.status || 'Active'
      };
      list.push(newEmp);
      setStorageItem('shop_employees', list);
      logActivity(`Added new employee profile "${newEmp.name}" (${newEmp.emp_id})`, 'Salary / Payroll');
      return { data: newEmp } as any;
    }

    // Process Payroll for a month
    if (path === '/payroll/process') {
      checkAuth();
      const month = body.month || 'September 2026';
      const year = Number(body.year) || 2026;
      const employees = getStorageItem('shop_employees', defaultEmployees);
      const payrollRecords = getStorageItem('shop_payroll_records', defaultPayrollRecords);
      const advances = getStorageItem('shop_salary_advances', defaultAdvances);

      const activeEmployees = employees.filter((e: any) => e.status === 'Active');
      let createdCount = 0;

      activeEmployees.forEach((emp: any) => {
        const exists = payrollRecords.find((r: any) => r.employee_id === emp.id && r.month === month);
        if (!exists) {
          createdCount++;
          const newId = payrollRecords.length > 0 ? Math.max(...payrollRecords.map((r: any) => r.id)) + 1 : 1;
          const totalAllowances = (emp.hra || 0) + (emp.travel_allowance || 0) + (emp.food_allowance || 0) + (emp.performance_bonus || 0) + (emp.other_allowance || 0);
          const gross = emp.basic_salary + totalAllowances;
          
          const empAdvance = advances.find((a: any) => a.employee_id === emp.id && a.recovery_month === month && a.balance_amount > 0);
          const advanceRec = empAdvance ? Math.min(empAdvance.balance_amount, 2000) : 0;
          const totalDeductions = (emp.leave_deduction || 0) + (emp.late_deduction || 0) + (emp.other_deduction || 0) + advanceRec;
          const net = Math.max(0, gross - totalDeductions);

          payrollRecords.push({
            id: newId,
            salary_id: `SAL-${year}09-${String(emp.id).padStart(3, '0')}`,
            employee_id: emp.id,
            employee_name: emp.name,
            employee_code: emp.emp_id,
            department: emp.department,
            designation: emp.designation,
            month: month,
            year: year,
            month_num: 9,
            basic_salary: emp.basic_salary,
            hra: emp.hra || 0,
            travel_allowance: emp.travel_allowance || 0,
            food_allowance: emp.food_allowance || 0,
            performance_bonus: emp.performance_bonus || 0,
            other_allowance: emp.other_allowance || 0,
            overtime_amount: 0,
            total_allowances: totalAllowances,
            gross_salary: gross,
            leave_deductions: emp.leave_deduction || 0,
            late_deductions: emp.late_deduction || 0,
            loan_deductions: 0,
            advance_recovery: advanceRec,
            other_deductions: emp.other_deduction || 0,
            total_deductions: totalDeductions,
            net_salary: net,
            paid_amount: 0,
            balance_amount: net,
            payment_status: 'Pending'
          });
        }
      });

      setStorageItem('shop_payroll_records', payrollRecords);
      logActivity(`Processed payroll for ${month} (${createdCount} records)`, 'Salary / Payroll');
      return { data: { success: true, count: createdCount } } as any;
    }

    // Pay Salary (Integrates with Expenses and Banking)
    if (path === '/payroll/pay') {
      checkAuth();
      const { salary_id, payment_method, payment_date, reference_no, remarks } = body;
      const payrollRecords = getStorageItem('shop_payroll_records', defaultPayrollRecords);
      const index = payrollRecords.findIndex((r: any) => r.id === Number(salary_id) || r.salary_id === salary_id);

      if (index === -1) {
        const err: any = new Error('Salary record not found');
        err.response = { status: 404, data: { error: 'Salary record not found' } };
        throw err;
      }

      const rec = payrollRecords[index];
      const payMethod = payment_method || 'Bank Transfer';
      const payDate = payment_date || new Date().toISOString().split('T')[0];
      const refNo = reference_no || `SAL-${Date.now().toString().slice(-6)}`;

      payrollRecords[index] = {
        ...rec,
        paid_amount: rec.net_salary,
        balance_amount: 0,
        payment_status: 'Paid',
        payment_date: payDate,
        payment_method: payMethod,
        reference_no: refNo,
        remarks: remarks || `Salary disbursed via ${payMethod}`
      };
      setStorageItem('shop_payroll_records', payrollRecords);

      // 1. INTEGRATION WITH EXPENSES: Record expense under 'Salary'
      const expenses = getStorageItem('shop_expenses', defaultExpenses);
      const newExp = {
        id: expenses.length > 0 ? Math.max(...expenses.map((e: any) => e.id)) + 1 : 1,
        date: payDate,
        category: 'Salary',
        description: `Salary Payment - ${rec.employee_name} (${rec.month})`,
        amount: rec.net_salary,
        payment_method: payMethod,
        reference_no: refNo,
        notes: remarks || `Monthly salary disbursement for ${rec.month}`
      };
      expenses.unshift(newExp);
      setStorageItem('shop_expenses', expenses);

      // 2. INTEGRATION WITH BANKING: If Bank Transfer, record bank withdrawal
      if (payMethod === 'Bank Transfer') {
        const bankEntries = getStorageItem('shop_bank_entries', []);
        const newBankEntry = {
          id: bankEntries.length > 0 ? Math.max(...bankEntries.map((b: any) => b.id)) + 1 : 1,
          date: payDate,
          bank_name: 'HDFC Bank',
          account_name: `Salary Payment - ${rec.employee_name}`,
          amount: rec.net_salary,
          transaction_type: 'Withdrawal',
          reference_no: refNo,
          remarks: `Payroll disbursement for ${rec.month} - ${rec.employee_name}`
        };
        bankEntries.unshift(newBankEntry);
        setStorageItem('shop_bank_entries', bankEntries);
      }

      // If advance recovery was included, update salary advance balance
      if (rec.advance_recovery > 0) {
        const advances = getStorageItem('shop_salary_advances', defaultAdvances);
        const advIndex = advances.findIndex((a: any) => a.employee_id === rec.employee_id && a.status !== 'Fully Recovered');
        if (advIndex !== -1) {
          const adv = advances[advIndex];
          const newRecovered = (adv.recovered_amount || 0) + rec.advance_recovery;
          const newBal = Math.max(0, adv.advance_amount - newRecovered);
          advances[advIndex] = {
            ...adv,
            recovered_amount: newRecovered,
            balance_amount: newBal,
            status: newBal === 0 ? 'Fully Recovered' : 'Partially Recovered'
          };
          setStorageItem('shop_salary_advances', advances);
        }
      }

      logActivity(`Paid ₹${rec.net_salary.toLocaleString('en-IN')} salary to ${rec.employee_name} via ${payMethod}`, 'Salary / Payroll');
      return { data: payrollRecords[index] } as any;
    }

    // Salary Advance Issue
    if (path === '/payroll/advances') {
      checkAuth();
      const advances = getStorageItem('shop_salary_advances', defaultAdvances);
      const employees = getStorageItem('shop_employees', defaultEmployees);
      const emp = employees.find((e: any) => e.id === Number(body.employee_id));

      const newId = advances.length > 0 ? Math.max(...advances.map((a: any) => a.id)) + 1 : 1;
      const advAmt = Number(body.advance_amount) || 0;
      const newAdv = {
        id: newId,
        employee_id: Number(body.employee_id),
        employee_name: emp ? emp.name : body.employee_name || 'Staff',
        employee_code: emp ? emp.emp_id : 'EMP',
        date: body.date || new Date().toISOString().split('T')[0],
        advance_amount: advAmt,
        recovered_amount: 0,
        balance_amount: advAmt,
        reason: body.reason || 'Personal advance',
        recovery_month: body.recovery_month || 'October 2026',
        status: 'Pending'
      };
      advances.unshift(newAdv);
      setStorageItem('shop_salary_advances', advances);
      logActivity(`Issued ₹${advAmt} salary advance to ${newAdv.employee_name}`, 'Salary / Payroll');
      return { data: newAdv } as any;
    }

    // Reset settings
    if (path === '/settings/restore-defaults') {
      checkAuth();
      seedData(true);
      return { data: { success: true } } as any;
    }

    const err: any = new Error('Not Found');
    err.response = { status: 404, data: { error: 'Endpoint not found: ' + path } };
    throw err;
  },

  put: async <T = any>(url: string, body?: any): Promise<{ data: T }> => {
    const [path] = url.split('?');
    await new Promise(r => setTimeout(r, 60));

    const checkAuth = () => {
      if (!localStorage.getItem('token')) {
        const err: any = new Error('Unauthorized');
        err.response = { status: 401, data: { error: 'Unauthorized' } };
        throw err;
      }
    };

    if (path.startsWith('/customers/')) {
      checkAuth();
      const id = parseInt(path.split('/')[2], 10);
      const list = getStorageItem('shop_customers', []);
      const index = list.findIndex((c: any) => c.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], ...body };
        setStorageItem('shop_customers', list);
        logActivity(`Updated customer info for "${list[index].name}"`, 'Customers');
        return { data: list[index] } as any;
      }
    }

    if (path.startsWith('/vendors/')) {
      checkAuth();
      const id = parseInt(path.split('/')[2], 10);
      const list = getStorageItem('shop_vendors', []);
      const index = list.findIndex((v: any) => v.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], ...body };
        setStorageItem('shop_vendors', list);
        logActivity(`Updated vendor info for "${list[index].name}"`, 'Vendors');
        return { data: list[index] } as any;
      }
    }

    if (path.startsWith('/products/')) {
      checkAuth();
      const id = parseInt(path.split('/')[2], 10);
      const list = getStorageItem('shop_products', defaultProducts);
      const index = list.findIndex((p: any) => p.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], ...body };
        setStorageItem('shop_products', list);
        logActivity(`Updated product specs for "${list[index].name}"`, 'Products / Inventory');
        return { data: list[index] } as any;
      }
    }

    if (path.startsWith('/categories/')) {
      checkAuth();
      const id = parseInt(path.split('/')[2], 10);
      const list = getStorageItem('shop_categories', defaultCategories);
      const index = list.findIndex((c: any) => c.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], ...body };
        setStorageItem('shop_categories', list);
        return { data: list[index] } as any;
      }
    }

    if (path.startsWith('/brands/')) {
      checkAuth();
      const id = parseInt(path.split('/')[2], 10);
      const list = getStorageItem('shop_brands', defaultBrands);
      const index = list.findIndex((b: any) => b.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], ...body };
        setStorageItem('shop_brands', list);
        return { data: list[index] } as any;
      }
    }

    if (path.startsWith('/units/')) {
      checkAuth();
      const id = parseInt(path.split('/')[2], 10);
      const list = getStorageItem('shop_units', defaultUnits);
      const index = list.findIndex((u: any) => u.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], ...body };
        setStorageItem('shop_units', list);
        return { data: list[index] } as any;
      }
    }

    if (path.startsWith('/expenses/')) {
      checkAuth();
      const id = parseInt(path.split('/')[2], 10);
      const list = getStorageItem('shop_expenses', defaultExpenses);
      const index = list.findIndex((e: any) => e.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], ...body };
        setStorageItem('shop_expenses', list);
        logActivity(`Updated expense #${id}`, 'Expenses');
        return { data: list[index] } as any;
      }
    }

    if (path.startsWith('/users/')) {
      checkAuth();
      const id = parseInt(path.split('/')[2], 10);
      const list = getStorageItem('shop_users_mgmt', defaultUserAccounts);
      const index = list.findIndex((u: any) => u.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], ...body };
        setStorageItem('shop_users_mgmt', list);
        logActivity(`Updated user settings for "${list[index].username}"`, 'Users & Roles');
        return { data: list[index] } as any;
      }
    }

    if (path.startsWith('/employees/')) {
      checkAuth();
      const id = parseInt(path.split('/')[2], 10);
      const list = getStorageItem('shop_employees', defaultEmployees);
      const index = list.findIndex((e: any) => e.id === id);
      if (index !== -1) {
        const rawAcc = String(body.account_number || list[index].account_number || '');
        const maskedAcc = rawAcc.length >= 4 ? `XXXX XXXX ${rawAcc.slice(-4)}` : list[index].masked_account;
        list[index] = { ...list[index], ...body, masked_account: maskedAcc };
        setStorageItem('shop_employees', list);
        logActivity(`Updated employee profile for "${list[index].name}"`, 'Salary / Payroll');
        return { data: list[index] } as any;
      }
    }

    if (path === '/settings') {
      checkAuth();
      const current = getStorageItem('shop_settings', defaultSettings);
      const updated = { ...current, ...body };
      setStorageItem('shop_settings', updated);
      logActivity('Saved enterprise business settings', 'Settings');
      return { data: updated } as any;
    }

    const err: any = new Error('Not Found');
    err.response = { status: 404, data: { error: 'Endpoint not found: ' + path } };
    throw err;
  },

  delete: async <T = any>(url: string): Promise<{ data: T }> => {
    const [path] = url.split('?');
    await new Promise(r => setTimeout(r, 60));

    const checkAuth = () => {
      if (!localStorage.getItem('token')) {
        const err: any = new Error('Unauthorized');
        err.response = { status: 401, data: { error: 'Unauthorized' } };
        throw err;
      }
    };

    if (path.startsWith('/employees/')) {
      checkAuth();
      const id = parseInt(path.split('/')[2], 10);
      const list = getStorageItem('shop_employees', defaultEmployees);
      const filtered = list.filter((e: any) => e.id !== id);
      setStorageItem('shop_employees', filtered);
      logActivity(`Removed employee profile #${id}`, 'Salary / Payroll', 'Warning');
      return { data: { success: true } } as any;
    }

    if (path.startsWith('/payroll/advances/')) {
      checkAuth();
      const id = parseInt(path.split('/')[2], 10);
      const list = getStorageItem('shop_salary_advances', defaultAdvances);
      const filtered = list.filter((a: any) => a.id !== id);
      setStorageItem('shop_salary_advances', filtered);
      logActivity(`Cancelled advance entry #${id}`, 'Salary / Payroll', 'Warning');
      return { data: { success: true } } as any;
    }

    if (path.startsWith('/customers/')) {
      checkAuth();
      const id = parseInt(path.split('/')[2], 10);
      const list = getStorageItem('shop_customers', []);
      const filtered = list.filter((c: any) => c.id !== id);
      setStorageItem('shop_customers', filtered);
      logActivity(`Deleted customer #${id}`, 'Customers', 'Warning');
      return { data: { success: true } } as any;
    }

    if (path.startsWith('/vendors/')) {
      checkAuth();
      const id = parseInt(path.split('/')[2], 10);
      const list = getStorageItem('shop_vendors', []);
      const filtered = list.filter((v: any) => v.id !== id);
      setStorageItem('shop_vendors', filtered);
      logActivity(`Deleted vendor #${id}`, 'Vendors', 'Warning');
      return { data: { success: true } } as any;
    }

    if (path.startsWith('/sales/')) {
      checkAuth();
      const id = parseInt(path.split('/')[2], 10);
      const list = getStorageItem('shop_sales', []);
      const filtered = list.filter((s: any) => s.id !== id);
      setStorageItem('shop_sales', filtered);
      logActivity(`Deleted sales entry #${id}`, 'Sales', 'Warning');
      return { data: { success: true } } as any;
    }

    if (path.startsWith('/purchases/')) {
      checkAuth();
      const id = parseInt(path.split('/')[2], 10);
      const list = getStorageItem('shop_purchases', []);
      const filtered = list.filter((p: any) => p.id !== id);
      setStorageItem('shop_purchases', filtered);
      logActivity(`Deleted purchase entry #${id}`, 'Purchase', 'Warning');
      return { data: { success: true } } as any;
    }

    if (path.startsWith('/banking/')) {
      checkAuth();
      const id = parseInt(path.split('/')[2], 10);
      const list = getStorageItem('shop_bank_entries', []);
      const filtered = list.filter((b: any) => b.id !== id);
      setStorageItem('shop_bank_entries', filtered);
      logActivity(`Deleted bank entry #${id}`, 'Banking', 'Warning');
      return { data: { success: true } } as any;
    }

    if (path.startsWith('/products/')) {
      checkAuth();
      const id = parseInt(path.split('/')[2], 10);
      const list = getStorageItem('shop_products', defaultProducts);
      const filtered = list.filter((p: any) => p.id !== id);
      setStorageItem('shop_products', filtered);
      logActivity(`Deleted product #${id}`, 'Products / Inventory', 'Warning');
      return { data: { success: true } } as any;
    }

    if (path.startsWith('/categories/')) {
      checkAuth();
      const id = parseInt(path.split('/')[2], 10);
      const list = getStorageItem('shop_categories', defaultCategories);
      const filtered = list.filter((c: any) => c.id !== id);
      setStorageItem('shop_categories', filtered);
      return { data: { success: true } } as any;
    }

    if (path.startsWith('/brands/')) {
      checkAuth();
      const id = parseInt(path.split('/')[2], 10);
      const list = getStorageItem('shop_brands', defaultBrands);
      const filtered = list.filter((b: any) => b.id !== id);
      setStorageItem('shop_brands', filtered);
      return { data: { success: true } } as any;
    }

    if (path.startsWith('/units/')) {
      checkAuth();
      const id = parseInt(path.split('/')[2], 10);
      const list = getStorageItem('shop_units', defaultUnits);
      const filtered = list.filter((u: any) => u.id !== id);
      setStorageItem('shop_units', filtered);
      return { data: { success: true } } as any;
    }

    if (path.startsWith('/invoices/')) {
      checkAuth();
      const id = parseInt(path.split('/')[2], 10);
      const list = getStorageItem('shop_invoices', defaultInvoices);
      const filtered = list.filter((i: any) => i.id !== id);
      setStorageItem('shop_invoices', filtered);
      logActivity(`Deleted invoice #${id}`, 'Invoices', 'Warning');
      return { data: { success: true } } as any;
    }

    if (path.startsWith('/expenses/')) {
      checkAuth();
      const id = parseInt(path.split('/')[2], 10);
      const list = getStorageItem('shop_expenses', defaultExpenses);
      const filtered = list.filter((e: any) => e.id !== id);
      setStorageItem('shop_expenses', filtered);
      logActivity(`Deleted expense #${id}`, 'Expenses', 'Warning');
      return { data: { success: true } } as any;
    }

    if (path.startsWith('/users/')) {
      checkAuth();
      const id = parseInt(path.split('/')[2], 10);
      const list = getStorageItem('shop_users_mgmt', defaultUserAccounts);
      const filtered = list.filter((u: any) => u.id !== id);
      setStorageItem('shop_users_mgmt', filtered);
      logActivity(`Removed user profile #${id}`, 'Users & Roles', 'Warning');
      return { data: { success: true } } as any;
    }

    const err: any = new Error('Not Found');
    err.response = { status: 404, data: { error: 'Endpoint not found: ' + path } };
    throw err;
  }
};

export default api;
