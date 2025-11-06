"use client";

export default function FlightMap() {
  return (
    <section className="bg-white rounded-2xl shadow-sm border p-4 hover:shadow-md transition">
      <h2 className="font-semibold mb-3 text-lg">✈️ Live Flights Map</h2>
      <iframe
        src="https://globe.adsbexchange.com/"
        className="w-full h-[400px] rounded-lg border"
        loading="lazy"
      ></iframe>
      <p className="text-gray-500 text-xs mt-2">
        Source: adsbexchange.com — live air traffic data.
      </p>
    </section>
  );
}