import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { LibraryMember } from "@/types/library";

interface StaffMember {
  id: string;
  role: string;
  status: string;
}

export const useLibraryAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [libraryMember, setLibraryMember] = useState<LibraryMember | null>(null);
  const [staffMember, setStaffMember] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUserRoles(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUserRoles(session.user.id);
      } else {
        setLibraryMember(null);
        setStaffMember(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRoles = async (userId: string) => {
    try {
      // Check if user is a library member
      const { data: memberData } = await supabase
        .from("library_members")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .single();

      if (memberData) {
        setLibraryMember(memberData as LibraryMember);
      }

      // Check if user is staff/admin
      const { data: staffData } = await supabase
        .from("staff_members")
        .select("id, role, status")
        .eq("user_id", userId)
        .eq("status", "approved")
        .single();

      if (staffData) {
        setStaffMember(staffData as StaffMember);
      }
    } catch (error) {
      console.error("Error checking user roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    navigate("/library");
  };

  const isLibraryMember = libraryMember !== null;
  const isStaff = staffMember !== null && ["staff", "admin", "super_admin"].includes(staffMember.role);
  const isAdmin = staffMember !== null && ["admin", "super_admin"].includes(staffMember.role);
  const isSuperAdmin = staffMember !== null && staffMember.role === "super_admin";

  return {
    user,
    libraryMember,
    staffMember,
    loading,
    login,
    logout,
    isLibraryMember,
    isStaff,
    isAdmin,
    isSuperAdmin,
  };
};

// Hook to redirect based on user role after login
export const useRoleBasedRedirect = () => {
  const { user, isStaff, isLibraryMember, loading } = useLibraryAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (isStaff) {
        navigate("/library/admin");
      } else if (isLibraryMember) {
        navigate("/library/dashboard");
      }
    }
  }, [user, isStaff, isLibraryMember, loading, navigate]);

  return { loading };
};

// Protected route hook
export const useProtectedRoute = (requiredRole?: "member" | "staff" | "admin" | "super_admin") => {
  const { user, isLibraryMember, isStaff, isAdmin, isSuperAdmin, loading } = useLibraryAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth?mode=login&redirect=" + encodeURIComponent(window.location.pathname));
        return;
      }

      if (requiredRole === "member" && !isLibraryMember) {
        navigate("/library");
      } else if (requiredRole === "staff" && !isStaff) {
        navigate("/library");
      } else if (requiredRole === "admin" && !isAdmin) {
        navigate("/library");
      } else if (requiredRole === "super_admin" && !isSuperAdmin) {
        navigate("/library");
      }
    }
  }, [user, isLibraryMember, isStaff, isAdmin, isSuperAdmin, loading, navigate, requiredRole]);

  return { loading };
};
