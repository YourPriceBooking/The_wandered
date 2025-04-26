import React from 'react';
import s from './JournalPostDate.module.scss';

interface JournalPostDateProps {
	date: Date;
}
const JournalPostDate: React.FC<JournalPostDateProps> = ({ date }) => {
	return (
		<p className={s.date}>
			{date.toLocaleDateString('en-US', {
				month: 'long',
				day: 'numeric',
				year: 'numeric',
			})}
		</p>
	);
};

export default JournalPostDate;
