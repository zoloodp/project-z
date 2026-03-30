"use client";

import { useEffect, useRef, useState } from "react";

export default function AddressAutocomplete({ value, onChange }) {
  const inputRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteRef = useRef(null);
  const initializedRef = useRef(false);

  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadGoogleMaps() {
      try {
        if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
          setLoadError("Google Maps API key тохируулаагүй байна.");
          return;
        }

        if (!window.google?.maps) {
          let script = document.querySelector('script[data-google-maps="true"]');

          if (!script) {
            script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&language=mn&region=MN`;
            script.async = true;
            script.defer = true;
            script.setAttribute("data-google-maps", "true");
            document.head.appendChild(script);
          }

          await new Promise((resolve, reject) => {
            if (window.google?.maps) {
              resolve();
              return;
            }

            script.addEventListener("load", resolve, { once: true });
            script.addEventListener(
              "error",
              () => reject(new Error("Google Maps script ачаалж чадсангүй.")),
              { once: true }
            );
          });
        }

        if (cancelled || !mapRef.current || !inputRef.current) return;

        if (!mapInstanceRef.current) {
          const ubCenter = { lat: 47.9184, lng: 106.9177 };

          mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
            center: ubCenter,
            zoom: 12,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          });
        }

        if (!initializedRef.current) {
          autocompleteRef.current = new window.google.maps.places.Autocomplete(
            inputRef.current,
            {
              componentRestrictions: { country: "mn" },
              fields: ["formatted_address", "geometry", "place_id", "name"],
              types: ["geocode"],
            }
          );

          autocompleteRef.current.addListener("place_changed", () => {
            const place = autocompleteRef.current.getPlace();

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

          initializedRef.current = true;
        }

        setLoaded(true);
      } catch (error) {
        console.error(error);
        setLoadError("Google Maps ачааллахад алдаа гарлаа.");
      }
    }

    loadGoogleMaps();

    return () => {
      cancelled = true;
    };
  }, [onChange]);

  useEffect(() => {
    if (!inputRef.current) return;
    if (document.activeElement !== inputRef.current) {
      inputRef.current.value = value?.address || "";
    }

    if (value?.lat && value?.lng && mapInstanceRef.current) {
      mapInstanceRef.current.setCenter({ lat: value.lat, lng: value.lng });
      mapInstanceRef.current.setZoom(16);

      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      markerRef.current = new window.google.maps.Marker({
        position: { lat: value.lat, lng: value.lng },
        map: mapInstanceRef.current,
        title: value.address || "",
      });
    }
  }, [value]);

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-slate-200">Хаяг</label>

      <input
        ref={inputRef}
        type="text"
        placeholder="Google Maps-аас хаяг сонгоно уу"
        onChange={(e) =>
          onChange({
            ...value,
            address: e.target.value,
          })
        }
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
}