import s from './OldTopSection.module.scss';
import Link from 'next/link';
import HouseIcon from '../../../public/HouseIcon';
import DateBlock from './dateBlock/DateBlock';


import SearchField from '../Header/SearchField/SearchField';
import classNames from 'classnames';
import BackArrow from './BackArrow/BackArrow';
import { Suspense} from 'react';
import { routes } from '@/app/routes';

interface TopSectionProps {
	isLink?: boolean;
	isSearchField?: boolean;
	isWhite?: boolean;
	showSubtitle?: boolean;
	country?: string;
}

const OldTopSection: React.FC<TopSectionProps> = ({
	isLink = false,
	isSearchField = false,
	isWhite = false,
	showSubtitle = true,
	country,
}) => {
	const headerClass = classNames(s.topSection, {
		[s.white]: isWhite,
	});
	const subtitle = routes.find((item) => item.path === country)?.title;

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

				{showSubtitle && (
					<h1 className={s.title}>
						{subtitle && subtitle.length > 0 ? subtitle : 'The official Your Price Booking blog'}
					</h1>
				)}
			</div>
			{isSearchField && (
				<div className={s.searchBox}>
						<Suspense fallback={null}>
						<SearchField inputClass={s.inputClass} />
						</Suspense>
				</div>
			)}
		</div>
	);
};

export default OldTopSection;