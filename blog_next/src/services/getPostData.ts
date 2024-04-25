import { apiUrl } from '@/utils/url';
import axios from '../utils/axios';

export async function getPostData({ postId }: { postId: string }) {
	try {
		const { data } = await axios.get(`${apiUrl}api/post/get-post-by-id?id=${postId}`);

		return data.result[0];
	} catch (error: any) {
		console.log(error);
	}
}
