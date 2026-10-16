import React from 'react';
import style from './GptItiBanner.module.scss';

const GptItiBanner: React.FC = () => {
	return (
		<aside className={style.wrapper} aria-label="Discover GPTiti">
			<a
				href="https://gptiti.com/"
				target="_blank"
				rel="noopener noreferrer"
				className={style.banner}
				aria-label="Explore GPTiti — premium GPT models without a subscription (opens in a new tab)"
			>
				<div className={style.topline}>
					<span className={style.brand}>GPT<span>iti</span></span>
					<span className={style.label}>Your everyday AI</span>
				</div>
				<div className={style.content}>
					<div className={style.copy}>
						<h2 className={style.title}>Premium GPT.<br />No subscription.</h2>
						<p className={style.description}>
							Write, translate, explore ideas, and plan your next trip. Choose a model and pay as you go.
						</p>
						<span className={style.cta}>
							Explore GPTiti <span className={style.arrow} aria-hidden="true">↗</span>
						</span>
					</div>
					<div className={style.preview}>
						<p className={style.label}>Example conversation</p>
						<p className={style.question}>
							Help me compare farm stays for a quiet weekend in nature.
						</p>
						<p className={style.answer}>
							<strong>Start with what matters to you.</strong>
							Location, budget, wellness options, and how much farm life you want to experience.
						</p>
					</div>
				</div>
				<ul className={style.benefits}>
					<li>No monthly fee</li>
					<li>Pay with tokens</li>
					<li>Tokens never expire</li>
				</ul>
			</a>
		</aside>
	);
};

export default GptItiBanner;
