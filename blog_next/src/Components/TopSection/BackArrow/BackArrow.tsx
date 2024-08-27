'use client';
import React from 'react';
import s from './BackArrow.module.scss';
import BackArrowIcon from './BackArrowIcon/BackArrowIcon';

interface BackArrowProps {
	className?: string;
}
const BackArrow: React.FC<BackArrowProps> = ({}) => {
	const handleGoBack = () => {
		window.history.back();
	};
	return (
		<div onClick={handleGoBack} className={s.backArrowBox}>
			<BackArrowIcon />
		</div>
	);
};

export default BackArrow;
