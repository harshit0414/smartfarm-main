import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import farmHero from "@/assets/farm-hero.jpg";
import logo from "@/assets/logo.png";

export function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        setSuccess("Account created! You can now sign in.");
        setIsSignUp(false);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={farmHero}
          alt="Smart farming with solar panels and IoT sensors"
          className="absolute inset-0 h-full w-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/30 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display text-4xl leading-tight">
              Self-Optimizing Solar Powered
              <br />
              Smart Farming System
            </h2>
            <p className="mt-3 max-w-md text-lg opacity-90 font-body">
              AI & IoT technology for precision agriculture. Monitor your farm in real-time.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2 bg-background">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <img src={logo} alt="SmartFarm Logo" className="h-12 w-12" width={48} height={48} />
            <div>
              <h1 className="font-display text-2xl text-foreground">SmartFarm</h1>
              <p className="text-xs text-muted-foreground">IoT Dashboard</p>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-foreground mb-1">
            {isSignUp ? "Create your account" : "Welcome back, Farmer"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {isSignUp
              ? "Sign up to start monitoring your farm"
              : "Sign in to access your farm dashboard"}
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="farmer@example.com"
                className="w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(""); setSuccess(""); }}
              className="font-medium text-primary hover:underline"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
