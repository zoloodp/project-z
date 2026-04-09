"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  async function checkSession() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const allowedEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

      if (
        session?.user &&
        (!allowedEmail ||
          session.user.email?.toLowerCase() === allowedEmail.toLowerCase())
      ) {
        router.replace("/admin");
        return;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setChecking(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setToast({ type: "error", message: "Email болон password оруулна уу." });
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      const allowedEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

      if (
        allowedEmail &&
        data.user?.email?.toLowerCase() !== allowedEmail.toLowerCase()
      ) {
        await supabase.auth.signOut();
        setToast({
          type: "error",
          message: "Энэ хэрэглэгч admin эрхгүй байна.",
        });
        return;
      }

      router.replace("/admin");
    } catch (error) {
      console.error(error);
      setToast({
        type: "error",
        message: "Нэвтрэх мэдээлэл буруу байна.",
      });
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f172a] px-4 text-white">
        <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-800/80 p-8">
          <div className="h-6 w-40 animate-pulse rounded bg-slate-700/50" />
          <div className="mt-6 h-14 animate-pulse rounded-2xl bg-slate-700/40" />
          <div className="mt-4 h-14 animate-pulse rounded-2xl bg-slate-700/40" />
          <div className="mt-6 h-14 animate-pulse rounded-2xl bg-slate-700/40" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f172a] px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-800/80 p-8 shadow-[0_0_40px_rgba(34,211,238,0.08)]">
        <h1 className="text-3xl font-bold">Admin Login</h1>
        <p className="mt-2 text-slate-400">
          Supabase email + password ашиглан нэвтэрнэ.
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-4 text-white outline-none transition focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-4 text-white outline-none transition focus:border-cyan-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-cyan-500 px-5 py-4 text-lg font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
          </button>
        </form>
      </div>

      {toast && (
        <div
          className={[
            "fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-2xl border px-5 py-4 text-sm shadow-xl",
            toast.type === "success"
              ? "border-emerald-400 bg-emerald-500/10 text-emerald-300"
              : "border-red-400 bg-red-500/10 text-red-300",
          ].join(" ")}
        >
          {toast.message}
        </div>
      )}
    </main>
  );
}