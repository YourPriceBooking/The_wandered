/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	experimental: {
		appDir: true, // Дозволяє використовувати нову директорію app
	},
	images: {
		domains: ['s3-alpha-sig.figma.com', 'res.cloudinary.com', 'www.thewandered.com'],
	},
};

export default nextConfig;
