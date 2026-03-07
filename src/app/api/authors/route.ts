import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await axios.get(
      'https://www.thewandered.com/blog/api/author/get-all-authors',
      // 'https://ypbooking.chost.com.ua/blog/api/author/get-all-authors',https://www.thewandered.com/
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('API Proxy Error:', error);
    return NextResponse.json({ error: 'Failed to fetch authors' }, { status: 500 });
  }
}
