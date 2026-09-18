"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/ui/Card";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { useToast } from "@/ui/Toast";
import { Wallet, Sparkles, ArrowRight, Lock, Mail } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [isPending, startTransition] = useTransition();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setAuthError(null);
    startTransition(async () => {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (res?.error) {
        setAuthError("Invalid email or password. Please try again.");
      } else {
        success("Welcome back!", "Authentication successful.");
        router.push("/dashboard");
        router.refresh();
      }
    });
  };

  const handleQuickDemoFill = () => {
    setValue("email", "demo@example.com");
    setValue("password", "Password123!");
    setAuthError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/10 blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25">
            <Wallet className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">SmartSpend</h1>
          <p className="text-xs text-slate-400">Sign in to your financial analytics dashboard</p>
        </div>

        {/* Quick Demo Credentials Banner */}
        <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-indigo-300">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Pre-seeded demo user with 90 days of transactions</span>
          </div>
          <button
            type="button"
            onClick={handleQuickDemoFill}
            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] shrink-0 transition-colors cursor-pointer"
          >
            Quick Fill
          </button>
        </div>

        {/* Login Form Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sign In</CardTitle>
            <CardDescription className="text-xs">
              Enter your email and password to access your accounts.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {authError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
                  {authError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    {...register("email")}
                    error={errors.email?.message}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...register("password")}
                    error={errors.password?.message}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full mt-2" isLoading={isPending}>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="pt-2 border-t border-slate-800/80 justify-center">
            <p className="text-xs text-slate-400">
              Don't have an account yet?{" "}
              <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold underline-offset-4 hover:underline">
                Create one free
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
