"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, User, Phone } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/Button";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agree_terms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (!form.agree_terms) {
      toast.error("Please agree to the terms");
      return;
    }
    try {
      await register({
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
      });
      toast.success("Account created successfully!");
      router.push("/");
    } catch {
      toast.error("Registration failed. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-brand-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-heading text-2xl font-bold text-brand-900 tracking-wider">KALMKLOTHING</span>
          </Link>
          <h1 className="font-heading text-2xl font-bold text-brand-900 mt-6 mb-2">Create Account</h1>
          <p className="text-sm text-brand-500">Join us and define your style</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-brand-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-brand-600 mb-1.5">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400" />
                  <input type="text" required value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    placeholder="John"
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-600 mb-1.5">Last Name</label>
                <input type="text" required value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  placeholder="Doe"
                  className="w-full px-3 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-600 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400" />
                <input type="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-600 mb-1.5">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400" />
                <input type="tel" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+234..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-600 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400" />
                <input type={showPassword ? "text" : "password"} required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 8 characters"
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-600 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400" />
                <input type={showPassword ? "text" : "password"} required value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500" />
              </div>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={form.agree_terms}
                onChange={(e) => setForm({ ...form, agree_terms: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded border-brand-300 text-accent-600 focus:ring-accent-500" />
              <span className="text-xs text-brand-500">
                I agree to the{" "}
                <Link href="/terms" className="text-accent-600 hover:underline">Terms & Conditions</Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-accent-600 hover:underline">Privacy Policy</Link>
              </span>
            </label>

            <Button type="submit" fullWidth size="lg" loading={isLoading}>
              Create Account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-brand-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-accent-600 hover:text-accent-700 font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}
