import { AuthorType } from "@/types/authorTypes";
import axios from "axios";

export async function getAuthors() {
  try {
    const response = await axios.get("/api/authors");

    const allAuthors: AuthorType[] = response.data.result;

    return allAuthors;
  } catch (error) {
    console.error("getAuthors error:", error);
    return [];
  }
}
