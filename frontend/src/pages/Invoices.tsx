import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Share2, 
  Plus, 
  Search, 
  Eye, 
  Trash2, 
  X
} from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface Customer {
  id: number;
  name: string;
  mobile: string;
  address: string;
  gst_number: string;
}

interface Product {
  id: number;
  name: string;
  selling_price: number;
  gst_percent: number;
  current_stock: number;
  unit: string;
}

interface InvoiceItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount: number;
  gst_percent: number;
  total: number;
}

interface Invoice {
  id: number;
  invoice_no: string;
  date: string;
  customer_id: number;
  customer_name: string;
  customer_mobile: string;
  customer_address: string;
  customer_gstin: string;
  payment_type: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Credit';
  items: InvoiceItem[];
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

const Invoices: React.FC = () => {
  const { showToast } = useToast();

  const [activeView, setActiveView] = useState<'history' | 'create'>('history');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Invoice Preview State
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // Form State for New Invoice
  const [invoiceNo, setInvoiceNo] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [customerId, setCustomerId] = useState<number | ''>('');
  const [customerGstin, setCustomerGstin] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [paymentType, setPaymentType] = useState<'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Credit'>('UPI');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [paidAmount, setPaidAmount] = useState('');
  const [terms, setTerms] = useState('Thank you for your business! Goods once sold can be exchanged within 7 days with original invoice.');

  // Quick Customer Add Modal
  const [isCustModalOpen, setIsCustModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustMobile, setNewCustMobile] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustGst, setNewCustGst] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invRes, custRes, prodRes, nextNoRes] = await Promise.all([
        api.get('/invoices'),
        api.get('/customers'),
        api.get('/products'),
        api.get('/invoices/next-no')
      ]);
      setInvoices(invRes.data);
      setCustomers(custRes.data);
      setProducts(prodRes.data);
      setInvoiceNo(nextNoRes.data.nextInvoiceNo);

      // Initialize default item row
      if (prodRes.data.length > 0 && items.length === 0) {
        const p = prodRes.data[0];
        const lineTot = calculateItemTotal(1, p.selling_price, 0, p.gst_percent);
        setItems([
          {
            product_id: p.id,
            product_name: p.name,
            quantity: 1,
            unit_price: p.selling_price,
            discount: 0,
            gst_percent: p.gst_percent,
            total: lineTot
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to load invoice data:', err);
      showToast('Error loading invoices', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateItemTotal = (qty: number, price: number, disc: number, gstRate: number) => {
    const base = Math.max(0, qty * price - disc);
    const tax = (base * gstRate) / 100;
    return parseFloat((base + tax).toFixed(2));
  };

  const handleProductChange = (index: number, prodId: number) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;
    const newItems = [...items];
    const qty = newItems[index].quantity || 1;
    const disc = newItems[index].discount || 0;
    const tot = calculateItemTotal(qty, prod.selling_price, disc, prod.gst_percent);

    newItems[index] = {
      product_id: prod.id,
      product_name: prod.name,
      quantity: qty,
      unit_price: prod.selling_price,
      discount: disc,
      gst_percent: prod.gst_percent,
      total: tot
    };
    setItems(newItems);
  };

  const handleItemFieldChange = (index: number, field: keyof InvoiceItem, val: number) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: val };
    item.total = calculateItemTotal(item.quantity, item.unit_price, item.discount, item.gst_percent);
    newItems[index] = item;
    setItems(newItems);
  };

  const addItemRow = () => {
    const p = products[0];
    if (!p) return;
    const tot = calculateItemTotal(1, p.selling_price, 0, p.gst_percent);
    setItems([
      ...items,
      {
        product_id: p.id,
        product_name: p.name,
        quantity: 1,
        unit_price: p.selling_price,
        discount: 0,
        gst_percent: p.gst_percent,
        total: tot
      }
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) {
      showToast('Invoice must have at least one line item', 'warning');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  // Grand Total Computations
  const subtotal = items.reduce((sum, it) => sum + (it.quantity * it.unit_price), 0);
  const totalDiscount = items.reduce((sum, it) => sum + it.discount, 0);
  const taxableVal = Math.max(0, subtotal - totalDiscount);
  const totalGst = items.reduce((sum, it) => {
    const itemBase = Math.max(0, it.quantity * it.unit_price - it.discount);
    return sum + (itemBase * it.gst_percent) / 100;
  }, 0);
  const cgst = parseFloat((totalGst / 2).toFixed(2));
  const sgst = parseFloat((totalGst / 2).toFixed(2));
  const grandTotal = parseFloat((taxableVal + totalGst).toFixed(2));

  // Sync paid amount if user hasn't explicitly edited it or on full payment
  useEffect(() => {
    if (activeView === 'create' && paymentType !== 'Credit') {
      setPaidAmount(grandTotal.toString());
    } else if (paymentType === 'Credit' && !paidAmount) {
      setPaidAmount('0');
    }
  }, [grandTotal, paymentType, activeView]);

  const balanceDue = Math.max(0, grandTotal - (Number(paidAmount) || 0));

  const handleCustomerSelect = (id: number) => {
    setCustomerId(id);
    const c = customers.find(cust => cust.id === id);
    if (c) {
      setCustomerGstin(c.gst_number || '');
      setBillingAddress(c.address || '');
    }
  };

  const handleSaveInvoice = async (andPrint: boolean = false) => {
    if (!customerId) {
      showToast('Please select or add a customer', 'error');
      return;
    }
    if (items.length === 0) {
      showToast('Please add at least one line item', 'error');
      return;
    }

    const c = customers.find(cust => cust.id === customerId);
    const paidNum = Number(paidAmount) || 0;
    const paymentStatus: 'Paid' | 'Partial' | 'Pending' = 
      paidNum >= grandTotal ? 'Paid' : paidNum > 0 ? 'Partial' : 'Pending';

    const payload = {
      invoice_no: invoiceNo,
      date,
      customer_id: Number(customerId),
      customer_name: c?.name || 'Walk-in Customer',
      customer_mobile: c?.mobile || '',
      customer_address: billingAddress || c?.address || '',
      customer_gstin: customerGstin || c?.gst_number || '',
      payment_type: paymentType,
      items,
      subtotal,
      discount: totalDiscount,
      cgst,
      sgst,
      igst: 0,
      grand_total: grandTotal,
      paid_amount: paidNum,
      balance_amount: balanceDue,
      payment_status: paymentStatus,
      terms
    };

    try {
      const res = await api.post('/invoices', payload);
      showToast(`Invoice ${payload.invoice_no} saved successfully!`, 'success');
      
      if (andPrint) {
        setPreviewInvoice(res.data);
        setTimeout(() => window.print(), 300);
      } else {
        setPreviewInvoice(res.data);
      }

      // Refresh list
      loadData();
      setActiveView('history');
    } catch (err) {
      console.error(err);
      showToast('Failed to save invoice', 'error');
    }
  };

  const handleCreateCustomer = async () => {
    if (!newCustName.trim()) {
      showToast('Customer name is required', 'warning');
      return;
    }
    try {
      const res = await api.post('/customers', {
        name: newCustName.trim(),
        mobile: newCustMobile.trim(),
        address: newCustAddress.trim(),
        gst_number: newCustGst.trim()
      });
      showToast(`Customer "${res.data.name}" added`, 'success');
      setCustomers([...customers, res.data]);
      handleCustomerSelect(res.data.id);
      setIsCustModalOpen(false);
      setNewCustName('');
      setNewCustMobile('');
      setNewCustAddress('');
      setNewCustGst('');
    } catch (err) {
      console.error(err);
      showToast('Failed to add customer', 'error');
    }
  };

  // Download PDF
  const downloadInvoicePDF = (inv: Invoice) => {
    const doc = new jsPDF();

    // Primary Colors
    const primaryColor = [99, 102, 241]; // Indigo
    const darkColor = [24, 24, 27]; // Zinc 900
    const grayColor = [113, 113, 122];

    // Header
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('TAX INVOICE', 14, 22);

    // Store Details
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('SHOPMANAGER RETAIL STORE', 130, 16);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text('104 Commercial Complex, MG Road, Bengaluru', 130, 21);
    doc.text('GSTIN: 29ABCDE1234F1Z5 | Phone: +91 98765 43210', 130, 26);

    doc.setDrawColor(228, 228, 231);
    doc.line(14, 32, 196, 32);

    // Bill To
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('BILLED TO (BUYER):', 14, 40);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(inv.customer_name, 14, 46);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(`Mobile: ${inv.customer_mobile || 'N/A'}`, 14, 51);
    doc.text(`GSTIN: ${inv.customer_gstin || 'Unregistered'}`, 14, 56);
    doc.text(`Address: ${inv.customer_address || 'N/A'}`, 14, 61);

    // Invoice Meta
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('INVOICE DETAILS:', 130, 40);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(`Invoice No: ${inv.invoice_no}`, 130, 46);
    doc.text(`Date: ${inv.date}`, 130, 51);
    doc.text(`Payment Mode: ${inv.payment_type}`, 130, 56);
    doc.text(`Status: ${inv.payment_status}`, 130, 61);

    // Line Items Table
    const tableBody = inv.items.map((it, idx) => [
      idx + 1,
      it.product_name,
      it.quantity,
      `Rs. ${it.unit_price.toFixed(2)}`,
      it.discount > 0 ? `Rs. ${it.discount.toFixed(2)}` : '-',
      `${it.gst_percent}%`,
      `Rs. ${it.total.toFixed(2)}`
    ]);

    (doc as any).autoTable({
      startY: 68,
      head: [['#', 'Item Description', 'Qty', 'Unit Rate', 'Discount', 'GST %', 'Amount']],
      body: tableBody,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8.5
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Totals summary
    doc.setFontSize(9);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text(`Subtotal: Rs. ${inv.subtotal.toFixed(2)}`, 140, finalY);
    doc.text(`Total Discount: Rs. ${inv.discount.toFixed(2)}`, 140, finalY + 5);
    doc.text(`CGST (9%): Rs. ${inv.cgst.toFixed(2)}`, 140, finalY + 10);
    doc.text(`SGST (9%): Rs. ${inv.sgst.toFixed(2)}`, 140, finalY + 15);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`Grand Total: Rs. ${inv.grand_total.toFixed(2)}`, 140, finalY + 22);
    doc.setFontSize(9);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`Paid: Rs. ${inv.paid_amount.toFixed(2)}`, 140, finalY + 28);
    doc.setTextColor(185, 28, 28);
    doc.text(`Balance Due: Rs. ${inv.balance_amount.toFixed(2)}`, 140, finalY + 33);

    // Terms
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text('Terms & Conditions:', 14, finalY + 20);
    doc.text(inv.terms || 'Goods once sold cannot be returned without original receipt.', 14, finalY + 25);

    doc.save(`${inv.invoice_no}.pdf`);
    showToast(`Downloaded PDF for ${inv.invoice_no}`, 'success');
  };

  const handleShare = (inv: Invoice) => {
    navigator.clipboard?.writeText?.(`Invoice ${inv.invoice_no} for ${inv.customer_name} - Grand Total: Rs. ${inv.grand_total}`);
    showToast(`Invoice link copied! Ready to share with ${inv.customer_name}`, 'success');
  };

  const formatCur = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoice_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customer_mobile.includes(searchQuery);
    const matchesStatus = !statusFilter || inv.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
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
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Invoice & Bill Management
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Create professional GST tax invoices, compute line item discounts & taxes, preview, print and export.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeView === 'history' ? (
            <button
              onClick={() => setActiveView('create')}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create Invoice
            </button>
          ) : (
            <button
              onClick={() => setActiveView('history')}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 rounded-xl cursor-pointer"
            >
              Back to Invoices
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: CREATE INVOICE */}
      {activeView === 'create' && (
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-zinc-150 dark:border-zinc-800 pb-4 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">New Retail Tax Invoice</h2>
            <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-lg">
              {invoiceNo}
            </span>
          </div>

          {/* Invoice Meta Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                value={invoiceNo}
                onChange={e => setInvoiceNo(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Invoice Date
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Customer *
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustModalOpen(true)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Quick Add Customer
                </button>
              </div>
              <select
                value={customerId}
                onChange={e => handleCustomerSelect(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
              >
                <option value="">-- Select Customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.mobile || 'No Mobile'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Customer GSTIN
              </label>
              <input
                type="text"
                placeholder="27AAAAA1111A1Z1 (Optional)"
                value={customerGstin}
                onChange={e => setCustomerGstin(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Billing Address
              </label>
              <input
                type="text"
                placeholder="Door No, Street, City, Pincode"
                value={billingAddress}
                onChange={e => setBillingAddress(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Line Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Product Line Items
              </h3>
              <button
                type="button"
                onClick={addItemRow}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 rounded-lg cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item Row
              </button>
            </div>

            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-zinc-50/50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    <th className="py-3 px-3 w-48">Product</th>
                    <th className="py-3 px-2 text-center w-20">Qty</th>
                    <th className="py-3 px-2 text-right w-28">Unit Price (₹)</th>
                    <th className="py-3 px-2 text-right w-24">Discount (₹)</th>
                    <th className="py-3 px-2 text-center w-24">GST %</th>
                    <th className="py-3 px-3 text-right w-28">Total (₹)</th>
                    <th className="py-3 px-2 text-center w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {items.map((item, index) => (
                    <tr key={index} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20">
                      <td className="py-2.5 px-3">
                        <select
                          value={item.product_id}
                          onChange={e => handleProductChange(index, Number(e.target.value))}
                          className="w-full px-2 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-indigo-500 font-semibold text-zinc-900 dark:text-zinc-100"
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Stock: {p.current_stock})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2.5 px-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => handleItemFieldChange(index, 'quantity', Number(e.target.value))}
                          className="w-full px-2 py-1.5 text-xs text-center font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                        />
                      </td>
                      <td className="py-2.5 px-2">
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={e => handleItemFieldChange(index, 'unit_price', Number(e.target.value))}
                          className="w-full px-2 py-1.5 text-xs text-right font-medium bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                        />
                      </td>
                      <td className="py-2.5 px-2">
                        <input
                          type="number"
                          value={item.discount}
                          onChange={e => handleItemFieldChange(index, 'discount', Number(e.target.value))}
                          className="w-full px-2 py-1.5 text-xs text-right bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                        />
                      </td>
                      <td className="py-2.5 px-2">
                        <select
                          value={item.gst_percent}
                          onChange={e => handleItemFieldChange(index, 'gst_percent', Number(e.target.value))}
                          className="w-full px-1.5 py-1.5 text-xs text-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-indigo-500 text-zinc-700 dark:text-zinc-300"
                        >
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                          <option value="28">28%</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-zinc-900 dark:text-zinc-50">
                        {formatCur(item.total)}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItemRow(index)}
                          className="text-zinc-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment & Calculation Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {(['UPI', 'Cash', 'Card', 'Bank Transfer', 'Credit'] as const).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentType(mode)}
                      className={`py-2 px-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        paymentType === mode
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                          : 'bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Terms & Conditions / Note
                </label>
                <textarea
                  rows={3}
                  value={terms}
                  onChange={e => setTerms(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            {/* Calculations Box */}
            <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span>{formatCur(subtotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Total Item Discount</span>
                <span>-{formatCur(totalDiscount)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>CGST</span>
                <span>+{formatCur(cgst)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>SGST</span>
                <span>+{formatCur(sgst)}</span>
              </div>
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-2 flex justify-between text-sm font-extrabold text-zinc-900 dark:text-zinc-50">
                <span>Grand Total</span>
                <span className="text-indigo-600 dark:text-indigo-400">{formatCur(grandTotal)}</span>
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
                <span className="font-bold text-zinc-700 dark:text-zinc-300">Amount Paid (₹)</span>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={e => setPaidAmount(e.target.value)}
                  className="w-36 px-2.5 py-1.5 text-xs text-right font-bold bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div className="flex justify-between font-bold text-zinc-700 dark:text-zinc-300 pt-1">
                <span>Balance Due</span>
                <span className={balanceDue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-400'}>
                  {formatCur(balanceDue)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveView('history')}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer text-zinc-700 dark:text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSaveInvoice(false)}
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              Save Invoice
            </button>
            <button
              type="button"
              onClick={() => handleSaveInvoice(true)}
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/10 cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Save & Print
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: INVOICE HISTORY */}
      {activeView === 'history' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by invoice # or customer..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs font-semibold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-700 dark:text-zinc-300"
              >
                <option value="">All Payment Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Invoice No</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4 text-center">Payment Mode</th>
                    <th className="py-3.5 px-4 text-right">Total Amount</th>
                    <th className="py-3.5 px-4 text-right">Paid Amount</th>
                    <th className="py-3.5 px-4 text-right">Balance Due</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-zinc-400">
                        No invoices match your search filters.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {inv.invoice_no}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-500 font-mono text-[11px]">{inv.date}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{inv.customer_name}</span>
                          {inv.customer_mobile && <div className="text-[11px] text-zinc-400">{inv.customer_mobile}</div>}
                        </td>
                        <td className="py-3.5 px-4 text-center font-medium text-zinc-600 dark:text-zinc-400">
                          {inv.payment_type}
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-zinc-900 dark:text-zinc-50">
                          {formatCur(inv.grand_total)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatCur(inv.paid_amount)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold">
                          <span className={inv.balance_amount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-400'}>
                            {formatCur(inv.balance_amount)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            inv.payment_status === 'Paid'
                              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                              : inv.payment_status === 'Partial'
                              ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                              : 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                          }`}>
                            {inv.payment_status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setPreviewInvoice(inv)}
                              title="View / Print Preview"
                              className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => downloadInvoicePDF(inv)}
                              title="Download PDF"
                              className="p-1.5 text-zinc-400 hover:text-emerald-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleShare(inv)}
                              title="Share Invoice"
                              className="p-1.5 text-zinc-400 hover:text-sky-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
                            >
                              <Share2 className="w-4 h-4" />
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
      )}

      {/* MODAL: PROFESSIONAL INVOICE PREVIEW */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white text-zinc-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Bar */}
            <div className="p-4 bg-zinc-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-sm">Tax Invoice Preview — {previewInvoice.invoice_no}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadInvoicePDF(previewInvoice)}
                  className="px-3 py-1.5 text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  onClick={() => setPreviewInvoice(null)}
                  className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Paper Canvas */}
            <div id="print-area" className="p-8 overflow-y-auto space-y-6 text-xs bg-white text-zinc-900">
              {/* Top Row */}
              <div className="flex justify-between items-start border-b border-zinc-200 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-base">
                      S
                    </div>
                    <span className="text-lg font-black tracking-tight text-zinc-900">ShopManager Retail Hub</span>
                  </div>
                  <p className="text-zinc-500 text-[11px]">104 Commercial Complex, MG Road, Bengaluru, Karnataka 560001</p>
                  <p className="text-zinc-500 text-[11px]">GSTIN: 29ABCDE1234F1Z5 | Phone: +91 98765 43210</p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-extrabold uppercase px-2.5 py-1 bg-zinc-100 rounded-md text-zinc-700 tracking-wider">
                    TAX INVOICE
                  </span>
                  <h3 className="text-base font-extrabold text-zinc-900 mt-2">{previewInvoice.invoice_no}</h3>
                  <p className="text-zinc-500 text-[11px]">Date: {previewInvoice.date}</p>
                </div>
              </div>

              {/* Billed To & Payment Mode */}
              <div className="grid grid-cols-2 gap-6 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Billed To (Customer)</span>
                  <h4 className="font-extrabold text-sm text-zinc-900 mt-0.5">{previewInvoice.customer_name}</h4>
                  <p className="text-zinc-600 text-[11px] mt-0.5">{previewInvoice.customer_address || 'Address: N/A'}</p>
                  <p className="text-zinc-600 text-[11px]">Mobile: {previewInvoice.customer_mobile || 'N/A'}</p>
                  <p className="text-zinc-600 text-[11px]">GSTIN: {previewInvoice.customer_gstin || 'Unregistered'}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Payment Details</span>
                  <p className="font-bold text-zinc-800 text-[11px] mt-1">Mode: {previewInvoice.payment_type}</p>
                  <p className="text-[11px] mt-0.5">
                    Status:{' '}
                    <span className={`font-extrabold ${
                      previewInvoice.payment_status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {previewInvoice.payment_status}
                    </span>
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-zinc-300 text-[11px] font-bold text-zinc-600 uppercase">
                    <th className="py-2">Item Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Rate</th>
                    <th className="py-2 text-right">Discount</th>
                    <th className="py-2 text-center">GST</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-xs">
                  {previewInvoice.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 font-semibold text-zinc-900">{it.product_name}</td>
                      <td className="py-2.5 text-center font-bold">{it.quantity}</td>
                      <td className="py-2.5 text-right">{formatCur(it.unit_price)}</td>
                      <td className="py-2.5 text-right">{it.discount > 0 ? formatCur(it.discount) : '-'}</td>
                      <td className="py-2.5 text-center">{it.gst_percent}%</td>
                      <td className="py-2.5 text-right font-bold text-zinc-900">{formatCur(it.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary Calculations */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-zinc-600">
                    <span>Subtotal:</span>
                    <span>{formatCur(previewInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span>Total Discount:</span>
                    <span>-{formatCur(previewInvoice.discount)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>CGST (9%):</span>
                    <span>+{formatCur(previewInvoice.cgst)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>SGST (9%):</span>
                    <span>+{formatCur(previewInvoice.sgst)}</span>
                  </div>
                  <div className="border-t-2 border-zinc-800 pt-2 flex justify-between text-sm font-black text-zinc-900">
                    <span>Grand Total:</span>
                    <span>{formatCur(previewInvoice.grand_total)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-700 font-semibold pt-1">
                    <span>Paid Amount:</span>
                    <span>{formatCur(previewInvoice.paid_amount)}</span>
                  </div>
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>Balance Due:</span>
                    <span>{formatCur(previewInvoice.balance_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Terms & Footer */}
              <div className="border-t border-zinc-200 pt-4 flex items-end justify-between text-[11px] text-zinc-500">
                <div className="max-w-xs">
                  <p className="font-bold text-zinc-700 mb-0.5">Terms & Conditions:</p>
                  <p>{previewInvoice.terms}</p>
                </div>
                <div className="text-right">
                  <div className="h-10 border-b border-zinc-400 w-40 mb-1" />
                  <p className="font-bold text-zinc-700">Authorised Signatory</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ADD CUSTOMER MODAL */}
      <Modal
        isOpen={isCustModalOpen}
        onClose={() => setIsCustModalOpen(false)}
        title="Quick Add Customer"
        onConfirm={handleCreateCustomer}
        confirmLabel="Save Customer"
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Customer Name *</label>
            <input
              type="text"
              value={newCustName}
              onChange={e => setNewCustName(e.target.value)}
              placeholder="e.g. Metro Supermarket"
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Mobile Number</label>
            <input
              type="text"
              value={newCustMobile}
              onChange={e => setNewCustMobile(e.target.value)}
              placeholder="9876543210"
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">GSTIN Number</label>
            <input
              type="text"
              value={newCustGst}
              onChange={e => setNewCustGst(e.target.value)}
              placeholder="29ABCDE1234F1Z5"
              className="w-full px-3 py-2 text-sm font-mono bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Address</label>
            <input
              type="text"
              value={newCustAddress}
              onChange={e => setNewCustAddress(e.target.value)}
              placeholder="Shop #, Street, City"
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Invoices;
