
import s from './TopSection.module.scss';
import DateBlock from './dateblock/DateBlock';
import Image from 'next/image';
import classNames from 'classnames';
import ViewCounter from '../ViewCounter/ViewCounter';
import OrangeSpan from '../OrangeSpan/OrangeSpan';
import { count } from 'console';

interface TopSectionProps {
	isLink?: boolean;
	isSearchField?: boolean;
	isWhite?: boolean;
	country?: string;
	isNarrow?: boolean;
	viewPath?: string;
	countryTitle?: string;
	countryDescription?: string;
}

const TopSection: React.FC<TopSectionProps> = ({
	isWhite = false,
	isNarrow = true,
	country,
	viewPath,
	countryTitle = 'some country',
	countryDescription = 'country description',
}) => {
	

	return (
		<div className={s.topSection}>
			

			<div className={classNames(s.topBlock, { [s.topBlockNarrow]: isNarrow })}>
				<div style={{ display: 'flex', justifyContent: 'center',width: '100%' }}>
				<DateBlock isWhite={isWhite} country={country} />
				</div>
				<div className={s.nameBlock}>	
					<div className={s.logoBlock}>
						
					<Image src="/brandMarkTop.svg" alt="brand mark" width={18} height={18} className={s.brandMark} />
						<h2 className={s.topTitle}>the wandered</h2>
					</div>
					{country && <ViewCounter country={country} viewPath={viewPath} prefix="we have "  />}
					
				</div>
				<OrangeSpan text={'section'} />
					<div className={ classNames(s.logoBlock, s.countryLogoBlock)}>
					<h2 className={s.mainTitle}>{countryTitle}</h2>
				</div>

				<span className={s.mainText}>
					{countryDescription}
				</span>
				
				<img src="/countryLine.svg" alt="brand mark" className={s.countryLineMark} />
			</div>
			<div className={s.botBlock}>
			
				<div className={s.botVeil}/>
			</div>
		</div>
	);
};

export default TopSection;
