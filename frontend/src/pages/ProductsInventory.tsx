import React, { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  SlidersHorizontal, 
  Eye, 
  History, 
  Layers, 
  Tag, 
  Ruler, 
  DollarSign, 
  Boxes,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert
} from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';

interface ProductItem {
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

interface CategoryItem {
  id: number;
  name: string;
  product_count: number;
  status: string;
}

interface BrandItem {
  id: number;
  name: string;
  product_count: number;
  status: string;
}

interface UnitItem {
  id: number;
  name: string;
  short_code: string;
  description: string;
}

interface StockHistoryItem {
  id: number;
  date: string;
  product_id: number;
  product_name: string;
  transaction_type: string;
  reference: string;
  quantity_in: number;
  quantity_out: number;
  balance: number;
  remarks?: string;
}

interface StockOverview {
  totalProducts: number;
  totalStockQuantity: number;
  lowStockItems: number;
  outOfStock: number;
  totalStockValue: number;
  totalRetailValue: number;
}

const ProductsInventory: React.FC = () => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'products' | 'low-stock' | 'history' | 'categories' | 'brands' | 'units'>('products');
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [units, setUnits] = useState<UnitItem[]>([]);
  const [stockHistory, setStockHistory] = useState<StockHistoryItem[]>([]);
  const [overview, setOverview] = useState<StockOverview | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [viewingProduct, setViewingProduct] = useState<ProductItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null);
  
  // Stock Adjustment Modal
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [selectedProductForAdj, setSelectedProductForAdj] = useState<ProductItem | null>(null);
  const [adjType, setAdjType] = useState<'Add' | 'Remove'>('Add');
  const [adjQuantity, setAdjQuantity] = useState('');
  const [adjReason, setAdjReason] = useState('Inventory Audit Correction');
  const [adjDate, setAdjDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Quick Category / Brand / Unit Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitCode, setNewUnitCode] = useState('');

  // Product Form State
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formUnit, setFormUnit] = useState('Piece');
  const [formPurchasePrice, setFormPurchasePrice] = useState('');
  const [formSellingPrice, setFormSellingPrice] = useState('');
  const [formGst, setFormGst] = useState('18');
  const [formOpeningStock, setFormOpeningStock] = useState('0');
  const [formMinStock, setFormMinStock] = useState('5');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const [prodsRes, catsRes, brandsRes, unitsRes, historyRes, overviewRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
        api.get('/brands'),
        api.get('/units'),
        api.get('/inventory/history'),
        api.get('/inventory/overview')
      ]);

      setProducts(prodsRes.data);
      setCategories(catsRes.data);
      setBrands(brandsRes.data);
      setUnits(unitsRes.data);
      setStockHistory(historyRes.data);
      setOverview(overviewRes.data);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
      showToast('Error loading inventory data', 'error');
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

  const openAddProductModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormBarcode(`890${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    setFormCategory(categories[0]?.name || 'Electronics');
    setFormBrand(brands[0]?.name || 'Generic');
    setFormUnit('Piece');
    setFormPurchasePrice('');
    setFormSellingPrice('');
    setFormGst('18');
    setFormOpeningStock('10');
    setFormMinStock('5');
    setFormDescription('');
    setFormStatus('Active');
    setFormErrors({});
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: ProductItem) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormSku(product.sku);
    setFormBarcode(product.barcode);
    setFormCategory(product.category);
    setFormBrand(product.brand);
    setFormUnit(product.unit);
    setFormPurchasePrice(product.purchase_price.toString());
    setFormSellingPrice(product.selling_price.toString());
    setFormGst(product.gst_percent.toString());
    setFormOpeningStock(product.current_stock.toString());
    setFormMinStock(product.minimum_stock.toString());
    setFormDescription(product.description || '');
    setFormStatus(product.status);
    setFormErrors({});
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async () => {
    const errs: Record<string, string> = {};
    if (!formName.trim()) errs.name = 'Product name is required';
    if (!formPurchasePrice || Number(formPurchasePrice) < 0) errs.purchase_price = 'Valid purchase price required';
    if (!formSellingPrice || Number(formSellingPrice) < 0) errs.selling_price = 'Valid selling price required';
    if (!formMinStock || Number(formMinStock) < 0) errs.min_stock = 'Minimum stock is required';

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      showToast('Please fix the form errors', 'error');
      return;
    }

    try {
      const payload = {
        name: formName.trim(),
        sku: formSku.trim(),
        barcode: formBarcode.trim(),
        category: formCategory,
        brand: formBrand,
        unit: formUnit,
        purchase_price: Number(formPurchasePrice),
        selling_price: Number(formSellingPrice),
        gst_percent: Number(formGst),
        current_stock: Number(formOpeningStock),
        minimum_stock: Number(formMinStock),
        description: formDescription.trim(),
        status: formStatus
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        showToast(`Product "${payload.name}" updated successfully!`, 'success');
      } else {
        await api.post('/products', payload);
        showToast(`Product "${payload.name}" created successfully!`, 'success');
      }

      setIsProductModalOpen(false);
      fetchInventoryData();
    } catch (err) {
      console.error(err);
      showToast('Failed to save product', 'error');
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await api.delete(`/products/${productToDelete.id}`);
      showToast(`Product "${productToDelete.name}" deleted`, 'success');
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      fetchInventoryData();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete product', 'error');
    }
  };

  const openAdjustmentModal = (product: ProductItem) => {
    setSelectedProductForAdj(product);
    setAdjType('Add');
    setAdjQuantity('');
    setAdjReason('Inventory Audit Count Correction');
    setAdjDate(new Date().toISOString().split('T')[0]);
    setIsAdjustmentModalOpen(true);
  };

  const handleStockAdjustment = async () => {
    if (!selectedProductForAdj) return;
    const qty = Number(adjQuantity);
    if (!qty || qty <= 0) {
      showToast('Please enter a valid quantity greater than 0', 'warning');
      return;
    }
    if (adjType === 'Remove' && qty > selectedProductForAdj.current_stock) {
      showToast(`Cannot remove ${qty} units. Current stock is only ${selectedProductForAdj.current_stock}`, 'error');
      return;
    }

    try {
      await api.post('/inventory/adjust', {
        product_id: selectedProductForAdj.id,
        adjustment_type: adjType,
        quantity: qty,
        reason: adjReason,
        date: adjDate
      });
      showToast(`Stock updated for "${selectedProductForAdj.name}" (${adjType === 'Add' ? '+' : '-'}${qty})`, 'success');
      setIsAdjustmentModalOpen(false);
      fetchInventoryData();
    } catch (err) {
      console.error(err);
      showToast('Failed to adjust stock', 'error');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      showToast('Category name is required', 'warning');
      return;
    }
    try {
      await api.post('/categories', { name: newCategoryName.trim() });
      showToast(`Category "${newCategoryName}" added`, 'success');
      setNewCategoryName('');
      setIsCategoryModalOpen(false);
      fetchInventoryData();
    } catch (err) {
      console.error(err);
      showToast('Failed to add category', 'error');
    }
  };

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) {
      showToast('Brand name is required', 'warning');
      return;
    }
    try {
      await api.post('/brands', { name: newBrandName.trim() });
      showToast(`Brand "${newBrandName}" added`, 'success');
      setNewBrandName('');
      setIsBrandModalOpen(false);
      fetchInventoryData();
    } catch (err) {
      console.error(err);
      showToast('Failed to add brand', 'error');
    }
  };

  const handleAddUnit = async () => {
    if (!newUnitName.trim()) {
      showToast('Unit name is required', 'warning');
      return;
    }
    try {
      await api.post('/units', { name: newUnitName.trim(), short_code: newUnitCode.trim() || newUnitName.trim().slice(0, 3) });
      showToast(`Unit "${newUnitName}" added`, 'success');
      setNewUnitName('');
      setNewUnitCode('');
      setIsUnitModalOpen(false);
      fetchInventoryData();
    } catch (err) {
      console.error(err);
      showToast('Failed to add unit', 'error');
    }
  };

  // Filtered products list
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery);
    const matchesCat = !categoryFilter || p.category === categoryFilter;
    const matchesBrand = !brandFilter || p.brand === brandFilter;
    return matchesSearch && matchesCat && matchesBrand;
  });

  const lowStockProducts = products.filter(p => p.current_stock <= p.minimum_stock);

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-pulse">
        <div className="h-28 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header & Overview Cards */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2.5">
            <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Products & Inventory Management
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Manage SKUs, retail prices, GST tiers, track real-time stock levels and warehouse audit movements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={openAddProductModal}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Stock Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4.5 shadow-sm flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Products</p>
            <h4 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">
              {overview?.totalProducts || 0}
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">Catalog SKUs</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4.5 shadow-sm flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Stock Qty</p>
            <h4 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">
              {overview?.totalStockQuantity || 0}
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">Units in store</p>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('low-stock')}
          className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4.5 shadow-sm flex items-start gap-3.5 cursor-pointer hover:border-amber-500 transition-colors"
        >
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Low Stock Items</p>
            <h4 className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
              {overview?.lowStockItems || 0}
            </h4>
            <p className="text-[11px] text-amber-500/90 font-medium mt-0.5">Restock needed</p>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('low-stock')}
          className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4.5 shadow-sm flex items-start gap-3.5 cursor-pointer hover:border-rose-500 transition-colors"
        >
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Out of Stock</p>
            <h4 className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
              {overview?.outOfStock || 0}
            </h4>
            <p className="text-[11px] text-rose-500/90 font-medium mt-0.5">Zero stock</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4.5 shadow-sm flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Stock Valuation</p>
            <h4 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1 truncate">
              {formatCur(overview?.totalStockValue || 0)}
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">At purchase cost</p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'products'
              ? 'bg-indigo-600 text-white'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Package className="w-4 h-4" />
          Products ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('low-stock')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'low-stock'
              ? 'bg-amber-600 text-white'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Low Stock Alerts
          {lowStockProducts.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white">
              {lowStockProducts.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'history'
              ? 'bg-indigo-600 text-white'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <History className="w-4 h-4" />
          Stock History
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-indigo-600 text-white'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Tag className="w-4 h-4" />
          Categories ({categories.length})
        </button>

        <button
          onClick={() => setActiveTab('brands')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'brands'
              ? 'bg-indigo-600 text-white'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Boxes className="w-4 h-4" />
          Brands ({brands.length})
        </button>

        <button
          onClick={() => setActiveTab('units')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'units'
              ? 'bg-indigo-600 text-white'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Ruler className="w-4 h-4" />
          Units ({units.length})
        </button>
      </div>

      {/* TAB 1: PRODUCTS LIST */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Search and Filters Bar */}
          <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by name, SKU or barcode..."
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
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>

              <select
                value={brandFilter}
                onChange={e => setBrandFilter(e.target.value)}
                className="px-3 py-2 text-xs font-semibold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-700 dark:text-zinc-300"
              >
                <option value="">All Brands</option>
                {brands.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">SKU / Barcode</th>
                    <th className="py-3.5 px-4">Product Name</th>
                    <th className="py-3.5 px-4">Category & Brand</th>
                    <th className="py-3.5 px-4 text-right">Purchase Price</th>
                    <th className="py-3.5 px-4 text-right">Selling Price</th>
                    <th className="py-3.5 px-4 text-center">Stock Level</th>
                    <th className="py-3.5 px-4 text-center">GST %</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-zinc-400 dark:text-zinc-600">
                        No products match your search filters.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(product => {
                      const isLowStock = product.current_stock <= product.minimum_stock && product.current_stock > 0;
                      const isOutOfStock = product.current_stock === 0;

                      return (
                        <tr key={product.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                            <div>{product.sku}</div>
                            <span className="text-[10px] text-zinc-400">{product.barcode}</span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                            <div>{product.name}</div>
                            <span className="text-[11px] font-normal text-zinc-400 dark:text-zinc-500 line-clamp-1">
                              {product.description || 'No description'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400">
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{product.category}</span>
                            <div className="text-[11px] text-zinc-400">{product.brand}</div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-medium text-zinc-600 dark:text-zinc-400">
                            {formatCur(product.purchase_price)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-zinc-900 dark:text-zinc-50">
                            {formatCur(product.selling_price)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                                isOutOfStock
                                  ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                                  : isLowStock
                                  ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                                  : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                              }`}>
                                {product.current_stock} {product.unit}
                              </span>
                              <span className="text-[10px] text-zinc-400 mt-0.5">Min: {product.minimum_stock}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center font-medium text-zinc-500">
                            {product.gst_percent}%
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              product.status === 'Active'
                                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                            }`}>
                              {product.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setViewingProduct(product)}
                                title="View Product Details"
                                className="p-1.5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openAdjustmentModal(product)}
                                title="Adjust Stock"
                                className="p-1.5 text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                              >
                                <SlidersHorizontal className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openEditProductModal(product)}
                                title="Edit Product"
                                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setProductToDelete(product);
                                  setIsDeleteModalOpen(true);
                                }}
                                title="Delete Product"
                                className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOW STOCK ALERTS */}
      {activeTab === 'low-stock' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
              The products listed below are at or below their designated minimum threshold stock. Reordering or initiating a stock adjustment is recommended immediately.
            </p>
          </div>

          <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Product Name</th>
                    <th className="py-3.5 px-4">SKU</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4 text-center">Current Stock</th>
                    <th className="py-3.5 px-4 text-center">Minimum Required</th>
                    <th className="py-3.5 px-4 text-center">Deficit</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
                  {lowStockProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-emerald-600 dark:text-emerald-400 font-semibold">
                        All products are currently well-stocked above minimum thresholds!
                      </td>
                    </tr>
                  ) : (
                    lowStockProducts.map(p => {
                      const deficit = Math.max(0, p.minimum_stock - p.current_stock);
                      return (
                        <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                          <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                            {p.name}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-zinc-500">{p.sku}</td>
                          <td className="py-3.5 px-4 text-zinc-500">{p.category}</td>
                          <td className="py-3.5 px-4 text-center font-extrabold text-rose-600 dark:text-rose-400">
                            {p.current_stock} {p.unit}
                          </td>
                          <td className="py-3.5 px-4 text-center font-semibold text-zinc-500">
                            {p.minimum_stock} {p.unit}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-amber-600 dark:text-amber-400">
                            -{deficit} {p.unit}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => openAdjustmentModal(p)}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/10 cursor-pointer"
                            >
                              Add Stock
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STOCK HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Warehouse Movement History</h3>
                <p className="text-xs text-zinc-500">Chronological stock audit log across Sales, Purchases, Returns & Adjustments.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Product Name</th>
                    <th className="py-3.5 px-4">Transaction Type</th>
                    <th className="py-3.5 px-4">Reference</th>
                    <th className="py-3.5 px-4 text-right">Qty In</th>
                    <th className="py-3.5 px-4 text-right">Qty Out</th>
                    <th className="py-3.5 px-4 text-right">Balance</th>
                    <th className="py-3.5 px-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
                  {stockHistory.map(entry => (
                    <tr key={entry.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                      <td className="py-3.5 px-4 font-mono text-zinc-500">{entry.date}</td>
                      <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">{entry.product_name}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                          entry.transaction_type.includes('Purchase')
                            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                            : entry.transaction_type.includes('Sale')
                            ? 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                            : 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                        }`}>
                          {entry.transaction_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-600 dark:text-zinc-400">{entry.reference}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {entry.quantity_in > 0 ? `+${entry.quantity_in}` : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-rose-600 dark:text-rose-400">
                        {entry.quantity_out > 0 ? `-${entry.quantity_out}` : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-zinc-900 dark:text-zinc-100">
                        {entry.balance}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400 max-w-xs truncate">{entry.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Product Categories</h3>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Category
            </button>
          </div>

          <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Category Name</th>
                  <th className="py-3.5 px-4 text-center">Assigned Products</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
                {categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                    <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">{cat.name}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-zinc-500">{cat.product_count} items</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                        {cat.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: BRANDS */}
      {activeTab === 'brands' && (
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Product Brands</h3>
            <button
              onClick={() => setIsBrandModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Brand
            </button>
          </div>

          <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Brand Name</th>
                  <th className="py-3.5 px-4 text-center">Product Count</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
                {brands.map(brand => (
                  <tr key={brand.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                    <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">{brand.name}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-zinc-500">{brand.product_count} items</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
                        {brand.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: UNITS */}
      {activeTab === 'units' && (
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Measurement Units</h3>
            <button
              onClick={() => setIsUnitModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Unit
            </button>
          </div>

          <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Unit Name</th>
                  <th className="py-3.5 px-4">Symbol / Code</th>
                  <th className="py-3.5 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
                {units.map(unit => (
                  <tr key={unit.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                    <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">{unit.name}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{unit.short_code}</td>
                    <td className="py-3.5 px-4 text-zinc-500">{unit.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRODUCT */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        onConfirm={handleSaveProduct}
        confirmLabel={editingProduct ? 'Save Changes' : 'Create Product'}
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="e.g. Samsung 25W Fast Charger"
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
            />
            {formErrors.name && <p className="text-[11px] text-rose-500 mt-1">{formErrors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                SKU Code
              </label>
              <input
                type="text"
                value={formSku}
                onChange={e => setFormSku(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Barcode
              </label>
              <input
                type="text"
                value={formBarcode}
                onChange={e => setFormBarcode(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Category
              </label>
              <select
                value={formCategory}
                onChange={e => setFormCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Brand
              </label>
              <select
                value={formBrand}
                onChange={e => setFormBrand(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
              >
                {brands.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Unit
              </label>
              <select
                value={formUnit}
                onChange={e => setFormUnit(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
              >
                {units.map(u => (
                  <option key={u.id} value={u.name}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Purchase Price (₹) *
              </label>
              <input
                type="number"
                value={formPurchasePrice}
                onChange={e => setFormPurchasePrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
              />
              {formErrors.purchase_price && <p className="text-[11px] text-rose-500 mt-1">{formErrors.purchase_price}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                value={formSellingPrice}
                onChange={e => setFormSellingPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
              />
              {formErrors.selling_price && <p className="text-[11px] text-rose-500 mt-1">{formErrors.selling_price}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                GST Rate (%)
              </label>
              <select
                value={formGst}
                onChange={e => setFormGst(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
              >
                <option value="0">0% (Exempt)</option>
                <option value="5">5% GST</option>
                <option value="12">12% GST</option>
                <option value="18">18% GST</option>
                <option value="28">28% GST</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                {editingProduct ? 'Current Stock' : 'Opening Stock'}
              </label>
              <input
                type="number"
                value={formOpeningStock}
                onChange={e => setFormOpeningStock(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Minimum Stock Alert *
              </label>
              <input
                type="number"
                value={formMinStock}
                onChange={e => setFormMinStock(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={formDescription}
              onChange={e => setFormDescription(e.target.value)}
              placeholder="Product specification, warranty or batch notes..."
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Catalog Status
            </label>
            <select
              value={formStatus}
              onChange={e => setFormStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
            >
              <option value="Active">Active (Available for billing)</option>
              <option value="Inactive">Inactive (Archived)</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* MODAL: STOCK ADJUSTMENT */}
      <Modal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        title="Manual Stock Adjustment"
        onConfirm={handleStockAdjustment}
        confirmLabel="Apply Adjustment"
      >
        <div className="space-y-4">
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <p className="text-xs text-zinc-500">Selected Product</p>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{selectedProductForAdj?.name}</h4>
            <div className="flex items-center gap-4 mt-1 text-xs">
              <span className="text-zinc-500">SKU: <strong className="text-zinc-700 dark:text-zinc-300">{selectedProductForAdj?.sku}</strong></span>
              <span className="text-zinc-500">Current Stock: <strong className="text-indigo-600 dark:text-indigo-400">{selectedProductForAdj?.current_stock} {selectedProductForAdj?.unit}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Adjustment Type
              </label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setAdjType('Add')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                    adjType === 'Add'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Add (+)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjType('Remove')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                    adjType === 'Remove'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  Remove (-)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Adjustment Quantity *
              </label>
              <input
                type="number"
                min="1"
                value={adjQuantity}
                onChange={e => setAdjQuantity(e.target.value)}
                placeholder="e.g. 5"
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Reason for Adjustment *
            </label>
            <select
              value={adjReason}
              onChange={e => setAdjReason(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
            >
              <option value="Inventory Audit Correction">Physical Inventory Count Correction</option>
              <option value="Damaged Stock Write-off">Damaged / Broken Goods Write-off</option>
              <option value="Expired Goods Removal">Expired Product Clearance</option>
              <option value="Direct Supplier Inward">Unbilled Promotional Stock Inward</option>
              <option value="Internal Store Usage">Internal Store Usage / Display Demo</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Adjustment Date
            </label>
            <input
              type="date"
              value={adjDate}
              onChange={e => setAdjDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>
      </Modal>

      {/* MODAL: VIEW PRODUCT DETAILS */}
      <Modal
        isOpen={!!viewingProduct}
        onClose={() => setViewingProduct(null)}
        title="Product Information"
      >
        {viewingProduct && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">{viewingProduct.name}</h3>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1">{viewingProduct.description || 'No description provided.'}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-400 font-medium">SKU</span>
                <p className="font-mono font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{viewingProduct.sku}</p>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-400 font-medium">Barcode</span>
                <p className="font-mono font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{viewingProduct.barcode}</p>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-400 font-medium">Category / Brand</span>
                <p className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{viewingProduct.category} • {viewingProduct.brand}</p>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-400 font-medium">Unit / GST Rate</span>
                <p className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{viewingProduct.unit} • {viewingProduct.gst_percent}% GST</p>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-400 font-medium">Purchase Cost</span>
                <p className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{formatCur(viewingProduct.purchase_price)}</p>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-400 font-medium">Retail Selling Price</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{formatCur(viewingProduct.selling_price)}</p>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-400 font-medium">Current Stock</span>
                <p className="font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">{viewingProduct.current_stock} {viewingProduct.unit}</p>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-400 font-medium">Minimum Threshold</span>
                <p className="font-bold text-amber-600 dark:text-amber-400 mt-0.5">{viewingProduct.minimum_stock} {viewingProduct.unit}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: DELETE PRODUCT */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Product"
        type="danger"
        confirmLabel="Confirm Delete"
        onConfirm={handleDeleteProduct}
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Are you sure you want to delete product <strong>"{productToDelete?.name}"</strong>? This will remove it from the catalog.
        </p>
      </Modal>

      {/* MODAL: ADD CATEGORY */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Add Product Category"
        onConfirm={handleAddCategory}
        confirmLabel="Add Category"
      >
        <div className="space-y-3">
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
            Category Name *
          </label>
          <input
            type="text"
            value={newCategoryName}
            onChange={e => setNewCategoryName(e.target.value)}
            placeholder="e.g. Mobile Accessories"
            className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
          />
        </div>
      </Modal>

      {/* MODAL: ADD BRAND */}
      <Modal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        title="Add Product Brand"
        onConfirm={handleAddBrand}
        confirmLabel="Add Brand"
      >
        <div className="space-y-3">
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
            Brand Name *
          </label>
          <input
            type="text"
            value={newBrandName}
            onChange={e => setNewBrandName(e.target.value)}
            placeholder="e.g. Sony, boAt, Anchor"
            className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
          />
        </div>
      </Modal>

      {/* MODAL: ADD UNIT */}
      <Modal
        isOpen={isUnitModalOpen}
        onClose={() => setIsUnitModalOpen(false)}
        title="Add Measurement Unit"
        onConfirm={handleAddUnit}
        confirmLabel="Add Unit"
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Unit Name *
            </label>
            <input
              type="text"
              value={newUnitName}
              onChange={e => setNewUnitName(e.target.value)}
              placeholder="e.g. Bundle, Roll, Pack"
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Short Code / Symbol
            </label>
            <input
              type="text"
              value={newUnitCode}
              onChange={e => setNewUnitCode(e.target.value)}
              placeholder="e.g. Bdl, Rl, Pk"
              className="w-full px-3 py-2 text-sm font-mono bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductsInventory;
