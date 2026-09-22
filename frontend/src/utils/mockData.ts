// Comprehensive Mock Data for ShopManager ERP

export interface Product {
  id: number;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  brand: string;
  unit: string;
  purchase_price: number;
  selling_price: number;
  current_stock: number;
  minimum_stock: number;
  gst_percent: number;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface StockHistoryEntry {
  id: number;
  date: string;
  product_id: number;
  product_name: string;
  transaction_type: 'Purchase' | 'Sale' | 'Sales Return' | 'Purchase Return' | 'Stock Adjustment';
  reference: string;
  quantity_in: number;
  quantity_out: number;
  balance: number;
  remarks?: string;
}

export interface InvoiceLineItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount: number;
  gst_percent: number;
  total: number;
}

export interface Invoice {
  id: number;
  invoice_no: string;
  date: string;
  customer_id: number;
  customer_name: string;
  customer_mobile: string;
  customer_address: string;
  customer_gstin: string;
  payment_type: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Credit';
  items: InvoiceLineItem[];
  subtotal: number;
  discount: number;
  cgst: number;
  sgst: number;
  igst: number;
  grand_total: number;
  paid_amount: number;
  balance_amount: number;
  payment_status: 'Paid' | 'Partial' | 'Pending';
  terms: string;
}

export interface ReturnEntry {
  id: number;
  return_no: string;
  type: 'Sales Return' | 'Purchase Return';
  date: string;
  reference_bill: string;
  party_name: string; // Customer or Vendor
  party_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  reason: string;
  amount: number;
  refund_method?: string;
  status: 'Completed' | 'Pending' | 'Refunded';
  remarks?: string;
}

export interface Expense {
  id: number;
  date: string;
  category: string;
  description: string;
  amount: number;
  payment_method: string;
  reference_no: string;
  notes: string;
}

export interface UserAccount {
  id: number;
  username: string;
  email: string;
  mobile: string;
  role: string;
  status: 'Active' | 'Inactive';
  last_login: string;
}

export interface ActivityLog {
  id: number;
  user: string;
  action: string;
  module: string;
  timestamp: string;
  status: 'Success' | 'Warning' | 'Info';
}

export interface ShopSettings {
  business_name: string;
  owner_name: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string;
  business_logo?: string;
  
  invoice_prefix: string;
  invoice_next_num: number;
  show_gst: boolean;
  show_customer_gstin: boolean;
  show_terms: boolean;
  invoice_footer: string;
  
  enable_gst: boolean;
  default_gst_rate: number;
  cgst_rate: number;
  sgst_rate: number;
  igst_rate: number;
  
  payment_methods: {
    cash: boolean;
    upi: boolean;
    card: boolean;
    bank_transfer: boolean;
    credit: boolean;
  };
  
  bank_accounts: Array<{
    id: number;
    bank_name: string;
    account_name: string;
    account_number: string;
    ifsc: string;
    opening_balance: number;
    status: 'Active' | 'Inactive';
  }>;
  
  prefixes: {
    sale: string;
    purchase: string;
    sales_return: string;
    purchase_return: string;
    expense: string;
  };
}

const getRelDate = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const defaultProducts: Product[] = [
  {
    id: 1,
    sku: 'SAM-CHG-25W',
    barcode: '8901234500011',
    name: 'Samsung 25W Fast Charger Type-C',
    category: 'Electronics',
    brand: 'Samsung',
    unit: 'Piece',
    purchase_price: 850,
    selling_price: 1299,
    current_stock: 24,
    minimum_stock: 8,
    gst_percent: 18,
    description: 'Original Samsung Super Fast Adapter 25W Type-C port',
    status: 'Active'
  },
  {
    id: 2,
    sku: 'HP-MOU-WRL',
    barcode: '8901234500028',
    name: 'HP Wireless Optical Mouse 250',
    category: 'Computer Accessories',
    brand: 'HP',
    unit: 'Piece',
    purchase_price: 550,
    selling_price: 899,
    current_stock: 18,
    minimum_stock: 6,
    gst_percent: 18,
    description: 'Ergonomic 2.4GHz USB nano receiver wireless mouse',
    status: 'Active'
  },
  {
    id: 3,
    sku: 'LOG-KB-K120',
    barcode: '8901234500035',
    name: 'Logitech K120 USB Wired Keyboard',
    category: 'Computer Accessories',
    brand: 'Logitech',
    unit: 'Piece',
    purchase_price: 900,
    selling_price: 1450,
    current_stock: 12,
    minimum_stock: 5,
    gst_percent: 18,
    description: 'Spill-resistant durable full size retail keyboard',
    status: 'Active'
  },
  {
    id: 4,
    sku: 'PHI-LED-12W',
    barcode: '8901234500042',
    name: 'Philips LED Bulb 12W Cool Daylight B22',
    category: 'Lighting & Electrical',
    brand: 'Philips',
    unit: 'Piece',
    purchase_price: 95,
    selling_price: 160,
    current_stock: 5, // LOW STOCK (minimum 10)
    minimum_stock: 10,
    gst_percent: 12,
    description: 'Energy saving high lumen cool white B22 pin bulb',
    status: 'Active'
  },
  {
    id: 5,
    sku: 'BOAT-CAB-TYPC',
    barcode: '8901234500059',
    name: 'boAt Deuce Type-C Fast Sync Cable 1.5m',
    category: 'Mobile Accessories',
    brand: 'boAt',
    unit: 'Piece',
    purchase_price: 120,
    selling_price: 299,
    current_stock: 7, // LOW STOCK (minimum 15)
    minimum_stock: 15,
    gst_percent: 18,
    description: 'Braided tangle-free 3A fast charging Type C cable',
    status: 'Active'
  },
  {
    id: 6,
    sku: 'JK-PPR-A4-75',
    barcode: '8901234500066',
    name: 'JK Copier A4 Paper 75 GSM (Ream of 500)',
    category: 'Stationery',
    brand: 'JK Paper',
    unit: 'Box',
    purchase_price: 280,
    selling_price: 360,
    current_stock: 42,
    minimum_stock: 10,
    gst_percent: 12,
    description: 'High brightness premium photocopy paper ream',
    status: 'Active'
  },
  {
    id: 7,
    sku: 'BOAT-SPK-R100',
    barcode: '8901234500073',
    name: 'boAt Stone 190 Portable Bluetooth Speaker',
    category: 'Electronics',
    brand: 'boAt',
    unit: 'Piece',
    purchase_price: 1100,
    selling_price: 1999,
    current_stock: 15,
    minimum_stock: 5,
    gst_percent: 18,
    description: '5W RMS immersive sound IPX7 water resistant wireless speaker',
    status: 'Active'
  },
  {
    id: 8,
    sku: 'AMB-PB-10K',
    barcode: '8901234500080',
    name: 'Ambrane 10000mAh Compact Power Bank',
    category: 'Mobile Accessories',
    brand: 'Ambrane',
    unit: 'Piece',
    purchase_price: 750,
    selling_price: 1199,
    current_stock: 14,
    minimum_stock: 5,
    gst_percent: 18,
    description: '20W dual output fast charge slim pocket power bank',
    status: 'Active'
  },
  {
    id: 9,
    sku: 'ANC-EXT-4WAY',
    barcode: '8901234500097',
    name: 'Anchor 4-Way Surge Extension Board with Master Switch',
    category: 'Lighting & Electrical',
    brand: 'Anchor',
    unit: 'Piece',
    purchase_price: 320,
    selling_price: 520,
    current_stock: 0, // OUT OF STOCK (minimum 5)
    minimum_stock: 5,
    gst_percent: 18,
    description: 'Heavy duty brass terminals 2m power cord surge protection',
    status: 'Active'
  },
  {
    id: 10,
    sku: 'SND-PD-64GB',
    barcode: '8901234500103',
    name: 'SanDisk Ultra Dual Drive Go 64GB Type-C',
    category: 'Computer Accessories',
    brand: 'SanDisk',
    unit: 'Piece',
    purchase_price: 380,
    selling_price: 649,
    current_stock: 22,
    minimum_stock: 8,
    gst_percent: 18,
    description: '2-in-1 flash drive for USB Type-C & Type-A devices',
    status: 'Active'
  }
];

