"use client";

export default function WeatherWidget() {
  return (
    <section className="bg-white rounded-2xl shadow-sm border p-4 hover:shadow-md transition">
      <h2 className="font-semibold mb-3 text-lg">🌦 Global Weather</h2>
      <iframe
        src="https://embed.windy.com/embed2.html?width=650&height=400&level=surface&overlay=temperature&menu=&marker=true"
        className="w-full h-[400px] rounded-lg border"
        loading="lazy"
      ></iframe>
      <p style={{marginBottom:"14px"}}></p>
    </section>
  );
}