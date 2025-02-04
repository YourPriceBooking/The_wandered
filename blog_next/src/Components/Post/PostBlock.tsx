import React from "react";
import HouseIcon from "../../../public/HouseIcon";
import style from "./PostBlock.module.scss";
import Image from "next/image";
import SuggestedArticles from "../SuggestedArticles/SuggestedArticles";
import { getPostData } from '@/services/getPostData';
import { postData, PostPageProps } from '@/types/postTypes';
import { getReadableDate } from '@/services/getReadableDate';
import { notFound, useParams } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import PageViewes from "../PageViewes";
import { dataMarkup } from "./helpers/dataMarkup";

const PostBlock: React.FC<PostPageProps> = async ({ country, postPageLink }) => {
	if (!country || !postPageLink) return notFound()
	const post = await getPostData({ pageLink: String(postPageLink), country });
	if (!post) return notFound()
	const data = await dataMarkup(post)
	if (!data) return notFound()
	let readableDate = '';
	if (data?.publicationDate) {
		readableDate = getReadableDate(data?.publicationDate, country);
	}
	return (<>
	<div className={style.post__img}>
		{data.imageUrl.length > 0 ? (
			<Image src={data.imageUrl[0]}
  					 layout="responsive"
 					 width={100}
 					 height={100}
 					 alt="article-image"
  					 className={style.post__image}/>)
		: (<div className={style.post__img_bg}>
			<HouseIcon color="white"/>
			</div>)}
	</div>
	<div className={style.post__content}>
					<h1 className={style.post__title}>{data.heading}</h1>
					<div className={style.post__date_public}>
						 <p>{readableDate}</p>
					</div>
					<div className={style.viewCounter}>
						<PageViewes country={country} postPageLink={postPageLink} />
						<img src="/eye.png" alt="views icon" />
					</div>
					<p className={style.post__author}>{data.author}</p>
					<div
						className={style.post__markup}
						dangerouslySetInnerHTML={{
							__html: DOMPurify.sanitize(data.markup, {
								ADD_ATTR: ['target', 'allowfullscreen', 'frameborder', 'src'],
								ADD_TAGS: ['iframe'],
							}),
						}}
					></div>
	</div>
	<SuggestedArticles data={data} country={country} />
	</>)
}


export default PostBlock;