export const defaultCategories = [
  { id: 1, name: 'Electronics', product_count: 2, status: 'Active' },
  { id: 2, name: 'Computer Accessories', product_count: 3, status: 'Active' },
  { id: 3, name: 'Lighting & Electrical', product_count: 2, status: 'Active' },
  { id: 4, name: 'Stationery', product_count: 1, status: 'Active' },
  { id: 5, name: 'Mobile Accessories', product_count: 2, status: 'Active' }
];

export const defaultBrands = [
  { id: 1, name: 'Samsung', product_count: 1, status: 'Active' },
  { id: 2, name: 'HP', product_count: 1, status: 'Active' },
  { id: 3, name: 'Logitech', product_count: 1, status: 'Active' },
  { id: 4, name: 'Philips', product_count: 1, status: 'Active' },
  { id: 5, name: 'Syska', product_count: 0, status: 'Active' },
  { id: 6, name: 'boAt', product_count: 2, status: 'Active' },
  { id: 7, name: 'Ambrane', product_count: 1, status: 'Active' },
  { id: 8, name: 'Anchor', product_count: 1, status: 'Active' },
  { id: 9, name: 'SanDisk', product_count: 1, status: 'Active' },
  { id: 10, name: 'JK Paper', product_count: 1, status: 'Active' }
];

export const defaultUnits = [
  { id: 1, name: 'Piece', short_code: 'Pcs', description: 'Countable individual units' },
  { id: 2, name: 'Box', short_code: 'Bx', description: 'Pre-packed master box / carton' },
  { id: 3, name: 'Kg', short_code: 'Kg', description: 'Kilograms weight measure' },
  { id: 4, name: 'Litre', short_code: 'Ltr', description: 'Liquid volumetric measure' },
  { id: 5, name: 'Meter', short_code: 'Mtr', description: 'Length measurement' },
  { id: 6, name: 'Dozen', short_code: 'Dzn', description: 'Set of 12 pieces' }
];

export const defaultStockHistory: StockHistoryEntry[] = [
  {
    id: 1,
    date: getRelDate(-10),
    product_id: 1,
    product_name: 'Samsung 25W Fast Charger Type-C',
    transaction_type: 'Purchase',
    reference: 'PUR-00001',
    quantity_in: 30,
    quantity_out: 0,
    balance: 30,
    remarks: 'Initial vendor consignment inbound'
  },
  {
    id: 2,
    date: getRelDate(-8),
    product_id: 1,
    product_name: 'Samsung 25W Fast Charger Type-C',
    transaction_type: 'Sale',
    reference: 'SALE-00001',
    quantity_in: 0,
    quantity_out: 6,
    balance: 24,
    remarks: 'Billed to counter customer'
  },
  {
    id: 3,
    date: getRelDate(-7),
    product_id: 4,
    product_name: 'Philips LED Bulb 12W Cool Daylight B22',
    transaction_type: 'Purchase',
    reference: 'PUR-00002',
    quantity_in: 25,
    quantity_out: 0,
    balance: 25,
    remarks: 'Stock replenishment'
  },
  {
    id: 4,
    date: getRelDate(-4),
    product_id: 4,
    product_name: 'Philips LED Bulb 12W Cool Daylight B22',
    transaction_type: 'Sale',
    reference: 'SALE-00004',
    quantity_in: 0,
    quantity_out: 22,
    balance: 3,
    remarks: 'Wholesale order dispatch'
  },
  {
    id: 5,
    date: getRelDate(-2),
    product_id: 4,
    product_name: 'Philips LED Bulb 12W Cool Daylight B22',
    transaction_type: 'Sales Return',
    reference: 'RET-S-00001',
    quantity_in: 2,
    quantity_out: 0,
    balance: 5,
    remarks: 'Returned 2 pcs due to loose packaging'
  },
  {
    id: 6,
    date: getRelDate(-1),
    product_id: 9,
    product_name: 'Anchor 4-Way Surge Extension Board with Master Switch',
    transaction_type: 'Stock Adjustment',
    reference: 'ADJ-0001',
    quantity_in: 0,
    quantity_out: 4,
    balance: 0,
    remarks: 'Physical audit clearance of damaged stock'
  }
];

export const defaultInvoices: Invoice[] = [
  {
    id: 1,
    invoice_no: 'INV-01001',
    date: getRelDate(0),
    customer_id: 1,
    customer_name: 'Apex Retailers',
    customer_mobile: '9876543210',
    customer_address: '104 Market Road, Commercial Complex, Mumbai',
    customer_gstin: '27AAAAA1111A1Z1',
    payment_type: 'UPI',
    items: [
      {
        product_id: 1,
        product_name: 'Samsung 25W Fast Charger Type-C',
        quantity: 5,
        unit_price: 1299,
        discount: 200,
        gst_percent: 18,
        total: 7428.1
      },
      {
        product_id: 2,
        product_name: 'HP Wireless Optical Mouse 250',
        quantity: 3,
        unit_price: 899,
        discount: 100,
        gst_percent: 18,
        total: 3064.46
      }
    ],
    subtotal: 9192,
    discount: 300,
    cgst: 650.28,
    sgst: 650.28,
    igst: 0,
    grand_total: 10492.56,
    paid_amount: 10492.56,
    balance_amount: 0,
    payment_status: 'Paid',
    terms: 'Thank you for your business. Payment received via UPI.'
  },
  {
    id: 2,
    invoice_no: 'INV-01002',
    date: getRelDate(-1),
    customer_id: 2,
    customer_name: 'Sharma Enterprises',
    customer_mobile: '8765432109',
    customer_address: '45 MG Road, Gandhi Nagar, Bengaluru',
    customer_gstin: '29ABCDE1234F1Z5',
    payment_type: 'Credit',
    items: [
      {
        product_id: 3,
        product_name: 'Logitech K120 USB Wired Keyboard',
        quantity: 6,
        unit_price: 1450,
        discount: 400,
        gst_percent: 18,
        total: 9794
      },
      {
        product_id: 10,
        product_name: 'SanDisk Ultra Dual Drive Go 64GB Type-C',
        quantity: 10,
        unit_price: 649,
        discount: 200,
        gst_percent: 18,
        total: 7422.2
      }
    ],
    subtotal: 15190,
    discount: 600,
    cgst: 1308.1,
    sgst: 1308.1,
    igst: 0,
    grand_total: 17216.2,
    paid_amount: 5000,
    balance_amount: 12216.2,
    payment_status: 'Partial',
    terms: '15 Days credit term allowed. Remainder payable on or before due date.'
  },
  {
    id: 3,
    invoice_no: 'INV-01003',
    date: getRelDate(-3),
    customer_id: 3,
    customer_name: 'Priya Supermarket',
    customer_mobile: '9123456789',
    customer_address: '12 Temple Street, T. Nagar, Chennai',
    customer_gstin: '33AABCP9999P1ZZ',
    payment_type: 'Cash',
    items: [
      {
        product_id: 6,
        product_name: 'JK Copier A4 Paper 75 GSM (Ream of 500)',
        quantity: 20,
        unit_price: 360,
        discount: 400,
        gst_percent: 12,
        total: 7616
      }
    ],
    subtotal: 7200,
    discount: 400,
    cgst: 408,
    sgst: 408,
    igst: 0,
    grand_total: 7616,
    paid_amount: 7616,
    balance_amount: 0,
    payment_status: 'Paid',
    terms: 'Counter cash invoice paid in full.'
  }
];

