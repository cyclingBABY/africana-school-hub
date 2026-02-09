import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  LogOut, 
  Menu,
  Edit3,
  Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ApplicationsList from "@/components/admin/ApplicationsList";
import StaffManagement from "@/components/admin/StaffManagement";
import DashboardStats from "@/components/admin/DashboardStats";
import ContentManagement from "@/components/admin/ContentManagement";
import { Badge } from "@/components/ui/badge";

type TabType = "dashboard" | "applications" | "staff" | "content";

interface StaffMember {
  id: string;
  full_name: string;
  role: 'admin' | 'staff' | 'super_admin';
  status: 'pending' | 'approved' | 'blocked';
  email?: string;
  school_position?: string | null;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [staffMember, setStaffMember] = useState<StaffMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!isMounted) return;

      if (!session) {
        navigate('/auth');
        return;
      }

      setUser(session.user);
      await fetchStaffMember(session.user);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setStaffMember(null);
          navigate('/auth');
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session) {
            setUser(session.user);
            await fetchStaffMember(session.user);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchStaffMember = async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from('staff_members')
        .select('*')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (error) throw error;

      // Handle Supreme Admin bypass (if no record exists but email matches)
      const SUPREME_EMAIL = "africanamuslim_code5_creations@gmail.com";
      
      if (!data) {
        if (currentUser.email === SUPREME_EMAIL) {
          // Auto-create or use a temporary staff object for supreme admin
          const supremeStaff: StaffMember = {
            id: '00000000-0000-0000-0000-000000000000',
            full_name: 'Super Admin',
            role: 'super_admin',
            status: 'approved'
          };
          setStaffMember(supremeStaff);
          setIsLoading(false);
          return;
        }

        toast({
          title: "Access Denied",
          description: "You are not a registered staff member.",
          variant: "destructive",
        });
        await supabase.auth.signOut();
        return;
      }

      if (data.status === 'pending') {
        toast({
          title: "Pending Approval",
          description: "Your account is pending approval.",
        });
        await supabase.auth.signOut();
        return;
      }

      if (data.status === 'blocked') {
        toast({
          title: "Account Blocked",
          description: "Your account has been blocked.",
          variant: "destructive",
        });
        await supabase.auth.signOut();
        return;
      }

      setStaffMember(data as StaffMember);
    } catch (err: any) {
      console.error("Error fetching staff member:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const isSuperAdmin = staffMember?.role === 'super_admin';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const navItems = [
    { id: "dashboard" as TabType, label: "Dashboard", icon: LayoutDashboard },
    { id: "applications" as TabType, label: "Applications", icon: FileText },
    { id: "content" as TabType, label: "Content", icon: Edit3 },
    ...(isSuperAdmin 
      ? [{ id: "staff" as TabType, label: "Staff Management", icon: Users }] 
      : []),
  ];

  const getRoleBadge = () => {
    switch (staffMember?.role) {
      case 'super_admin':
        return (
          <Badge className="bg-amber-500 text-white">
            <Crown className="w-3 h-3 mr-1" />
            Super Admin
          </Badge>
        );
      case 'admin':
        return <Badge className="bg-primary">Admin</Badge>;
      default:
        return <Badge variant="secondary">Staff</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-card border-r border-border
        transform transition-transform duration-200
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full hero-gradient flex items-center justify-center">
                <span className="text-primary-foreground font-serif font-bold">A</span>
              </div>
              <div>
                <h1 className="font-serif font-bold text-foreground">Admin Panel</h1>
                <p className="text-xs text-muted-foreground">Africana Muslim SS</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg
                      transition-colors text-left
                      ${activeTab === item.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-foreground hover:bg-muted'}
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-border">
            <div className="mb-4 px-4">
              <p className="font-medium text-foreground truncate">{staffMember?.full_name}</p>
              <div className="mt-1">
                {getRoleBadge()}
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between lg:justify-end">
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <Button variant="ghost" onClick={() => navigate('/')}>
            View Website
          </Button>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {activeTab === "dashboard" && <DashboardStats />}
          {activeTab === "applications" && <ApplicationsList staffId={staffMember?.id || ''} />}
          {activeTab === "content" && staffMember && (
            <ContentManagement staffId={staffMember.id} isSuperAdmin={isSuperAdmin} />
          )}
          {activeTab === "staff" && isSuperAdmin && <StaffManagement />}
        </main>
      </div>
    </div>
  );
};

export default Admin;
