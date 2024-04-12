import { JournalPostType } from '@/types/historyTypes';
import JournalPost from './JournalPost/JournalPost';

interface JournalPostsProps {
	posts: JournalPostType[];
}

const JournalPosts: React.FC<JournalPostsProps> = ({ posts }) => {
	return posts.map((post: JournalPostType) => <JournalPost post={post} />);
};

export default JournalPosts;