export const defaultReturns: ReturnEntry[] = [
  {
    id: 1,
    return_no: 'RET-S-00001',
    type: 'Sales Return',
    date: getRelDate(-2),
    reference_bill: 'SALE-00002',
    party_name: 'Sharma Enterprises',
    party_id: 2,
    product_id: 4,
    product_name: 'Philips LED Bulb 12W Cool Daylight B22',
    quantity: 2,
    reason: 'Defective unit with flickering light',
    amount: 320,
    refund_method: 'Cash',
    status: 'Completed',
    remarks: 'Tested at counter; issued instant cash refund'
  },
  {
    id: 2,
    return_no: 'RET-S-00002',
    type: 'Sales Return',
    date: getRelDate(-1),
    reference_bill: 'SALE-00003',
    party_name: 'Priya Supermarket',
    party_id: 3,
    product_id: 5,
    product_name: 'boAt Deuce Type-C Fast Sync Cable 1.5m',
    quantity: 1,
    reason: 'Customer Changed Mind (Required Lightning cable)',
    amount: 299,
    refund_method: 'Store Credit',
    status: 'Completed',
    remarks: 'Product seal intact; store credit adjusted against next purchase'
  },
  {
    id: 3,
    return_no: 'RET-P-00001',
    type: 'Purchase Return',
    date: getRelDate(-3),
    reference_bill: 'PUR-00001',
    party_name: 'TechSource Components Pvt',
    party_id: 3,
    product_id: 2,
    product_name: 'HP Wireless Optical Mouse 250',
    quantity: 2,
    reason: 'Damaged packaging during transit consignment',
    amount: 1100,
    refund_method: 'Bank Transfer',
    status: 'Completed',
    remarks: 'Debit note DN-2024-04 issued to supplier'
  }
];

export const defaultExpenses: Expense[] = [
  {
    id: 1,
    date: getRelDate(0),
    category: 'Internet',
    description: 'Airtel Broadband Office Commercial Plan',
    amount: 1180,
    payment_method: 'UPI',
    reference_no: 'UPI-BB-99201',
    notes: 'Monthly 200Mbps unlimited connection'
  },
  {
    id: 2,
    date: getRelDate(0),
    category: 'Office Supplies',
    description: 'Thermal POS billing rolls (10 pcs) & stationery',
    amount: 650,
    payment_method: 'Cash',
    reference_no: 'CASH-REC-112',
    notes: 'Local market purchase'
  },
  {
    id: 3,
    date: getRelDate(-2),
    category: 'Transport',
    description: 'Inward goods tempo unloading charges',
    amount: 1850,
    payment_method: 'Cash',
    reference_no: 'VOUCH-089',
    notes: 'Consignment delivery from railway goods shed'
  },
  {
    id: 4,
    date: getRelDate(-4),
    category: 'Electricity',
    description: 'BESCOM Commercial Power Bill for Store',
    amount: 4250,
    payment_method: 'Bank Transfer',
    reference_no: 'NEFT-BESCOM-0041',
    notes: 'Monthly power consumption meter #8812'
  },
  {
    id: 5,
    date: getRelDate(-7),
    category: 'Rent',
    description: 'Main Showroom Shop Rent for Current Month',
    amount: 25000,
    payment_method: 'Bank Transfer',
    reference_no: 'NEFT-RENT-0012',
    notes: 'Paid to Landlord Mr. K. Hegde'
  },
  {
    id: 6,
    date: getRelDate(-8),
    category: 'Marketing',
    description: 'Local Festival Pamphlet printing & newspaper inserts',
    amount: 2500,
    payment_method: 'UPI',
    reference_no: 'UPI-MKTG-551',
    notes: 'Covered 5km residential radius'
  },
  {
    id: 7,
    date: getRelDate(-10),
    category: 'Salary',
    description: 'Store Assistant & Cashier monthly advance / salary',
    amount: 40000,
    payment_method: 'Bank Transfer',
    reference_no: 'RTGS-SAL-1029',
    notes: 'Disbursed to staff bank accounts'
  }
];

export const defaultUserAccounts: UserAccount[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@shopmanager.in',
    mobile: '9876500001',
    role: 'Admin',
    status: 'Active',
    last_login: 'Today, 09:12 AM'
  },
  {
    id: 2,
    username: 'sunil.manager',
    email: 'sunil@shopmanager.in',
    mobile: '9876500002',
    role: 'Manager',
    status: 'Active',
    last_login: 'Today, 10:35 AM'
  },
  {
    id: 3,
    username: 'amit.sales',
    email: 'amit@shopmanager.in',
    mobile: '9876500003',
    role: 'Sales Staff',
    status: 'Active',
    last_login: 'Today, 11:20 AM'
  },
  {
    id: 4,
    username: 'suresh.purchase',
    email: 'suresh@shopmanager.in',
    mobile: '9876500004',
    role: 'Purchase Staff',
    status: 'Active',
    last_login: 'Yesterday, 04:50 PM'
  },
  {
    id: 5,
    username: 'kavita.accounts',
    email: 'kavita@shopmanager.in',
    mobile: '9876500005',
    role: 'Accountant',
    status: 'Active',
    last_login: 'Today, 08:45 AM'
  }
];

export const defaultRoles = [
  {
    id: 1,
    name: 'Admin',
    description: 'Full system control, financial authority, user management & settings',
    users_count: 1
  },
  {
    id: 2,
    name: 'Manager',
    description: 'Store operations, inventory oversight, sales approval & reports',
    users_count: 1
  },
  {
    id: 3,
    name: 'Sales Staff',
    description: 'Point of sale billing, customer receipts, invoices & sales returns',
    users_count: 1
  },
  {
    id: 4,
    name: 'Purchase Staff',
    description: 'Supplier orders, inbound stock entries, vendor bills & purchase returns',
    users_count: 1
  },
  {
    id: 5,
    name: 'Accountant',
    description: 'Bank books, ledger reconciliation, expense management & tax reporting',
    users_count: 1
  }
];

export const defaultModulesList = [
  'Dashboard',
  'Sales',
  'Purchase',
  'Products / Inventory',
  'Customers',
  'Vendors',
  'Pending Payments',
  'Banking',
  'Returns',
  'Expenses',
  'Reports',
  'Invoices',
  'Users',
  'Settings'
];

