import s from './JournalPostContent.module.scss';

interface JournalPostContentProps {
	title: string;
	description: string;
	img: string;
}

const notFoundImg =
	'https://img.freepik.com/premium-vector/error-404-found-glitch-effect_8024-4.jpg?w=1380';

const JournalPostContent: React.FC<JournalPostContentProps> = ({ title, description, img }) => {
	return (
		<div className={s.infoPostContent}>
			<article className={s.infoPostContentLink}>
				<h4 className={s.title}>{title}</h4>
				<p className={s.text}>{description}</p>
				<div className={s.line}></div>
			</article>
			<div className={s.infoPostContentImage}>
				<img
					src={img || notFoundImg}
					alt={title || 'Picture of the post'}
					className={s.infoPostContentImageContent}
					loading="lazy"
				/>

				<noscript>
					<img
						src={img || notFoundImg}
						alt={title || 'Picture of the post'}
						className={s.infoPostContentImageContent}
					/>
				</noscript>
			</div>
			<h4 className={s.title}>{title}</h4>
		</div>
	);
};

export default JournalPostContent;
