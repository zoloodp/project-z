"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

const SERVICE_PRICES = {
  basic: 35000,
  standard: 70000,
  deep: 120000,
};

const ADDON_PRICES = {
  ssd_setup: 30000,
  fps_boost: 20000,
};

function formatPrice(value) {
  return `${value.toLocaleString()}₮`;
}

function formatServiceLabel(service) {
  if (service === "basic") return "BASIC";
  if (service === "standard") return "STANDARD";
  if (service === "deep") return "DEEP";
  return service || "-";
}

function formatAddonLabel(addon) {
  if (addon === "ssd_setup") return "SSD Setup";
  if (addon === "fps_boost") return "FPS Boost";
  return addon;
}

function formatStatusLabel(status) {
  if (status === "pending") return "Pending";
  if (status === "confirmed") return "Confirmed";
  if (status === "done") return "Done";
  return status || "-";
}

function getStatusClass(status) {
  if (status === "done") {
    return "border-emerald-400/30 bg-emerald-500/10 text-emerald-300";
  }
  if (status === "confirmed") {
    return "border-cyan-400/30 bg-cyan-500/10 text-cyan-300";
  }
  return "border-yellow-400/30 bg-yellow-500/10 text-yellow-300";
}

function calculateBookingTotal(booking) {
  const servicePrice = SERVICE_PRICES[booking.service] || 0;
  const addonsPrice = Array.isArray(booking.addons)
    ? booking.addons.reduce((sum, addon) => sum + (ADDON_PRICES[addon] || 0), 0)
    : 0;

  return servicePrice + addonsPrice;
}

export default function AdminPage() {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  async function loadBookings() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("bookings")
        .select("id,name,phone,service,addons,address,date,time,status,created_at")
        .order("date", { ascending: false })
        .order("time", { ascending: false });

      if (error) throw error;

      setBookings(data || []);
    } catch (error) {
      console.error(error);
      setToast({ type: "error", message: "Захиалгуудыг ачаалж чадсангүй." });
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id ? { ...booking, status } : booking
        )
      );

      setToast({ type: "success", message: "Статус шинэчлэгдлээ." });
    } catch (error) {
      console.error(error);
      setToast({ type: "error", message: "Статус шинэчлэхэд алдаа гарлаа." });
    }
  }

  async function deleteBooking(id) {
    const confirmed = window.confirm("Энэ захиалгыг устгах уу?");
    if (!confirmed) return;

    try {
      const { error } = await supabase.from("bookings").delete().eq("id", id);

      if (error) throw error;

      setBookings((prev) => prev.filter((booking) => booking.id !== id));
      setToast({ type: "success", message: "Захиалга устгагдлаа." });
    } catch (error) {
      console.error(error);
      setToast({ type: "error", message: "Устгахад алдаа гарлаа." });
    }
  }

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesStatus =
        statusFilter === "all" ? true : booking.status === statusFilter;

      const matchesDate = dateFilter ? booking.date === dateFilter : true;

      return matchesStatus && matchesDate;
    });
  }, [bookings, statusFilter, dateFilter]);

  const todayString = new Date().toISOString().split("T")[0];

  const todayBookings = bookings.filter((booking) => booking.date === todayString);

  const todayRevenue = todayBookings.reduce(
    (sum, booking) => sum + calculateBookingTotal(booking),
    0
  );

  return (
    <main className="min-h-screen bg-[#0f172a] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold md:text-4xl">Admin Dashboard</h1>
          <p className="mt-2 text-slate-400">
            Захиалгуудыг хянах, баталгаажуулах, дуусгах.
          </p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-700 bg-slate-800/70 p-6">
            <p className="text-slate-400">Өнөөдрийн захиалга</p>
            <div className="mt-3 text-4xl font-bold text-cyan-400">
              {todayBookings.length}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-700 bg-slate-800/70 p-6">
            <p className="text-slate-400">Өнөөдрийн орлогын тооцоо</p>
            <div className="mt-3 text-4xl font-bold text-emerald-400">
              {formatPrice(todayRevenue)}
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-slate-700 bg-slate-800/70 p-4 md:p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Status filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Date filter
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("all");
                  setDateFilter("");
                }}
                className="w-full rounded-2xl border border-slate-600 bg-slate-900 px-4 py-3 text-white transition hover:border-cyan-400"
              >
                Filter reset
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-800/70">
          <div className="overflow-x-auto">
            <table className="min-w-[1200px] w-full">
              <thead className="bg-slate-900/80 text-left text-sm text-slate-300">
                <tr>
                  <th className="px-4 py-4">Нэр</th>
                  <th className="px-4 py-4">Утас</th>
                  <th className="px-4 py-4">Service</th>
                  <th className="px-4 py-4">Add-ons</th>
                  <th className="px-4 py-4">Нийт үнэ</th>
                  <th className="px-4 py-4">Хаяг</th>
                  <th className="px-4 py-4">Date</th>
                  <th className="px-4 py-4">Time</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-t border-slate-700">
                      <td className="px-4 py-4" colSpan={10}>
                        <div className="h-12 animate-pulse rounded-2xl bg-slate-700/40" />
                      </td>
                    </tr>
                  ))
                ) : filteredBookings.length === 0 ? (
                  <tr className="border-t border-slate-700">
                    <td
                      colSpan={10}
                      className="px-4 py-10 text-center text-slate-400"
                    >
                      Захиалга олдсонгүй.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-t border-slate-700 align-top"
                    >
                      <td className="px-4 py-4 font-medium text-white">
                        {booking.name}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2">
                          <span>{booking.phone}</span>
                          <a
                            href={`tel:${booking.phone}`}
                            className="inline-flex w-fit rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300"
                          >
                            Call
                          </a>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-semibold text-white">
                          {formatServiceLabel(booking.service)}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {Array.isArray(booking.addons) && booking.addons.length > 0 ? (
                          <div className="flex max-w-[220px] flex-wrap gap-2">
                            {booking.addons.map((addon) => (
                              <span
                                key={addon}
                                className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300"
                              >
                                {formatAddonLabel(addon)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="px-4 py-4 font-semibold text-emerald-400">
                        {formatPrice(calculateBookingTotal(booking))}
                      </td>

                      <td className="px-4 py-4 text-slate-200">
                        <div className="max-w-[260px] whitespace-normal break-words">
                          {booking.address}
                        </div>
                      </td>

                      <td className="px-4 py-4">{booking.date}</td>
                      <td className="px-4 py-4">{booking.time}</td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-sm ${getStatusClass(
                            booking.status
                          )}`}
                        >
                          {formatStatusLabel(booking.status)}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => updateStatus(booking.id, "confirmed")}
                            className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300 transition hover:bg-cyan-500/20"
                          >
                            Confirm
                          </button>

                          <button
                            type="button"
                            onClick={() => updateStatus(booking.id, "done")}
                            className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300 transition hover:bg-emerald-500/20"
                          >
                            Done
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteBooking(booking.id)}
                            className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/20"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
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