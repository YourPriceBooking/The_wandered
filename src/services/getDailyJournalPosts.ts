import { daysSinceDate } from './daysCounter';

const revalidateTime = 86400;

export async function getDailyJournalPosts(page: number = daysSinceDate() * 5, limit: number = 4) {
	const res = await fetch(
		`https://ypbooking.chost.com.ua/api/acsess-to-admin/get-titles-and-description?page=${page}&limit=${limit}`,
		{
			next: {
				revalidate: revalidateTime,
			},
		},
	);
	if (!res.ok) {
		throw new Error('Failed to fetch data');
	}
	return res.json();
}
