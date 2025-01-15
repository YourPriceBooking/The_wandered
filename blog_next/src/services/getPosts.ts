import axios from '../utils/axios';
import { apiUrl } from '@/utils/url';
import { routes } from '@/app/routes';
import { postData } from '@/types/postTypes';

export async function getPosts({ page, country }: { page: number; country: string }) {
	try {
		const { data } = await axios.get(
			`${apiUrl}api/post/get-all?page=${page}&limit=7&typeOfPage=${country}`,
		);

		return data;
	} catch (error: any) {
		return 'err';
	}
}

export async function getAllPosts() {
	try {
		const requests = routes.map((page) =>
			axios.get(`${apiUrl}api/post/get-all${page.path ? `?typeOfPage=${page.path}` : ''}`, {
				withCredentials: true,
			}),
		);

		const responses = await Promise.all(requests);

		const allPosts: postData[] = responses.flatMap((response) => response.data.result);

		return allPosts || [];
	} catch (error: any) {
		console.log(error);
	}
}

export async function getPostsByCountry({ country }: { country: string }) {
	try {
		const { data } = await axios.get(`${apiUrl}api/post/get-all?typeOfPage=${country}`);

		return data.result;
	} catch (error: any) {
		console.log(error);
	}
}

export async function getPostsBySearch({ search }: { search: string }) {
	try {
		const { data } = await axios.get(`${apiUrl}api/post/search-query?search=${search}`);
		return data.result;
	} catch (error: any) {
		console.warn(error);
	}
}
