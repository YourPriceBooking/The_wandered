import { apiUrl } from '@/utils/url';
import { AsyncThunk, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../utils/axios';
import { postsDataType } from '@/types/postTypes';

const POSTS_URL =
	'https://server-your-price-booking.onrender.com/api/acsess-to-admin/get-titles-and-description';

export async function getPosts({ page }: { page: number }) {
	try {
		const { data } = await axios.get(`${apiUrl}api/post/get-all?page=${page}&limit=7`, {
			headers: {
				'Cache-Control': 'no-cache, no-store, must-revalidate',
				Pragma: 'no-cache',
				Expires: '0',
			},
		});

		return data;
	} catch (error: any) {
		return 'err';
	}
}
export async function getAllPosts() {
	try {
		const { data } = await axios.get(`${apiUrl}api/post/get-all?`, {
			headers: {
				'Cache-Control': 'no-cache, no-store, must-revalidate',
				Pragma: 'no-cache',
				Expires: '0',
			},
		});

		return data;
	} catch (error: any) {
		return 'err';
	}
}

export async function getPostsBySearch({ search }: { search: string }) {
	try {
		const { data } = await axios.get(`${apiUrl}api/post/search-query?search=${search}`);
		return data.result;
	} catch (error: any) {
		console.log(error);
	}
}
