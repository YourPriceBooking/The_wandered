"use client";

export default function WorldMap() {
  return (
    <section className="bg-white rounded-2xl shadow-sm border p-4 hover:shadow-md transition">
      <h2 className="font-semibold mb-3 text-lg">🗺️ Explore World Map</h2>
      <iframe
        src="https://www.openstreetmap.org/export/embed.html"
        className="w-full h-[400px] rounded-lg border"
        loading="lazy"
      ></iframe>
      <p style={{marginBottom:"14px"}}>
      </p>
    </section>
  );
}