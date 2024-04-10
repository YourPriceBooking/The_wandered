const POSTS_URL =
	'https://server-your-price-booking.onrender.com/api/acsess-to-admin/get-titles-and-description';

export default async function getPosts() {
	const res = await fetch(POSTS_URL);

	if (!res.ok) {
		throw new Error('Failed to fetch data');
	}

	return res.json();
}
