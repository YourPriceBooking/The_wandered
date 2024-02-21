import Link from 'next/link';
import s from './Header.module.scss';

export default function Header() {
  return (
    <header className={s.header}>
      <div className={s.headerContent}>
        <nav>{/* <Link href="#">Header Link</Link> */}</nav>
        <div className={s.searchBlock}>
          <form action="" method="post" className={s.search}>
            <input type="search" name="" placeholder="Search article" className={s.input} />
            <input type="submit" name="" value="" className={s.submit} />
          </form>
        </div>
      </div>
    </header>
  );
}
