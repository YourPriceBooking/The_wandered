"use client";
import s from '../Travel-resources.module.scss';

export default function FlightMap() {
  return (
    <section className="bg-white rounded-2xl shadow-sm border p-4 hover:shadow-md transition">
      <h2 className={`${s.title} ${"font-semibold mb-3 text-lg"}`}>✈️ Live Flights Map</h2>
      <iframe
        src="https://globe.adsbexchange.com/"
        className={`${s.iframe} ${"w-full h-[400px] rounded-lg border"}`}
        loading="lazy"
      ></iframe>
      <p style={{marginBottom:"14px"}}>      
      </p>
    </section>
  );
}