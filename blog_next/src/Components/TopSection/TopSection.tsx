import Image from 'next/image';
import s from './TopSection.module.scss';
import logo from './../../../public/house-icon.svg';
import Link from 'next/link';
import SearchField from '../Header/SearchField/SearchField';
import { Suspense } from 'react';
import Loading from '@/app/loading';

interface TopSectionProps {
	isLink?: boolean;
	isSearchField?: boolean;
}

const TopSection: React.FC<TopSectionProps> = ({ isLink = false, isSearchField = false }) => {
	return (
		<div className={s.topSection}>
			{isLink ? (
				<Link href="/">
					<Image
						src={logo}
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
			<div className={s.mainTextBlock}>
				<h2 className={s.mainTitle}>the wandered</h2>
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
