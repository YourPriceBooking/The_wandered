export function getReadableDate(date: string, country?: string) {
	const dateStr = date;
	const newDate = new Date(dateStr);
	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'long',
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

	return readableDate;
}
