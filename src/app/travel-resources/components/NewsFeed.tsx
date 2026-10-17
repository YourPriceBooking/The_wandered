import TravelTool from './TravelTool';

export default function NewsFeed() {
  return (
    <TravelTool
      id="travel-news-trends"
      title="📰 Travel News & Trends"
      description="Browse travel headlines from Google News, displayed through the Bloople RSS reader. Open a headline to read the original publisher’s coverage; these are external stories, not articles from The Wandered."
      frameTitle="Travel headlines from Google News RSS, displayed by Bloople"
      src="https://rss.bloople.net/?url=https%3A%2F%2Fnews.google.com%2Frss%2Fsearch%3Fq%3Dtravel%26hl%3Den-US%26gl%3DUS%26ceid%3DUS%3Aen&showtitle=false&type=html"
      sourceUrl="https://news.google.com/search?q=travel&hl=en-US&gl=US&ceid=US%3Aen"
      sourceName="Google News"
    />
  );
}