export const defaultRolePermissions: Record<string, Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean; export: boolean }>> = {
  Admin: defaultModulesList.reduce((acc, mod) => {
    acc[mod] = { view: true, create: true, edit: true, delete: true, export: true };
    return acc;
  }, {} as any),
  Manager: defaultModulesList.reduce((acc, mod) => {
    acc[mod] = { view: true, create: true, edit: true, delete: mod !== 'Settings' && mod !== 'Users', export: true };
    return acc;
  }, {} as any),
  'Sales Staff': defaultModulesList.reduce((acc, mod) => {
    const isSalesMod = ['Dashboard', 'Sales', 'Products / Inventory', 'Customers', 'Invoices', 'Returns'].includes(mod);
    acc[mod] = { 
      view: isSalesMod, 
      create: ['Sales', 'Customers', 'Invoices', 'Returns'].includes(mod), 
      edit: ['Sales', 'Customers'].includes(mod), 
      delete: false, 
      export: isSalesMod 
    };
    return acc;
  }, {} as any),
  'Purchase Staff': defaultModulesList.reduce((acc, mod) => {
    const isPurMod = ['Dashboard', 'Purchase', 'Products / Inventory', 'Vendors', 'Returns'].includes(mod);
    acc[mod] = { 
      view: isPurMod, 
      create: ['Purchase', 'Vendors', 'Returns'].includes(mod), 
      edit: ['Purchase', 'Vendors'].includes(mod), 
      delete: false, 
      export: isPurMod 
    };
    return acc;
  }, {} as any),
  Accountant: defaultModulesList.reduce((acc, mod) => {
    const isAccMod = ['Dashboard', 'Sales', 'Purchase', 'Pending Payments', 'Banking', 'Expenses', 'Reports', 'Invoices', 'Settings'].includes(mod);
    acc[mod] = { 
      view: isAccMod, 
      create: ['Banking', 'Expenses'].includes(mod), 
      edit: ['Banking', 'Expenses'].includes(mod), 
      delete: false, 
      export: true 
    };
    return acc;
  }, {} as any)
};

export const defaultActivityLogs: ActivityLog[] = [
  {
    id: 1,
    user: 'Admin',
    action: 'Created Sales Invoice INV-01001 for Apex Retailers',
    module: 'Invoices',
    timestamp: 'Today, 11:45 AM',
    status: 'Success'
  },
  {
    id: 2,
    user: 'Manager',
    action: 'Updated product stock for Samsung 25W Fast Charger (+10 pcs)',
    module: 'Products / Inventory',
    timestamp: 'Today, 10:30 AM',
    status: 'Info'
  },
  {
    id: 3,
    user: 'Sales Staff',
    action: 'Created new customer profile "Priya Supermarket"',
    module: 'Customers',
    timestamp: 'Today, 09:40 AM',
    status: 'Success'
  },
  {
    id: 4,
    user: 'Purchase Staff',
    action: 'Added purchase invoice PUR-00004 from Global Paper Co',
    module: 'Purchase',
    timestamp: 'Yesterday, 04:15 PM',
    status: 'Success'
  },
  {
    id: 5,
    user: 'Accountant',
    action: 'Logged utility expense of ₹4,250 for BESCOM Power',
    module: 'Expenses',
    timestamp: 'Yesterday, 02:20 PM',
    status: 'Info'
  },
  {
    id: 6,
    user: 'Admin',
    action: 'Approved sales return RET-S-00001 (Refund ₹320)',
    module: 'Returns',
    timestamp: '2 days ago, 03:10 PM',
    status: 'Warning'
  }
];

export const defaultSettings: ShopSettings = {
  business_name: 'ShopManager Retail Electronics & Store',
  owner_name: 'Rajesh Sharma',
  mobile: '9876543210',
  email: 'contact@shopmanager.in',
  address: 'Shop #12, Commercial Plaza, Brigade Road',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560001',
  gstin: '29ABCDE1234F1Z5',
  
  invoice_prefix: 'INV-',
  invoice_next_num: 1004,
  show_gst: true,
  show_customer_gstin: true,
  show_terms: true,
  invoice_footer: 'Thank you for shopping with us! Goods once sold can be exchanged within 7 days with original invoice.',
  
  enable_gst: true,
  default_gst_rate: 18,
  cgst_rate: 9,
  sgst_rate: 9,
  igst_rate: 18,
  
  payment_methods: {
    cash: true,
    upi: true,
    card: true,
    bank_transfer: true,
    credit: true
  },
  
  bank_accounts: [
    {
      id: 1,
      bank_name: 'HDFC Bank',
      account_name: 'ShopManager Current A/C',
      account_number: '•••• •••• •••• 4519',
      ifsc: 'HDFC0001234',
      opening_balance: 145000,
      status: 'Active'
    },
    {
      id: 2,
      bank_name: 'State Bank of India',
      account_name: 'Operational Reserve A/C',
      account_number: '•••• •••• •••• 8820',
      ifsc: 'SBIN0004567',
      opening_balance: 82000,
      status: 'Active'
    }
  ],
  
  prefixes: {
    sale: 'SALE-',
    purchase: 'PUR-',
    sales_return: 'RET-S-',
    purchase_return: 'RET-P-',
    expense: 'EXP-'
  }
};

