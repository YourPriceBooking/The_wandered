import Image from 'next/image';
import s from './TopSection.module.scss';
import logo from './../../../public/house-icon.svg';
import logoOrange from './../../../public/houseIconOrange.svg';
import Link from 'next/link';
import SearchField from '../Header/SearchField/SearchField';
import { Suspense } from 'react';
import Loading from '@/app/loading';
import classNames from 'classnames';
import BackArrow from './BackArrow/BackArrow';

interface TopSectionProps {
	isLink?: boolean;
	isSearchField?: boolean;
	isWhite?: boolean;
}

const TopSection: React.FC<TopSectionProps> = ({
	isLink = false,
	isSearchField = false,
	isWhite = false,
}) => {
	const headerClass = classNames(s.topSection, {
		[s.white]: isWhite,
	});
	return (
		<div className={headerClass}>
			{isLink && <BackArrow />}

			<div className={s.mainTextBlock}>
				<div className={s.logoBlock}>
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

				<h1 className={s.title}>The official Your Price Booking blog</h1>
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
