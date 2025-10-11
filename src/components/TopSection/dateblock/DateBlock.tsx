'use client';
import s from './DateBlock.module.scss';
import { useEffect, useState } from 'react';

interface DateBlockProps {
  isWhite?: boolean;
  country?: string;
}

const DateBlock: React.FC<DateBlockProps> = ({ isWhite = false, country }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getLocaleFromCountry = (country: string = ''): string => {
    switch (country.toLowerCase()) {
      case 'ukraine':
        return 'uk-UA';
      case 'poland':
        return 'pl-PL';
      case 'australia':
        return 'en-AU';
      default:
        return 'en-US';
    }
  };

  const locale = getLocaleFromCountry(country);
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  let formattedDate = new Intl.DateTimeFormat(locale, {
    weekday: locale === 'uk-UA' ? undefined : 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    hour12: locale === 'en-AU' || locale === 'uk-UA' || locale === 'pl-PL' ? false : true,
    minute: '2-digit',
    timeZone: locale === 'en-AU' ? 'Australia/Sydney' : userTimeZone,
  }).format(currentDate);

  if (locale === 'uk-UA') {
    const weekdaysNominative = [
      'неділя',
      'понеділок',
      'вівторок',
      'середа',
      'четвер',
      'п’ятниця',
      'субота',
    ];

    const ukraineWeekday = weekdaysNominative[currentDate.getDay()];
    formattedDate = `${ukraineWeekday}, ${formattedDate.replace('р. о', '')}`;
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDate(new Date());
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);



  return (
    <time className={s.date} dateTime={currentDate.toISOString()}>
      {formattedDate}{locale === 'en-AU' ? ' AEST' : ''}
    </time>
  );
};

export default DateBlock;

