
import s from './ArticlePage.module.scss';
import ScrollToTop from '../ScrollToTop/ScrollToTop';
import Banner from '../banner/Banner';
import PostBlock from '../Post/PostBlock';
//import { GetServerSideProps } from 'next';



export default function ArticlePage({ country = 'home' }: { country?: string }) {
  return (
    <article className={s.postBlock}>
      <PostBlock country={country} />
      <Banner />
      <ScrollToTop />
    </article>
  );
}


// import { useParams } from 'next/navigation';
// import { getPostData } from '@/services/getPostData';
// import { useEffect, useState } from 'react';
// import { postData } from '@/types/postTypes';
 // const { postPageLink } = useParams();
 // const [post, setPost] = useState<postData | null>(null);



//   const editingHTMLData = (htmlStr: string) => {
//     const doc = new DOMParser().parseFromString(htmlStr, 'text/html');
//     doc.querySelectorAll('[style]').forEach(el => el.removeAttribute('style'));
//     doc.querySelectorAll('h1, h2, h3, h4, h5, h6, img, iframe, blockquote').forEach(el => {
//       if (!el.previousElementSibling || el.previousElementSibling.tagName !== 'P') {
//         el.insertAdjacentHTML('beforebegin', '<p><br/></p>');
//       }
//     });
//     doc.querySelectorAll('blockquote').forEach(blockquote => {
//       const parts = blockquote.innerHTML.split('—');
//       if (parts.length > 1) {
//         blockquote.innerHTML = `${parts.slice(0, -1).join('—')} — <span class="author">${parts.pop()?.trim()}</span>`;
//       }
//     });
//     return doc.body.innerHTML;
//   };

//   useEffect(() => {
//     (async () => {
//       const data = await getPostData({ pageLink: String(postPageLink), country });
//       const updatedMarkup = editingHTMLData(data.markup)
//         .split('imgUrlByIdx')
//         .reduce((acc, part, i) => acc + (data.imageUrl?.[i] || '') + part, '');

//       // setPost({ ...data, markup: updatedMarkup });
//     })();
//   }, [postPageLink, country]);
// export const getServerSideProps: GetServerSideProps = async (context) => {
// 	const { country } = context.params || { country: 'home' };

// 	return {
// 	  props: { country },
// 	};
//  };
