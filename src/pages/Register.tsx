import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Register = () => {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);

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
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full hero-gradient flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-foreground">
              Join the Library
            </h1>
            <p className="text-muted-foreground mt-2">
              Create your member profile to access books and media.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
            {isSubmitted ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h2 className="font-semibold text-lg text-foreground mb-2">
                  Registration Submitted
                </h2>
                <p className="text-muted-foreground mb-6">
                  We will review your request and send you a member login shortly.
                </p>
                <Button onClick={() => navigate("/auth")}>Proceed to Login</Button>
              </div>
            ) : (
              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  setIsSubmitted(true);
                }}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" placeholder="Enter first name" required />
                  </div>
                  <div>
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" placeholder="Enter last name" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" required />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" placeholder="+256 700 000 000" required />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="Kampala, Uganda" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="member-type">Member Type</Label>
                  <Input id="member-type" placeholder="Student / Staff / Public" />
                </div>
                <Button type="submit" className="w-full">
                  Submit Registration
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
