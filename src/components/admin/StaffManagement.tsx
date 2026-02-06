import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Trash2, Shield, User, Check, X, Ban, Crown } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StaffMember {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'staff' | 'super_admin';
  status: 'pending' | 'approved' | 'blocked';
  school_position: string | null;
  created_at: string;
}

const StaffManagement = () => {
  const { toast } = useToast();
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [pendingMembers, setPendingMembers] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    user_id: "",
    email: "",
    full_name: "",
    role: "staff" as "admin" | "staff" | "super_admin",
    school_position: "",
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
      const approved = data.filter((s: StaffMember) => s.status === 'approved' || s.status === 'blocked');
      const pending = data.filter((s: StaffMember) => s.status === 'pending');
      setStaffMembers(approved as StaffMember[]);
      setPendingMembers(pending as StaffMember[]);
    }
    setIsLoading(false);
  };

  const handleApproveStaff = async (staff: StaffMember) => {
    const { error } = await supabase
      .from('staff_members')
      .update({ status: 'approved' })
      .eq('id', staff.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to approve staff member",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Staff Approved",
        description: `${staff.full_name} has been approved`,
      });
      fetchStaffMembers();
    }
  };

  const handleRejectStaff = async (staff: StaffMember) => {
    const { error } = await supabase
      .from('staff_members')
      .delete()
      .eq('id', staff.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to reject registration",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Registration Rejected",
        description: `${staff.full_name}'s registration has been rejected`,
      });
      fetchStaffMembers();
    }
  };

  const handleBlockStaff = async (staffId: string, staffName: string, block: boolean) => {
    const { error } = await supabase
      .from('staff_members')
      .update({ status: block ? 'blocked' : 'approved' })
      .eq('id', staffId);

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${block ? 'block' : 'unblock'} staff member`,
        variant: "destructive",
      });
    } else {
      toast({
        title: block ? "Staff Blocked" : "Staff Unblocked",
        description: `${staffName} has been ${block ? 'blocked' : 'unblocked'}`,
      });
      fetchStaffMembers();
    }
  };

  const handleAddStaff = async () => {
    if (!newStaff.user_id || !newStaff.email || !newStaff.full_name) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
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
        status: 'approved',
        school_position: newStaff.school_position || null,
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
      setNewStaff({ user_id: "", email: "", full_name: "", role: "staff", school_position: "" });
      setIsAddOpen(false);
      fetchStaffMembers();
    }
  };

  const handleRoleChange = async (staffId: string, newRole: "admin" | "staff" | "super_admin") => {
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="w-5 h-5 text-primary-foreground" />;
      case 'admin':
        return <Shield className="w-5 h-5 text-primary-foreground" />;
      default:
        return <User className="w-5 h-5 text-background" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-amber-500';
      case 'admin':
        return 'bg-primary';
      default:
        return 'bg-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-500">Active</Badge>;
      case 'blocked':
        return <Badge variant="destructive">Blocked</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500">Pending</Badge>;
      default:
        return null;
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
          <p className="text-muted-foreground">Manage staff accounts, approvals, and permissions</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Staff Manually
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Add a staff member directly. They must have an existing auth account.
              </p>
              <div>
                <Label>User ID (UUID) *</Label>
                <Input
                  placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
                  value={newStaff.user_id}
                  onChange={(e) => setNewStaff({ ...newStaff, user_id: e.target.value })}
                />
              </div>
              <div>
                <Label>Full Name *</Label>
                <Input
                  placeholder="Enter full name"
                  value={newStaff.full_name}
                  onChange={(e) => setNewStaff({ ...newStaff, full_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="Enter email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                />
              </div>
              <div>
                <Label>School Position</Label>
                <Input
                  placeholder="e.g., Teacher, Bursar"
                  value={newStaff.school_position}
                  onChange={(e) => setNewStaff({ ...newStaff, school_position: e.target.value })}
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select 
                  value={newStaff.role} 
                  onValueChange={(value: "admin" | "staff" | "super_admin") => setNewStaff({ ...newStaff, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
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

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            Pending Approvals
            {pendingMembers.length > 0 && (
              <span className="ml-2 bg-destructive text-destructive-foreground rounded-full px-2 py-0.5 text-xs">
                {pendingMembers.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Active Staff ({staffMembers.filter(s => s.status === 'approved').length})</TabsTrigger>
          <TabsTrigger value="blocked">Blocked ({staffMembers.filter(s => s.status === 'blocked').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Staff Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingMembers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No pending registrations</p>
              ) : (
                <div className="space-y-4">
                  {pendingMembers.map((staff) => (
                    <div
                      key={staff.id}
                      className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-amber-500">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{staff.full_name}</p>
                          <p className="text-sm text-muted-foreground">{staff.email}</p>
                          <p className="text-sm text-primary font-medium mt-1">
                            Position: {staff.school_position || 'Not specified'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Registered: {new Date(staff.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => handleApproveStaff(staff)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Reject Registration?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to reject {staff.full_name}'s registration? They will need to register again.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleRejectStaff(staff)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Reject
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
        </TabsContent>

        <TabsContent value="approved" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Staff Members</CardTitle>
            </CardHeader>
            <CardContent>
              {staffMembers.filter(s => s.status === 'approved').length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No active staff members</p>
              ) : (
                <div className="space-y-4">
                  {staffMembers.filter(s => s.status === 'approved').map((staff) => (
                    <div
                      key={staff.id}
                      className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${getRoleBadgeColor(staff.role)}`}>
                          {getRoleIcon(staff.role)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{staff.full_name}</p>
                            {getStatusBadge(staff.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{staff.email}</p>
                          {staff.school_position && (
                            <p className="text-sm text-primary">{staff.school_position}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Select 
                          value={staff.role} 
                          onValueChange={(value: "admin" | "staff" | "super_admin") => handleRoleChange(staff.id, value)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleBlockStaff(staff.id, staff.full_name, true)}
                          title="Block user"
                        >
                          <Ban className="w-4 h-4 text-amber-600" />
                        </Button>
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
                                Are you sure you want to remove {staff.full_name}? They will lose all access.
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
        </TabsContent>

        <TabsContent value="blocked" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Blocked Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              {staffMembers.filter(s => s.status === 'blocked').length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No blocked accounts</p>
              ) : (
                <div className="space-y-4">
                  {staffMembers.filter(s => s.status === 'blocked').map((staff) => (
                    <div
                      key={staff.id}
                      className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-destructive">
                          <Ban className="w-5 h-5 text-destructive-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{staff.full_name}</p>
                            {getStatusBadge(staff.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{staff.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBlockStaff(staff.id, staff.full_name, false)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Unblock
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Account Permanently?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove {staff.full_name}'s staff record.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteStaff(staff.id, staff.full_name)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
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
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Setting Up the First Super Admin</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>To create the first Super Admin account:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Register through the staff portal with your email</li>
            <li>Verify your email address</li>
            <li>Open the Cloud panel and navigate to Database → Tables → staff_members</li>
            <li>Find your record and update: set <code className="bg-muted px-1 rounded">role</code> to "super_admin" and <code className="bg-muted px-1 rounded">status</code> to "approved"</li>
            <li>Log in again to access the full admin panel</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffManagement;
