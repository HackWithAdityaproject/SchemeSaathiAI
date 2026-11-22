import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, LoaderCircle, LockKeyhole, Sprout } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { API_BASE_URL } from "../api.js";
import { useAuth } from "./AuthContext.jsx";

function messageFromError(error, fallback) {
  if (!error.response) {
    const backend = API_BASE_URL || "the current site";
    return `Can’t reach the backend at ${backend}. Start Spring Boot, verify its port, and try again.`;
  }
  if (error.response.status === 404) {
    return "The backend doesn’t have the auth endpoint yet. Restart it with the local profile, then try again.";
  }
  return error.response?.data?.message || error.response?.data?.detail || fallback;
}

function AuthLayout({ title, description, children }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas px-4 py-10">
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full border border-leaf/10" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full border border-leaf/10" />
      <section className="relative w-full max-w-md rounded-3xl border border-white bg-white p-6 shadow-xl shadow-forest/5 sm:p-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-forest">
          <Sprout size={19} className="text-leaf" /> SchemeSaathi
        </Link>
        <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-forest">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        {children}
        <Link to="/" className="mt-7 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-forest">
          <ArrowLeft size={14} /> Back to exploring schemes
        </Link>
      </section>
    </main>
  );
}

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export function LoginPage() {
  const { user, loading, authError, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  if (!loading && user) return <Navigate to="/account" replace />;

  async function onSubmit(values) {
    setSubmitting(true);
    setServerError("");
    try {
      await login(values);
      navigate(location.state?.from?.pathname || "/account", { replace: true });
    } catch (error) {
      setServerError(messageFromError(error, "We couldn’t sign you in. Check your details and try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" description="Sign in to your SchemeSaathi account.">
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        {(serverError || authError) && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{serverError || authError}</p>}
        <div>
          <label htmlFor="login-email" className="mb-1.5 block text-sm font-semibold text-forest">Email address</label>
          <input id="login-email" type="email" autoComplete="email" {...register("email")} className="h-12 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-leaf focus:ring-4 focus:ring-leaf/10" />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="login-password" className="mb-1.5 block text-sm font-semibold text-forest">Password</label>
          <input id="login-password" type="password" autoComplete="current-password" {...register("password")} className="h-12 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-leaf focus:ring-4 focus:ring-leaf/10" />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>
        <button disabled={submitting} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-forest text-sm font-bold text-white hover:bg-leaf disabled:opacity-60">
          {submitting ? <LoaderCircle size={17} className="animate-spin" /> : <LockKeyhole size={16} />}
          Sign in
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-600">
        New here? <Link to="/register" className="font-bold text-leaf hover:text-forest">Create an account</Link>
      </p>
    </AuthLayout>
  );
}

const registerSchema = z.object({
  displayName: z.string().trim().min(2, "Enter at least 2 characters.").max(80),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters.").max(72, "Use no more than 72 characters."),
  confirmPassword: z.string(),
}).refine((values) => values.password === values.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export function RegisterPage() {
  const { user, loading, register: createAccount } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { displayName: "", email: "", password: "", confirmPassword: "" },
  });

  if (!loading && user) return <Navigate to="/account" replace />;

  async function onSubmit(values) {
    setSubmitting(true);
    setServerError("");
    try {
      await createAccount({
        displayName: values.displayName,
        email: values.email,
        password: values.password,
      });
      navigate("/account", { replace: true });
    } catch (error) {
      setServerError(messageFromError(error, "We couldn’t create your account. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Create your account" description="Save your progress and keep useful schemes together.">
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        {serverError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{serverError}</p>}
        <div>
          <label htmlFor="register-name" className="mb-1.5 block text-sm font-semibold text-forest">Your name</label>
          <input id="register-name" autoComplete="name" {...register("displayName")} className="h-12 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-leaf focus:ring-4 focus:ring-leaf/10" />
          {errors.displayName && <p className="mt-1 text-xs text-red-600">{errors.displayName.message}</p>}
        </div>
        <div>
          <label htmlFor="register-email" className="mb-1.5 block text-sm font-semibold text-forest">Email address</label>
          <input id="register-email" type="email" autoComplete="email" {...register("email")} className="h-12 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-leaf focus:ring-4 focus:ring-leaf/10" />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="register-password" className="mb-1.5 block text-sm font-semibold text-forest">Password</label>
          <input id="register-password" type="password" autoComplete="new-password" {...register("password")} className="h-12 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-leaf focus:ring-4 focus:ring-leaf/10" />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>
        <div>
          <label htmlFor="register-confirm-password" className="mb-1.5 block text-sm font-semibold text-forest">Confirm password</label>
          <input id="register-confirm-password" type="password" autoComplete="new-password" {...register("confirmPassword")} className="h-12 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-leaf focus:ring-4 focus:ring-leaf/10" />
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
        </div>
        <p className="text-xs leading-5 text-slate-500">Don’t use Aadhaar, bank, or other sensitive information as your password.</p>
        <button disabled={submitting} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-forest text-sm font-bold text-white hover:bg-leaf disabled:opacity-60">
          {submitting ? <LoaderCircle size={17} className="animate-spin" /> : <ArrowRight size={17} />}
          Create account
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-600">
        Already have an account? <Link to="/login" className="font-bold text-leaf hover:text-forest">Sign in</Link>
      </p>
    </AuthLayout>
  );
}

export function AccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogout() {
    setSubmitting(true);
    setError("");
    try {
      await logout();
      navigate("/", { replace: true });
    } catch {
      setError("We couldn’t sign you out. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title={`Hello, ${user.displayName}`} description="Your account is ready. You can continue exploring schemes without sharing sensitive identity details.">
      <div className="mt-6 rounded-2xl bg-[#f5f7f2] p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Signed in as</p>
        <p className="mt-1 break-all text-sm font-semibold text-forest">{user.email}</p>
      </div>
      {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>}
      <Link to="/" className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-forest text-sm font-bold text-white hover:bg-leaf">
        Explore schemes <ArrowRight size={16} />
      </Link>
      <button onClick={handleLogout} disabled={submitting} className="mt-3 h-12 w-full rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
        {submitting ? "Signing out…" : "Sign out"}
      </button>
    </AuthLayout>
  );
}

export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-canvas text-sm font-semibold text-leaf">Checking your account…</div>;
  }
  return user ? children : <Navigate to="/login" state={{ from: location }} replace />;
}
