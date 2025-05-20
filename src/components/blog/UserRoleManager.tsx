
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { setUserRole, isUserSuperAdmin } from '@/components/blog/blogService';
import { toast } from 'sonner';
import { useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';

const UserRoleManager: React.FC = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'user' | 'admin' | 'super_admin'>('admin');
  const [loading, setLoading] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const superAdmin = await isUserSuperAdmin();
        setIsSuperAdmin(superAdmin);
        
        if (!superAdmin) {
          toast.error('You do not have permission to access this page');
          navigate('/blog');
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
        toast.error('Error checking permissions');
        navigate('/blog');
      } finally {
        setInitialLoading(false);
      }
    };
    
    checkPermission();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await setUserRole(email, role);
      toast.success(`User ${email} has been set as ${role}`);
      setEmail('');
    } catch (error: any) {
      console.error('Error setting user role:', error);
      toast.error(error.message || 'Failed to set user role');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="container mx-auto px-6 py-10 text-center">Checking permissions...</div>;
  }

  if (!isSuperAdmin) {
    return <div className="container mx-auto px-6 py-10 text-center">You do not have permission to access this page.</div>;
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Manage User Roles</CardTitle>
          <CardDescription>Assign admin or super_admin roles to users</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                User Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                Role
              </label>
              <Select value={role} onValueChange={(value: any) => setRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Assigning Role...' : 'Assign Role'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRoleManager;