export interface Employee {
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

export interface PayrollRecord {
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

export interface SalaryAdvance {
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

export const defaultEmployees: Employee[] = [
  {
    id: 1,
    emp_id: 'EMP-001',
    name: 'Arun Kumar',
    dob: '1992-05-14',
    gender: 'Male',
    mobile: '9876543201',
    email: 'arun.kumar@shopmanager.in',
    address: '24/B, 1st Cross, Indiranagar, Bengaluru, Karnataka',
    joining_date: '2023-03-15',
    department: 'Sales',
    designation: 'Sales Executive',
    employment_type: 'Full Time',
    salary_type: 'Monthly',
    basic_salary: 25000,
    hra: 2000,
    travel_allowance: 1000,
    food_allowance: 0,
    performance_bonus: 0,
    other_allowance: 0,
    overtime_rate: 150,
    late_deduction: 500,
    leave_deduction: 500,
    other_deduction: 0,
    bank_name: 'HDFC Bank',
    account_holder: 'Arun Kumar',
    account_number: '501004124587',
    masked_account: 'XXXX XXXX 4587',
    ifsc: 'HDFC0001234',
    status: 'Active'
  },
  {
    id: 2,
    emp_id: 'EMP-002',
    name: 'Priya S',
    dob: '1995-08-22',
    gender: 'Female',
    mobile: '9876543202',
    email: 'priya.s@shopmanager.in',
    address: '102 Lakshmi Nivas, Malleshwaram, Bengaluru, Karnataka',
    joining_date: '2023-06-01',
    department: 'Accounts',
    designation: 'Cashier',
    employment_type: 'Full Time',
    salary_type: 'Monthly',
    basic_salary: 20000,
    hra: 1500,
    travel_allowance: 500,
    food_allowance: 0,
    performance_bonus: 0,
    other_allowance: 0,
    overtime_rate: 120,
    late_deduction: 200,
    leave_deduction: 300,
    other_deduction: 0,
    bank_name: 'State Bank of India',
    account_holder: 'Priya S',
    account_number: '382910447812',
    masked_account: 'XXXX XXXX 7812',
    ifsc: 'SBIN0004567',
    status: 'Active'
  },
  {
    id: 3,
    emp_id: 'EMP-003',
    name: 'Karthik R',
    dob: '1988-11-03',
    gender: 'Male',
    mobile: '9876543203',
    email: 'karthik.r@shopmanager.in',
    address: '55 Green Glen Layout, Bellandur, Bengaluru, Karnataka',
    joining_date: '2022-01-10',
    department: 'Management',
    designation: 'Store Manager',
    employment_type: 'Full Time',
    salary_type: 'Monthly',
    basic_salary: 48000,
    hra: 5000,
    travel_allowance: 2500,
    food_allowance: 1500,
    performance_bonus: 3000,
    other_allowance: 0,
    overtime_rate: 250,
    late_deduction: 0,
    leave_deduction: 0,
    other_deduction: 0,
    bank_name: 'ICICI Bank',
    account_holder: 'Karthik R',
    account_number: '002105993421',
    masked_account: 'XXXX XXXX 3421',
    ifsc: 'ICIC0000021',
    status: 'Active'
  },
  {
    id: 4,
    emp_id: 'EMP-004',
    name: 'Divya M',
    dob: '1997-04-18',
    gender: 'Female',
    mobile: '9876543204',
    email: 'divya.m@shopmanager.in',
    address: '88 4th Main, Jayanagar, Bengaluru, Karnataka',
    joining_date: '2023-09-15',
    department: 'Sales',
    designation: 'Sales Staff',
    employment_type: 'Full Time',
    salary_type: 'Monthly',
    basic_salary: 18500,
    hra: 1500,
    travel_allowance: 500,
    food_allowance: 500,
    performance_bonus: 0,
    other_allowance: 0,
    overtime_rate: 110,
    late_deduction: 0,
    leave_deduction: 400,
    other_deduction: 0,
    bank_name: 'Axis Bank',
    account_holder: 'Divya M',
    account_number: '918020556190',
    masked_account: 'XXXX XXXX 6190',
    ifsc: 'UTIB0000918',
    status: 'Active'
  },
  {
    id: 5,
    emp_id: 'EMP-005',
    name: 'Suresh V',
    dob: '1994-01-29',
    gender: 'Male',
    mobile: '9876543205',
    email: 'suresh.v@shopmanager.in',
    address: '12 Railway Colony, Yeshwanthpur, Bengaluru, Karnataka',
    joining_date: '2023-11-01',
    department: 'Store',
    designation: 'Stock Assistant',
    employment_type: 'Full Time',
    salary_type: 'Monthly',
    basic_salary: 16000,
    hra: 1200,
    travel_allowance: 800,
    food_allowance: 500,
    performance_bonus: 0,
    other_allowance: 0,
    overtime_rate: 100,
    late_deduction: 300,
    leave_deduction: 300,
    other_deduction: 0,
    bank_name: 'Canara Bank',
    account_holder: 'Suresh V',
    account_number: '120034889012',
    masked_account: 'XXXX XXXX 9012',
    ifsc: 'CNRB0001200',
    status: 'Active'
  },
  {
    id: 6,
    emp_id: 'EMP-006',
    name: 'Ramesh Babu',
    dob: '1990-07-12',
    gender: 'Male',
    mobile: '9876543206',
    email: 'ramesh.babu@shopmanager.in',
    address: '77 Kanteerava Nagar, Peenya, Bengaluru, Karnataka',
    joining_date: '2022-08-20',
    department: 'Purchase',
    designation: 'Purchase Executive',
    employment_type: 'Full Time',
    salary_type: 'Monthly',
    basic_salary: 30000,
    hra: 2500,
    travel_allowance: 1200,
    food_allowance: 800,
    performance_bonus: 1000,
    other_allowance: 0,
    overtime_rate: 180,
    late_deduction: 0,
    leave_deduction: 0,
    other_deduction: 0,
    bank_name: 'Bank of Baroda',
    account_holder: 'Ramesh Babu',
    account_number: '278001994563',
    masked_account: 'XXXX XXXX 4563',
    ifsc: 'BARB0KORAMA',
    status: 'Active'
  },
  {
    id: 7,
    emp_id: 'EMP-007',
    name: 'Kavita Sharma',
    dob: '1991-03-25',
    gender: 'Female',
    mobile: '9876543207',
    email: 'kavita.sharma@shopmanager.in',
    address: '304 Shanti Enclave, Koramangala 4th Block, Bengaluru, Karnataka',
    joining_date: '2022-04-05',
    department: 'Accounts',
    designation: 'Senior Accountant',
    employment_type: 'Full Time',
    salary_type: 'Monthly',
    basic_salary: 38000,
    hra: 3500,
    travel_allowance: 1500,
    food_allowance: 1000,
    performance_bonus: 1500,
    other_allowance: 0,
    overtime_rate: 200,
    late_deduction: 0,
    leave_deduction: 0,
    other_deduction: 0,
    bank_name: 'HDFC Bank',
    account_holder: 'Kavita Sharma',
    account_number: '501008776543',
    masked_account: 'XXXX XXXX 6543',
    ifsc: 'HDFC0001234',
    status: 'Active'
  },
  {
    id: 8,
    emp_id: 'EMP-008',
    name: 'Anitha G',
    dob: '1993-09-08',
    gender: 'Female',
    mobile: '9876543208',
    email: 'anitha.g@shopmanager.in',
    address: '15 Anand Nagar, Hebbal, Bengaluru, Karnataka',
    joining_date: '2023-01-16',
    department: 'Administration',
    designation: 'Administration Officer',
    employment_type: 'Full Time',
    salary_type: 'Monthly',
    basic_salary: 26000,
    hra: 2500,
    travel_allowance: 1000,
    food_allowance: 500,
    performance_bonus: 0,
    other_allowance: 0,
    overtime_rate: 140,
    late_deduction: 250,
    leave_deduction: 500,
    other_deduction: 0,
    bank_name: 'State Bank of India',
    account_holder: 'Anitha G',
    account_number: '201145889320',
    masked_account: 'XXXX XXXX 9320',
    ifsc: 'SBIN0004567',
    status: 'Active'
  },
  {
    id: 9,
    emp_id: 'EMP-009',
    name: 'Vignesh K',
    dob: '1996-06-17',
    gender: 'Male',
    mobile: '9876543209',
    email: 'vignesh.k@shopmanager.in',
    address: '43 6th Cross, Rajajinagar, Bengaluru, Karnataka',
    joining_date: '2024-02-01',
    department: 'Store',
    designation: 'Store Assistant',
    employment_type: 'Full Time',
    salary_type: 'Monthly',
    basic_salary: 17000,
    hra: 1500,
    travel_allowance: 800,
    food_allowance: 500,
    performance_bonus: 0,
    other_allowance: 0,
    overtime_rate: 105,
    late_deduction: 0,
    leave_deduction: 350,
    other_deduction: 0,
    bank_name: 'Union Bank of India',
    account_holder: 'Vignesh K',
    account_number: '456012998341',
    masked_account: 'XXXX XXXX 8341',
    ifsc: 'UBIN0545601',
    status: 'Active'
  },
  {
    id: 10,
    emp_id: 'EMP-010',
    name: 'Meena P',
    dob: '1998-10-30',
    gender: 'Female',
    mobile: '9876543210',
    email: 'meena.p@shopmanager.in',
    address: '22 BTM 2nd Stage, Outer Ring Road, Bengaluru, Karnataka',
    joining_date: '2023-12-10',
    department: 'Sales',
    designation: 'Sales Staff',
    employment_type: 'Full Time',
    salary_type: 'Monthly',
    basic_salary: 19000,
    hra: 1600,
    travel_allowance: 600,
    food_allowance: 500,
    performance_bonus: 0,
    other_allowance: 0,
    overtime_rate: 115,
    late_deduction: 0,
    leave_deduction: 0,
    other_deduction: 0,
    bank_name: 'Indian Bank',
    account_holder: 'Meena P',
    account_number: '601928447190',
    masked_account: 'XXXX XXXX 7190',
    ifsc: 'IDIB000M024',
    status: 'Active'
  },
  {
    id: 11,
    emp_id: 'EMP-011',
    name: 'Rajesh Kannan',
    dob: '1989-02-14',
    gender: 'Male',
    mobile: '9876543211',
    email: 'rajesh.kannan@shopmanager.in',
    address: '90 Banashankari 3rd Stage, Bengaluru, Karnataka',
    joining_date: '2022-03-01',
    department: 'Store',
    designation: 'Inventory Supervisor',
    employment_type: 'Full Time',
    salary_type: 'Monthly',
    basic_salary: 32000,
    hra: 3000,
    travel_allowance: 1200,
    food_allowance: 800,
    performance_bonus: 1000,
    other_allowance: 0,
    overtime_rate: 190,
    late_deduction: 0,
    leave_deduction: 0,
    other_deduction: 0,
    bank_name: 'HDFC Bank',
    account_holder: 'Rajesh Kannan',
    account_number: '501009112847',
    masked_account: 'XXXX XXXX 2847',
    ifsc: 'HDFC0001234',
    status: 'Active'
  },
  {
    id: 12,
    emp_id: 'EMP-012',
    name: 'Deepak S',
    dob: '1995-12-05',
    gender: 'Male',
    mobile: '9876543212',
    email: 'deepak.s@shopmanager.in',
    address: '09 Vidyaranyapura Main Road, Bengaluru, Karnataka',
    joining_date: '2024-01-05',
    department: 'Store',
    designation: 'Driver & Logistics',
    employment_type: 'Full Time',
    salary_type: 'Monthly',
    basic_salary: 15500,
    hra: 1200,
    travel_allowance: 1500,
    food_allowance: 600,
    performance_bonus: 0,
    other_allowance: 0,
    overtime_rate: 110,
    late_deduction: 0,
    leave_deduction: 400,
    other_deduction: 0,
    bank_name: 'State Bank of India',
    account_holder: 'Deepak S',
    account_number: '310928441920',
    masked_account: 'XXXX XXXX 1920',
    ifsc: 'SBIN0004567',
    status: 'Active'
  }
];

export const defaultAdvances: SalaryAdvance[] = [
  {
    id: 1,
    employee_id: 1,
    employee_name: 'Arun Kumar',
    employee_code: 'EMP-001',
    date: '2026-09-10',
    advance_amount: 5000,
    recovered_amount: 2000,
    balance_amount: 3000,
    reason: 'Medical emergency in family',
    recovery_month: 'September 2026',
    status: 'Partially Recovered'
  },
  {
    id: 2,
    employee_id: 2,
    employee_name: 'Priya S',
    employee_code: 'EMP-002',
    date: '2026-09-05',
    advance_amount: 4000,
    recovered_amount: 2000,
    balance_amount: 2000,
    reason: 'Festival celebrations (Onam)',
    recovery_month: 'September 2026',
    status: 'Partially Recovered'
  },
  {
    id: 3,
    employee_id: 5,
    employee_name: 'Suresh V',
    employee_code: 'EMP-005',
    date: '2026-09-08',
    advance_amount: 6000,
    recovered_amount: 2000,
    balance_amount: 4000,
    reason: 'Bicycle repair and personal expense',
    recovery_month: 'September 2026',
    status: 'Partially Recovered'
  },
  {
    id: 4,
    employee_id: 4,
    employee_name: 'Divya M',
    employee_code: 'EMP-004',
    date: '2026-09-12',
    advance_amount: 5000,
    recovered_amount: 0,
    balance_amount: 5000,
    reason: 'College fee payment for sibling',
    recovery_month: 'October 2026',
    status: 'Pending'
  },
  {
    id: 5,
    employee_id: 12,
    employee_name: 'Deepak S',
    employee_code: 'EMP-012',
    date: '2026-09-02',
    advance_amount: 5000,
    recovered_amount: 2000,
    balance_amount: 3000,
    reason: 'Vehicle maintenance advance',
    recovery_month: 'September 2026',
    status: 'Partially Recovered'
  }
];

export const defaultPayrollRecords: PayrollRecord[] = [
  // September 2026 (Active/Current Month)
  {
    id: 1,
    salary_id: 'SAL-202609-001',
    employee_id: 1,
    employee_name: 'Arun Kumar',
    employee_code: 'EMP-001',
    department: 'Sales',
    designation: 'Sales Executive',
    month: 'September 2026',
    year: 2026,
    month_num: 9,
    basic_salary: 25000,
    hra: 2000,
    travel_allowance: 1000,
    food_allowance: 0,
    performance_bonus: 0,
    other_allowance: 0,
    overtime_amount: 1500,
    total_allowances: 4500,
    gross_salary: 29500,
    leave_deductions: 500,
    late_deductions: 500,
    loan_deductions: 0,
    advance_recovery: 0,
    other_deductions: 0,
    total_deductions: 1000,
    net_salary: 28500,
    paid_amount: 0,
    balance_amount: 28500,
    payment_status: 'Pending'
  },
  {
    id: 2,
    salary_id: 'SAL-202609-002',
    employee_id: 2,
    employee_name: 'Priya S',
    employee_code: 'EMP-002',
    department: 'Accounts',
    designation: 'Cashier',
    month: 'September 2026',
    year: 2026,
    month_num: 9,
    basic_salary: 20000,
    hra: 1500,
    travel_allowance: 500,
    food_allowance: 0,
    performance_bonus: 0,
    other_allowance: 0,
    overtime_amount: 0,
    total_allowances: 2000,
    gross_salary: 22000,
    leave_deductions: 300,
    late_deductions: 200,
    loan_deductions: 0,
    advance_recovery: 2000,
    other_deductions: 0,
    total_deductions: 2500,
    net_salary: 19500,
    paid_amount: 19500,
    balance_amount: 0,
    payment_status: 'Paid',
    payment_date: '2026-09-18',
    payment_method: 'Bank Transfer',
    reference_no: 'UTR92044810239',
    remarks: 'Disbursed via SBI Net Banking'
  },
  {
    id: 3,
    salary_id: 'SAL-202609-003',
    employee_id: 3,
    employee_name: 'Karthik R',
    employee_code: 'EMP-003',
    department: 'Management',
    designation: 'Store Manager',
    month: 'September 2026',
    year: 2026,
    month_num: 9,
    basic_salary: 48000,
    hra: 5000,
    travel_allowance: 2500,
    food_allowance: 1500,
    performance_bonus: 3000,
    other_allowance: 0,
    overtime_amount: 0,
    total_allowances: 12000,
    gross_salary: 60000,
    leave_deductions: 0,
    late_deductions: 0,
    loan_deductions: 0,
    advance_recovery: 0,
    other_deductions: 0,
    total_deductions: 0,
    net_salary: 60000,
    paid_amount: 60000,
    balance_amount: 0,
    payment_status: 'Paid',
    payment_date: '2026-09-18',
    payment_method: 'Bank Transfer',
    reference_no: 'UTR92044810240',
    remarks: 'Manager salary direct transfer ICICI'
  },
  {
    id: 4,
    salary_id: 'SAL-202609-004',
    employee_id: 4,
    employee_name: 'Divya M',
    employee_code: 'EMP-004',
    department: 'Sales',
    designation: 'Sales Staff',
    month: 'September 2026',
    year: 2026,
    month_num: 9,
    basic_salary: 18500,
    hra: 1500,
    travel_allowance: 500,
    food_allowance: 500,
    performance_bonus: 0,
    other_allowance: 0,
    overtime_amount: 1100,
    total_allowances: 3600,
    gross_salary: 22100,
    leave_deductions: 400,
    late_deductions: 0,
    loan_deductions: 0,
    advance_recovery: 0,
    other_deductions: 0,
    total_deductions: 400,
    net_salary: 21700,
    paid_amount: 21700,
    balance_amount: 0,
    payment_status: 'Paid',
    payment_date: '2026-09-18',
    payment_method: 'UPI',
    reference_no: 'UPI-9876543204-AXIS',
    remarks: 'Disbursed via Google Pay'
  },
  {
    id: 5,
    salary_id: 'SAL-202609-005',
    employee_id: 5,
    employee_name: 'Suresh V',
    employee_code: 'EMP-005',
    department: 'Store',
    designation: 'Stock Assistant',
    month: 'September 2026',
    year: 2026,
    month_num: 9,
    basic_salary: 16000,
    hra: 1200,
    travel_allowance: 800,
    food_allowance: 500,
    performance_bonus: 0,
    other_allowance: 0,
    overtime_amount: 1200,
    total_allowances: 3700,
    gross_salary: 19700,
    leave_deductions: 300,
    late_deductions: 300,
    loan_deductions: 0,
    advance_recovery: 2000,
    other_deductions: 0,
    total_deductions: 2600,
    net_salary: 17100,
    paid_amount: 0,
    balance_amount: 17100,
    payment_status: 'Pending'
  },
  {
    id: 6,
    salary_id: 'SAL-202609-006',
    employee_id: 6,
    employee_name: 'Ramesh Babu',
    employee_code: 'EMP-006',
    department: 'Purchase',
    designation: 'Purchase Executive',
    month: 'September 2026',
    year: 2026,
    month_num: 9,
    basic_salary: 30000,
    hra: 2500,
    travel_allowance: 1200,
    food_allowance: 800,
    performance_bonus: 1000,
    other_allowance: 0,
    overtime_amount: 0,
    total_allowances: 5500,
    gross_salary: 35500,
    leave_deductions: 0,
    late_deductions: 0,
    loan_deductions: 0,
    advance_recovery: 0,
    other_deductions: 0,
    total_deductions: 0,
    net_salary: 35500,
    paid_amount: 35500,
    balance_amount: 0,
    payment_status: 'Paid',
    payment_date: '2026-09-18',
    payment_method: 'Bank Transfer',
    reference_no: 'UTR92044810241',
    remarks: 'Disbursed via BOB RTGS'
  },
  {
    id: 7,
    salary_id: 'SAL-202609-007',
    employee_id: 7,
    employee_name: 'Kavita Sharma',
    employee_code: 'EMP-007',
    department: 'Accounts',
    designation: 'Senior Accountant',
    month: 'September 2026',
    year: 2026,
    month_num: 9,
    basic_salary: 38000,
    hra: 3500,
    travel_allowance: 1500,
    food_allowance: 1000,
    performance_bonus: 1500,
    other_allowance: 0,
    overtime_amount: 0,
    total_allowances: 7500,
    gross_salary: 45500,
    leave_deductions: 0,
    late_deductions: 0,
    loan_deductions: 0,
    advance_recovery: 0,
    other_deductions: 0,
    total_deductions: 0,
    net_salary: 45500,
    paid_amount: 45500,
    balance_amount: 0,
    payment_status: 'Paid',
    payment_date: '2026-09-18',
    payment_method: 'Bank Transfer',
    reference_no: 'UTR92044810242',
    remarks: 'Disbursed via HDFC NEFT'
  },
  {
    id: 8,
    salary_id: 'SAL-202609-008',
    employee_id: 8,
    employee_name: 'Anitha G',
    employee_code: 'EMP-008',
    department: 'Administration',
    designation: 'Administration Officer',
    month: 'September 2026',
    year: 2026,
    month_num: 9,
    basic_salary: 26000,
    hra: 2500,
    travel_allowance: 1000,
    food_allowance: 500,
    performance_bonus: 0,
    other_allowance: 0,
    overtime_amount: 0,
    total_allowances: 4000,
    gross_salary: 30000,
    leave_deductions: 500,
    late_deductions: 250,
    loan_deductions: 0,
    advance_recovery: 0,
    other_deductions: 0,
    total_deductions: 750,
    net_salary: 29250,
    paid_amount: 29250,
    balance_amount: 0,
    payment_status: 'Paid',
    payment_date: '2026-09-18',
    payment_method: 'Bank Transfer',
    reference_no: 'UTR92044810243',
    remarks: 'Disbursed via SBI NEFT'
  },
  {
    id: 9,
    salary_id: 'SAL-202609-009',
    employee_id: 9,
    employee_name: 'Vignesh K',
    employee_code: 'EMP-009',
    department: 'Store',
    designation: 'Store Assistant',
    month: 'September 2026',
    year: 2026,
    month_num: 9,
    basic_salary: 17000,
    hra: 1500,
    travel_allowance: 800,
    food_allowance: 500,
    performance_bonus: 0,
    other_allowance: 0,
    overtime_amount: 800,
    total_allowances: 3600,
    gross_salary: 20600,
    leave_deductions: 350,
    late_deductions: 0,
    loan_deductions: 0,
    advance_recovery: 0,
    other_deductions: 0,
    total_deductions: 350,
    net_salary: 20250,
    paid_amount: 20250,
    balance_amount: 0,
    payment_status: 'Paid',
    payment_date: '2026-09-19',
    payment_method: 'Cash',
    reference_no: 'CASH-VOUCHER-088',
    remarks: 'Disbursed in cash from cash counter'
  },
  {
    id: 10,
    salary_id: 'SAL-202609-010',
    employee_id: 10,
    employee_name: 'Meena P',
    employee_code: 'EMP-010',
    department: 'Sales',
    designation: 'Sales Staff',
    month: 'September 2026',
    year: 2026,
    month_num: 9,
    basic_salary: 19000,
    hra: 1600,
    travel_allowance: 600,
    food_allowance: 500,
    performance_bonus: 0,
    other_allowance: 0,
    overtime_amount: 0,
    total_allowances: 2700,
    gross_salary: 21700,
    leave_deductions: 0,
    late_deductions: 0,
    loan_deductions: 0,
    advance_recovery: 0,
    other_deductions: 0,
    total_deductions: 0,
    net_salary: 21700,
    paid_amount: 21700,
    balance_amount: 0,
    payment_status: 'Paid',
    payment_date: '2026-09-18',
    payment_method: 'UPI',
    reference_no: 'UPI-9876543210-PAYTM',
    remarks: 'Disbursed via Paytm UPI'
  },
  {
    id: 11,
    salary_id: 'SAL-202609-011',
    employee_id: 11,
    employee_name: 'Rajesh Kannan',
    employee_code: 'EMP-011',
    department: 'Store',
    designation: 'Inventory Supervisor',
    month: 'September 2026',
    year: 2026,
    month_num: 9,
    basic_salary: 32000,
    hra: 3000,
    travel_allowance: 1200,
    food_allowance: 800,
    performance_bonus: 1000,
    other_allowance: 0,
    overtime_amount: 0,
    total_allowances: 6000,
    gross_salary: 38000,
    leave_deductions: 0,
    late_deductions: 0,
    loan_deductions: 0,
    advance_recovery: 0,
    other_deductions: 0,
    total_deductions: 0,
    net_salary: 38000,
    paid_amount: 38000,
    balance_amount: 0,
    payment_status: 'Paid',
    payment_date: '2026-09-18',
    payment_method: 'Bank Transfer',
    reference_no: 'UTR92044810244',
    remarks: 'Disbursed via HDFC Net Banking'
  },
  {
    id: 12,
    salary_id: 'SAL-202609-012',
    employee_id: 12,
    employee_name: 'Deepak S',
    employee_code: 'EMP-012',
    department: 'Store',
    designation: 'Driver & Logistics',
    month: 'September 2026',
    year: 2026,
    month_num: 9,
    basic_salary: 15500,
    hra: 1200,
    travel_allowance: 1500,
    food_allowance: 600,
    performance_bonus: 0,
    other_allowance: 0,
    overtime_amount: 1100,
    total_allowances: 4400,
    gross_salary: 19900,
    leave_deductions: 400,
    late_deductions: 0,
    loan_deductions: 0,
    advance_recovery: 2000,
    other_deductions: 0,
    total_deductions: 2400,
    net_salary: 17500,
    paid_amount: 0,
    balance_amount: 17500,
    payment_status: 'Pending'
  },

  // August 2026 (All Paid)
  {
    id: 13,
    salary_id: 'SAL-202608-001',
    employee_id: 1,
    employee_name: 'Arun Kumar',
    employee_code: 'EMP-001',
    department: 'Sales',
    designation: 'Sales Executive',
    month: 'August 2026',
    year: 2026,
    month_num: 8,
    basic_salary: 25000,
    hra: 2000,
    travel_allowance: 1000,
    food_allowance: 0,
    performance_bonus: 1000,
    other_allowance: 0,
    overtime_amount: 1200,
    total_allowances: 5200,
    gross_salary: 30200,
    leave_deductions: 0,
    late_deductions: 300,
    loan_deductions: 0,
    advance_recovery: 0,
    other_deductions: 0,
    total_deductions: 300,
    net_salary: 29900,
    paid_amount: 29900,
    balance_amount: 0,
    payment_status: 'Paid',
    payment_date: '2026-08-31',
    payment_method: 'Bank Transfer',
    reference_no: 'UTR8103391001'
  },
  {
    id: 14,
    salary_id: 'SAL-202608-002',
    employee_id: 2,
    employee_name: 'Priya S',
    employee_code: 'EMP-002',
    department: 'Accounts',
    designation: 'Cashier',
    month: 'August 2026',
    year: 2026,
    month_num: 8,
    basic_salary: 20000,
    hra: 1500,
    travel_allowance: 500,
    food_allowance: 0,
    performance_bonus: 0,
    other_allowance: 0,
    overtime_amount: 0,
    total_allowances: 2000,
    gross_salary: 22000,
    leave_deductions: 0,
    late_deductions: 0,
    loan_deductions: 0,
    advance_recovery: 0,
    other_deductions: 0,
    total_deductions: 0,
    net_salary: 22000,
    paid_amount: 22000,
    balance_amount: 0,
    payment_status: 'Paid',
    payment_date: '2026-08-31',
    payment_method: 'Bank Transfer',
    reference_no: 'UTR8103391002'
  },
  {
    id: 15,
    salary_id: 'SAL-202608-003',
    employee_id: 3,
    employee_name: 'Karthik R',
    employee_code: 'EMP-003',
    department: 'Management',
    designation: 'Store Manager',
    month: 'August 2026',
    year: 2026,
    month_num: 8,
    basic_salary: 48000,
    hra: 5000,
    travel_allowance: 2500,
    food_allowance: 1500,
    performance_bonus: 3000,
    other_allowance: 0,
    overtime_amount: 0,
    total_allowances: 12000,
    gross_salary: 60000,
    leave_deductions: 0,
    late_deductions: 0,
    loan_deductions: 0,
    advance_recovery: 0,
    other_deductions: 0,
    total_deductions: 0,
    net_salary: 60000,
    paid_amount: 60000,
    balance_amount: 0,
    payment_status: 'Paid',
    payment_date: '2026-08-31',
    payment_method: 'Bank Transfer',
    reference_no: 'UTR8103391003'
  },
  {
    id: 16,
    salary_id: 'SAL-202608-004',
    employee_id: 4,
    employee_name: 'Divya M',
    employee_code: 'EMP-004',
    department: 'Sales',
    designation: 'Sales Staff',
    month: 'August 2026',
    year: 2026,
    month_num: 8,
    basic_salary: 18500,
    hra: 1500,
    travel_allowance: 500,
    food_allowance: 500,
    performance_bonus: 0,
    other_allowance: 0,
    overtime_amount: 0,
    total_allowances: 2500,
    gross_salary: 21000,
    leave_deductions: 0,
    late_deductions: 0,
    loan_deductions: 0,
    advance_recovery: 0,
    other_deductions: 0,
    total_deductions: 0,
    net_salary: 21000,
    paid_amount: 21000,
    balance_amount: 0,
    payment_status: 'Paid',
    payment_date: '2026-08-31',
    payment_method: 'UPI',
    reference_no: 'UPI-8103391004'
  },

  // July 2026 (All Paid)
  {
    id: 17,
    salary_id: 'SAL-202607-001',
    employee_id: 1,
    employee_name: 'Arun Kumar',
    employee_code: 'EMP-001',
    department: 'Sales',
    designation: 'Sales Executive',
    month: 'July 2026',
    year: 2026,
    month_num: 7,
    basic_salary: 25000,
    hra: 2000,
    travel_allowance: 1000,
    food_allowance: 0,
    performance_bonus: 0,
    other_allowance: 0,
    overtime_amount: 1000,
    total_allowances: 4000,
    gross_salary: 29000,
    leave_deductions: 0,
    late_deductions: 200,
    loan_deductions: 0,
    advance_recovery: 0,
    other_deductions: 0,
    total_deductions: 200,
    net_salary: 28800,
    paid_amount: 28800,
    balance_amount: 0,
    payment_status: 'Paid',
    payment_date: '2026-07-31',
    payment_method: 'Bank Transfer',
    reference_no: 'UTR7102281001'
  },
  {
    id: 18,
    salary_id: 'SAL-202607-002',
    employee_id: 2,
    employee_name: 'Priya S',
    employee_code: 'EMP-002',
    department: 'Accounts',
    designation: 'Cashier',
    month: 'July 2026',
    year: 2026,
    month_num: 7,
    basic_salary: 20000,
    hra: 1500,
    travel_allowance: 500,
    food_allowance: 0,
    performance_bonus: 0,
    other_allowance: 0,
    overtime_amount: 0,
    total_allowances: 2000,
    gross_salary: 22000,
    leave_deductions: 0,
    late_deductions: 0,
    loan_deductions: 0,
    advance_recovery: 0,
    other_deductions: 0,
    total_deductions: 0,
    net_salary: 22000,
    paid_amount: 22000,
    balance_amount: 0,
    payment_status: 'Paid',
    payment_date: '2026-07-31',
    payment_method: 'Bank Transfer',
    reference_no: 'UTR7102281002'
  },
  {
    id: 19,
    salary_id: 'SAL-202607-003',
    employee_id: 3,
    employee_name: 'Karthik R',
    employee_code: 'EMP-003',
    department: 'Management',
    designation: 'Store Manager',
    month: 'July 2026',
    year: 2026,
    month_num: 7,
    basic_salary: 48000,
    hra: 5000,
    travel_allowance: 2500,
    food_allowance: 1500,
    performance_bonus: 3000,
    other_allowance: 0,
    overtime_amount: 0,
    total_allowances: 12000,
    gross_salary: 60000,
    leave_deductions: 0,
    late_deductions: 0,
    loan_deductions: 0,
    advance_recovery: 0,
    other_deductions: 0,
    total_deductions: 0,
    net_salary: 60000,
    paid_amount: 60000,
    balance_amount: 0,
    payment_status: 'Paid',
    payment_date: '2026-07-31',
    payment_method: 'Bank Transfer',
    reference_no: 'UTR7102281003'
  }
];
