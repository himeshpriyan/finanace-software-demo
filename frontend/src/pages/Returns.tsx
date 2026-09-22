import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Search, 
  Eye
} from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';

interface ReturnItem {
  id: number;
  return_no: string;
  type: 'Sales Return' | 'Purchase Return';
  date: string;
  reference_bill: string;
  party_name: string;
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

interface Product {
  id: number;
  name: string;
  selling_price: number;
  purchase_price: number;
  current_stock: number;
  unit: string;
}

interface Customer {
  id: number;
  name: string;
}

interface Vendor {
  id: number;
  name: string;
}

const Returns: React.FC = () => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'history' | 'sales_return' | 'purchase_return'>('history');
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Selected Return Detail Modal
  const [selectedReturn, setSelectedReturn] = useState<ReturnItem | null>(null);

  // Sales Return Form State
  const [salesInvRef, setSalesInvRef] = useState('SALE-00002');
  const [salesCustomerId, setSalesCustomerId] = useState<number | ''>('');
  const [salesDate, setSalesDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [salesProductId, setSalesProductId] = useState<number | ''>('');
  const [salesQty, setSalesQty] = useState('1');
  const [salesReason, setSalesReason] = useState('Defective unit with flickering light');
  const [salesRefundAmt, setSalesRefundAmt] = useState('');
  const [salesRefundMethod, setSalesRefundMethod] = useState('Cash');
  const [salesRemarks, setSalesRemarks] = useState('');

  // Purchase Return Form State
  const [purBillRef, setPurBillRef] = useState('PUR-00001');
  const [purVendorId, setPurVendorId] = useState<number | ''>('');
  const [purDate, setPurDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [purProductId, setPurProductId] = useState<number | ''>('');
  const [purQty, setPurQty] = useState('1');
  const [purReason, setPurReason] = useState('Damaged packaging during transit');
  const [purReturnAmt, setPurReturnAmt] = useState('');
  const [purRemarks, setPurRemarks] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [retRes, prodRes, custRes, vendRes] = await Promise.all([
        api.get('/returns'),
        api.get('/products'),
        api.get('/customers'),
        api.get('/vendors')
      ]);
      setReturns(retRes.data);
      setProducts(prodRes.data);
      setCustomers(custRes.data);
      setVendors(vendRes.data);

      if (custRes.data.length > 0 && !salesCustomerId) {
        setSalesCustomerId(custRes.data[0].id);
      }
      if (vendRes.data.length > 0 && !purVendorId) {
        setPurVendorId(vendRes.data[0].id);
      }
      if (prodRes.data.length > 0) {
        if (!salesProductId) {
          setSalesProductId(prodRes.data[0].id);
          setSalesRefundAmt(prodRes.data[0].selling_price.toString());
        }
        if (!purProductId) {
          setPurProductId(prodRes.data[0].id);
          setPurReturnAmt(prodRes.data[0].purchase_price.toString());
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading returns data', 'error');
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

  const handleSalesProductChange = (prodId: number) => {
    setSalesProductId(prodId);
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setSalesRefundAmt((prod.selling_price * (Number(salesQty) || 1)).toString());
    }
  };

  const handleSalesQtyChange = (q: string) => {
    setSalesQty(q);
    const prod = products.find(p => p.id === salesProductId);
    if (prod) {
      setSalesRefundAmt((prod.selling_price * (Number(q) || 1)).toString());
    }
  };

  const handlePurProductChange = (prodId: number) => {
    setPurProductId(prodId);
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setPurReturnAmt((prod.purchase_price * (Number(purQty) || 1)).toString());
    }
  };

  const handlePurQtyChange = (q: string) => {
    setPurQty(q);
    const prod = products.find(p => p.id === purProductId);
    if (prod) {
      setPurReturnAmt((prod.purchase_price * (Number(q) || 1)).toString());
    }
  };

  const handleSubmitSalesReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salesProductId || !salesCustomerId || !salesQty || Number(salesQty) <= 0) {
      showToast('Please fill all required return fields', 'warning');
      return;
    }

    const prod = products.find(p => p.id === salesProductId);
    const cust = customers.find(c => c.id === salesCustomerId);

    const payload = {
      return_no: `RET-S-${Date.now().toString().slice(-4)}`,
      reference_bill: salesInvRef,
      customer_id: salesCustomerId,
      customer_name: cust?.name || 'Customer',
      date: salesDate,
      product_id: salesProductId,
      product_name: prod?.name || 'Product',
      quantity: Number(salesQty),
      reason: salesReason,
      amount: Number(salesRefundAmt) || 0,
      refund_method: salesRefundMethod,
      remarks: salesRemarks,
      status: 'Completed'
    };

    try {
      await api.post('/returns/sales', payload);
      showToast(`Sales return logged! +${payload.quantity} units added back to inventory.`, 'success');
      loadData();
      setActiveTab('history');
    } catch (err) {
      console.error(err);
      showToast('Failed to record sales return', 'error');
    }
  };

