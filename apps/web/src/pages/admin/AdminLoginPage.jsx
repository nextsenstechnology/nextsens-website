import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogIn } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const AdminLoginPage = () => {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAdminExists, setCheckingAdminExists] = useState(true);

  useEffect(() => {
    const checkAdminUser = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('admin-auth-actions', {
          body: JSON.stringify({ action: 'check-admin-exists' }),
        });

        if (error) throw error;
        
        if (data && !data.adminExists) {
          navigate('/admin/setup');
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error Checking Admin Status",
          description: "Could not connect to the authentication server. Please try again later.",
        });
        console.error("Error checking for admin user:", error);
      } finally {
        setCheckingAdminExists(false);
      }
    };

    checkAdminUser();
  }, [navigate, toast]);

  useEffect(() => {
    if (user) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
      });
    } else {
      toast({
        title: "Login Successful!",
        description: "Redirecting to your dashboard...",
      });
      navigate('/admin');
    }
    setLoading(false);
  };

  if (checkingAdminExists) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-primary">
        <Loader2 className="h-16 w-16 animate-spin" />
        <p className="mt-4 text-lg">Checking for admin account...</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Login | NextSens Tech</title>
      </Helmet>
      <div className="flex items-center justify-center min-h-screen bg-secondary/50 p-4">
        <Card className="w-full max-w-md shadow-2xl animate-in fade-in-50 zoom-in-95">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
            <CardDescription>Access the NextSens Tech Dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@nextsens.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-label="Admin Email Address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Your secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-label="Admin Password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminLoginPage;