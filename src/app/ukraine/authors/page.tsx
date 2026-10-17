import AuthorsPage, { authorsMetadata } from '@/components/AuthorsPage/AuthorsPage';

export const dynamic = 'force-dynamic';
export const metadata = authorsMetadata('uk');

export default function Page() {
  return <AuthorsPage language="uk" />;
}
