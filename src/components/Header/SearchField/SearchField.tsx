'use client';

import { useEffect, useId, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { PagesEnum } from '@/types/enums/pagesEnums';
import { getSearchCopy } from '@/defaultData/searchCopy';
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
  const copy = getSearchCopy(pathname.split('/')[1]);

  return (
    <form
      role="search"
      aria-label={copy.label}
      lang={copy.lang}
      className={`${s.searchBlock} ${variant === 'hero' ? s.hero : ''} ${inputClass || ''} ${className}`}
      onClick={onClick}
      onSubmit={(event) => {
        event.preventDefault();
        const search = value.trim();
        if (search) router.push(`/${PagesEnum.SEARCH_DATA_PAGE}?search=${encodeURIComponent(search)}`);
      }}
    >
      <label className={s.srOnly} htmlFor={inputId}>{copy.label}</label>
      <input id={inputId} className={s.input} type="search" name="search" placeholder={copy.placeholder} value={value} onChange={(event) => setValue(event.target.value)} />
      <button className={s.searchButton} type="submit">
        <SearchBtnIcon fill="currentColor" stroke="currentColor" width={16} height={16} />
        <span>{copy.button}</span>
      </button>
    </form>
  );
}
