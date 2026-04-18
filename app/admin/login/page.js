"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace("/admin");
        return;
      }

      setLoading(false);
    };

    checkSession();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    router.replace("/admin");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#081225] text-white flex items-center justify-center">
        Уншиж байна...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#081225] text-white flex items-center justify-center px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-[#16243c] border border-[#294062] rounded-3xl p-8"
      >
        <h1 className="text-3xl font-bold mb-6">Admin Login</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-2xl bg-[#020b20] border border-[#294062] outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-2xl bg-[#020b20] border border-[#294062] outline-none"
        />

        <button
          type="submit"
          className="w-full py-3 rounded-2xl bg-[#37e3ae] text-black font-semibold"
        >
          Login
        </button>
      </form>
    </div>
  );
}