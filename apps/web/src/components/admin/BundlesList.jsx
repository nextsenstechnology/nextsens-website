import React, { useState, useEffect } from 'react';
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
import { Edit, Trash2, PlusCircle, Package, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import BundleForm from './BundleForm';
import { supabase } from '@/lib/customSupabaseClient';

const BundlesList = ({ bundles, loading, onBundleChange, products, openSignal }) => {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const handleOpenForm = (bundle = null) => {
    setEditingBundle(bundle);
    setIsFormOpen(true);
  };

  // Open the create form when the dashboard "Create Bundle" quick action fires
  useEffect(() => {
    if (openSignal && openSignal > 0) {
      handleOpenForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSignal]);

  // ---- Persistent bundle ordering (sort_order) ----
  const commitBundleOrder = async (newIds) => {
    try {
      await Promise.all(newIds.map((id, idx) =>
        supabase.from('bundles').update({ sort_order: idx + 1 }).eq('id', id)
      ));
      onBundleChange();
    } catch (e) {
      toast({ variant: 'destructive', title: 'Failed to save order', description: e.message });
    }
  };

  const moveBundle = (id, dir) => {
    const ids = bundles.map(b => b.id);
    const i = ids.indexOf(id);
    const j = i + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    commitBundleOrder(ids);
  };

  const handleDragStart = (id) => setDragId(id);
  const handleDragOver = (e, id) => { e.preventDefault(); setDragOverId(id); };
  const handleDrop = (id) => {
    if (!dragId || dragId === id) { setDragId(null); setDragOverId(null); return; }
    const ids = bundles.map(b => b.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(id);
    ids.splice(from, 1);
    ids.splice(to, 0, dragId);
    setDragId(null); setDragOverId(null);
    commitBundleOrder(ids);
  };

  const handleCloseForm = () => {
    setEditingBundle(null);
    setIsFormOpen(false);
  };

  const handleFormSuccess = () => {
    handleCloseForm();
    onBundleChange();
  };

  return (
    <div className="admin-card">
      <div className="admin-toolbar">
        <div className="flex-grow">
          <h2 className="text-lg font-semibold text-foreground">Equipment Bundles</h2>
          <p className="text-sm text-muted-foreground">Manage product bundles and packages</p>
        </div>
        <Button onClick={() => handleOpenForm()} className="bg-accent hover:bg-primary">
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Bundle
        </Button>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          </div>
        ) : bundles.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No bundles created yet. Create your first bundle to get started.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[60px] text-center">Order</TableHead>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Bundle Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Final Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bundles.map((bundle) => {
                const finalPrice = bundle.discounted_price || bundle.base_price;
                const discount = bundle.discount_percentage || 0;
                return (
                  <TableRow
                    key={bundle.id}
                    className={dragOverId === bundle.id ? 'border-t-2 border-accent' : ''}
                    draggable
                    onDragStart={() => handleDragStart(bundle.id)}
                    onDragOver={(e) => handleDragOver(e, bundle.id)}
                    onDrop={() => handleDrop(bundle.id)}
                    onDragEnd={() => { setDragId(null); setDragOverId(null); }}
                  >
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        <div className="flex flex-col">
                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => moveBundle(bundle.id, -1)} title="Move up">
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => moveBundle(bundle.id, 1)} title="Move down">
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <img 
                        src={bundle.image_url || 'https://via.placeholder.com/50'} 
                        alt={bundle.name} 
                        className="h-12 w-12 object-contain rounded-md bg-white border border-border p-1" 
                      />
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate" title={bundle.name}>
                      {bundle.name}
                    </TableCell>
                    <TableCell className="max-w-[250px] truncate text-sm text-muted-foreground" title={bundle.description}>
                      {bundle.description || '-'}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₹{bundle.base_price?.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>
                      {discount > 0 ? (
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10">
                          {discount}% OFF
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-bold text-accent">
                      ₹{finalPrice?.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                        bundle.status === 'active' 
                          ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-700/10' 
                          : 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-700/10'
                      }`}>
                        {bundle.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="mr-1 h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700" 
                        onClick={() => handleOpenForm(bundle)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DeleteBundleDialog bundle={bundle} onDelete={onBundleChange} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <BundleForm 
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        bundle={editingBundle}
        products={products}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

const DeleteBundleDialog = ({ bundle, onDelete }) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { supabase } = await import('@/lib/customSupabaseClient');
      const { error } = await supabase.from('bundles').delete().eq('id', bundle.id);
      
      if (error) throw error;
      
      toast({
        title: "Bundle deleted successfully!",
        description: `${bundle.name} has been removed.`,
      });
      
      onDelete();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete bundle",
        description: error.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Bundle</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <span className="font-bold">{bundle.name}</span>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BundlesList;