  const handleSubmitPurchaseReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purProductId || !purVendorId || !purQty || Number(purQty) <= 0) {
      showToast('Please fill all required return fields', 'warning');
      return;
    }

    const prod = products.find(p => p.id === purProductId);
    const vend = vendors.find(v => v.id === purVendorId);

    if (prod && Number(purQty) > prod.current_stock) {
      showToast(`Cannot return ${purQty} units. Only ${prod.current_stock} currently in stock.`, 'error');
      return;
    }

    const payload = {
      return_no: `RET-P-${Date.now().toString().slice(-4)}`,
      reference_bill: purBillRef,
      vendor_id: purVendorId,
      vendor_name: vend?.name || 'Vendor',
      date: purDate,
      product_id: purProductId,
      product_name: prod?.name || 'Product',
      quantity: Number(purQty),
      reason: purReason,
      amount: Number(purReturnAmt) || 0,
      remarks: purRemarks,
      status: 'Completed'
    };

    try {
      await api.post('/returns/purchase', payload);
      showToast(`Purchase return logged! -${payload.quantity} units reduced from inventory.`, 'success');
      loadData();
      setActiveTab('history');
    } catch (err) {
      console.error(err);
      showToast('Failed to record purchase return', 'error');
    }
  };

  const filteredReturns = returns.filter(r => {
    const matchesSearch = r.return_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.party_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reference_bill.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !typeFilter || r.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-pulse">
        <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
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
            <RotateCcw className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Returns & Credit Notes Management
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Process Customer Sales Returns and Vendor Purchase Returns with automated inventory stock synchronisation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveTab('sales_return')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'sales_return'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
            New Sales Return
          </button>

          <button
            onClick={() => setActiveTab('purchase_return')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'purchase_return'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-rose-500" />
            New Purchase Return
          </button>
        </div>
      </div>

      {/* Visual Relationship Explainer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/30 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 shrink-0">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
              Sales Return → Inventory Inward (+)
            </h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-400/90 mt-0.5">
              When a customer returns a product, goods are received back into the store. Product stock is automatically increased in inventory.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/30 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 shrink-0">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-rose-900 dark:text-rose-300 uppercase tracking-wider">
              Purchase Return → Inventory Outward (-)
            </h4>
            <p className="text-xs text-rose-700 dark:text-rose-400/90 mt-0.5">
              When returning defective goods to a vendor, warehouse stock is dispatched back. Product stock is automatically reduced from inventory.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'history'
              ? 'bg-indigo-600 text-white'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          Return History ({returns.length})
        </button>
      </div>

      {/* TAB 1: NEW SALES RETURN FORM */}
      {activeTab === 'sales_return' && (
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5 max-w-3xl mx-auto">
          <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">Record Sales Return (Customer Inward)</h2>
              <p className="text-xs text-zinc-500">Incoming stock from customer return will be re-added to inventory.</p>
            </div>
            <button
              onClick={() => setActiveTab('history')}
              className="text-xs text-zinc-400 hover:text-zinc-600"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmitSalesReturn} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Original Invoice Number *
                </label>
                <input
                  type="text"
                  required
                  value={salesInvRef}
                  onChange={e => setSalesInvRef(e.target.value)}
                  placeholder="e.g. SALE-00001 or INV-01001"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 font-mono text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Customer *
                </label>
                <select
                  required
                  value={salesCustomerId}
                  onChange={e => setSalesCustomerId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100 font-semibold"
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Returned Product *
                </label>
                <select
                  required
                  value={salesProductId}
                  onChange={e => handleSalesProductChange(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100 font-semibold"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.current_stock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Return Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={salesQty}
                  onChange={e => handleSalesQtyChange(e.target.value)}
                  className="w-full px-3 py-2 text-center font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Refund Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={salesRefundAmt}
                  onChange={e => setSalesRefundAmt(e.target.value)}
                  className="w-full px-3 py-2 font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Refund Method
                </label>
                <select
                  value={salesRefundMethod}
                  onChange={e => setSalesRefundMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="Cash">Cash Refund</option>
                  <option value="UPI">UPI Transfer</option>
                  <option value="Store Credit">Store Credit Note</option>
                  <option value="Bank Transfer">Bank Refund</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Return Date
                </label>
                <input
                  type="date"
                  value={salesDate}
                  onChange={e => setSalesDate(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Return Reason *
              </label>
              <select
                value={salesReason}
                onChange={e => setSalesReason(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
              >
                <option value="Defective unit with flickering light">Defective / Malfunctioning Product</option>
                <option value="Customer Changed Mind">Customer Changed Mind / Wrong Item Picked</option>
                <option value="Damaged Outer Packaging">Damaged Packing / Sealed Box Issue</option>
                <option value="Quality dissatisfaction">Quality Dissatisfaction</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Remarks / Internal Notes
              </label>
              <input
                type="text"
                placeholder="Inspected by counter manager; goods in restockable condition"
                value={salesRemarks}
                onChange={e => setSalesRemarks(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className="px-4 py-2 font-semibold text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                Submit Sales Return (+ Stock)
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: NEW PURCHASE RETURN FORM */}
      {activeTab === 'purchase_return' && (
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5 max-w-3xl mx-auto">
          <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">Record Purchase Return (Vendor Outward)</h2>
              <p className="text-xs text-zinc-500">Outgoing goods sent back to supplier will be deducted from warehouse inventory.</p>
            </div>
            <button
              onClick={() => setActiveTab('history')}
              className="text-xs text-zinc-400 hover:text-zinc-600"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmitPurchaseReturn} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Original Purchase Bill / PO *
                </label>
                <input
                  type="text"
                  required
                  value={purBillRef}
                  onChange={e => setPurBillRef(e.target.value)}
                  placeholder="e.g. PUR-00001"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 font-mono text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Vendor / Supplier *
                </label>
                <select
                  required
                  value={purVendorId}
                  onChange={e => setPurVendorId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100 font-semibold"
                >
                  <option value="">-- Select Vendor --</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Product to Return *
                </label>
                <select
                  required
                  value={purProductId}
                  onChange={e => handlePurProductChange(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100 font-semibold"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (In Stock: {p.current_stock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Return Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={purQty}
                  onChange={e => handlePurQtyChange(e.target.value)}
                  className="w-full px-3 py-2 text-center font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Debit / Return Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={purReturnAmt}
                  onChange={e => setPurReturnAmt(e.target.value)}
                  className="w-full px-3 py-2 font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-rose-600 dark:text-rose-400"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Return Date
                </label>
                <input
                  type="date"
                  value={purDate}
                  onChange={e => setPurDate(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Return Reason *
              </label>
              <select
                value={purReason}
                onChange={e => setPurReason(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
              >
                <option value="Damaged packaging during transit">Damaged Packaging / Broken in Transit</option>
                <option value="Expired / Old Stock Delivered">Expired or Near-Expiry Batch Received</option>
                <option value="Wrong Specification Shipped">Wrong Item / Specification Shipped</option>
                <option value="Quality Inspection Failed">Quality / Functionality Test Failed</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Remarks / Debit Note Ref
              </label>
              <input
                type="text"
                placeholder="Debit note DN-2024-04 issued to supplier"
                value={purRemarks}
                onChange={e => setPurRemarks(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className="px-4 py-2 font-semibold text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/10 cursor-pointer"
              >
                Submit Purchase Return (- Stock)
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: RETURN HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search returns by ID, party or item..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="px-3 py-2 text-xs font-semibold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-700 dark:text-zinc-300"
              >
                <option value="">All Return Types</option>
                <option value="Sales Return">Sales Returns (Inward)</option>
                <option value="Purchase Return">Purchase Returns (Outward)</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Return No</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Return Type</th>
                    <th className="py-3.5 px-4">Party (Customer / Vendor)</th>
                    <th className="py-3.5 px-4">Ref Invoice</th>
                    <th className="py-3.5 px-4">Item Returned</th>
                    <th className="py-3.5 px-4 text-center">Qty</th>
                    <th className="py-3.5 px-4 text-right">Amount</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
                  {filteredReturns.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-zinc-400">
                        No returns found matching search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredReturns.map(ret => (
                      <tr key={ret.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {ret.return_no}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-500 font-mono text-[11px]">{ret.date}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase flex items-center gap-1 w-max ${
                            ret.type === 'Sales Return'
                              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                          }`}>
                            {ret.type === 'Sales Return' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                            {ret.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                          {ret.party_name}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-zinc-500">{ret.reference_bill}</td>
                        <td className="py-3.5 px-4 text-zinc-700 dark:text-zinc-300 font-medium">
                          {ret.product_name}
                        </td>
                        <td className="py-3.5 px-4 text-center font-extrabold">
                          <span className={ret.type === 'Sales Return' ? 'text-emerald-600' : 'text-rose-600'}>
                            {ret.type === 'Sales Return' ? `+${ret.quantity}` : `-${ret.quantity}`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-zinc-900 dark:text-zinc-50">
                          {formatCur(ret.amount)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                            {ret.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedReturn(ret)}
                            className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
                            title="View Return Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      <Modal
        isOpen={!!selectedReturn}
        onClose={() => setSelectedReturn(null)}
        title="Return & Credit Note Details"
      >
        {selectedReturn && (
          <div className="space-y-4 text-xs">
            <div className={`p-4 rounded-xl border ${
              selectedReturn.type === 'Sales Return'
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30'
                : 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30'
            }`}>
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-sm">{selectedReturn.return_no}</span>
                <span className="font-extrabold">{selectedReturn.type}</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-300 mt-1">
                Ref Bill: <strong>{selectedReturn.reference_bill}</strong> | Date: <strong>{selectedReturn.date}</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-400 font-medium">Party Name</span>
                <p className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{selectedReturn.party_name}</p>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-400 font-medium">Product Returned</span>
                <p className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{selectedReturn.product_name}</p>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-400 font-medium">Quantity Effect</span>
                <p className="font-extrabold text-sm mt-0.5">
                  {selectedReturn.type === 'Sales Return'
                    ? `+${selectedReturn.quantity} (Stock Re-added)`
                    : `-${selectedReturn.quantity} (Stock Reduced)`}
                </p>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-400 font-medium">Refund / Debit Amount</span>
                <p className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {formatCur(selectedReturn.amount)}
                </p>
              </div>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-zinc-400 font-medium">Reason:</span>
              <p className="font-medium text-zinc-800 dark:text-zinc-200">{selectedReturn.reason}</p>
              {selectedReturn.remarks && (
                <p className="text-zinc-500 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                  Remarks: {selectedReturn.remarks}
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Returns;
