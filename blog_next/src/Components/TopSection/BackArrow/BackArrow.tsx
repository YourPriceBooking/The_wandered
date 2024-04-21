import React from 'react';
import s from './BackArrow.module.scss';
import BackArrowIcon from './BackArrowIcon/BackArrowIcon';
import Link from 'next/link';

interface BackArrowProps {
	className?: string;
}
const BackArrow: React.FC<BackArrowProps> = ({}) => {
	return (
		<Link href="/" className={s.backArrowBox}>
			<BackArrowIcon />
		</Link>
	);
};

export default BackArrow;
