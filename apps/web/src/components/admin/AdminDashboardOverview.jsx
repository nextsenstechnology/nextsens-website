import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RefreshCw, PlusCircle, Package, ShoppingCart, TrendingUp, IndianRupee, Boxes, AlertTriangle } from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';

const DATE_FILTERS = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'week', label: 'This Week' },
  { key: 'lastWeek', label: 'Last Week' },
  { key: 'month', label: 'This Month' },
  { key: 'lastMonth', label: 'Last Month' },
  { key: '3m', label: '3 Months' },
  { key: '6m', label: '6 Months' },
  { key: '12m', label: '12 Months' },
  { key: 'ytd', label: 'YTD' },
  { key: 'all', label: 'Lifetime' },
];

const STATUS_COLORS = { completed: '#16a34a', pending: '#ca8a04', failed: '#dc2626' };
const CAT_COLORS = ['#2563eb', '#0ea5e9', '#7c3aed', '#db2777', '#ea580c', '#16a34a'];
const INV_COLORS = { 'In Stock': '#16a34a', 'Made to Order': '#ea580c', 'Out of Stock': '#dc2626' };

const fmtINR = (n) => {
  const v = Number(n) || 0;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
};
const fmtNum = (n) => (n === null || n === undefined ? '--' : new Intl.NumberFormat('en-IN').format(n));

