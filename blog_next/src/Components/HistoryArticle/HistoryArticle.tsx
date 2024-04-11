import Image from 'next/image';

import s from './HistoryArticle.module.scss';
import Link from 'next/link';

interface ArticleProps {
	title: string;
	link: string;
	text: string;
	date: string;
}

export default function HistoryArticle({ title, link, text, date }: ArticleProps) {
	return (
		<div className={s.articleBlock}>
			<div className={s.infoPostContent}>
				<div className={s.infoPostContentLink}>
					<svg
						className={s.icon}
						width="35"
						height="38"
						viewBox="0 0 38 38"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M12.6665 20.5834H25.3332"
							stroke="#4C4C4C"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<path
							d="M12.6665 26.9167H25.3332"
							stroke="#4C4C4C"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M9.49992 4.75H24.0223C24.8614 4.75 25.6673 5.08408 26.2611 5.67783L30.7388 10.1555C31.3325 10.7493 31.6666 11.5552 31.6666 12.3943V30.0833C31.6666 31.8329 30.2495 33.25 28.4999 33.25H9.49992C7.75034 33.25 6.33325 31.8329 6.33325 30.0833V7.91667C6.33325 6.16708 7.75034 4.75 9.49992 4.75Z"
							stroke="#4C4C4C"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<path
							d="M31.6667 12.6667H25.3333C24.4593 12.6667 23.75 11.9573 23.75 11.0833V4.75"
							stroke="#4C4C4C"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<path
							d="M12.6665 14.2499H17.4165"
							stroke="#4C4C4C"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					<p className={s.link}>
						New page added{' '}
						<Link
							href={link}
							// className={s.linkText}
							target="blank"
							rel="nofollow noreferrer noopener"
						>
							{/* Link */}
							{link}
						</Link>
					</p>
				</div>

				<p className={s.date}>{date}</p>
			</div>
			<div className={s.infoPostContent}>
				<article className={s.infoPostContentLink}>
					<h4 className={s.title}>{title}</h4>
					<p className={s.text}>{text}</p>
					<div className={s.line}></div>
				</article>
				<div className={s.infoPostContentImage}>
					<img
						src="https://s3-alpha-sig.figma.com/img/903e/1d4d/7f01e44a2a80ee0d23ff79a9c8489d8c?Expires=1713744000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=Xpc7sDYJfwrLFgmZjsucR6yIWQKUq8B3Prwmvuh2TWC6swdtQl0J7cv1MDagRXTM-dHwwtiOcRhlsJEsnI6qlxvXbWWSkni-6XZmqJuU3MXS0-dt4ulxwdIoNPPqW1x8lRjvjaVrASEGuz8DJimCIcNmAriaVJ5Bj7J9SvuY-we2IC924qBUtEirhNnVB4lPIoi8HIPhs-40Qg4KzQmuweM2MM4sW~0gwyM2fkzgFCeOd1Ngi4CWy1he5L8dHlkavQp5UbUO-LGOQRUQBp6MgXGvoCztW6OR3MgYj7-ebNa8MZdUyaCM65FDHPtjYnudju6TVn3HLpF4jqcOxVcr6g__"
						alt="Picture of the post"
						className={s.infoPostContentImageContent}
					/>
				</div>
				<h4 className={s.title}>{title}</h4>
			</div>
		</div>
	);
}
