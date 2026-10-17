import TravelTool from './TravelTool';

export default function WorldMap() {
  return (
    <TravelTool
      id="explore-world-map"
      title="🗺️ Explore World Map"
      description="Explore destinations, streets and nearby places with OpenStreetMap. Pan and zoom to get your bearings, or open the full map to search for a specific place."
      frameTitle="Interactive world map from OpenStreetMap"
      src="https://www.openstreetmap.org/export/embed.html"
      sourceUrl="https://www.openstreetmap.org/"
      sourceName="OpenStreetMap"
    />
  );
}
