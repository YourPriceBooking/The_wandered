import Link from 'next/link';
import s from './JournalPostLink.module.scss';

interface JournalPostLink {
	link: string;
}
const JournalPostLink: React.FC<JournalPostLink> = ({ link }) => {
	return (
		<p className={s.link}>
			New page added{' '}
			<Link
				href={link}
				// className={s.linkText}
				target="blank"
				rel="nofollow noreferrer noopener"
			>
				{/* Link */}
				{link}
			</Link>
		</p>
	);
};

export default JournalPostLink;
