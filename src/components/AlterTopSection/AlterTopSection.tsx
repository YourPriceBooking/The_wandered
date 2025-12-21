
import s from './AlterTopSection.module.scss';

import classNames from 'classnames';
import { routes } from '@/app/routes';
import ViewCounter from '../ViewCounter/ViewCounter';
import WhiteUpPointer from '../WhiteUpPointer/WhiteUpPointer';

interface TopSectionProps {
	isLink?: boolean;
	isSearchField?: boolean;
	isWhite?: boolean;
	country?: string;
	isNarrow?: boolean;
	viewPath?: string;
}

const AlterTopSection: React.FC<TopSectionProps> = ({
	isLink = false,
	isSearchField = false,
	isWhite = false,
	isNarrow = true,
	country,
	viewPath,
}) => {

	const subtitle = routes.find((item) => item.path === country)?.title;

	return (
		<div className={s.topSection}>
			

			<div className={classNames(s.topBlock, { [s.topBlockNarrow]: isNarrow })}>

				
				<div className={s.logoBlock}>
					

					<h2 className={s.topTitle}>the wandered</h2>
				</div>

				<ViewCounter viewPath={viewPath} prefix="we have " />
			</div>
			<div className={s.botBlock}>
				<div className={s.logoBlock}>
					<h2 className={s.mainTitle}>UNCHARTED PLANET</h2>
				</div>

				<span className={s.mainText}>
					{'Ancient structures that challenge our understanding '}
				</span>
				<span className={s.mainText}>
					{'of history, engineering, and human capability '}
				</span>
				<div className={s.topFooter}>
					<div className={s.footerLeft}>29.9792° N — 31.1342° E </div>
					<WhiteUpPointer className={classNames(s.pointerIcon, s.footerPointer)}/>
					<div className={s.footerRight}>field notes / open hypotheses </div>
				</div>
				<div className={s.botVeil}/>
			</div>
		</div>
	);
};

export default AlterTopSection;
