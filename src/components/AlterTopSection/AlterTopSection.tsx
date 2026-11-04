import TopSection from '../TopSection/TopSection';

interface TopSectionProps {
  isLink?: boolean;
  isSearchField?: boolean;
  isWhite?: boolean;
  country?: string;
  isNarrow?: boolean;
  viewPath?: string;
}

export default function AlterTopSection({
  country = 'uncharted-planet',
  viewPath,
}: TopSectionProps) {
  return (
    <TopSection
      country={country}
      viewPath={viewPath}
      countryTitle="Uncharted planet"
      countryDescription="Ancient structures that challenge our understanding of history, engineering, and human capability."
    />
  );
}
