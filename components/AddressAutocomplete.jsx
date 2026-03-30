"use client";

export default function AddressAutocomplete({ value, onChange }) {
  const mapSearchUrl = value?.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        value.address
      )}`
    : "https://www.google.com/maps";

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-slate-200">Хаяг</label>

      <input
        type="text"
        value={value?.address || ""}
        placeholder="Жишээ: БЗД, 26-р хороо, Olympic Residence, 801-р байр"
        onChange={(e) =>
          onChange({
            address: e.target.value,
            lat: null,
            lng: null,
            placeId: null,
          })
        }
        className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-4 text-white outline-none transition focus:border-cyan-400"
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
        <p className="text-sm text-slate-300">
          Хаягаа дэлгэрэнгүй бичээд Google Maps дээр шалгаж болно.
        </p>

        <a
          href={mapSearchUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-full items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
        >
          Google Maps дээр шалгах
        </a>
      </div>
    </div>
  );
}