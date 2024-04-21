type additionalType = {
	title: string;
	text: string;
};
type postData = {
	_id: string;
	title: string;
	author: string;
	imageUrl: string[];
	description: string;
	articleUrl: string;
	publicationDate: string;
	slug: string;
};
export type postsDataType = {
	result: postData[];
};
