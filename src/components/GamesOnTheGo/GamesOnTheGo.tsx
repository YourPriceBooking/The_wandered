import s from './GamesOnTheGo.module.scss';
import BackArrow from '../TopSection/BackArrow/BackArrow';

export default function GamesOnTheGo() {

	return (
		<div className={s.gameSection} id="game-zone">
			<div className={s.arrowBack}>
				<BackArrow />
			</div>
			<div className={s.gameHeader}>
				<h2>Game Zone</h2>
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
			<div className="empty"></div> {/* just for styling */}
		</div>
	);
}
