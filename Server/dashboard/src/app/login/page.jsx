"use client";

import { Suspense, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2, Leaf, ShieldCheck, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  function validate() {
    const errs = {}
    if (!email) errs.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email address"
    if (!password) errs.password = "Password is required"
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setLoading(true)

    try {
      const result = await signIn("credentials", { email, password, redirect: false, callbackUrl })
      if (result?.error) {
        toast.error("Invalid credentials. Please check your email and password.")
        setLoading(false)
      } else if (result?.ok) {
        toast.success("Welcome back!")
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Left — Gradient Hero Panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #18181b 0%, #27272a 30%, #3f3f46 60%, #52525b 100%)",
        }}
      >
        {/* Background decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/3" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-white text-center max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <div className="flex size-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <Leaf className="size-8 text-white" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-4xl font-bold tracking-tight mb-3"
          >
            Tanak Prabha
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-zinc-100 text-lg leading-relaxed mb-10"
          >
            Admin dashboard for farmer welfare management. Manage beneficiaries, professionals, and content all in one place.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-col gap-3 text-left"
          >
            {[
              { icon: "🌾", text: "Manage farmer beneficiaries" },
              { icon: "👨‍⚕️", text: "Track agricultural professionals" },
              { icon: "📋", text: "Publish schemes & banners" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm text-zinc-50 font-medium">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="absolute bottom-8 flex items-center gap-2 text-zinc-200 text-xs"
        >
          <ShieldCheck className="size-4" />
          Secured Admin Access — Authorized Personnel Only
        </motion.div>
      </motion.div>

      {/* Right — Login Form */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-16 bg-background"
      >
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="flex size-9 items-center justify-center rounded-xl bg-zinc-600">
            <Leaf className="size-5 text-white" />
          </div>
          <span className="text-xl font-bold">Tanak Prabha</span>
        </div>

        <div className="w-full max-w-sm">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-1">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground mb-8">
              Sign in to your admin account to continue.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@tanakprabha.org"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })) }}
                disabled={loading}
                className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })) }}
                  disabled={loading}
                  className={`pr-10 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            {/* Submit */}
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer bg-zinc-600 hover:bg-zinc-700 active:bg-zinc-800 text-white font-semibold transition-all"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </motion.div>
          </motion.form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Need help? Contact your system administrator.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-zinc-600" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
