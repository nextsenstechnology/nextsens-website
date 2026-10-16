import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, PlusCircle, Edit, Trash2, LogOut, Home, Search, Package, Save, CheckCircle, ShoppingCart, Download, Mail, GripVertical, Archive, ArrowUp, ArrowDown, BarChart3, RotateCcw } from 'lucide-react';
import BundlesList from '@/components/admin/BundlesList';
import AdminDashboardOverview from '@/components/admin/AdminDashboardOverview';
import WebsiteAnalytics from '@/components/admin/WebsiteAnalytics';

const CATEGORIES = ['Electrodes', 'Instruments', 'Materials', 'Cells & Reactors'];
const APPLICATIONS = ['Corrosion Testing', 'Water Testing', 'Battery / Energy Research', 'Hydrothermal Synthesis'];
const STOCK_STATUSES = ['In Stock', 'Made to Order'];

const AdminDashboardPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStock, setFilterStock] = useState('All');

  // Orders State
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('completed');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form State
  const [productData, setProductData] = useState({
    name: '',
    category: 'Electrodes',
    price: '',
    discount_percentage: '10',
    short_description: '',
    features: '',
    other_specifications: '{}',
    applications: [],
    availability: 'In Stock',
    pdf_url: '',
    video_url: '',
    image_url: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  // Bulk Actions State
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [bulkActionCategory, setBulkActionCategory] = useState('');
  const [bulkActionApplications, setBulkActionApplications] = useState([]);
  const [bulkActionStock, setBulkActionStock] = useState('');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  // Tab + ordering + order management state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pendingAction, setPendingAction] = useState(null);
  const [bundleOpenSignal, setBundleOpenSignal] = useState(0);
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isOrderActioning, setIsOrderActioning] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [productsRes, ordersRes, bundlesRes] = await Promise.all([
        supabase.from('products').select('*').order('sort_order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: false }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('bundles').select('*').order('sort_order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: false })
    ]);
    
    if (productsRes.error) {
        toast({ variant: "destructive", title: "Error fetching products", description: productsRes.error.message });
    } else {
        setProducts(productsRes.data || []);
    }

    if (ordersRes.error) {
        toast({ variant: "destructive", title: "Error fetching orders", description: ordersRes.error.message });
    } else {
        setOrders(ordersRes.data || []);
    }

    if (bundlesRes.error) {
        toast({ variant: "destructive", title: "Error fetching bundles", description: bundlesRes.error.message });
    } else {
        setBundles(bundlesRes.data || []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/nst-admin/login');
  };

  // Filter Logic Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = filterCategory === 'All' || p.category === filterCategory;
      const stock = p.specifications?.availability || 'In Stock';
      const matchStock = filterStock === 'All' || stock === filterStock;
      return matchSearch && matchCategory && matchStock;
    });
  }, [products, searchQuery, filterCategory, filterStock]);

  // Filter Logic Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const archiveMatch = showArchived ? o.archived === true : !o.archived;
      const searchMatch = o.order_id?.toLowerCase().includes(orderSearch.toLowerCase()) || 
                          o.customer_name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.order_number?.toLowerCase().includes(orderSearch.toLowerCase());
      const statusMatch = orderStatus === 'All' || o.payment_status === orderStatus;
      return archiveMatch && searchMatch && statusMatch;
    });
  }, [orders, orderSearch, orderStatus, showArchived]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setProductData(prev => ({ ...prev, [id]: value }));
  };

  const handleApplicationToggle = (app) => {
    setProductData(prev => {
      const apps = prev.applications.includes(app)
        ? prev.applications.filter(a => a !== app)
        : [...prev.applications, app];
      return { ...prev, applications: apps };
    });
  };

  const handleFileChange = (e, setFile, type) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFile(file);
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setProductData({
      name: '',
      category: 'Electrodes',
      price: '',
      discount_percentage: '10',
      short_description: '',
      features: '',
      other_specifications: '{}',
      applications: [],
      availability: 'In Stock',
      pdf_url: '',
      video_url: '',
      image_url: ''
    });
    setImageFile(null);
    setPdfFile(null);
  };

  const handleOpenDialog = (product = null) => {
    resetForm();
    if (product) {
      setEditingProduct(product);
      
      const specs = product.specifications || {};
      const apps = specs.applications || [];
      const avail = specs.availability || 'In Stock';
      
      const otherSpecs = { ...specs };
      delete otherSpecs.applications;
      delete otherSpecs.availability;

      setProductData({
        name: product.name || '',
        category: product.category || 'Electrodes',
        price: product.price || '',
        discount_percentage: product.discount_percentage ?? 10,
        short_description: product.short_description || '',
        features: (product.features || []).join('\n'),
        other_specifications: Object.keys(otherSpecs).length ? JSON.stringify(otherSpecs, null, 2) : '{}',
        applications: apps,
        availability: avail,
        pdf_url: product.pdf_url || '',
        video_url: product.video_url || '',
        image_url: product.image_url || '',
      });
    }
    setIsDialogOpen(true);
  };

  const uploadFile = async (file, folder) => {
      if (!file) return null;
      const fileName = `${folder}/${user.id}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('product-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }
      
      const { data: { publicUrl } } = supabase.storage.from('product-files').getPublicUrl(data.path);
      return publicUrl;
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productData.name || !productData.category) {
      toast({ variant: "destructive", title: "Validation Error", description: "Name and Category are required." });
      return;
    }
    
    setIsSubmitting(true);
    setIsUploading(true);
  
    try {
        const [newImageUrl, newPdfUrl] = await Promise.all([
          uploadFile(imageFile, 'images'),
          uploadFile(pdfFile, 'pdfs'),
        ]);

        const featuresArray = productData.features.split('\n').filter(f => f.trim() !== '');
        
        let otherSpecsJson = {};
        try {
          otherSpecsJson = JSON.parse(productData.other_specifications);
        } catch (err) {
          throw new Error("Invalid JSON in Specifications field.");
        }

        const specificationsJson = {
          ...otherSpecsJson,
          applications: productData.applications,
          availability: productData.availability
        };

        const discountPercentage = productData.discount_percentage === '' ? 0 : Number(productData.discount_percentage);
        if (!Number.isFinite(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
          throw new Error("Discount must be a number between 0 and 100.");
        }

        const basePrice = productData.price ? parseFloat(productData.price) : null;

        const payload = {
            name: productData.name,
            category: productData.category,
            short_description: productData.short_description,
            features: featuresArray,
            specifications: specificationsJson,
            price: basePrice,
            discount_percentage: discountPercentage,
            discounted_price: basePrice !== null ? Math.round(basePrice * (1 - discountPercentage / 100)) : null,
            currency: 'INR',
            owner_id: user.id,
            image_url: newImageUrl || productData.image_url,
            pdf_url: newPdfUrl || productData.pdf_url,
            video_url: productData.video_url
        };
      
        let error;
        if (editingProduct) {
            const { error: updateError } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
            error = updateError;
        } else {
            if (!payload.image_url) throw new Error("A product image URL or file is required.");
            const maxSort = products.reduce((m, p) => Math.max(m, p.sort_order || 0), 0);
            const { error: insertError } = await supabase.from('products').insert([{ ...payload, sort_order: maxSort + 1 }]);
            error = insertError;
        }
      
        if (error) throw error;
  
        toast({
            title: `Product ${editingProduct ? 'updated' : 'created'} successfully!`,
        });
  
        fetchData();
        setIsDialogOpen(false);
        resetForm();

    } catch (error) {
        toast({
            variant: "destructive",
            title: `Failed to save product`,
            description: error.message || "An unexpected error occurred.",
        });
    } finally {
        setIsSubmitting(false);
        setIsUploading(false);
    }
  };

  const handleDelete = async (productId) => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      toast({ variant: "destructive", title: "Failed to delete product", description: error.message });
    } else {
      toast({ title: "Product deleted successfully!" });
      setProducts(prev => prev.filter(p => p.id !== productId));
      setSelectedProductIds(prev => prev.filter(id => id !== productId));
    }
  };

  // ---- Product ordering (persistent sort_order) ----
  const commitProductOrder = async (newFilteredIds) => {
    const filteredIds = filteredProducts.map(p => p.id);
    const restIds = products.filter(p => !filteredIds.includes(p.id)).map(p => p.id);
    const fullOrder = [...newFilteredIds, ...restIds];
    try {
      await Promise.all(fullOrder.map((id, idx) =>
        supabase.from('products').update({ sort_order: idx + 1 }).eq('id', id)
      ));
      setProducts(prev => {
        const map = {};
        prev.forEach(p => { map[p.id] = p; });
        return fullOrder.map((id, idx) => ({ ...map[id], sort_order: idx + 1 }));
      });
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to save order", description: e.message });
    }
  };

  const moveProduct = (id, dir) => {
    const ids = filteredProducts.map(p => p.id);
    const i = ids.indexOf(id);
    const j = i + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    commitProductOrder(ids);
  };

  const handleDragStart = (id) => setDragId(id);
  const handleDragOver = (e, id) => { e.preventDefault(); setDragOverId(id); };
  const handleDrop = (id) => {
    if (!dragId || dragId === id) { setDragId(null); setDragOverId(null); return; }
    const ids = filteredProducts.map(p => p.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(id);
    ids.splice(from, 1);
    ids.splice(to, 0, dragId);
    setDragId(null); setDragOverId(null);
    commitProductOrder(ids);
  };

  // ---- Quick actions from Dashboard ----
  const handleQuickAction = (action) => {
    if (action === 'addProduct') { setActiveTab('products'); setPendingAction('addProduct'); }
    else if (action === 'addBundle') { setActiveTab('bundles'); setBundleOpenSignal(s => s + 1); }
    else if (action === 'products') setActiveTab('products');
    else if (action === 'bundles') setActiveTab('bundles');
    else if (action === 'orders') setActiveTab('orders');
  };

  useEffect(() => {
    if (activeTab === 'products' && pendingAction === 'addProduct') {
      handleOpenDialog();
      setPendingAction(null);
    }
  }, [activeTab, pendingAction]);

  // ---- Order archive / soft-delete ----
  const handleArchiveOrder = async (id, archive) => {
    setIsOrderActioning(true);
    const { error } = await supabase.from('orders').update({ archived: archive, deleted_at: archive ? new Date().toISOString() : null }).eq('id', id);
    if (error) toast({ variant: "destructive", title: "Failed", description: error.message });
    else { toast({ title: archive ? "Order archived" : "Order restored" }); fetchData(); }
    setIsOrderActioning(false);
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    setIsOrderActioning(true);
    const { error } = await supabase.from('orders').update({ archived: true, deleted_at: new Date().toISOString() }).eq('id', orderToDelete.id);
    if (error) toast({ variant: "destructive", title: "Failed to delete order", description: error.message });
    else { toast({ title: "Order deleted (archived)" }); fetchData(); }
    setOrderToDelete(null);
    setIsOrderActioning(false);
  };

  // Bulk Actions
  const toggleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelectProduct = (id) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleBulkApplicationToggle = (app) => {
    setBulkActionApplications(prev => 
      prev.includes(app) ? prev.filter(a => a !== app) : [...prev, app]
    );
  };

  const handleBulkUpdate = async () => {
    if (selectedProductIds.length === 0) return;
    if (!bulkActionCategory && bulkActionApplications.length === 0 && !bulkActionStock) {
      toast({ variant: "destructive", title: "No changes specified for bulk update."});
      return;
    }

    setIsBulkUpdating(true);
    try {
      const updates = [];

      for (const id of selectedProductIds) {
        const product = products.find(p => p.id === id);
        if (!product) continue;

        let payload = {};
        if (bulkActionCategory) payload.category = bulkActionCategory;
        
        let specs = { ...product.specifications };
        let updateSpecs = false;

        if (bulkActionApplications.length > 0) {
          specs.applications = [...new Set([...(specs.applications || []), ...bulkActionApplications])];
          updateSpecs = true;
        }

        if (bulkActionStock) {
          specs.availability = bulkActionStock;
          updateSpecs = true;
        }

        if (updateSpecs) {
          payload.specifications = specs;
        }

        if (Object.keys(payload).length > 0) {
          const { error } = await supabase.from('products').update(payload).eq('id', id);
          if (error) throw error;
        }
      }

      toast({ title: "Bulk update successful!" });
      fetchData();
      setBulkActionCategory('');
      setBulkActionApplications([]);
      setBulkActionStock('');
      setSelectedProductIds([]);
    } catch (err) {
      toast({ variant: "destructive", title: "Bulk update failed", description: err.message });
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const viewOrderDetails = (order) => {
      setSelectedOrder(order);
      setIsOrderModalOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | NextSens Tech</title>
      </Helmet>
      <div className="admin-container">
        <div className="max-w-7xl mx-auto">
          <header className="admin-header">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Package className="h-8 w-8 text-accent" /> Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">Manage your store, inventory, and orders.</p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline" className="bg-white">
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Store Home
                </Link>
              </Button>
              <Button onClick={handleSignOut} variant="outline" className="bg-white text-destructive border-destructive/30 hover:bg-destructive/10">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </header>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-muted flex flex-wrap h-auto">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-background"><BarChart3 className="mr-1.5 h-4 w-4" />Dashboard</TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:bg-background">Products</TabsTrigger>
              <TabsTrigger value="bundles" className="data-[state=active]:bg-background">Equipment Bundles</TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:bg-background">Orders</TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-background"><BarChart3 className="mr-1.5 h-4 w-4" />Website Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <AdminDashboardOverview
                products={products}
                bundles={bundles}
                orders={orders}
                loading={loading}
                onRefresh={fetchData}
                onQuickAction={handleQuickAction}
              />
            </TabsContent>

            <TabsContent value="products">
                <main className="space-y-6">
                    {/* Toolbar: Search, Filter, and Create */}
                    <div className="admin-card">
                    <div className="admin-toolbar">
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-grow">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input 
                            type="text" 
                            placeholder="Search products..." 
                            className="admin-input pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select 
                            className="admin-select w-full sm:w-48"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select 
                            className="admin-select w-full sm:w-48"
                            value={filterStock}
                            onChange={(e) => setFilterStock(e.target.value)}
                        >
                            <option value="All">All Stock Status</option>
                            {STOCK_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        </div>
                        
                        <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto bg-accent hover:bg-primary">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                        </Button>
                    </div>
                    
                    {/* Bulk Actions Panel (visible when items selected) */}
                    {selectedProductIds.length > 0 && (
                        <div className="bg-blue-50/50 border-b border-border p-4 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                        <span className="font-semibold text-accent text-sm">
                            {selectedProductIds.length} product(s) selected
                        </span>
                        <div className="flex flex-wrap items-center gap-3">
                            <select 
                            className="admin-select h-8 text-xs w-36"
                            value={bulkActionCategory}
                            onChange={(e) => setBulkActionCategory(e.target.value)}
                            >
                            <option value="">Update Category...</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>

                            <select 
                            className="admin-select h-8 text-xs w-36"
                            value={bulkActionStock}
                            onChange={(e) => setBulkActionStock(e.target.value)}
                            >
                            <option value="">Update Stock...</option>
                            {STOCK_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>

                            <div className="flex items-center gap-2 border border-border rounded-md px-2 py-1 h-8 bg-white overflow-hidden max-w-[250px] overflow-x-auto">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">Add App:</span>
                            {APPLICATIONS.map(app => (
                                <div key={app} className="flex items-center space-x-1 whitespace-nowrap">
                                <Checkbox 
                                    id={`bulk-app-${app}`} 
                                    className="h-3 w-3"
                                    checked={bulkActionApplications.includes(app)}
                                    onCheckedChange={() => handleBulkApplicationToggle(app)}
                                />
                                <label htmlFor={`bulk-app-${app}`} className="text-[10px]">{app.split(' ')[0]}</label>
                                </div>
                            ))}
                            </div>

                            <Button 
                            size="sm" 
                            onClick={handleBulkUpdate} 
                            disabled={isBulkUpdating}
                            className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
                            >
                            {isBulkUpdating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
                            Apply Bulk Update
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setSelectedProductIds([])}>Cancel</Button>
                        </div>
                        </div>
                    )}
                    
                    {/* Data Table */}
                    <div className="admin-table-container">
                        {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-10 w-10 animate-spin text-accent" />
                        </div>
                        ) : filteredProducts.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>No products found matching your criteria.</p>
                        </div>
                        ) : (
                        <Table>
                            <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead className="w-[60px] text-center">Order</TableHead>
                                <TableHead className="w-[50px] text-center">
                                <Checkbox 
                                    checked={filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length}
                                    onCheckedChange={toggleSelectAll}
                                />
                                </TableHead>
                                <TableHead className="w-[80px]">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Applications</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {filteredProducts.map((product) => {
                                const stock = product.specifications?.availability || 'In Stock';
                                const apps = product.specifications?.applications || [];
                                const isSelected = selectedProductIds.includes(product.id);
                                return (
                                <TableRow 
                                  key={product.id} 
                                  className={`${isSelected ? 'bg-blue-50/30' : ''} ${dragOverId === product.id ? 'border-t-2 border-accent' : ''}`}
                                  draggable
                                  onDragStart={() => handleDragStart(product.id)}
                                  onDragOver={(e) => handleDragOver(e, product.id)}
                                  onDrop={() => handleDrop(product.id)}
                                  onDragEnd={() => { setDragId(null); setDragOverId(null); }}
                                >
                                    <TableCell className="text-center">
                                      <div className="flex items-center justify-center gap-0.5">
                                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                        <div className="flex flex-col">
                                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => moveProduct(product.id, -1)} title="Move up">
                                            <ArrowUp className="h-3 w-3" />
                                          </Button>
                                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => moveProduct(product.id, 1)} title="Move down">
                                            <ArrowDown className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                    <Checkbox 
                                        checked={isSelected}
                                        onCheckedChange={() => toggleSelectProduct(product.id)}
                                    />
                                    </TableCell>
                                    <TableCell>
                                    <img src={product.image_url || 'https://via.placeholder.com/50'} alt={product.name} className="h-12 w-12 object-contain rounded-md bg-white border border-border p-1" />
                                    </TableCell>
                                    <TableCell className="font-medium max-w-[200px] truncate" title={product.name}>{product.name}</TableCell>
                                    <TableCell>
                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                        {product.category}
                                    </span>
                                    </TableCell>
                                    <TableCell>
                                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                                        {apps.length > 0 ? apps.map(app => (
                                        <span key={app} className="text-[10px] bg-muted px-1.5 py-0.5 rounded" title={app}>
                                            {app.split(' ')[0]}
                                        </span>
                                        )) : <span className="text-muted-foreground text-xs">-</span>}
                                    </div>
                                    </TableCell>
                                    <TableCell className="font-semibold">
                                    {product.price ? `₹${product.price.toLocaleString('en-IN')}` : 'Request'}
                                    </TableCell>
                                    <TableCell>
                                    {product.price !== null && product.discount_percentage !== null && product.discount_percentage !== undefined
                                        ? `${product.discount_percentage}%`
                                        : '—'}
                                    </TableCell>
                                    <TableCell>
                                    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${stock === 'In Stock' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                                        <CheckCircle className="h-3 w-3" />
                                        {stock}
                                    </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className="mr-1 h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700" onClick={() => handleOpenDialog(product)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Delete Product</DialogTitle>
                                                <DialogDescription>
                                                    Are you sure you want to delete <span className="font-bold">{product.name}</span>? This action cannot be undone.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter>
                                                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                                                <Button variant="destructive" onClick={() => handleDelete(product.id)}>Delete Permanently</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                    </TableCell>
                                </TableRow>
                                );
                            })}
                            </TableBody>
                        </Table>
                        )}
                    </div>
                    </div>

                    {/* Edit / Create Modal */}
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-background">
                        <DialogHeader className="px-6 py-4 border-b border-border bg-muted/20">
                        <DialogTitle className="text-xl">{editingProduct ? 'Edit Product' : 'Create New Product'}</DialogTitle>
                        <DialogDescription>
                            Complete the form below to {editingProduct ? 'update the' : 'add a new'} product to the catalog.
                        </DialogDescription>
                        </DialogHeader>
                        
                        <form id="product-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            {/* Left Column: Basic Info */}
                            <div className="space-y-5">
                            <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
                            
                            <div className="admin-form-group">
                                <label htmlFor="name" className="admin-label">Product Name *</label>
                                <input id="name" type="text" className="admin-input" value={productData.name} onChange={handleInputChange} required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="admin-form-group">
                                <label htmlFor="price" className="admin-label">Price (₹)</label>
                                <input id="price" type="number" className="admin-input" value={productData.price} onChange={handleInputChange} placeholder="Leave blank for 'On Request'" />
                                </div>
                                <div className="admin-form-group">
                                <label htmlFor="discount_percentage" className="admin-label">Discount (%)</label>
                                <input id="discount_percentage" type="number" min="0" max="100" step="0.01" className="admin-input" value={productData.discount_percentage} onChange={handleInputChange} placeholder="e.g., 10" />
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="availability" className="admin-label">Stock Status</label>
                                <select id="availability" className="admin-select" value={productData.availability} onChange={handleInputChange}>
                                    {STOCK_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="category" className="admin-label">Category *</label>
                                <select id="category" className="admin-select" value={productData.category} onChange={handleInputChange}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-label mb-2 block">Applications (Select multiple)</label>
                                <div className="grid grid-cols-2 gap-2 bg-muted/20 p-3 rounded-md border border-border">
                                {APPLICATIONS.map((app) => (
                                    <div key={app} className="admin-checkbox-group">
                                    <Checkbox 
                                        id={`app-${app}`} 
                                        checked={productData.applications.includes(app)}
                                        onCheckedChange={() => handleApplicationToggle(app)}
                                    />
                                    <label htmlFor={`app-${app}`} className="text-sm cursor-pointer">{app}</label>
                                    </div>
                                ))}
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="short_description" className="admin-label">Short Description</label>
                                <textarea id="short_description" className="admin-textarea" value={productData.short_description} onChange={handleInputChange} rows={3} />
                            </div>
                            </div>

                            {/* Right Column: Details & Media */}
                            <div className="space-y-5">
                            <h3 className="text-lg font-semibold border-b pb-2">Details & Media</h3>

                            <div className="admin-form-group">
                                <label htmlFor="features" className="admin-label">Key Features (One per line)</label>
                                <textarea id="features" className="admin-textarea font-mono text-xs" value={productData.features} onChange={handleInputChange} rows={4} placeholder="Feature 1&#10;Feature 2" />
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="other_specifications" className="admin-label">Other Specifications (JSON)</label>
                                <textarea id="other_specifications" className="admin-textarea font-mono text-xs" value={productData.other_specifications} onChange={handleInputChange} rows={4} placeholder='{"Voltage": "0-10V"}' />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-label">Product Image *</label>
                                <div className="flex gap-4 items-center">
                                <input type="url" id="image_url" placeholder="Image URL (or upload below)" className="admin-input flex-1" value={productData.image_url} onChange={handleInputChange} />
                                </div>
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setImageFile, 'image')} className="admin-input mt-2" />
                                {(imageFile || productData.image_url) && (
                                <div className="mt-2 h-20 w-20 rounded-md border overflow-hidden bg-white flex items-center justify-center">
                                    {imageFile ? <span className="text-xs text-center p-1">{imageFile.name}</span> : <img src={productData.image_url} alt="Preview" className="max-h-full max-w-full object-contain" />}
                                </div>
                                )}
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-label">PDF Datasheet</label>
                                <div className="flex gap-4 items-center mb-2">
                                <input type="url" id="pdf_url" placeholder="PDF URL (or upload)" className="admin-input flex-1" value={productData.pdf_url} onChange={handleInputChange} />
                                </div>
                                <input type="file" accept="application/pdf" onChange={(e) => handleFileChange(e, setPdfFile, 'pdf')} className="admin-input" />
                            </div>
                            
                            <div className="admin-form-group">
                                <label htmlFor="video_url" className="admin-label">YouTube Video URL</label>
                                <input type="url" id="video_url" className="admin-input" value={productData.video_url} onChange={handleInputChange} placeholder="https://youtube.com/watch?v=..." />
                            </div>
                            </div>
                        </div>
                        </form>

                        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/20 sm:justify-between">
                        <div className="text-sm text-muted-foreground flex items-center">
                            * Required fields
                        </div>
                        <div className="flex gap-2">
                            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                            <Button type="submit" form="product-form" disabled={isSubmitting || isUploading} className="bg-accent hover:bg-primary text-white min-w-[120px]">
                                {(isSubmitting || isUploading) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                {editingProduct ? 'Save Changes' : 'Create Product'}
                            </Button>
                        </div>
                        </DialogFooter>
                    </DialogContent>
                    </Dialog>

                </main>
            </TabsContent>

            <TabsContent value="bundles">
              <BundlesList 
                bundles={bundles}
                loading={loading}
                onBundleChange={fetchData}
                products={products}
                openSignal={bundleOpenSignal}
              />
            </TabsContent>

            <TabsContent value="orders">
               <div className="admin-card">
                  <div className="admin-toolbar">
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input 
                          type="text" 
                          placeholder="Search orders..." 
                          className="admin-input pl-9"
                          value={orderSearch}
                          onChange={(e) => setOrderSearch(e.target.value)}
                        />
                      </div>
                      <select 
                        className="admin-select w-full sm:w-48"
                        value={orderStatus}
                        onChange={(e) => setOrderStatus(e.target.value)}
                      >
                        <option value="All">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                      </select>
                      <Button
                        variant={showArchived ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowArchived(s => !s)}
                        className={showArchived ? "bg-accent hover:bg-primary text-white" : ""}
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        {showArchived ? "Showing Archived" : "Show Archived"}
                      </Button>
                    </div>
                  </div>

                  <div className="admin-table-container">
                    {loading ? (
                      <div className="flex justify-center items-center h-64"><Loader2 className="h-10 w-10 animate-spin text-accent" /></div>
                    ) : filteredOrders.length === 0 ? (
                       <div className="p-8 text-center text-muted-foreground">
                        <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No orders found matching criteria.</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredOrders.map(order => (
                             <TableRow key={order.id} className={order.archived ? 'opacity-60' : ''}>
                               <TableCell className="font-medium text-sm">
                                 {order.order_number || order.order_id}
                                 {order.order_number && <span className="block text-[10px] text-muted-foreground font-normal">{order.order_id}</span>}
                               </TableCell>
                               <TableCell>
                                 {order.customer_name}<br/>
                                 <span className="text-xs text-muted-foreground flex items-center mt-0.5">
                                    <Mail className="h-3 w-3 mr-1 inline" />
                                    {order.email}
                                 </span>
                               </TableCell>
                               <TableCell className="text-sm">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                               <TableCell className="font-semibold">₹{order.total_amount}</TableCell>
                               <TableCell>
                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    order.payment_status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' : 
                                    order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                    'bg-red-100 text-red-800 border border-red-200'
                                 }`}>
                                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                 </span>
                               </TableCell>
                               <TableCell className="text-right space-x-2">
                                  {order.invoice_pdf_url && (
                                     <Button variant="ghost" size="icon" asChild title="Download Invoice" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                                         <a href={order.invoice_pdf_url} target="_blank" rel="noopener noreferrer">
                                            <Download className="h-4 w-4" />
                                         </a>
                                     </Button>
                                  )}
                                  <Button variant="outline" size="sm" onClick={() => viewOrderDetails(order)}>View Details</Button>
                                  {order.archived ? (
                                    <Button variant="outline" size="sm" onClick={() => handleArchiveOrder(order.id, false)} disabled={isOrderActioning} title="Restore order">
                                      <RotateCcw className="mr-1 h-3.5 w-3.5" /> Restore
                                    </Button>
                                  ) : (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-600 hover:bg-orange-50" onClick={() => handleArchiveOrder(order.id, true)} disabled={isOrderActioning} title="Archive order">
                                      <Archive className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => setOrderToDelete(order)} title="Delete order">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                               </TableCell>
                             </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
               </div>

               {/* Order Details Modal */}
               <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
                  <DialogContent className="max-w-3xl">
                     <DialogHeader className="border-b pb-4">
                        <DialogTitle className="flex justify-between items-center pr-6">
                            <span>Order Details: {selectedOrder?.order_id}</span>
                            {selectedOrder && (
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${selectedOrder.payment_status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {selectedOrder.payment_status.toUpperCase()}
                                </span>
                            )}
                        </DialogTitle>
                     </DialogHeader>
                     
                     {selectedOrder && (
                        <div className="space-y-6 py-4 custom-scrollbar max-h-[70vh] overflow-y-auto">
                           {/* Customer Info */}
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/20 p-4 rounded-lg border">
                             <div>
                                 <h4 className="font-semibold text-sm text-muted-foreground mb-2 uppercase">Customer Information</h4>
                                 <div className="space-y-1 text-sm">
                                    <p><span className="font-medium w-24 inline-block">Name:</span> {selectedOrder.customer_name}</p>
                                    <p><span className="font-medium w-24 inline-block">Email:</span> {selectedOrder.email}</p>
                                    <p><span className="font-medium w-24 inline-block">Mobile:</span> {selectedOrder.mobile}</p>
                                    {selectedOrder.company_name && <p><span className="font-medium w-24 inline-block">Company:</span> {selectedOrder.company_name}</p>}
                                    {selectedOrder.gst_number && <p><span className="font-medium w-24 inline-block">GST No:</span> {selectedOrder.gst_number}</p>}
                                 </div>
                             </div>
                             <div>
                                 <h4 className="font-semibold text-sm text-muted-foreground mb-2 uppercase">Order Info</h4>
                                 <div className="space-y-1 text-sm">
                                     <p><span className="font-medium w-28 inline-block">Date:</span> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                                     <p><span className="font-medium w-28 inline-block">Razorpay ID:</span> {selectedOrder.razorpay_payment_id || 'N/A'}</p>
                                     <p><span className="font-medium w-28 inline-block">Email Sent:</span> {selectedOrder.email_sent ? 'Yes' : 'No'}</p>
                                     <p><span className="font-medium w-28 inline-block">Invoice No:</span> {selectedOrder.invoice_number || 'N/A'}</p>
                                 </div>
                             </div>
                           </div>

                           {/* Addresses */}
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-white p-4 rounded-lg border shadow-sm">
                                  <h4 className="font-semibold text-sm text-muted-foreground mb-2 uppercase border-b pb-2">Billing Address</h4>
                                  <address className="not-italic text-sm space-y-1 mt-2">
                                      {selectedOrder.billing_address?.line}<br/>
                                      {selectedOrder.billing_address?.city}, {selectedOrder.billing_address?.state} {selectedOrder.billing_address?.pincode}
                                  </address>
                              </div>
                              <div className="bg-white p-4 rounded-lg border shadow-sm">
                                  <h4 className="font-semibold text-sm text-muted-foreground mb-2 uppercase border-b pb-2">Shipping Address</h4>
                                  <address className="not-italic text-sm space-y-1 mt-2">
                                      {selectedOrder.shipping_address?.line}<br/>
                                      {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} {selectedOrder.shipping_address?.pincode}
                                  </address>
                              </div>
                           </div>

                           {/* Items */}
                           <div>
                             <h4 className="font-semibold text-lg mb-3">Order Items</h4>
                             <div className="border rounded-md overflow-hidden">
                                 <Table>
                                    <TableHeader className="bg-muted">
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead className="text-center w-24">Qty</TableHead>
                                            <TableHead className="text-right w-32">Price</TableHead>
                                            <TableHead className="text-right w-32">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                    {selectedOrder.items.map((i, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-medium">{i.name}</TableCell>
                                            <TableCell className="text-center">{i.quantity}</TableCell>
                                            <TableCell className="text-right">₹{i.price}</TableCell>
                                            <TableCell className="text-right font-semibold">₹{i.price * i.quantity}</TableCell>
                                        </TableRow>
                                    ))}
                                    </TableBody>
                                 </Table>
                             </div>
                             
                             <div className="mt-4 flex justify-end">
                                 <div className="w-64 space-y-2 text-sm">
                                     <div className="flex justify-between">
                                         <span className="text-muted-foreground">Subtotal</span>
                                         <span>₹{selectedOrder.subtotal}</span>
                                     </div>
                                     {selectedOrder.gst_amount > 0 && (
                                         <div className="flex justify-between">
                                             <span className="text-muted-foreground">GST (18%)</span>
                                             <span>₹{selectedOrder.gst_amount}</span>
                                         </div>
                                     )}
                                     <div className="flex justify-between border-t pt-2 font-bold text-lg">
                                         <span>Total Paid</span>
                                         <span>₹{selectedOrder.total_amount}</span>
                                     </div>
                                 </div>
                             </div>
                           </div>
                        </div>
                     )}
                     
                     <DialogFooter className="border-t pt-4 sm:justify-between items-center">
                        <div>
                            {selectedOrder?.invoice_pdf_url && (
                               <Button asChild variant="outline" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200">
                                  <a href={selectedOrder.invoice_pdf_url} target="_blank" rel="noopener noreferrer">
                                     <Download className="mr-2 h-4 w-4" /> Download PDF Invoice
                                  </a>
                               </Button>
                            )}
                        </div>
                        <DialogClose asChild><Button>Close Details</Button></DialogClose>
                     </DialogFooter>
                  </DialogContent>
               </Dialog>

               {/* Delete/Archive Order Confirmation */}
               <Dialog open={!!orderToDelete} onOpenChange={(open) => !open && setOrderToDelete(null)}>
                  <DialogContent>
                     <DialogHeader>
                        <DialogTitle>Delete Order</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete order <span className="font-bold">{orderToDelete?.order_number || orderToDelete?.order_id}</span>?
                          This will archive it (soft-delete) so it disappears from the active list and dashboard, but the record is retained. This action can be reversed from the "Show Archived" view.
                        </DialogDescription>
                     </DialogHeader>
                     <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button variant="destructive" onClick={handleDeleteOrder} disabled={isOrderActioning}>
                          {isOrderActioning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                          Delete Order
                        </Button>
                     </DialogFooter>
                  </DialogContent>
               </Dialog>
            </TabsContent>

            <TabsContent value="analytics">
              <WebsiteAnalytics />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default AdminDashboardPage;