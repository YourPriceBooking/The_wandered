"use client";
import s from '../Travel-resources.module.scss';
import { WithHrefProps } from '../page';
import Link from 'next/link';

export default function NewsFeed({ href }: WithHrefProps) {
  const content = (
    <section className="bg-white rounded-2xl shadow-sm border p-4 hover:shadow-md transition">
      <h2 className={`${s.title} ${"font-semibold mb-3 text-lg"}`}>📰 Travel News & Trends</h2>
      <iframe
        src="https://rss.bloople.net/?url=https%3A%2F%2Fnews.google.com%2Frss%2Fsearch%3Fq%3Dtravel%26hl%3Den-US%26gl%3DUS%26ceid%3DUS%3Aen&showtitle=false&type=html"
        className={`${s.iframe} ${"w-full h-[500px] rounded-lg border"}`}
        loading="lazy"
      ></iframe>
      <p style={{marginBottom:"14px"}}></p>
    </section>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}