import s from './JournalPostContent.module.scss';

interface JournalPostContentProps {
	title: string;
	description: string;
	img: string;
  headingLevel?: 2 | 3;
}

const notFoundImg =
	'https://img.freepik.com/premium-vector/error-404-found-glitch-effect_8024-4.jpg?w=1380';

const JournalPostContent: React.FC<JournalPostContentProps> = ({ title, description, img, headingLevel = 2 }) => {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
	return (
		<div className={s.infoPostContent}>
			<article className={s.infoPostContentLink}>
				<Heading className={s.title} data-journal-title>{title}</Heading>
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
			<p className={s.title} aria-hidden="true">{title}</p>
		</div>
	);
};

export default JournalPostContent;
