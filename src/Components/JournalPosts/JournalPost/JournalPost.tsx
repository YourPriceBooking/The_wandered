import s from './JournalPost.module.scss';
import { JournalPostType } from '@/types/historyTypes';
import JournalPostIcon from './JournalPostIcon/JournalPostIcon';
import JournalPostLink from './JournalPostLink/JournalPostLink';
import JournalPostContent from './JournalPostContent/JournalPostContent';

export interface JournalPost {
	post: JournalPostType;
}

const JournalPost: React.FC<JournalPost> = ({ post }) => {
	return (
		<div className={s.articleBlock}>
			<div className={s.headerPostContent}>
				<div className={s.headerPostContentLink}>
					<JournalPostIcon />
					<JournalPostLink link={post.url} />
				</div>
			</div>
			<JournalPostContent
				title={post.title}
				description={post.description}
				img={post.linkOnPhoto}
			/>
		</div>
	);
};

export default JournalPost;
