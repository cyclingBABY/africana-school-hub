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
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ApplicationsList from "@/components/admin/ApplicationsList";
import StaffManagement from "@/components/admin/StaffManagement";
import DashboardStats from "@/components/admin/DashboardStats";

type TabType = "dashboard" | "applications" | "staff";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [staffMember, setStaffMember] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          navigate('/auth');
        } else {
          setTimeout(() => {
            fetchStaffMember(session.user.id);
          }, 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate('/auth');
      } else {
        fetchStaffMember(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchStaffMember = async (userId: string) => {
    const { data, error } = await supabase
      .from('staff_members')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      toast({
        title: "Access Denied",
        description: "You are not a registered staff member. Please contact an administrator.",
        variant: "destructive",
      });
      await supabase.auth.signOut();
      navigate('/auth');
      return;
    }

    setStaffMember(data);
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

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
    ...(staffMember?.role === 'admin' 
      ? [{ id: "staff" as TabType, label: "Staff Management", icon: Users }] 
      : []),
  ];

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
              <p className="text-sm text-muted-foreground capitalize">{staffMember?.role}</p>
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
          {activeTab === "applications" && <ApplicationsList staffId={staffMember?.id} />}
          {activeTab === "staff" && staffMember?.role === 'admin' && <StaffManagement />}
        </main>
      </div>
    </div>
  );
};

export default Admin;
