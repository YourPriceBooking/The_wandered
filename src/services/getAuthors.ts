import { AuthorType } from '@/types/authorTypes';
import axios from 'axios';

export async function getAuthors() {
  try {
    const response = await axios.get(
      'https://www.thewandered.com/blog/api/author/get-all-authors',
      // 'https://ypbooking.chost.com.ua/blog/api/author/get-all-authors',
    );

    const allAuthors: AuthorType[] = response.data.result;

    return allAuthors as AuthorType[];
  } catch (error) {
    console.log(error);
  }
}
