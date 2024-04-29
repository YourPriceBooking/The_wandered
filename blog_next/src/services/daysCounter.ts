export function daysSinceDate(): number {
	const initialDateString: string = 'Mon, Apr 28, 2024, 09:49:48 AM GMT+3';
	const initialDate: Date = new Date(initialDateString);
	const currentDate: Date = new Date();
	const diffInMilliseconds: number = currentDate.getTime() - initialDate.getTime();
	const diffInDays: number = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

	return diffInDays;
}
