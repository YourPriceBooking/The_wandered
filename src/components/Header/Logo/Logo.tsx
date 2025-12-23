import Link from 'next/link';
import s from './Logo.module.scss';
import HouseIcon from '../../../../public/HouseIcon';

const Logo: React.FC = () => {
	return (
		<Link href="/" className={s.logo}>
			<HouseIcon />
		</Link>
	);
};

export default Logo;
