import AuthorsPage, { authorsMetadata } from '@/components/AuthorsPage/AuthorsPage';

export const dynamic = 'force-dynamic';
export const metadata = authorsMetadata('en');

export default function Page() {
  return <AuthorsPage language="en" />;
}
