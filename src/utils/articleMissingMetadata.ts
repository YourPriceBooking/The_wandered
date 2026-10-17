import type { Metadata } from 'next';
import { routeStateCopy } from '@/defaultData/routeStateCopy';

export function articleMissingMetadata(country: string): Metadata {
  const copy = routeStateCopy[country === 'ukraine' ? 'uk' : country === 'poland' ? 'pl' : 'en'];
  return { title: copy.missing, description: copy.missingText, robots: { index: false, follow: true } };
}

export function articleErrorMetadata(country: string): Metadata {
  const copy = routeStateCopy[country === 'ukraine' ? 'uk' : country === 'poland' ? 'pl' : 'en'];
  return { title: copy.error, description: copy.errorText, robots: { index: false, follow: true } };
}
