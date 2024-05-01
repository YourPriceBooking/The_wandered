import { apiUrl } from '@/utils/url';
import axios from '../utils/axios';

export async function getPostData({ pageLink }: { pageLink: string }) {
	try {
		const { data } = await axios.get(
			`${apiUrl}api/post/get-by-url?articleUrl=https://www.thewandered.com/${pageLink}`,
		);
		return data.result;
	} catch (error: any) {
		console.log(error);
	}
}
