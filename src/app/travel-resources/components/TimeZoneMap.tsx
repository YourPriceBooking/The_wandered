"use client";
import s from '../Travel-resources.module.scss';

export default function TimeZoneMap() {
  return (
    <section className="bg-white rounded-2xl shadow-sm border p-4 hover:shadow-md transition">
      <h2 className="font-semibold mb-3 text-lg">🕓 World Time & Time Zones</h2>
      <iframe
        src="https://time.is/map"
        className={`${s.iframe} ${"w-full h-[450px] rounded-lg border"}`}
        loading="lazy"
      ></iframe>
      <p style={{marginBottom:"14px"}}></p>
    </section>
  );
}