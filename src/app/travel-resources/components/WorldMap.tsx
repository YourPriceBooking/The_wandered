"use client";
import s from '../Travel-resources.module.scss';
import { WithHrefProps } from '../page';
import Link from 'next/link';

export default function WorldMap({ href }: WithHrefProps) {
  const content = (
    <section className="bg-white rounded-2xl shadow-sm border p-4 hover:shadow-md transition">
      <h2 className={`${s.title} ${"font-semibold mb-3 text-lg"}`}>🗺️ Explore World Map</h2>
      <iframe
        src="https://www.openstreetmap.org/export/embed.html"
        className={`${s.iframe} ${"w-full h-[400px] rounded-lg border"}`}
        loading="lazy"
      ></iframe>
      <p style={{marginBottom:"14px"}}>
      </p>
    </section>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}