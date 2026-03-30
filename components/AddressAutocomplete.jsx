"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import AddressAutocomplete from "../../components/AddressAutocomplete";

const TIME_SLOTS = ["10:00", "12:00", "14:00", "16:00", "18:00"];
const MAX_PER_DAY = 5;

const SERVICES = [
  { value: "basic", label: "BASIC CLEAN", price: "35,000₮" },
  { value: "standard", label: "STANDARD CLEAN", price: "70,000₮" },
  { value: "deep", label: "DEEP CLEAN", price: "120,000₮" },
];

function formatDateToYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getMonthDays(year, month) {
  const date = new Date(year, month, 1);
  const days = [];

  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  return days;
}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function digitsOnly(value) {
  return value.replace(/\D/g, "").slice(0, 8);
}

function formatMnPhone(value) {
  const digits = digitsOnly(value);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)} ${digits.slice(4)}`;
}

function getSlotStatus(bookings, selectedDate) {
  if (!selectedDate) {
    return { label: "Өдөр сонгоно уу", disabled: true };
  }

  if (bookings.length >= MAX_PER_DAY) {
    return { label: "Дүүрсэн", disabled: true };
  }

  return { label: "Боломжтой", disabled: false };
}

export default function BookingPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("standard");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [addressData, setAddressData] = useState({
    address: "",
    lat: null,
    lng: null,
    placeId: null,
  });

  const [bookingsForDate, setBookingsForDate] = useState([]);
  const [fullyBookedDates, setFullyBookedDates] = useState([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const phoneDigits = digitsOnly(phone);
  const isPhoneValid = phoneDigits.length === 8;
  const phoneError =
    phone.length > 0 && !isPhoneValid
      ? "Утасны дугаар 8 оронтой байх ёстой"
      : "";

  const monthDays = useMemo(
    () => getMonthDays(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  useEffect(() => {
    fetchMonthBookingSummary();
  }, [currentMonth, currentYear]);

  useEffect(() => {
    if (selectedDate) {
      fetchBookingsForDate(selectedDate);
    } else {
      setBookingsForDate([]);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  async function fetchMonthBookingSummary() {
    try {
      setLoadingDates(true);

      const monthStart = formatDateToYYYYMMDD(new Date(currentYear, currentMonth, 1));
      const monthEnd = formatDateToYYYYMMDD(new Date(currentYear, currentMonth + 1, 0));

      const { data, error } = await supabase
        .from("bookings")
        .select("date")
        .gte("date", monthStart)
        .lte("date", monthEnd);

      if (error) throw error;

      const grouped = {};
      (data || []).forEach((row) => {
        grouped[row.date] = (grouped[row.date] || 0) + 1;
      });

      const fullDates = Object.entries(grouped)
        .filter(([, count]) => count >= MAX_PER_DAY)
        .map(([date]) => date);

      setFullyBookedDates(fullDates);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingDates(false);
    }
  }

  async function fetchBookingsForDate(date) {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("date", date);

      if (error) throw error;

      setBookingsForDate(data || []);
    } catch (error) {
      console.error(error);
      setBookingsForDate([]);
    }
  }

  function changeMonth(direction) {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear((prev) => prev - 1);
      } else {
        setCurrentMonth((prev) => prev - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear((prev) => prev + 1);
      } else {
        setCurrentMonth((prev) => prev + 1);
      }
    }
  }

  async function handleSubmit() {
    try {
      if (!name.trim()) {
        setToast({ type: "error", message: "Нэрээ оруулна уу." });
        return;
      }

      if (!isPhoneValid) {
        setToast({ type: "error", message: "Утасны дугаар 8 оронтой байх ёстой." });
        return;
      }

      if (!addressData.address.trim()) {
        setToast({ type: "error", message: "Хаягаа оруулна уу." });
        return;
      }

      if (!selectedDate) {
        setToast({ type: "error", message: "Өдөр сонгоно уу." });
        return;
      }

      if (!selectedTime) {
        setToast({ type: "error", message: "Цагийн слот сонгоно уу." });
        return;
      }

      const dateObj = parseLocalDate(selectedDate);

      if (!isWeekend(dateObj)) {
        setToast({
          type: "error",
          message: "Захиалга зөвхөн амралтын өдөр боломжтой.",
        });
        return;
      }

      if (bookingsForDate.length >= MAX_PER_DAY) {
        setToast({ type: "error", message: "Энэ өдөр дүүрсэн байна." });
        return;
      }

      setSubmitting(true);

      const { error } = await supabase.from("bookings").insert([
        {
          name: name.trim(),
          phone: phoneDigits,
          service,
          address: addressData.address,
          date: selectedDate,
          time: selectedTime,
          status: "pending",
        },
      ]);

      if (error) throw error;

      setToast({
        type: "success",
        message: "Таны захиалга бүртгэгдлээ. Бид холбогдох болно.",
      });

      setName("");
      setPhone("");
      setService("standard");
      setAddressData({
        address: "",
        lat: null,
        lng: null,
        placeId: null,
      });
      setSelectedDate("");
      setSelectedTime("");

      await fetchMonthBookingSummary();
    } catch (error) {
      console.error(error);
      setToast({
        type: "error",
        message: "Алдаа гарлаа. Дахин оролдоно уу.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const selectedDaySlotsLeft = selectedDate
    ? Math.max(MAX_PER_DAY - bookingsForDate.length, 0)
    : MAX_PER_DAY;

  return (
    <main className="min-h-screen bg-[#0f172a] px-4 py-10 text-white md:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <div>
            <span className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
              Weekend only booking
            </span>
            <h1 className="mt-4 text-4xl font-bold">Захиалга өгөх</h1>
            <p className="mt-3 text-slate-300">
              Хаяг болон багцаа сонгоод weekend slot захиална.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-700 bg-slate-800/70 p-6">
            <h2 className="text-xl font-semibold text-emerald-400">
              On-site үйлчилгээ
            </h2>
            <p className="mt-3 text-slate-300">
              Бид таны байршил дээр очиж PC-г цэвэрлэнэ. Хаяг заавал шаардлагатай.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-700 bg-slate-800/70 p-6">
            <p className="text-slate-300">Сонгосон өдрийн үлдсэн слот</p>
            <div className="mt-3 text-5xl font-bold text-cyan-400">
              {selectedDaySlotsLeft}
            </div>
            <p className="mt-2 text-slate-400">
              {selectedDate ? selectedDate : "Өдөр сонгоно уу"}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-700 bg-slate-800/70 p-6">
            <h3 className="text-2xl font-semibold">Таны сонголт</h3>
            <div className="mt-4 space-y-3 text-slate-300">
              <div className="flex items-center justify-between">
                <span>Үйлчилгээ</span>
                <span className="font-semibold text-white">
                  {SERVICES.find((s) => s.value === service)?.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Үнэ</span>
                <span className="font-semibold text-cyan-400">
                  {SERVICES.find((s) => s.value === service)?.price}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Өдөр</span>
                <span className="font-semibold text-white">
                  {selectedDate || "-"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Цаг</span>
                <span className="font-semibold text-white">
                  {selectedTime || "-"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-700 bg-slate-800/70 p-6">
            <h3 className="text-2xl font-semibold">Үнийн мэдээлэл</h3>
            <div className="mt-4 space-y-4 text-slate-300">
              <div className="flex items-center justify-between">
                <span>BASIC CLEAN</span>
                <span className="font-semibold">35,000₮</span>
              </div>
              <div className="flex items-center justify-between">
                <span>STANDARD CLEAN</span>
                <span className="font-semibold">70,000₮</span>
              </div>
              <div className="flex items-center justify-between">
                <span>DEEP CLEAN</span>
                <span className="font-semibold">120,000₮</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-700 bg-slate-800/80 p-6 md:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Нэр
              </label>
              <input
                type="text"
                placeholder="Жишээ: Бат"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-4 text-white outline-none transition focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Утас
              </label>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="Жишээ: 9911 2233"
                value={phone}
                onChange={(e) => setPhone(formatMnPhone(e.target.value))}
                className={[
                  "w-full rounded-2xl border bg-slate-950/80 px-4 py-4 text-white outline-none transition",
                  phone.length === 0
                    ? "border-slate-700 focus:border-cyan-400"
                    : isPhoneValid
                    ? "border-emerald-400 ring-2 ring-emerald-400/20"
                    : "border-red-400 ring-2 ring-red-400/20",
                ].join(" ")}
              />
              {phoneError ? (
                <p className="mt-2 text-sm text-red-400">{phoneError}</p>
              ) : isPhoneValid ? (
                <p className="mt-2 text-sm text-emerald-400">Зөв дугаар байна</p>
              ) : null}
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Үйлчилгээний төрөл
            </label>
            <div className="grid gap-3 md:grid-cols-3">
              {SERVICES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setService(item.value)}
                  className={[
                    "rounded-2xl border px-4 py-4 text-left transition",
                    service === item.value
                      ? "border-cyan-400 bg-cyan-500 text-slate-950"
                      : "border-slate-700 bg-slate-950/80 text-white hover:border-cyan-400/60",
                  ].join(" ")}
                >
                  <div className="font-semibold">{item.label}</div>
                  <div className="mt-1 text-sm opacity-90">{item.price}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <AddressAutocomplete value={addressData} onChange={setAddressData} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_220px]">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Өдөр сонгох</h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => changeMonth("prev")}
                    className="rounded-xl border border-slate-700 px-3 py-2 hover:border-cyan-400"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => changeMonth("next")}
                    className="rounded-xl border border-slate-700 px-3 py-2 hover:border-cyan-400"
                  >
                    ›
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-5">
                <div className="mb-4 text-2xl font-semibold">
                  {new Date(currentYear, currentMonth).toLocaleString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>

                <div className="mb-3 grid grid-cols-7 gap-2 text-center text-sm text-slate-400">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div key={day}>{day}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {Array.from({
                    length: new Date(currentYear, currentMonth, 1).getDay(),
                  }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}

                  {monthDays.map((date) => {
                    const dateStr = formatDateToYYYYMMDD(date);
                    const weekend = isWeekend(date);
                    const full = fullyBookedDates.includes(dateStr);
                    const selected = selectedDate === dateStr;

                    return (
                      <button
                        key={dateStr}
                        type="button"
                        disabled={!weekend || full}
                        onClick={() => {
                          setSelectedDate(dateStr);
                          setSelectedTime("");
                        }}
                        className={[
                          "aspect-square rounded-xl text-sm transition",
                          selected
                            ? "bg-cyan-500 text-slate-950"
                            : !weekend
                            ? "cursor-not-allowed bg-slate-900/40 text-slate-600"
                            : full
                            ? "cursor-not-allowed bg-red-500/10 text-red-400"
                            : "bg-slate-900 text-white hover:border hover:border-cyan-400",
                        ].join(" ")}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>

                <p className="mt-5 text-sm text-slate-400">
                  Захиалга зөвхөн амралтын өдөр боломжтой.
                  {loadingDates ? " Өдрүүдийг шалгаж байна..." : ""}
                </p>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold">Цагийн слот</h3>
              <div className="space-y-3">
                {TIME_SLOTS.map((slot) => {
                  const status = getSlotStatus(bookingsForDate, selectedDate);

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={!selectedDate || status.disabled}
                      onClick={() => setSelectedTime(slot)}
                      className={[
                        "w-full rounded-2xl border px-4 py-4 text-left transition",
                        selectedTime === slot
                          ? "border-cyan-400 bg-cyan-500 text-slate-950"
                          : !selectedDate || status.disabled
                          ? "cursor-not-allowed border-slate-800 bg-slate-900/40 text-slate-500"
                          : "border-slate-700 bg-slate-950/80 text-white hover:border-cyan-400/60 hover:bg-slate-900",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{slot}</span>
                        <span
                          className={[
                            "text-sm",
                            status.disabled ? "text-red-400" : "text-emerald-400",
                          ].join(" ")}
                        >
                          {status.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-8 w-full rounded-2xl bg-cyan-500 px-5 py-4 text-lg font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Илгээж байна..."
              : `${SERVICES.find((s) => s.value === service)?.price} -ийн захиалга илгээх`}
          </button>

          <p className="mt-3 text-center text-sm text-slate-400">
            Захиалга илгээсний дараа бид утсаар холбогдож баталгаажуулна.
          </p>
        </div>
      </div>

      <a
        href={`tel:${process.env.NEXT_PUBLIC_BUSINESS_PHONE || "89664270"}`}
        className="fixed bottom-6 right-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-2xl text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.4)] transition hover:scale-105"
      >
        📞
      </a>

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