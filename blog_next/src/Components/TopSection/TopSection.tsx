import s from './TopSection.module.scss';
import Link from 'next/link';
import Image from 'next/image';
import logo from './../../../public/house-icon.svg';
import Loading from '@/app/loading';
import logoOrange from './../../../public/houseIconOrange.svg';
import SearchField from '../Header/SearchField/SearchField';
import classNames from 'classnames';
import BackArrow from './BackArrow/BackArrow';
import { Suspense } from 'react';
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

	const getLocaleFromCountry = (country: string = ''): string => {
		switch (country.toLowerCase()) {
			case 'ukraine':
				return 'uk-UA';
			case 'poland':
				return 'pl-PL';
			default:
				return 'en-US';
		}
	};

	const locale = getLocaleFromCountry(country);
	const currentDate = new Date();

	let formattedDate = new Intl.DateTimeFormat(locale, {
		weekday: locale === 'uk-UA' ? undefined : 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	}).format(currentDate);

	if (locale === 'uk-UA') {
		const weekdaysNominative = [
			'неділя',
			'понеділок',
			'вівторок',
			'середа',
			'четвер',
			'п’ятниця',
			'субота',
		];
		formattedDate = `${weekdaysNominative[currentDate.getDay()]}, ${formattedDate.replace(
			' р.',
			'',
		)}`;
	}

	const fontSyle =
		country === 'ukraine'
			? { fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', fontWeight: 500 }
			: { fontFamily: 'Sen' };

	return (
		<div className={headerClass}>
			{isLink && <BackArrow country={country} />}

			<div className={isWhite ? s.mainTextBlock : s.mainTextBlockOrange}>
				<p style={fontSyle} className={s.date}>
					{formattedDate}
				</p>
				<div className={isWhite ? s.logoBlock : s.logoBlockOrange}>
					{isLink ? (
						<Link href="/">
							<Image
								src={logoOrange}
								width={63}
								height={58}
								alt="logo-icon"
								className={s.logo}
								priority={true}
							/>
						</Link>
					) : (
						<Image
							src={logo}
							width={63}
							height={58}
							alt="logo-icon"
							className={s.logo}
							priority={true}
						/>
					)}

					<h2 className={s.mainTitle}>the wandered</h2>
				</div>

				<h1 className={s.title}>
					{subtitle && subtitle.length > 0 ? subtitle : 'The official Your Price Booking blog'}
				</h1>
			</div>
			{isSearchField && (
				<div className={s.searchBox}>
					<Suspense fallback={<Loading />}>
						<SearchField inputClass={s.inputClass} />
					</Suspense>
				</div>
			)}
		</div>
	);
};

export default TopSection;
