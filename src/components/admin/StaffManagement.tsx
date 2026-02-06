import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Trash2, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const StaffManagement = () => {
  const { toast } = useToast();
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    user_id: "",
    email: "",
    full_name: "",
    role: "staff" as "admin" | "staff",
  });

  useEffect(() => {
    fetchStaffMembers();
  }, []);

  const fetchStaffMembers = async () => {
    const { data, error } = await supabase
      .from('staff_members')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setStaffMembers(data);
    }
    setIsLoading(false);
  };

  const handleAddStaff = async () => {
    if (!newStaff.user_id || !newStaff.email || !newStaff.full_name) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('staff_members')
      .insert({
        user_id: newStaff.user_id,
        email: newStaff.email,
        full_name: newStaff.full_name,
        role: newStaff.role,
      });

    if (error) {
      if (error.code === '23505') {
        toast({
          title: "User Already Exists",
          description: "This user is already a staff member",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Staff Added",
        description: `${newStaff.full_name} has been added as ${newStaff.role}`,
      });
      setNewStaff({ user_id: "", email: "", full_name: "", role: "staff" });
      setIsAddOpen(false);
      fetchStaffMembers();
    }
  };

  const handleRoleChange = async (staffId: string, newRole: "admin" | "staff") => {
    const { error } = await supabase
      .from('staff_members')
      .update({ role: newRole })
      .eq('id', staffId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Role Updated",
        description: "Staff member role has been updated",
      });
      fetchStaffMembers();
    }
  };

  const handleDeleteStaff = async (staffId: string, staffName: string) => {
    const { error } = await supabase
      .from('staff_members')
      .delete()
      .eq('id', staffId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove staff member",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Staff Removed",
        description: `${staffName} has been removed from staff`,
      });
      fetchStaffMembers();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Staff Management</h2>
          <p className="text-muted-foreground">Manage staff accounts and permissions</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                The user must first sign up through the login page. Then enter their User ID (UUID) below.
              </p>
              <div>
                <Label>User ID (UUID)</Label>
                <Input
                  placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
                  value={newStaff.user_id}
                  onChange={(e) => setNewStaff({ ...newStaff, user_id: e.target.value })}
                />
              </div>
              <div>
                <Label>Full Name</Label>
                <Input
                  placeholder="Enter full name"
                  value={newStaff.full_name}
                  onChange={(e) => setNewStaff({ ...newStaff, full_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="Enter email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select 
                  value={newStaff.role} 
                  onValueChange={(value: "admin" | "staff") => setNewStaff({ ...newStaff, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddStaff} className="w-full">
                Add Staff Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Members ({staffMembers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {staffMembers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No staff members yet</p>
          ) : (
            <div className="space-y-4">
              {staffMembers.map((staff) => (
                <div
                  key={staff.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${staff.role === 'admin' ? 'bg-primary' : 'bg-muted-foreground'}`}>
                      {staff.role === 'admin' ? (
                        <Shield className="w-5 h-5 text-primary-foreground" />
                      ) : (
                        <User className="w-5 h-5 text-background" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{staff.full_name}</p>
                      <p className="text-sm text-muted-foreground">{staff.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Select 
                      value={staff.role} 
                      onValueChange={(value: "admin" | "staff") => handleRoleChange(staff.id, value)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Staff Member?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove {staff.full_name}? They will lose access to the admin panel.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteStaff(staff.id, staff.full_name)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Setting Up the First Admin</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>To create the first admin account:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Sign up through the login page with your admin email</li>
            <li>Verify your email address</li>
            <li>Open the Cloud panel and navigate to Database → Tables → staff_members</li>
            <li>Add a new row with your user_id, email, full_name, and set role to "admin"</li>
            <li>Log in again to access the admin panel</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffManagement;
