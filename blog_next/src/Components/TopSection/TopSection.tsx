
import s from './TopSection.module.scss';
import Link from 'next/link';
import HouseIcon from '../../../public/HouseIcon';
import DateBlock from './dateblock/DateBlock';


import SearchField from '../Header/SearchField/SearchField';
import classNames from 'classnames';
import BackArrow from './BackArrow/BackArrow';
import { Suspense} from 'react';
import { routes } from '@/app/routes';

interface TopSectionProps {
	isLink?: boolean;
	isSearchField?: boolean;
	isWhite?: boolean;
	country?: string;
}

const TopSection: React.FC<TopSectionProps> = ({
	isLink = false,
	isSearchField = false,
	isWhite = false,
	country,
}) => {
	const headerClass = classNames(s.topSection, {
		[s.white]: isWhite,
	});
	const subtitle = routes.find((item) => item.path === country)?.title;

	// const [currentDate, setCurrentDate] = useState(new Date());

	// const getLocaleFromCountry = (country: string = ''): string => {
	// 	switch (country.toLowerCase()) {
	// 		case 'ukraine':
	// 			return 'uk-UA';
	// 		case 'poland':
	// 			return 'pl-PL';
	// 		default:
	// 			return 'en-US';
	// 	}
	// };

	// const locale = getLocaleFromCountry(country);
	// const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	// let formattedDate = new Intl.DateTimeFormat(locale, {
	// 	weekday: locale === 'uk-UA' ? undefined : 'long',
	// 	year: 'numeric',
	// 	month: 'long',
	// 	day: 'numeric',
	// 	hour: '2-digit',
	// 	minute: '2-digit',

	// 	timeZone: userTimeZone,
	// }).format(currentDate);

	// if (locale === 'uk-UA') {
	// 	const weekdaysNominative = [
	// 		'неділя',
	// 		'понеділок',
	// 		'вівторок',
	// 		'середа',
	// 		'четвер',
	// 		'п’ятниця',
	// 		'субота',
	// 	];

	// 	const ukraineWeekday = weekdaysNominative[currentDate.getDay()];
	// 	formattedDate = `${ukraineWeekday}, ${formattedDate.replace('р. о', '')}`;
	// }

	// useEffect(() => {
	// 	const intervalId = setInterval(() => {
	// 		setCurrentDate(new Date());
	// 	}, 10000);

	// 	return () => clearInterval(intervalId);
	// }, []);

	// const fontSyle =
	// 	country === 'ukraine'
	// 		? { fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', fontWeight: 500 }
	// 		: { fontFamily: 'Sen' };

	return (
		<div className={headerClass}>
			{isLink && <BackArrow country={country} />}

			<div className={isWhite ? s.mainTextBlock : s.mainTextBlockOrange}>
				<DateBlock isWhite={isWhite} country={country} />

				{/* <p style={fontSyle} className={s.date}>
					{formattedDate}
				</p> */}
				<div className={isWhite ? s.logoBlock : s.logoBlockOrange}>
					{isLink ? (
						<Link href="/" className={s.logo}>
							<HouseIcon/>
						</Link>
					) : (
						isWhite ? <HouseIcon/> : <HouseIcon color='white'/>
					)}

					<h2 className={s.mainTitle}>the wandered</h2>
				</div>

				<h1 className={s.title}>
					{subtitle && subtitle.length > 0 ? subtitle : 'The official Your Price Booking blog'}
				</h1>
			</div>
			{isSearchField && (
				<div className={s.searchBox}>
						<SearchField inputClass={s.inputClass} />
				</div>
			)}
		</div>
	);
};

export default TopSection;
