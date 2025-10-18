'use client';
import s from './GamesOnTheGo.module.scss';
import BackArrow from '../TopSection/BackArrow/BackArrow';
import { useEffect, useRef } from 'react';

export default function GamesOnTheGo({ isScrollIntoView }: { isScrollIntoView?: boolean }) {
	const updateURL = () => {
		window.history.replaceState(
			{},
			'',
			`/daily-journal-of-your-price-booking-service-history?page=${'game-zone'}`,
		);
	};
	useEffect(() => {
		if (!isScrollIntoView) return;

		const el = document.getElementById('game-zone');
		el?.scrollIntoView({ behavior: 'smooth' });
	}, [isScrollIntoView]);

	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!ref.current) return;

		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				updateURL(); // користувач дійшов до елемента
			}
		});

		observer.observe(ref.current);

		return () => observer.disconnect();
	}, [updateURL]);

	return (
		<div className={s.gameSection} id="game-zone">
			<div className={s.arrowBack}>
				<BackArrow />
			</div>
			<div className={s.gameHeader}>
				<h1>Game Zone</h1>
			</div>
			<iframe
				title="Embedded Example"
				sandbox="allow-scripts allow-same-origin"
				allow="fullscreen"
				referrerPolicy="no-referrer"
				src="https://gamesnacks.com/embed/"
				allowFullScreen
				loading="lazy"
			></iframe>
			<div className="empty" ref={ref}></div> {/* just for styling */}
		</div>
	);
}
