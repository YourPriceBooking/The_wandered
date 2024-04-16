import Link from 'next/link';
import s from './Header.module.scss';
import Logo from './Logo/Logo';
import SearchField from './SearchField/SearchField';

export default function Header() {
	return (
		<header className={s.header}>
			<div className={s.headerContent}>
				<Logo />
				<SearchField />
			</div>
		</header>
	);
}
