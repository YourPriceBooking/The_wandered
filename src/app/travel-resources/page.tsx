import { pageMetadata, socialImage } from '@/utils/seoMetadata';
import FlightMap from "./components/FlightMap";
import WeatherWidget from "./components/WeatherWidget";
import NewsFeed from "./components/NewsFeed";
import WorldMap from "./components/WorldMap";
import s from "./Travel-resources.module.scss";
export const metadata = pageMetadata({
  title: 'Travel tools: live flights, weather, news & maps | The Wandered',
  description: 'Explore live flight tracking, weather, travel news and world maps in one travel dashboard on The Wandered.',
  path: '/travel-resources', image: socialImage('travel-resources', 'Travel tools: flights, weather, news and maps'),
});


export interface WithHrefProps {
  href?: string;
}

export default function TravelResourcesPage() {
  return (
    <main className={s.main}>
      <div className={s.container}>
        {/* Header */}
        <header className={s.header}>
          <h1 className={s.headerTitle}>🌍 Travel Tools Dashboard</h1>
          <p className={s.headerDescription}>
            Discover real-time tools and live data designed for curious travelers — explore flights, weather, time zones, maps, and travel trends all in one place..
          </p>
        </header>

        {/* GRID */}
        <div className={s.grid}>
          <FlightMap href="/travel-resources/live-flights-map" />
          <WeatherWidget href="/travel-resources/global-weather"/>
          <NewsFeed href="/travel-resources/travel-news-trends"/>
          <WorldMap href="/travel-resources/explore-world-map" />
        </div>

        <p className={s.footer}>
          {/* Updated live • Powered by open APIs */}
        </p>
      </div>
    </main>
  );
}