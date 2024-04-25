type additionalType = {
	title: string;
	text: string;
};
export type postData = {
	_id: string;
	title: string;
	author: string;
	imageUrl: string[];
	description: string;
	articleUrl: string;
	publicationDate: string;
	changeDate: string;
	slug: string;
	markup: string;
};
export type postsDataType = {
	result: postData[];
};
