'use client';

import React from 'react';
import s from './OrangeSpan.module.scss';

type Props = {
  text: string;
  className?: string;
};

const OrangeSpan: React.FC<Props> = ({ text, className }) => {

  return (
    <div className={s.countWrapper} title="views">
     {text}
      <div className={s.lightVeil} />
    </div>
  );
};

export default OrangeSpan;