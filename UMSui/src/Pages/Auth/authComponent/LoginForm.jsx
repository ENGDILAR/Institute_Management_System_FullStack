import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/Context/AuthContext";

export default function LoginForm() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [email, setEmailInput] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);

      console.log("Logged in user:", user);

      console.log("User Role:", user.role);

      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "instructor") {
        navigate("/instructor");
      } else if (user.role === "student") {
        navigate("/student");
      } else {
        setError("Unknown user role.");
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.response?.status === 401) {
        setError("Invalid email or password");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-0 bg-transparent p-2 shadow-none">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label className="text-sm font-medium">Email address</label>

          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />

            <Input
              type="email"
              placeholder="name@example.com"
              className="h-12 pl-10"
              value={email}
              onChange={(e) => setEmailInput(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Password</label>

            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <div className="relative">
            <LockKeyhole
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />

            <Input
              type="password"
              placeholder="Enter your password"
              className="h-12 pl-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border accent-primary"
          />
          Remember me
        </label>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full text-sm font-semibold"
        >
          {loading ? "Signing in..." : "Sign in"}

          {!loading && <ArrowRight className="ml-auto" size={18} />}
        </Button>
      </form>

      <div className="my-7 flex items-center gap-4">
        <Separator className="flex-1" />

        <span className="text-xs text-muted-foreground">Secure access</span>

        <Separator className="flex-1" />
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ShieldCheck size={18} />
        </div>

        <div>
          <p className="text-sm font-medium">Your data is protected</p>

          <p className="text-xs text-muted-foreground">
            Secure authentication for institute members.
          </p>
        </div>
      </div>
    </Card>
  );
}
