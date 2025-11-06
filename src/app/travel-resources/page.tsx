import FlightMap from "./components/FlightMap";
import WeatherWidget from "./components/WeatherWidget";
import TimeZoneMap from "./components/TimeZoneMap";
import NewsFeed from "./components/NewsFeed";
import WorldMap from "./components/WorldMap";

export const metadata = {
  title: "🌍 Travel Tools Dashboard — The Wandered",
  description:
    "Reddit-style dashboard with real-time travel tools: live flights, weather, maps and world data. Made for modern explorers.",
};

export default function TravelResourcesPage() {
  return (
    <main className="bg-[#f6f7f8] min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <header className="pb-6 border-b border-gray-300 mb-8">
          <h1 className="text-3xl font-bold">🌍 Travel Tools Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Real-time tools and data for curious travelers — inspired by the simplicity of Reddit.
          </p>
        </header>

        {/* GRID */}
        <div className="grid gap-6 md:grid-cols-2">
          <FlightMap />
          <WeatherWidget />
          <TimeZoneMap />
          <NewsFeed />
          <WorldMap />
        </div>

        <p className="text-center text-sm text-gray-400 pt-8">
          Updated live • Powered by open APIs
        </p>
      </div>
    </main>
  );
}