import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { CheckCircle, Download, ShoppingBag, AlertCircle, Loader2, MapPin, Package, Mail, FileText, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function numberToWords(num) {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    if (num === 0) return 'Zero';
    const numStr = num.toString().split('.')[0];
    if (numStr.length > 9) return 'Overflow';
    const n = ('000000000' + numStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return ''; 
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str.trim() + ' Only';
}

const OrderConfirmationPage = () => {
  const { order_id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let timeoutId;
    const fetchOrder = async () => {
      try {
        // First try secure RPC lookup (which prevents table-wide scraping)
        let orderRecord = null;
        const { data: rpcData, error: rpcError } = await supabase
            .rpc('get_order_by_id', { lookup_order_id: order_id });
            
        if (!rpcError && rpcData && rpcData.length > 0) {
          orderRecord = rpcData[0];
        } else {
          // Fallback to direct query if RPC is not yet created
          const { data: directData, error: directError } = await supabase
              .from('orders')
              .select('*')
              .eq('order_id', order_id)
              .single();
          if (directError || !directData) throw new Error('Order not found.');
          orderRecord = directData;
        }

        if (!orderRecord) throw new Error('Order not found.');
        if (orderRecord.payment_status !== 'completed') throw new Error('Payment not completed.');

        setOrder(orderRecord);
      } catch (err) {
        setError(err.message);
        timeoutId = setTimeout(() => navigate('/store'), 5000);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
    return () => { if (timeoutId) clearTimeout(timeoutId); };
  }, [order_id, navigate]);

  if (loading) return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-4 bg-muted/20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading order details...</p>
      </div>
  );
  
  if (error) return (
      <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-muted/20">
          <Card className="max-w-md w-full border-destructive/20">
              <CardContent className="pt-8 pb-8 flex flex-col items-center text-center">
                  <AlertCircle className="h-16 w-16 text-destructive mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Error</h2>
                  <p className="text-muted-foreground mb-6">{error}</p>
                  <Button asChild className="w-full"><Link to="/store">Back to Store</Link></Button>
              </CardContent>
          </Card>
      </div>
  );

  return (
    <div className="min-h-screen bg-muted/20 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2 text-foreground">Payment Successful!</h1>
            <p className="text-muted-foreground text-lg">Thank you for your purchase, {order.customer_name}.</p>
        </div>
        
        <div className="mb-8 space-y-3">
            {order.email_sent ? (
                <>
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg flex items-center justify-center gap-3">
                        <Mail className="h-5 w-5 flex-shrink-0" />
                        <p>Confirmation email sent to <strong>{order.email}</strong></p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg flex items-center justify-center gap-3">
                        <Info className="h-5 w-5 flex-shrink-0" />
                        <p>Admin notified at <strong>nextsenstechnology@gmail.com</strong></p>
                    </div>
                </>
            ) : (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg flex items-center justify-center gap-3">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p>Order confirmed, but we had a slight issue sending the email notification. Your order is successfully recorded.</p>
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="shadow-sm">
                <CardHeader className="bg-muted/30 pb-4">
                    <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5" /> Invoice Details</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4 text-sm">
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Order ID</span>
                        <span className="font-semibold">{order.order_id}</span>
                    </div>
                    {order.invoice_number && (
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Invoice No.</span>
                            <span className="font-semibold text-primary">{order.invoice_number}</span>
                        </div>
                    )}
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Date & Time</span>
                        <span>{new Date(order.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Payment Status</span>
                        <span className="text-green-600 font-medium capitalize">{order.payment_status}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Taxable Value</span>
                        <span>₹{order.subtotal?.toFixed(2)}</span>
                    </div>
                    
                    {order.tax_type === 'CGST_SGST' ? (
                        <>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">CGST @ 9%</span>
                                <span>₹{Number(order.cgst_amount || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">SGST @ 9%</span>
                                <span>₹{Number(order.sgst_amount || 0).toFixed(2)}</span>
                            </div>
                        </>
                    ) : (
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">IGST @ 18%</span>
                            <span>₹{Number(order.igst_amount || order.gst_amount || 0).toFixed(2)}</span>
                        </div>
                    )}

                    <div className="flex flex-col pt-2">
                        <div className="flex justify-between">
                            <span className="font-bold">Total Amount</span>
                            <span className="font-bold text-primary text-lg">₹{order.total_amount?.toFixed(2)}</span>
                        </div>
                        <span className="text-xs text-muted-foreground mt-1 text-right">INR {numberToWords(order.total_amount || 0)}</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="bg-muted/30 pb-4">
                    <CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-5 w-5" /> Customer Details</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4 text-sm">
                    <div>
                        <p className="font-semibold">{order.customer_name}</p>
                        {order.company_name && <p>{order.company_name}</p>}
                        <p className="text-muted-foreground">{order.email} | {order.mobile}</p>
                        {order.gst_number && <p className="text-muted-foreground mt-1">GSTIN: <span className="font-medium">{order.gst_number}</span></p>}
                    </div>
                    <div className="pt-4 border-t grid grid-cols-2 gap-4">
                        <div>
                            <p className="font-medium mb-1 text-xs uppercase text-muted-foreground">Billing Address</p>
                            <p className="text-muted-foreground">{order.billing_address?.line}</p>
                            <p className="text-muted-foreground">{order.billing_address?.city}, {order.billing_address?.state}</p>
                        </div>
                        <div>
                            <p className="font-medium mb-1 text-xs uppercase text-muted-foreground">Shipping Address</p>
                            <p className="text-muted-foreground">{order.shipping_address?.line}</p>
                            <p className="text-muted-foreground">{order.shipping_address?.city}, {order.shipping_address?.state}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <Card className="mb-8 shadow-sm">
            <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-lg flex items-center gap-2"><Package className="h-5 w-5" /> Items Purchased</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y">
                    <div className="flex justify-between p-4 text-xs font-medium text-muted-foreground bg-muted/10">
                        <div className="w-1/2">DESCRIPTION & HSN</div>
                        <div className="w-1/4 text-center">PRICE x QTY</div>
                        <div className="w-1/4 text-right">TOTAL</div>
                    </div>
                    {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between p-4 text-sm items-start">
                            <div className="w-1/2">
                                <p className="font-medium">{item.name || item.description}</p>
                                <p className="text-xs text-muted-foreground">HSN: 9027</p>
                                {item.isBundle && item.included_items?.length > 0 && (
                                    <ul className="mt-1 text-xs text-muted-foreground space-y-0.5">
                                        {item.included_items.map((inc, i) => (
                                            <li key={i} className="flex items-start gap-1">
                                                <span className="text-accent">•</span>
                                                <span>{inc}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="w-1/4 text-center text-muted-foreground pt-1">
                                ₹{Number(item.price).toFixed(2)} × {item.quantity}
                            </div>
                            <div className="w-1/4 text-right font-semibold pt-1">
                                ₹{(item.quantity * Number(item.price)).toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-10">
          {order.invoice_pdf_url && (
              <Button asChild size="lg" className="w-full sm:w-auto bg-primary">
                <a href={order.invoice_pdf_url} target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-5 w-5" /> Download Tax Invoice PDF
                </a>
              </Button>
          )}
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link to="/store"><ShoppingBag className="mr-2 h-5 w-5" /> Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;