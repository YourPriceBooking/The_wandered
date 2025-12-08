import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const country = new URL(req.url).searchParams.get('country');

  const res = await fetch(
    `https://ypbooking.chost.com.ua/blog/api/post/get-all?typeOfPage=${country}`,
    { cache: 'no-store' }
  );

  const data = await res.json();
  return NextResponse.json(data);
}
