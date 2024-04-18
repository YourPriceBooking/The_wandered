const revalidateTime = 30;
const url = 'https://ypbooking.chost.com.ua/api/acsess-to-admin/get-titles-and-description';

export async function getDailyJournalPosts(page: number, limit: number) {
	const res = await fetch(
		`https://ypbooking.chost.com.ua/api/acsess-to-admin/get-titles-and-description?page=${page}&limit=${limit}`,
		{
			mode: 'no-cors',
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
