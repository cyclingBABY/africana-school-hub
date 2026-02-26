import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft, QrCode, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
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

const roleMatrix = [
  {
    email: "admin@ugandadigitallibrary.org",
    password: "admin.uganda.2026",
    role: "admin",
    name: "Library Admin",
  },
  {
    email: "member@ugandadigitallibrary.org",
    password: "member.uganda.2026",
    role: "member",
    name: "Amina",
  },
];

type LoginFormData = z.infer<typeof loginSchema>;

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const role = localStorage.getItem("user_role");
    if (role === "admin") {
      navigate("/admin");
    }
    if (role === "member") {
      navigate("/member");
    }
  }, [navigate]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    
    // Simulate a small delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const matchedUser = roleMatrix.find(
      (user) => user.email.toLowerCase() === data.email.toLowerCase() && user.password === data.password
    );

    if (matchedUser) {
      localStorage.setItem("user_role", matchedUser.role);
      localStorage.setItem("user_email", matchedUser.email);
      localStorage.setItem("user_name", matchedUser.name);
      localStorage.setItem("admin_logged_in", matchedUser.role === "admin" ? "true" : "false");
      localStorage.setItem("admin_email", matchedUser.role === "admin" ? matchedUser.email : "");
      localStorage.setItem("admin_name", matchedUser.role === "admin" ? matchedUser.name : "");
      localStorage.setItem("member_name", matchedUser.role === "member" ? matchedUser.name : "");

      toast({
        title: "Login Successful",
        description: `Welcome, ${matchedUser.name}!`,
      });

      navigate(matchedUser.role === "admin" ? "/admin" : "/member");
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
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
              Secure Login Portal
            </h1>
            <p className="text-muted-foreground mt-2">
              Unified access for admins and members
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
            <div className="mt-6 space-y-3">
              <Button variant="outline" className="w-full" type="button">
                <Mail className="w-4 h-4 mr-2" />
                Login with Google
              </Button>
              <Button variant="outline" className="w-full" type="button">
                <QrCode className="w-4 h-4 mr-2" />
                Scan QR Code to Login
              </Button>
              <div className="text-xs text-muted-foreground text-center">
                Demo Admin: admin@ugandadigitallibrary.org | Demo Member: member@ugandadigitallibrary.org
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Auth;
