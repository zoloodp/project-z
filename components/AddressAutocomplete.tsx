"use client";

import { useEffect, useRef, useState } from "react";

type AddressValue = {
  address: string;
  lat: number | null;
  lng: number | null;
  placeId: string | null;
};

type Props = {
  value: AddressValue;
  onChange: (value: AddressValue) => void;
};

declare global {
  interface Window {
    google: any;
  }
}

export default function AddressAutocomplete({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function initGoogleMaps() {
      try {
        if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
          setLoadError("Google Maps API key тохируулаагүй байна.");
          return;
        }

        if (!window.google?.maps) {
          const existingScript = document.querySelector(
            'script[data-google-maps="true"]'
          ) as HTMLScriptElement | null;

          if (!existingScript) {
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&language=mn&region=MN`;
            script.async = true;
            script.defer = true;
            script.setAttribute("data-google-maps", "true");
            document.head.appendChild(script);

            await new Promise<void>((resolve, reject) => {
              script.onload = () => resolve();
              script.onerror = () =>
                reject(new Error("Google Maps script ачаалж чадсангүй."));
            });
          } else {
            await new Promise<void>((resolve) => {
              if (window.google?.maps) {
                resolve();
                return;
              }
              existingScript.addEventListener("load", () => resolve(), {
                once: true,
              });
            });
          }
        }

        if (!isMounted || !inputRef.current || !mapRef.current) return;

        const ubCenter = { lat: 47.9184, lng: 106.9177 };

        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center: ubCenter,
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        const autocomplete = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            componentRestrictions: { country: "mn" },
            fields: ["formatted_address", "geometry", "place_id", "name"],
            types: ["geocode"],
          }
        );

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();

          const address = place.formatted_address || place.name || "";
          const lat = place.geometry?.location?.lat?.() ?? null;
          const lng = place.geometry?.location?.lng?.() ?? null;
          const placeId = place.place_id || null;

          onChange({
            address,
            lat,
            lng,
            placeId,
          });

          if (lat && lng && mapInstanceRef.current) {
            mapInstanceRef.current.setCenter({ lat, lng });
            mapInstanceRef.current.setZoom(16);

            if (markerRef.current) {
              markerRef.current.setMap(null);
            }

            markerRef.current = new window.google.maps.Marker({
              position: { lat, lng },
              map: mapInstanceRef.current,
              title: address,
            });
          }
        });

        if (value.lat && value.lng) {
          mapInstanceRef.current.setCenter({ lat: value.lat, lng: value.lng });
          mapInstanceRef.current.setZoom(16);

          markerRef.current = new window.google.maps.Marker({
            position: { lat: value.lat, lng: value.lng },
            map: mapInstanceRef.current,
            title: value.address,
          });
        }

        setLoaded(true);
      } catch (error) {
        console.error(error);
        setLoadError("Google Maps ачааллахад алдаа гарлаа.");
      }
    }

    initGoogleMaps();

    return () => {
      isMounted = false;
    };
  }, [onChange, value.address, value.lat, value.lng]);

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-slate-200">Хаяг</label>

      <input
        ref={inputRef}
        type="text"
        defaultValue={value.address}
        placeholder="Google Maps-аас хаяг сонгоно уу"
        className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-4 text-white outline-none transition focus:border-cyan-400"
      />

      {loadError ? (
        <p className="text-sm text-red-400">{loadError}</p>
      ) : (
        <p className="text-sm text-slate-400">
          Улаанбаатар доторх хаягаа саналуудаас сонгоно уу.
        </p>
      )}

      <div
        ref={mapRef}
        className="h-64 w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-900"
      >
        {!loaded && !loadError && (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Газрын зураг ачаалж байна...
          </div>
        )}
      </div>
    </div>
  );
}"use client";

import { useEffect, useRef, useState } from "react";

type AddressValue = {
  address: string;
  lat: number | null;
  lng: number | null;
  placeId: string | null;
};

type Props = {
  value: AddressValue;
  onChange: (value: AddressValue) => void;
};

declare global {
  interface Window {
    google: typeof google;
  }
}

export default function AddressAutocomplete({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) return;

      if (!window.google?.maps) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&v=weekly&loading=async&libraries=places,marker&language=mn&region=MN`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Google Maps load failed"));
        });
      }

      if (cancelled) return;

      const center = { lat: 47.9184, lng: 106.9177 }; // Ulaanbaatar
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current as HTMLDivElement, {
        center,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      const autocomplete = new window.google.maps.places.Autocomplete(
        inputRef.current as HTMLInputElement,
        {
          fields: ["formatted_address", "geometry", "name", "place_id"],
          componentRestrictions: { country: "mn" },
          types: ["address"],
        }
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        const lat = place.geometry?.location?.lat() ?? null;
        const lng = place.geometry?.location?.lng() ?? null;
        const address = place.formatted_address || place.name || "";
        const placeId = place.place_id || null;

        onChange({
          address,
          lat,
          lng,
          placeId,
        });

        if (lat && lng && mapInstanceRef.current) {
          mapInstanceRef.current.setCenter({ lat, lng });
          mapInstanceRef.current.setZoom(16);

          if (markerRef.current) {
            markerRef.current.map = null;
          }

          markerRef.current = new google.maps.marker.AdvancedMarkerElement({
            map: mapInstanceRef.current,
            position: { lat, lng },
            title: address,
          });
        }
      });

      setLoaded(true);
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [onChange]);

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-slate-200">Хаяг</label>

      <input
        ref={inputRef}
        type="text"
        defaultValue={value.address}
        placeholder="Google Maps-аас хаяг сонгоно уу"
        className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-4 text-white outline-none transition focus:border-cyan-400"
      />

      <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-300">
        {loaded
          ? "Саналуудаас хаягаа сонгоно уу."
          : "Газрын зураг ачаалж байна..."}
      </div>

      <div
        ref={mapRef}
        className="h-64 w-full overflow-hidden rounded-2xl border border-slate-700"
      />
    </div>
  );
}