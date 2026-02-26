import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const isLoggedIn = localStorage.getItem("admin_logged_in") === "true";
    if (isLoggedIn) {
      navigate("/admin");
    }
  }, [navigate]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Check user role in database
        const { data: staffData, error: staffError } = await supabase
          .from('staff_members')
          .select('role, full_name')
          .eq('user_id', authData.user.id)
          .eq('status', 'approved')
          .single();

        const { data: memberData, error: memberError } = await supabase
          .from('library_members')
          .select('member_type, full_name')
          .eq('user_id', authData.user.id)
          .eq('member_status', 'active')
          .single();

        // Role-based redirection
        if (staffData && !staffError) {
          // Staff/Admin user
          localStorage.setItem("user_role", staffData.role);
          localStorage.setItem("user_name", staffData.full_name);

          toast({
            title: "Login Successful",
            description: `Welcome back, ${staffData.full_name}!`,
          });

          navigate("/admin");
        } else if (memberData && !memberError) {
          // Library member
          localStorage.setItem("user_role", "member");
          localStorage.setItem("user_name", memberData.full_name);

          toast({
            title: "Login Successful",
            description: `Welcome, ${memberData.full_name}!`,
          });

          navigate("/dashboard");
        } else {
          // No valid role found
          await supabase.auth.signOut();
          throw new Error("No valid library account found. Please contact admin.");
        }
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Homepage</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full hero-gradient flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-serif font-bold text-2xl">A</span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-foreground">
              Library Portal Login
            </h1>
            <p className="text-muted-foreground mt-2">
              Africana Library Hub
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Auth;
