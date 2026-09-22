import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Building2, 
  FileText, 
  Percent, 
  CreditCard, 
  Landmark, 
  Hash, 
  Database, 
  Save, 
  Upload, 
  Download, 
  RotateCcw, 
  Plus,
  Trash2
} from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';

interface ShopSettings {
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

const Settings: React.FC = () => {
  const { showToast } = useToast();

  const [activeSection, setActiveSection] = useState<'profile' | 'invoice' | 'tax' | 'payment' | 'banks' | 'numbering' | 'backup'>('profile');
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Bank Account Modal
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newAccName, setNewAccName] = useState('');
  const [newAccNo, setNewAccNo] = useState('');
  const [newIfsc, setNewIfsc] = useState('');
  const [newBal, setNewBal] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      setSettings(res.data);
    } catch (err) {
      console.error(err);
      showToast('Error loading system settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    try {
      await api.put('/settings', settings);
      showToast('Settings saved successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save settings', 'error');
    }
  };

  const handleAddBank = () => {
    if (!newBankName || !newAccNo) {
      showToast('Bank name and account number required', 'warning');
      return;
    }
    if (!settings) return;

    const masked = `•••• •••• •••• ${newAccNo.slice(-4) || '9999'}`;
    const newAcct = {
      id: Date.now(),
      bank_name: newBankName,
      account_name: newAccName || settings.business_name,
      account_number: masked,
      ifsc: newIfsc.toUpperCase() || 'HDFC0001234',
      opening_balance: Number(newBal) || 0,
      status: 'Active' as const
    };

    const updated = {
      ...settings,
      bank_accounts: [...settings.bank_accounts, newAcct]
    };
    setSettings(updated);
    setIsBankModalOpen(false);
    setNewBankName('');
    setNewAccName('');
    setNewAccNo('');
    setNewIfsc('');
    setNewBal('');
    showToast(`Bank account "${newBankName}" added`, 'success');
  };

  const handleDeleteBank = (id: number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      bank_accounts: settings.bank_accounts.filter(b => b.id !== id)
    });
    showToast('Bank account removed', 'info');
  };

  // Backup & Restore
  const handleExportData = () => {
    const backupObj: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('shop_')) {
        try {
          backupObj[key] = JSON.parse(localStorage.getItem(key) || 'null');
        } catch {
          backupObj[key] = localStorage.getItem(key);
        }
      }
    }
    const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ShopManager_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Local database backup exported successfully!', 'success');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        Object.entries(data).forEach(([k, v]) => {
          localStorage.setItem(k, JSON.stringify(v));
        });
        showToast('Backup restored successfully! Refreshing...', 'success');
        setTimeout(() => window.location.reload(), 800);
      } catch {
        showToast('Invalid backup JSON format', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all ShopManager data back to initial seeds? All recent edits will be refreshed.')) {
      api.post('/settings/restore-defaults').then(() => {
        showToast('Data reset to default mock records!', 'success');
        setTimeout(() => window.location.reload(), 500);
      });
    }
  };

  if (loading || !settings) {
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
            <SettingsIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Enterprise System Configuration
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Configure retail business profile, GST tax rates, invoice templates, banking ledgers and data backups.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Save Settings
        </button>
      </div>

      {/* Main Settings Layout (Sidebar nav + Content panel) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Tabs */}
        <div className="space-y-1">
          {[
            { id: 'profile', name: 'Business Profile', icon: Building2 },
            { id: 'invoice', name: 'Invoice Settings', icon: FileText },
            { id: 'tax', name: 'Tax / GST Config', icon: Percent },
            { id: 'payment', name: 'Payment Methods', icon: CreditCard },
            { id: 'banks', name: 'Bank Accounts', icon: Landmark },
            { id: 'numbering', name: 'Numbering Prefixes', icon: Hash },
            { id: 'backup', name: 'Backup & Restore', icon: Database },
          ].map(section => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{section.name}</span>
              </button>
            );
          })}
        </div>

        {/* Panel Content */}
        <div className="md:col-span-3 bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          {/* 1. BUSINESS PROFILE */}
          {activeSection === 'profile' && (
            <div className="space-y-5">
              <div className="border-b border-zinc-150 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50">Business Profile & Store Identity</h3>
                <p className="text-xs text-zinc-500">Official business registration details displayed on customer invoices and vouchers.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Business Name *</label>
                  <input
                    type="text"
                    value={settings.business_name}
                    onChange={e => setSettings({ ...settings, business_name: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Proprietor / Owner Name</label>
                  <input
                    type="text"
                    value={settings.owner_name}
                    onChange={e => setSettings({ ...settings, owner_name: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Contact Mobile</label>
                  <input
                    type="text"
                    value={settings.mobile}
                    onChange={e => setSettings({ ...settings, mobile: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={e => setSettings({ ...settings, email: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Shop Address</label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={e => setSettings({ ...settings, address: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">City & State</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="City"
                      value={settings.city}
                      onChange={e => setSettings({ ...settings, city: e.target.value })}
                      className="px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={settings.state}
                      onChange={e => setSettings({ ...settings, state: e.target.value })}
                      className="px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={settings.pincode}
                    onChange={e => setSettings({ ...settings, pincode: e.target.value })}
                    className="w-full px-3 py-2 font-mono bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">GSTIN (15 Character Indian Tax ID)</label>
                  <input
                    type="text"
                    value={settings.gstin}
                    onChange={e => setSettings({ ...settings, gstin: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 font-mono font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. INVOICE SETTINGS */}
          {activeSection === 'invoice' && (
            <div className="space-y-5 text-xs">
              <div className="border-b border-zinc-150 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50">Invoice Template & Formatting</h3>
                <p className="text-zinc-500">Configure numbering sequence, display toggles and legal footer disclaimers.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Invoice Prefix</label>
                  <input
                    type="text"
                    value={settings.invoice_prefix}
                    onChange={e => setSettings({ ...settings, invoice_prefix: e.target.value })}
                    className="w-full px-3 py-2 font-mono font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Starting Number Sequence</label>
                  <input
                    type="number"
                    value={settings.invoice_next_num}
                    onChange={e => setSettings({ ...settings, invoice_next_num: Number(e.target.value) })}
                    className="w-full px-3 py-2 font-mono bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.show_gst}
                    onChange={e => setSettings({ ...settings, show_gst: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <div>
                    <p className="font-bold text-zinc-800 dark:text-zinc-200">Show GST Breakdown</p>
                    <span className="text-zinc-400 text-[11px]">Print CGST & SGST percentage columns on customer bill copies.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.show_customer_gstin}
                    onChange={e => setSettings({ ...settings, show_customer_gstin: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <div>
                    <p className="font-bold text-zinc-800 dark:text-zinc-200">Show Customer GSTIN</p>
                    <span className="text-zinc-400 text-[11px]">Display buyer's GST number for B2B input credit compliance.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.show_terms}
                    onChange={e => setSettings({ ...settings, show_terms: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <div>
                    <p className="font-bold text-zinc-800 dark:text-zinc-200">Show Terms & Conditions</p>
                    <span className="text-zinc-400 text-[11px]">Print return & warranty policies at the bottom of the bill.</span>
                  </div>
                </label>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Invoice Footer Note</label>
                <textarea
                  rows={2}
                  value={settings.invoice_footer}
                  onChange={e => setSettings({ ...settings, invoice_footer: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
          )}

          {/* 3. TAX / GST */}
          {activeSection === 'tax' && (
            <div className="space-y-5 text-xs">
              <div className="border-b border-zinc-150 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50">Goods & Services Tax (GST) Rates</h3>
                <p className="text-zinc-500">Standard tax computation rates for intra-state and inter-state transactions.</p>
              </div>

              <label className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enable_gst}
                  onChange={e => setSettings({ ...settings, enable_gst: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <div>
                  <p className="font-bold text-zinc-800 dark:text-zinc-200">Enable GST Compliance System</p>
                  <span className="text-zinc-400 text-[11px]">Automatically compute CGST, SGST & IGST during product invoicing.</span>
                </div>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Default GST Rate</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={settings.default_gst_rate}
                      onChange={e => setSettings({ ...settings, default_gst_rate: Number(e.target.value) })}
                      className="w-full px-3 py-2 font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">%</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">CGST Share</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={settings.cgst_rate}
                      onChange={e => setSettings({ ...settings, cgst_rate: Number(e.target.value) })}
                      className="w-full px-3 py-2 font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">%</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">SGST Share</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={settings.sgst_rate}
                      onChange={e => setSettings({ ...settings, sgst_rate: Number(e.target.value) })}
                      className="w-full px-3 py-2 font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">%</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">IGST Share</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={settings.igst_rate}
                      onChange={e => setSettings({ ...settings, igst_rate: Number(e.target.value) })}
                      className="w-full px-3 py-2 font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. PAYMENT METHODS */}
          {activeSection === 'payment' && (
            <div className="space-y-5 text-xs">
              <div className="border-b border-zinc-150 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50">Accepted Payment Channels</h3>
                <p className="text-zinc-500">Toggle active payment gateways and counter checkout modes.</p>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'cash', title: 'Cash on Counter', desc: 'Accept direct cash payments at retail counter' },
                  { key: 'upi', title: 'UPI / QR Code', desc: 'Accept instant payments via Google Pay, PhonePe, Paytm' },
                  { key: 'card', title: 'Debit & Credit Cards', desc: 'POS card swipe machines (Visa, Mastercard, RuPay)' },
                  { key: 'bank_transfer', title: 'Direct Bank Transfer / NEFT / IMPS', desc: 'Wholesale B2B electronic clearing' },
                  { key: 'credit', title: 'Store Credit / Khata (Pay Later)', desc: 'Allow 15/30 day pending ledger terms' }
                ].map(item => (
                  <label key={item.key} className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 cursor-pointer">
                    <div>
                      <p className="font-bold text-zinc-800 dark:text-zinc-200">{item.title}</p>
                      <span className="text-zinc-400 text-[11px]">{item.desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={(settings.payment_methods as any)[item.key]}
                      onChange={e => setSettings({
                        ...settings,
                        payment_methods: {
                          ...settings.payment_methods,
                          [item.key]: e.target.checked
                        }
                      })}
                      className="w-5 h-5 rounded text-indigo-600"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 5. BANK ACCOUNTS */}
          {activeSection === 'banks' && (
            <div className="space-y-5 text-xs">
              <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50">Company Bank Accounts</h3>
                  <p className="text-zinc-500">Registered bank ledgers with masked account numbers for internal security.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBankModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Account
                </button>
              </div>

              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50/50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Bank Name</th>
                      <th className="py-3 px-4">Account Name</th>
                      <th className="py-3 px-4 font-mono">Account Number</th>
                      <th className="py-3 px-4">IFSC</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800/60">
                    {settings.bank_accounts.map(bank => (
                      <tr key={bank.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20">
                        <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          <Landmark className="w-4 h-4 text-indigo-500" />
                          {bank.bank_name}
                        </td>
                        <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 font-medium">{bank.account_name}</td>
                        <td className="py-3 px-4 font-mono text-zinc-700 dark:text-zinc-300">{bank.account_number}</td>
                        <td className="py-3 px-4 font-mono text-zinc-500">{bank.ifsc}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                            {bank.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteBank(bank.id)}
                            className="p-1 text-zinc-400 hover:text-rose-600 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. NUMBERING PREFIXES */}
          {activeSection === 'numbering' && (
            <div className="space-y-5 text-xs">
              <div className="border-b border-zinc-150 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50">Transaction Numbering Prefixes</h3>
                <p className="text-zinc-500">Configure standard code prefixes for ERP vouchers and ledger references.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Sales Invoice Prefix</label>
                  <input
                    type="text"
                    value={settings.prefixes.sale}
                    onChange={e => setSettings({
                      ...settings,
                      prefixes: { ...settings.prefixes, sale: e.target.value }
                    })}
                    className="w-full px-3 py-2 font-mono font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Purchase Invoice Prefix</label>
                  <input
                    type="text"
                    value={settings.prefixes.purchase}
                    onChange={e => setSettings({
                      ...settings,
                      prefixes: { ...settings.prefixes, purchase: e.target.value }
                    })}
                    className="w-full px-3 py-2 font-mono font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Sales Return Prefix</label>
                  <input
                    type="text"
                    value={settings.prefixes.sales_return}
                    onChange={e => setSettings({
                      ...settings,
                      prefixes: { ...settings.prefixes, sales_return: e.target.value }
                    })}
                    className="w-full px-3 py-2 font-mono font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Purchase Return Prefix</label>
                  <input
                    type="text"
                    value={settings.prefixes.purchase_return}
                    onChange={e => setSettings({
                      ...settings,
                      prefixes: { ...settings.prefixes, purchase_return: e.target.value }
                    })}
                    className="w-full px-3 py-2 font-mono font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Expense Voucher Prefix</label>
                  <input
                    type="text"
                    value={settings.prefixes.expense}
                    onChange={e => setSettings({
                      ...settings,
                      prefixes: { ...settings.prefixes, expense: e.target.value }
                    })}
                    className="w-full px-3 py-2 font-mono font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 7. BACKUP & DATA */}
          {activeSection === 'backup' && (
            <div className="space-y-5 text-xs">
              <div className="border-b border-zinc-150 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50">Local Database Backup & Restoration</h3>
                <p className="text-zinc-500">Download complete encrypted JSON snapshot of store tables or restore from backup.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold">
                    <Download className="w-4 h-4" />
                    <span>Export Database Backup</span>
                  </div>
                  <p className="text-zinc-500">
                    Saves all sales, purchases, inventory, invoices, expenses and contacts into a portable JSON backup file.
                  </p>
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="w-full py-2 px-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm cursor-pointer"
                  >
                    Download Backup JSON
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                    <Upload className="w-4 h-4" />
                    <span>Restore from Backup</span>
                  </div>
                  <p className="text-zinc-500">
                    Upload an exported ShopManager JSON file to restore transaction records and settings.
                  </p>
                  <label className="w-full block text-center py-2 px-3 text-xs font-bold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 rounded-xl cursor-pointer">
                    Choose Backup File
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-rose-700 dark:text-rose-400">Reset System to Default Demo Data</h4>
                    <p className="text-zinc-500 mt-0.5">Re-seeds all 10 sample products, 6 sales, purchases, returns and expenses.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl cursor-pointer shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADD BANK ACCOUNT */}
      <Modal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        title="Add Company Bank Account"
        onConfirm={handleAddBank}
        confirmLabel="Add Bank Account"
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Bank Name *</label>
            <input
              type="text"
              value={newBankName}
              onChange={e => setNewBankName(e.target.value)}
              placeholder="e.g. ICICI Bank, Axis Bank"
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Account Holder Name</label>
            <input
              type="text"
              value={newAccName}
              onChange={e => setNewAccName(e.target.value)}
              placeholder="e.g. ShopManager Current Account"
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Account Number *</label>
            <input
              type="text"
              value={newAccNo}
              onChange={e => setNewAccNo(e.target.value)}
              placeholder="e.g. 50200012345678"
              className="w-full px-3 py-2 font-mono bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">IFSC Code</label>
              <input
                type="text"
                value={newIfsc}
                onChange={e => setNewIfsc(e.target.value)}
                placeholder="ICIC0001234"
                className="w-full px-3 py-2 font-mono uppercase bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Opening Balance (₹)</label>
              <input
                type="number"
                value={newBal}
                onChange={e => setNewBal(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
