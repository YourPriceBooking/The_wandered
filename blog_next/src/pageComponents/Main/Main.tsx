import Image from 'next/image';
import s from './Main.module.scss';
import logo from '../../../public/house-icon.png';

export default function Main() {
  return (
    <main className={s.main}>
      <div className={s.topSection}>
        <Image src={logo} width={50} height={45} alt="house-icon" className={s.logo}></Image>
        <div className={s.mainTextBlock}>
          <h1 className={s.mainTitle}>wandered</h1>
          <p className={s.subtitle}>The official Your Price Booking blog</p>
        </div>
      </div>
      <div className={s.contentSection}>Article</div>
    </main>
  );
}
