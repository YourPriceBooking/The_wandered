import React from 'react';
import style from './GptItiBanner.module.scss';
import Link from 'next/link';
import Image from 'next/image';

const GptItiBanner: React.FC = () => {
	return (
		<Link href="https://www.gptiti.com/" target="blank" className={style.banner}>
			<div className={style.head}>
				<Image
					src="/GptItiLogo.svg"
					alt="GPT ITI Logo"
					width={165}
					height={130}
					priority
					className={style.logo}
				/>
				<span className={style.title}>Premium GPT access for free </span>
			</div>
			<div className={style.body}>
				<div className={style.textAnswer}>
					<span className={style.AiAnswer}>How can I help you today? </span>
					<div className={style.help} >
						<span >Free access to premium GPT models. No subscriptions.  </span>
					</div>
				</div>
				<div className={style.wrapperQuestion}>	
					<input className={style.textQuestion} placeholder="Ask anything..." />
					<div className={style.pressEnter}>
						<Image
							src="/customEnter.svg"
						alt="GPT ITI Logo"
						width={85}
						height={16}
						priority
						className={style.logo}
					/>
					</div>
					
				</div>
				
			</div>
			<div className={style.footer}>
				<span className={style.disclaimer}>GPTiti — access premium GPT models for free</span>
			</div>
		</Link>
	);
};

export default GptItiBanner;
