import TravelTool from './TravelTool';

export default function WeatherWidget() {
  return (
    <TravelTool
      id="global-weather"
      title="🌦 Global Weather"
      description="Explore temperature patterns with Windy before planning your next stop. Move around the map and check the forecast for the places you plan to visit."
      frameTitle="Global temperature and weather map from Windy"
      src="https://embed.windy.com/embed2.html?width=650&height=400&level=surface&overlay=temperature&menu=&marker=true"
      sourceUrl="https://www.windy.com/"
      sourceName="Windy"
    />
  );
}
