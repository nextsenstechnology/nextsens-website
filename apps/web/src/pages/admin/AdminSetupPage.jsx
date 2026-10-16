import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UserPlus, ShieldAlert } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const AdminSetupPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkAndSetup = async () => {
      try {
        // First, check if an admin user already exists.
        const { data: checkData, error: checkError } = await supabase.functions.invoke('admin-auth-actions', {
            body: JSON.stringify({ action: 'check-admin-exists' }),
        });

        if (checkError) throw new Error(checkError.message);
        if (checkData.error) throw new Error(checkData.error);

        if (checkData.adminExists) {
          setAdminExists(true);
          toast({
            variant: "destructive",
            title: "Setup Not Available",
            description: "An admin account already exists. Redirecting to login.",
          });
          setTimeout(() => navigate('/nst-admin/login'), 3000);
        } else {
          // If no admin, proceed to set up storage.
          const { error: storageError } = await supabase.rpc('setup_product_files_storage');
          if (storageError) {
            console.error('Storage setup failed:', storageError);
            toast({
              variant: "destructive",
              title: "Initial Setup Failed",
              description: "Could not initialize required file storage. Please contact support.",
            });
          }
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error During Initial Setup",
          description: "Could not connect to the server. Please refresh.",
        });
        console.error("Error during initial check/setup:", error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkAndSetup();
  }, [navigate, toast]);

  const handleSetup = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Password is too short",
        description: "Password must be at least 6 characters.",
      });
      return;
    }
    setLoading(true);
    try {
        const { data, error } = await supabase.functions.invoke('admin-auth-actions', {
            body: JSON.stringify({
                action: 'create-admin',
                payload: { email, password },
            }),
        });

        if (error) throw error;
        
        if (data.error) throw new Error(data.error);
        
        toast({
          title: "Admin Account Created Successfully!",
          description: "You will be redirected to the login page.",
        });
        setTimeout(() => navigate('/nst-admin/login'), 2000);

    } catch (error) {
        toast({
            variant: "destructive",
            title: "Setup Failed",
            description: error.message || "An unexpected error occurred. Please try again.",
        });
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-primary">
        <Loader2 className="h-16 w-16 animate-spin" />
        <p className="mt-4 text-lg">Verifying setup status...</p>
      </div>
    );
  }

  if (adminExists) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-destructive p-4">
        <ShieldAlert className="h-24 w-24" />
        <h1 className="mt-4 text-3xl font-bold">Setup Already Completed</h1>
        <p className="mt-2 text-lg text-center text-muted-foreground">An administrator account already exists. You are being redirected to the login page.</p>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Admin Setup | NextSens Tech</title>
      </Helmet>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 to-secondary/20 p-4">
        <Card className="w-full max-w-md shadow-2xl animate-in fade-in-50 zoom-in-95">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Create Your Admin Account</CardTitle>
            <CardDescription>This is a one-time setup to secure your dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your-email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Choose a strong password (min. 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-f4" />
                )}
                Create Admin User
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminSetupPage;