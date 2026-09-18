"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/ui/Card";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { useToast } from "@/ui/Toast";
import { Wallet, ArrowRight } from "lucide-react";

const registerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormData = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [isPending, startTransition] = useTransition();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    setApiError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.error || "Failed to create account");
        }

        success(
          "Account Created!",
          "Your account and default categories have been configured. Please sign in."
        );
        router.push("/login");
      } catch (err: any) {
        setApiError(err.message || "An unexpected error occurred.");
      }
    });
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
          <p className="text-xs text-slate-400">Create your personal financial tracking account</p>
        </div>

        {/* Register Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Create Account</CardTitle>
            <CardDescription className="text-xs">
              Start tracking expenses with automated budgets and visual cash flow reports.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {apiError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
                  {apiError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Full Name
                </label>
                <Input
                  placeholder="Alex Morgan"
                  {...register("name")}
                  error={errors.name?.message}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="alex@example.com"
                  {...register("email")}
                  error={errors.email?.message}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password (min. 6 characters)
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  error={errors.password?.message}
                />
              </div>

              <Button type="submit" className="w-full mt-2" isLoading={isPending}>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="pt-2 border-t border-slate-800/80 justify-center">
            <p className="text-xs text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline-offset-4 hover:underline">
                Sign in here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
