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

export default function TravelResourcesPage() {
  return (
    <main className={s.main}>
      <div className={s.container}>
        <header className={s.header}>
          <h1 className={s.headerTitle}>🌍 Travel Tools Dashboard</h1>
          <p className={s.headerDescription}>
            Plan your next trip with live flight tracking, weather maps, travel headlines and a world map. Explore the tools below or open their providers in a new tab.
          </p>
        </header>

        <div className={s.grid}>
          <FlightMap />
          <WeatherWidget />
          <NewsFeed />
          <WorldMap />
        </div>

        <p className={s.footer}>
          These tools are provided by external services. Their coverage and update frequency vary.
          If a tool does not load, use its source link above.
        </p>
      </div>
    </main>
  );
}
