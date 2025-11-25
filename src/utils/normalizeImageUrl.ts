export type ImageUrlItem = {
	url: string;
	id: string | null;
	context: {
		alt: string | null;
		caption: string | null;
	};
};

export type ImageUrlInput = string | ImageUrlItem;

export function normalizeImageUrl(imageUrl: ImageUrlInput[] | undefined | null): ImageUrlItem[] {
	if (!imageUrl || !Array.isArray(imageUrl)) {
		return [];
	}

	return imageUrl.map((img) => {
		if (typeof img === 'string') {
			return {
				url: img,
				id: null,
				context: {
					alt: null,
					caption: null,
				},
			};
		}
		if (typeof img === 'object' && img !== null) {
			return {
				url: (img as any).url || '',
				id: (img as any).id ?? null,
				context: {
					alt: (img as any).context?.alt ?? null,
					caption: (img as any).context?.caption ?? null,
				},
			};
		}
		return {
			url: '',
			id: null,
			context: {
				alt: null,
				caption: null,
			},
		};
	});
}

export function getImageUrl(imageUrl: ImageUrlItem[], index: number = 0): string | null {
	if (!imageUrl || imageUrl.length === 0 || !imageUrl[index]) {
		return null;
	}
	return imageUrl[index].url || null;
}
