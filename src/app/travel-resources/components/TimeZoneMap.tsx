"use client";

export default function TimeZoneMap() {
  return (
    <section className="bg-white rounded-2xl shadow-sm border p-4 hover:shadow-md transition">
      <h2 className="font-semibold mb-3 text-lg">🕓 World Time & Time Zones</h2>
      <iframe
        src="https://time.is/map"
        className="w-full h-[450px] rounded-lg border"
        loading="lazy"
      ></iframe>
      <p className="text-gray-500 text-xs mt-2">Source: time.is</p>
    </section>
  );
}