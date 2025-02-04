export type postData = {
	_id: string;
	title: string;
	author: string;
	imageUrl: string[];
	country: string;
	description: string;
	articleUrl: string;
	publicationDate: string;
	changeDate: string;
	slug: string;
	markup: string;
	heading: string;
};

export type postsDataType = {
	result: postData[];
	total: number;
};

export interface PostPageProps {
	country: string;
	postPageLink: string
}