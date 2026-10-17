import TravelTool from './TravelTool';

export default function FlightMap() {
  return (
    <TravelTool
      id="live-flights-map"
      title="✈️ Live Flights Map"
      description="Explore aircraft positions on the ADS-B Exchange map. Use the map controls to move around, zoom in and inspect available aircraft details."
      frameTitle="Live aircraft tracking map from ADS-B Exchange"
      src="https://globe.adsbexchange.com/"
      sourceUrl="https://globe.adsbexchange.com/"
      sourceName="ADS-B Exchange"
    />
  );
}
