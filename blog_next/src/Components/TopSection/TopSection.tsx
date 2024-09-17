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

interface TopSectionProps {
	isLink?: boolean;
	isSearchField?: boolean;
	isWhite?: boolean;
	country?: string;
}

export const routes = [
	{
		name: 'Home',
		path: '',
		title: '',
	},
	{
		name: 'Ukraine',
		path: 'ukraine',
		title: 'Україна',
	},
	{
		name: 'Poland',
		path: 'poland',
		title: 'Poland',
	},
	{
		name: 'USA',
		path: 'usa',
		title: 'USA',
	},
	{
		name: 'Canada',
		path: 'canada',
		title: 'Canada',
	},
];

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

	return (
		<div className={headerClass}>
			{isLink && <BackArrow />}

			<div className={isWhite ? s.mainTextBlock : s.mainTextBlockOrange}>
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
