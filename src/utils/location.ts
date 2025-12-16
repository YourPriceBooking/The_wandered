export function getCurrentLocation(pathname: string): string {
	const segments = pathname.replace(/^\//, '').split('/');

	if (!segments[0] || segments[0] === '') {
		return 'home';
	}

	const knownCountries = ['ukraine', 'poland', 'usa', 'canada', 'australia', 'singapore'];

	if (knownCountries.includes(segments[0])) {
		return segments[0];
	}

	return 'home';
}
