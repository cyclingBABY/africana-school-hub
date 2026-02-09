import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  LayoutDashboard, 
  FileText, 
  LogOut, 
  Menu,
  Newspaper,
  Crown,
  Image,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ApplicationsList from "@/components/admin/ApplicationsList";
import DashboardStats from "@/components/admin/DashboardStats";
import ContentManagement from "@/components/admin/ContentManagement";
import MediaManagement from "@/components/admin/MediaManagement";
import SliderManagement from "@/components/admin/SliderManagement";
import { Badge } from "@/components/ui/badge";

type TabType = "dashboard" | "applications" | "content" | "media" | "sliders";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [staffId, setStaffId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndFetchStaff = async () => {
      // Check if logged in via localStorage
      const isLoggedIn = localStorage.getItem("admin_logged_in") === "true";
      const adminEmail = localStorage.getItem("admin_email");
      
      if (!isLoggedIn) {
        navigate("/auth");
        return;
      }
      
      setAdminName(localStorage.getItem("admin_name") || "Super Admin");
      
      // Fetch staff member ID from database (case-insensitive)
      if (adminEmail) {
        const { data: staffData, error } = await supabase
          .from('staff_members')
          .select('id')
          .ilike('email', adminEmail)
          .maybeSingle();
        
        if (staffData) {
          setStaffId(staffData.id);
        } else {
          // If no staff record, create one for the super admin
          const { data: newStaff } = await supabase
            .from('staff_members')
            .insert({
              email: adminEmail.toLowerCase(),
              full_name: 'Super Admin',
              role: 'super_admin',
              status: 'approved',
              user_id: '00000000-0000-0000-0000-000000000001'
            })
            .select('id')
            .single();
          
          if (newStaff) {
            setStaffId(newStaff.id);
          }
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuthAndFetchStaff();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin_logged_in");
    localStorage.removeItem("admin_email");
    localStorage.removeItem("admin_name");
    
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
    
    navigate("/");
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
    { id: "media" as TabType, label: "Media", icon: Image },
    { id: "sliders" as TabType, label: "Sliders", icon: Layers },
    { id: "content" as TabType, label: "News & Events", icon: Newspaper },
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
              <p className="font-medium text-foreground truncate">{adminName}</p>
              <div className="mt-1">
                <Badge className="bg-amber-500 text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  Super Admin
                </Badge>
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
          {activeTab === "applications" && staffId && <ApplicationsList staffId={staffId} />}
          {activeTab === "applications" && !staffId && (
            <div className="text-center py-12 text-muted-foreground">Loading staff data...</div>
          )}
          {activeTab === "media" && <MediaManagement />}
          {activeTab === "sliders" && <SliderManagement />}
          {activeTab === "content" && staffId && <ContentManagement staffId={staffId} isSuperAdmin={true} />}
          {activeTab === "content" && !staffId && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading staff data...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Admin;
