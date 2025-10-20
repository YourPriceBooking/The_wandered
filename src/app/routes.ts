import { routeType } from '@/types/routeType';

export const routes: routeType[] = [
	{
		name: 'Home',
		path: '',
		title: '',
	},
	{
		name: 'Ukraine',
		path: 'ukraine',
		title: 'Україна',
		readmore: 'ЧИТАТИ ДАЛІ',
		search: 'Пошук статті',
	},
	{
		name: 'Poland',
		path: 'poland',
		title: 'Polska',
		readmore: 'CZYTAJ WIĘCEJ',
		search: 'Wyszukaj artykuł',
	},
	{
		name: 'USA',
		path: 'usa',
		title: 'USA',
	},
	{
		name: 'Canada',
		path: 'canada',
		title: 'Canada',
	},
	{
		name: 'Australia',
		path: 'australia',
		title: 'Australia',
	},
	{
		name: 'Singapore',
		path: 'singapore',
		title: 'Explore Singapore: Travel Tips, Hidden Gems & Booking Insights',
	},
	{
		name: 'Travel\u00A0Resources',
		path: 'travel-resources',
		title: '',
	},
];
