import { apiUrl } from '@/utils/url';
import axios from '../utils/axios';

export async function getPostData({ pageLink, country }: { pageLink: string; country?: string }) {
	try {
		let fullPageLink = '';

		if (!country || country === 'home') {
			fullPageLink = pageLink;
		} else {
			fullPageLink = `${country}/${pageLink}`;
		}

		const { data } = await axios.get(
			`${apiUrl}api/post/get-by-url?articleUrl=https://www.thewandered.com/${fullPageLink}`,
		);

		return data.result;
	} catch (error: any) {
		console.log(error);
	}
}
