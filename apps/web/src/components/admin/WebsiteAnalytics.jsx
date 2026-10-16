import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, BarChart3, Link2, ExternalLink, ShieldCheck } from 'lucide-react';

const RANGES = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: 'month', label: 'This Month' },
  { key: 'lastMonth', label: 'Last Month' },
  { key: '3m', label: '3 Months' },
  { key: '6m', label: '6 Months' },
  { key: '12m', label: '12 Months' },
  { key: 'ytd', label: 'YTD' },
];

const WebsiteAnalytics = () => {
  const [range, setRange] = useState('30d');
  const [status, setStatus] = useState('loading'); // loading | connected | notconnected | error
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchReport = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('analytics-report', {
        body: { range },
      });
      if (invokeError) throw new Error(invokeError.message);
      if (data?.connected) {
        setStatus('connected');
        setReport(data.report || null);
      } else if (data?.connected === false) {
        setStatus('notconnected');
      } else {
        setStatus('error');
        setError(data?.error || 'Unexpected response from analytics service.');
      }
      setLastUpdated(new Date());
    } catch (e) {
      setStatus('error');
      setError(e.message || 'Failed to load analytics.');
      setLastUpdated(new Date());
    }
  }, [range]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-accent" /> Website Analytics
          </h2>
          <p className="text-sm text-muted-foreground">
            {lastUpdated ? `Last updated: ${lastUpdated.toLocaleString('en-IN')}` : 'Website usage & visitor metrics'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1 bg-muted/40 p-1 rounded-lg">
            {RANGES.map(f => (
              <button
                key={f.key}
                onClick={() => setRange(f.key)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${range === f.key ? 'bg-accent text-white shadow-sm' : 'text-foreground hover:bg-muted'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={fetchReport}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      {status === 'loading' && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-accent" />
        </div>
      )}

      {status === 'error' && (
        <Card className="shadow-sm border-destructive/30">
          <CardContent className="p-6 text-center">
            <p className="text-destructive font-medium">Unable to load analytics.</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </CardContent>
        </Card>
      )}

      {status === 'notconnected' && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Link2 className="h-5 w-5 text-muted-foreground" /> Analytics data is not connected yet.
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect Google Analytics 4 to see real visitor traffic, traffic sources, top pages,
              devices, locations, and ecommerce events. No data is ever fabricated — until a
              property is linked, this panel shows nothing.
            </p>
            <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-2">
              <li>Create a Google Analytics 4 property for <code className="bg-muted px-1 rounded">nextsenstech.com</code> in Google Analytics.</li>
              <li>Add the GA4 web stream and copy your <strong>Measurement ID</strong> (format <code className="bg-muted px-1 rounded">G-XXXXXXX</code>).</li>
              <li>Create a Google Cloud service account with the <em>Analytics Reporting API</em> / <em>Google Analytics Data API</em> enabled, and download its JSON key.</li>
              <li>Share the GA4 property (Viewer) with the service account email.</li>
              <li>Provide the Measurement ID and service-account credentials to your site admin so they can be stored as Supabase secrets (<code className="bg-muted px-1 rounded">GA4_MEASUREMENT_ID</code>, <code className="bg-muted px-1 rounded">GA4_PROPERTY_ID</code>, <code className="bg-muted px-1 rounded">GA4_CLIENT_EMAIL</code>, <code className="bg-muted px-1 rounded">GA4_PRIVATE_KEY</code>).</li>
            </ol>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button asChild size="sm" variant="outline">
                <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer">
                  Open Google Analytics <ExternalLink className="ml-2 h-3.5 w-3.5" />
                </a>
              </Button>
              <Button size="sm" variant="outline" onClick={fetchReport}>
                <RefreshCw className="mr-2 h-4 w-4" /> Re-check connection
              </Button>
            </div>
            <div className="flex items-start gap-2 bg-muted/30 p-3 rounded-md text-xs text-muted-foreground mt-2">
              <ShieldCheck className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Analytics uses aggregated data only. Individual visitor names, emails, phone numbers, addresses, and identifiable browsing histories are never exposed. Credentials are kept server-side and admin-only.</span>
            </div>
          </CardContent>
        </Card>
      )}

      {status === 'connected' && report && (
        <>
          {report.metrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(report.metrics).map(([k, v]) => (
                <Card key={k} className="shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase">{k}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{v ?? '--'}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {report.rows && report.rows.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader><CardTitle className="text-base">Daily Traffic</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-muted-foreground border-b">{Object.keys(report.rows[0]).map(h => <th key={h} className="py-2 pr-4">{h}</th>)}</tr></thead>
                    <tbody>
                      {report.rows.map((r, i) => (
                        <tr key={i} className="border-b last:border-0">{Object.values(r).map((c, j) => <td key={j} className="py-2 pr-4">{c ?? '--'}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default WebsiteAnalytics;
