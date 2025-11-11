import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import { Beaker, FlaskConical, TestTube2 } from "lucide-react";

const authSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/lab");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = isLogin
        ? { email, password }
        : { email, password, fullName };
      
      authSchema.parse(data);

      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Welcome back!");
          navigate("/lab");
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes("User already registered")) {
            toast.error("This email is already registered. Please sign in.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Account created! Welcome to the lab!");
          navigate("/lab");
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/10">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon-cyan/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Floating lab equipment icons */}
      <div className="absolute top-20 left-20 text-neon-cyan/30 animate-bounce">
        <Beaker size={48} />
      </div>
      <div className="absolute bottom-20 right-20 text-neon-purple/30 animate-bounce delay-500">
        <FlaskConical size={48} />
      </div>
      <div className="absolute top-40 right-40 text-accent/30 animate-bounce delay-1000">
        <TestTube2 size={48} />
      </div>

      <Card className="w-full max-w-md mx-4 glass-panel holographic-border relative z-10 p-8">
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="relative">
              <FlaskConical className="w-16 h-16 text-primary glow-cyan mx-auto" />
              <div className="absolute inset-0 animate-ping opacity-20">
                <FlaskConical className="w-16 h-16 text-primary mx-auto" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-glow-cyan mb-2">
            Virtual Chemistry Lab
          </h1>
          <p className="text-muted-foreground">
            Immersive 3D Learning Experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-foreground/90">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={!isLogin}
                className="bg-input/50 border-border/50 focus:border-primary focus:glow-cyan transition-all"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground/90">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="student@lab.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-input/50 border-border/50 focus:border-primary focus:glow-cyan transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground/90">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-input/50 border-border/50 focus:border-primary focus:glow-cyan transition-all"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground glow-cyan font-semibold"
            disabled={loading}
          >
            {loading ? "Loading..." : isLogin ? "Enter Lab" : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-border/30">
          <p className="text-xs text-center text-muted-foreground">
            🔬 Secure • Immersive • Educational
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
