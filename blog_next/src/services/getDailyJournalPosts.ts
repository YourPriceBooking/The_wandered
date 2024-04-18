const revalidateTime = 86400;

export async function getDailyJournalPosts() {
	const res = await fetch(
		'https://ypbooking.chost.com.ua/api/acsess-to-admin/get-titles-and-description',
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
