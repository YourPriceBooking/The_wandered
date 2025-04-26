"use client"
import s from './ScrollToTop.module.scss';
import React, { useEffect, useState } from 'react';

function ScrollToTop() {
	const [isVisible, setIsVisible] = useState(false);

	const toggleVisibility = () => {
		if (window.scrollY > 300) {
			setIsVisible(true);
		} else {
			setIsVisible(false);
		}
	};

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth',
		});
	};

	useEffect(() => {
		window.addEventListener('scroll', toggleVisibility);

		return () => {
			window.removeEventListener('scroll', toggleVisibility);
		};
	}, []);

	return (
		<>
			{isVisible && (
				<div onClick={scrollToTop} className={s.topBtn}>
					<img src="/arrow-top.png" alt="arrow icon to top" />
				</div>
			)}
		</>
	);
}

export default ScrollToTop;
