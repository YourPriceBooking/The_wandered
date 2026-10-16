'use client';

import { useEffect, useId, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { PagesEnum } from '@/types/enums/pagesEnums';
import { routes } from '@/app/routes';
import SearchBtnIcon from './SearchBtnIcon/SearchBtnIcon';
import s from './SearchField.module.scss';

interface SearchFieldProps {
  className?: string;
  inputClass?: string;
  variant?: 'default' | 'hero';
  onClick?: () => void;
}

export default function SearchField({ inputClass, className = '', variant = 'default', onClick }: SearchFieldProps) {
  const searchParams = useSearchParams();
  const query = searchParams?.get('search') || '';
  const [value, setValue] = useState(query);
  const router = useRouter();
  const pathname = usePathname();
  const inputId = useId();
  useEffect(() => { setValue(query); }, [query]);
  const placeholder = routes.find((route) => route.path === pathname.split('/')[1])?.search || 'Search articles…';

  return (
    <form
      role="search"
      aria-label="Article search"
      className={`${s.searchBlock} ${variant === 'hero' ? s.hero : ''} ${inputClass || ''} ${className}`}
      onClick={onClick}
      onSubmit={(event) => {
        event.preventDefault();
        const search = value.trim();
        if (search) router.push(`/${PagesEnum.SEARCH_DATA_PAGE}?search=${encodeURIComponent(search)}`);
      }}
    >
      <label className={s.srOnly} htmlFor={inputId}>Search articles</label>
      <input id={inputId} className={s.input} type="search" name="search" placeholder={placeholder} value={value} onChange={(event) => setValue(event.target.value)} />
      <button className={s.searchButton} type="submit">
        <SearchBtnIcon fill="currentColor" stroke="currentColor" width={16} height={16} />
        <span>Search</span>
      </button>
    </form>
  );
}
