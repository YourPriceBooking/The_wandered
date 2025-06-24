export function getArticleDate(date: string, country?: string) {
	const dateStr = date;
	const newDate = new Date(dateStr);
	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	};

	const getLocaleByCountry = (country: string | undefined): string => {
		switch (country?.toLowerCase()) {
			case 'poland':
				return 'pl-PL';
			case 'ukraine':
				return 'uk-UA';
			case 'canada':
			case 'usa':
			case 'home':
				return 'en-US';
			default:
				return 'en-US';
		}
	};

	const locale = getLocaleByCountry(country);
	const readableDate = newDate.toLocaleDateString(locale, options);

	if (locale === 'pl-PL' || locale === 'uk-UA') {
		const day = newDate.getDate();
		const month = newDate.toLocaleString(locale, { month: 'short' });
		const year = newDate.getFullYear();
		return `${day} ${month[0].charAt(0).toUpperCase() + month.slice(1)} ${year}`;
	} else {
		return readableDate;
	}

}
