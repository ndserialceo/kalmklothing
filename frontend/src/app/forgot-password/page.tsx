"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import api from "@/lib/api";
import Button from "@/components/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/auth/password-reset/", { email });
      setIsSubmitted(true);
    } catch {
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-brand-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-heading text-2xl font-bold text-brand-900 tracking-wider">KALMKLOTHING</span>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-brand-100 p-8">
          {isSubmitted ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-7 w-7 text-green-500" />
              </div>
              <h1 className="font-heading text-xl font-bold text-brand-900 mb-2">Check Your Email</h1>
              <p className="text-sm text-brand-500 mb-6">
                We&apos;ve sent a password reset link to <span className="font-medium text-brand-700">{email}</span>.
                Please check your inbox and follow the instructions.
              </p>
              <p className="text-xs text-brand-400 mb-6">
                Didn&apos;t receive the email? Check your spam folder or try again.
              </p>
              <Link href="/login">
                <Button variant="secondary" fullWidth>
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-heading text-xl font-bold text-brand-900 mb-2 text-center">Forgot Password?</h1>
              <p className="text-sm text-brand-500 text-center mb-6">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-brand-600 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400" />
                    <input type="email" required value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500" />
                  </div>
                </div>

                <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
                  Send Reset Link
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-900 transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