const getRange = (key) => {
  const now = new Date();
  const start = new Date();
  const end = new Date();
  switch (key) {
    case 'today':
      start.setHours(0, 0, 0, 0); return { start, end: now };
    case 'yesterday': {
      start.setDate(now.getDate() - 1); start.setHours(0, 0, 0, 0);
      end.setDate(now.getDate() - 1); end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    case 'week': {
      const day = now.getDay();
      start.setDate(now.getDate() - day); start.setHours(0, 0, 0, 0);
      return { start, end: now };
    }
    case 'lastWeek': {
      const day = now.getDay();
      start.setDate(now.getDate() - day - 7); start.setHours(0, 0, 0, 0);
      end.setDate(now.getDate() - day - 1); end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    case 'month':
      start.setDate(1); start.setHours(0, 0, 0, 0); return { start, end: now };
    case 'lastMonth': {
      start.setMonth(now.getMonth() - 1, 1); start.setHours(0, 0, 0, 0);
      end.setDate(0); end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    case '3m': start.setMonth(now.getMonth() - 3); return { start, end: now };
    case '6m': start.setMonth(now.getMonth() - 6); return { start, end: now };
    case '12m': start.setFullYear(now.getFullYear() - 1); return { start, end: now };
    case 'ytd': start.setMonth(0, 1); start.setHours(0, 0, 0, 0); return { start, end: now };
    case 'all': start.setFullYear(2000, 0, 1); return { start, end: now };
    default: return { start: new Date(2000, 0, 1), end: now };
  }
};

const KpiCard = ({ icon: Icon, label, value, sub, accent }) => (
  <Card className="shadow-sm">
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className={`p-2 rounded-lg ${accent}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const AdminDashboardOverview = ({ products, bundles, orders, loading, onRefresh, onQuickAction }) => {
  const [filter, setFilter] = useState('month');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Active (non-archived) orders only
  const activeOrders = useMemo(() => (orders || []).filter(o => !o.archived), [orders]);

  const range = useMemo(() => getRange(filter), [filter]);

  const inRangeOrders = useMemo(() => {
    return activeOrders.filter(o => {
      const d = new Date(o.created_at);
      return d >= range.start && d <= range.end;
    });
  }, [activeOrders, range]);

  // KPIs
  const kpis = useMemo(() => {
    const completed = inRangeOrders.filter(o => o.payment_status === 'completed');
    const revenue = completed.reduce((s, o) => s + Number(o.total_amount || 0), 0);
    const aov = completed.length ? revenue / completed.length : 0;

    const totalProducts = products.length;
    const activeBundles = bundles.filter(b => b.status === 'active').length;

    const stockOf = (p) => p.specifications?.availability || 'In Stock';
    const inStock = products.filter(p => stockOf(p) === 'In Stock').length;
    const madeToOrder = products.filter(p => stockOf(p) === 'Made to Order').length;
    const outOfStock = products.filter(p => stockOf(p) === 'Out of Stock').length;

    // Order counts across ranges
    const countSince = (days) => {
      const s = new Date(); s.setDate(s.getDate() - days); s.setHours(0, 0, 0, 0);
      return activeOrders.filter(o => new Date(o.created_at) >= s).length;
    };
    const countToday = countSince(0) === 0 ? activeOrders.filter(o => { const d = new Date(o.created_at); const n = new Date(); return d.toDateString() === n.toDateString(); }).length : countSince(1);
    const todayOrders = activeOrders.filter(o => { const d = new Date(o.created_at); const n = new Date(); return d.toDateString() === n.toDateString(); }).length;

    const startOfWeek = new Date(); startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); startOfWeek.setHours(0, 0, 0, 0);
    const weekOrders = activeOrders.filter(o => new Date(o.created_at) >= startOfWeek).length;

    const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
    const monthOrders = activeOrders.filter(o => new Date(o.created_at) >= startOfMonth).length;

    const startOfYear = new Date(); startOfYear.setMonth(0, 1); startOfYear.setHours(0, 0, 0, 0);
    const ytdOrders = activeOrders.filter(o => new Date(o.created_at) >= startOfYear).length;

    const revenueSince = (s) => activeOrders.filter(o => o.payment_status === 'completed' && new Date(o.created_at) >= s).reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const todayRev = revenueSince(new Date(new Date().setHours(0, 0, 0, 0)));
    const weekRev = revenueSince(startOfWeek);
    const monthRev = revenueSince(startOfMonth);
    const ytdRev = revenueSince(startOfYear);
    const lifetimeRev = activeOrders.filter(o => o.payment_status === 'completed').reduce((s, o) => s + Number(o.total_amount || 0), 0);

    return {
      revenue, aov, completedCount: completed.length, rangeOrders: inRangeOrders.length,
      totalProducts, activeBundles, totalBundles: bundles.length,
      inStock, madeToOrder, outOfStock,
      todayOrders, weekOrders, monthOrders, ytdOrders, totalOrders: activeOrders.length,
      todayRev, weekRev, monthRev, ytdRev, lifetimeRev,
    };
  }, [inRangeOrders, activeOrders, products, bundles]);

  // Revenue + Orders over time (bucketed by day for <= 60 days, else month)
  const timeSeries = useMemo(() => {
    if (inRangeOrders.length === 0) return [];
    const spanDays = Math.max(1, Math.round((range.end - range.start) / 86400000));
    const byMonth = spanDays > 60;
    const buckets = {};
    inRangeOrders.forEach(o => {
      const d = new Date(o.created_at);
      const key = byMonth
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!buckets[key]) buckets[key] = { key, revenue: 0, orders: 0 };
      if (o.payment_status === 'completed') buckets[key].revenue += Number(o.total_amount || 0);
      buckets[key].orders += 1;
    });
    return Object.keys(buckets).sort().map(k => ({ ...buckets[k], label: k }));
  }, [inRangeOrders, range]);

  // Order status distribution
  const statusDist = useMemo(() => {
    const m = {};
    activeOrders.forEach(o => { m[o.payment_status] = (m[o.payment_status] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [activeOrders]);

  // Products by category
  const categoryDist = useMemo(() => {
    const m = {};
    products.forEach(p => { m[p.category] = (m[p.category] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [products]);

  // Inventory status
  const inventoryDist = useMemo(() => {
    const m = { 'In Stock': 0, 'Made to Order': 0, 'Out of Stock': 0 };
    products.forEach(p => { const s = p.specifications?.availability || 'In Stock'; m[s] = (m[s] || 0) + 1; });
    return Object.entries(m).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [products]);

  // Top products by revenue (from completed order items)
  const topProducts = useMemo(() => {
    const m = {};
    activeOrders.filter(o => o.payment_status === 'completed').forEach(o => {
      (o.items || []).forEach(i => {
        const name = i.name || i.description || 'Unknown';
        if (!m[name]) m[name] = { name, qty: 0, revenue: 0 };
        m[name].qty += Number(i.quantity || 0);
        m[name].revenue += Number(i.price || 0) * Number(i.quantity || 0);
      });
    });
    return Object.values(m).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [activeOrders]);

  // Recent orders
  const recentOrders = useMemo(() => {
    return [...activeOrders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 8);
  }, [activeOrders]);

  // Low stock
  const lowStock = useMemo(() => {
    return products.filter(p => (p.specifications?.availability || 'In Stock') !== 'In Stock').slice(0, 6);
  }, [products]);

  const handleRefresh = () => { onRefresh(); setLastUpdated(new Date()); };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header: filters + refresh */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Business Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1 bg-muted/40 p-1 rounded-lg">
            {DATE_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${filter === f.key ? 'bg-accent text-white shadow-sm' : 'text-foreground hover:bg-muted'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* KPI Row 1: Catalog */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={Package} label="Total Products" value={fmtNum(kpis.totalProducts)} accent="bg-blue-600" />
        <KpiCard icon={Boxes} label="Active Bundles" value={fmtNum(kpis.activeBundles)} sub={`${kpis.totalBundles} total`} accent="bg-violet-600" />
        <KpiCard icon={Package} label="In Stock" value={fmtNum(kpis.inStock)} accent="bg-green-600" />
        <KpiCard icon={AlertTriangle} label="Low / Out of Stock" value={fmtNum(kpis.madeToOrder + kpis.outOfStock)} sub={`${kpis.outOfStock} out, ${kpis.madeToOrder} made-to-order`} accent="bg-orange-600" />
      </div>

      {/* KPI Row 2: Orders */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KpiCard icon={ShoppingCart} label="Orders Today" value={fmtNum(kpis.todayOrders)} accent="bg-blue-600" />
        <KpiCard icon={ShoppingCart} label="This Week" value={fmtNum(kpis.weekOrders)} accent="bg-sky-600" />
        <KpiCard icon={ShoppingCart} label="This Month" value={fmtNum(kpis.monthOrders)} accent="bg-indigo-600" />
        <KpiCard icon={ShoppingCart} label="YTD" value={fmtNum(kpis.ytdOrders)} accent="bg-violet-600" />
        <KpiCard icon={ShoppingCart} label="Total Orders" value={fmtNum(kpis.totalOrders)} accent="bg-slate-700" />
      </div>

      {/* KPI Row 3: Revenue */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KpiCard icon={IndianRupee} label="Revenue Today" value={fmtINR(kpis.todayRev)} accent="bg-green-600" />
        <KpiCard icon={IndianRupee} label="Revenue Week" value={fmtINR(kpis.weekRev)} accent="bg-green-600" />
        <KpiCard icon={IndianRupee} label="Revenue Month" value={fmtINR(kpis.monthRev)} accent="bg-green-600" />
        <KpiCard icon={IndianRupee} label="Revenue YTD" value={fmtINR(kpis.ytdRev)} accent="bg-green-700" />
        <KpiCard icon={TrendingUp} label="Lifetime Revenue" value={fmtINR(kpis.lifetimeRev)} accent="bg-emerald-700" />
      </div>

      {/* Range summary + AOV */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KpiCard icon={ShoppingCart} label={`Orders (${DATE_FILTERS.find(f => f.key === filter)?.label})`} value={fmtNum(kpis.rangeOrders)} accent="bg-blue-600" />
        <KpiCard icon={IndianRupee} label={`Revenue (${DATE_FILTERS.find(f => f.key === filter)?.label})`} value={fmtINR(kpis.revenue)} accent="bg-green-600" />
        <KpiCard icon={TrendingUp} label="Avg Order Value" value={fmtINR(kpis.aov)} accent="bg-accent" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">Revenue & Orders Over Time</CardTitle></CardHeader>
          <CardContent>
            {timeSeries.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12 text-center">No orders in this period.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={timeSeries}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} minTickGap={20} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#16a34a" fill="url(#rev)" name="Revenue (₹)" />
                  <Area type="monotone" dataKey="orders" stroke="#2563eb" fill="#2563eb33" name="Orders" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">Order Status Distribution</CardTitle></CardHeader>
          <CardContent>
            {statusDist.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12 text-center">No orders yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={statusDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {statusDist.map((e, i) => <Cell key={i} fill={STATUS_COLORS[e.name] || '#94a3b8'} />)}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">Products by Category</CardTitle></CardHeader>
          <CardContent>
            {categoryDist.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12 text-center">No products.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={categoryDist}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" name="Products" radius={[4, 4, 0, 0]}>
                    {categoryDist.map((e, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">Inventory Status</CardTitle></CardHeader>
          <CardContent>
            {inventoryDist.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12 text-center">No products.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={inventoryDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {inventoryDist.map((e, i) => <Cell key={i} fill={INV_COLORS[e.name] || '#94a3b8'} />)}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top products + Low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">Top Products by Revenue</CardTitle></CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No sales data yet.</p>
            ) : (
              <div className="space-y-2">
                {topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm border-b last:border-0 pb-2">
                    <span className="font-medium truncate pr-2">{p.name}</span>
                    <span className="text-muted-foreground whitespace-nowrap">{p.qty} sold · <span className="font-semibold text-foreground">{fmtINR(p.revenue)}</span></span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">Low / Out of Stock Products</CardTitle></CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">All products in stock.</p>
            ) : (
              <div className="space-y-2">
                {lowStock.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm border-b last:border-0 pb-2">
                    <span className="font-medium truncate pr-2">{p.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.specifications?.availability === 'Out of Stock' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'}`}>
                      {p.specifications?.availability}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Orders</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onQuickAction('orders')}>View All</Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b">
                    <th className="py-2 pr-4">Order #</th>
                    <th className="py-2 pr-4">Customer</th>
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4 text-right">Total</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(o => (
                    <tr key={o.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium">{o.order_number || o.order_id}</td>
                      <td className="py-2 pr-4 truncate max-w-[160px]">{o.customer_name}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                      <td className="py-2 pr-4 text-right font-semibold">₹{Number(o.total_amount || 0).toLocaleString('en-IN')}</td>
                      <td className="py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${o.payment_status === 'completed' ? 'bg-green-50 text-green-700' : o.payment_status === 'pending' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                          {o.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="bg-accent hover:bg-primary" onClick={() => onQuickAction('addProduct')}><PlusCircle className="mr-2 h-4 w-4" /> Add Product</Button>
            <Button size="sm" className="bg-accent hover:bg-primary" onClick={() => onQuickAction('addBundle')}><PlusCircle className="mr-2 h-4 w-4" /> Create Bundle</Button>
            <Button size="sm" variant="outline" onClick={() => onQuickAction('products')}><Package className="mr-2 h-4 w-4" /> View Products</Button>
            <Button size="sm" variant="outline" onClick={() => onQuickAction('bundles')}><Boxes className="mr-2 h-4 w-4" /> View Bundles</Button>
            <Button size="sm" variant="outline" onClick={() => onQuickAction('orders')}><ShoppingCart className="mr-2 h-4 w-4" /> View Orders</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardOverview;
