import { privatePolicyData } from '@/defaultData/privatePolicyData';
import { Metadata } from 'next';
import { format } from 'date-fns';
import s from './privatePolicyPage.module.scss';

export const metadata: Metadata = {
	title: privatePolicyData.metaTitle,
	description: privatePolicyData.metaDescription,
};

export default function PrivatePolicy() {
	return (
		<main className={s.main}>
			<section className={s.section}>
				<div className={s.container}>
					<h1>
						{privatePolicyData.title.map((item, index) => (
							<span
								key={index}
								style={{
									color: privatePolicyData.titleColors[index],
									fontWeight: privatePolicyData.titleFontWeight[index],
								}}
							>
								{`${item} `}
							</span>
						))}
					</h1>
					<p>
						{`${privatePolicyData.revisionDated.text} ${format(
							privatePolicyData.revisionDated.date,
							'MMMM dd, yyyy',
						)}`}
					</p>
					<ul>
						{privatePolicyData.articles.map(({ subTitle, paragraphText }, index) => (
							<li key={subTitle}>
								<h2>{subTitle}</h2>
								{Array.isArray(paragraphText) ? (
									paragraphText.map((item) => <p key={item}>{item}</p>)
								) : (
									<p>{paragraphText}</p>
								)}
								<p></p>
							</li>
						))}
					</ul>
				</div>
			</section>
		</main>
	);
}
