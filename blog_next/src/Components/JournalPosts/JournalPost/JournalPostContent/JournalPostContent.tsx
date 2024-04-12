import s from './JournalPostContent.module.scss';

interface JournalPostContentProps {
	title: string;
	description: string;
	img?: string;
}

const mockLink =
	'https://s3-alpha-sig.figma.com/img/903e/1d4d/7f01e44a2a80ee0d23ff79a9c8489d8c?Expires=1713744000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=Xpc7sDYJfwrLFgmZjsucR6yIWQKUq8B3Prwmvuh2TWC6swdtQl0J7cv1MDagRXTM-dHwwtiOcRhlsJEsnI6qlxvXbWWSkni-6XZmqJuU3MXS0-dt4ulxwdIoNPPqW1x8lRjvjaVrASEGuz8DJimCIcNmAriaVJ5Bj7J9SvuY-we2IC924qBUtEirhNnVB4lPIoi8HIPhs-40Qg4KzQmuweM2MM4sW~0gwyM2fkzgFCeOd1Ngi4CWy1he5L8dHlkavQp5UbUO-LGOQRUQBp6MgXGvoCztW6OR3MgYj7-ebNa8MZdUyaCM65FDHPtjYnudju6TVn3HLpF4jqcOxVcr6g__';

const JournalPostContent: React.FC<JournalPostContentProps> = ({
	title,
	description,
	img = mockLink,
}) => {
	return (
		<div className={s.infoPostContent}>
			<article className={s.infoPostContentLink}>
				<h4 className={s.title}>{title}</h4>
				<p className={s.text}>{description}</p>
				<div className={s.line}></div>
			</article>
			<div className={s.infoPostContentImage}>
				<img src={img} alt="Picture of the post" className={s.infoPostContentImageContent} />
			</div>
			<h4 className={s.title}>{title}</h4>
		</div>
	);
};

export default JournalPostContent;
