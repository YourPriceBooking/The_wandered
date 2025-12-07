import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page");
  const limit = searchParams.get("limit");
  const typeOfPage = searchParams.get("typeOfPage");

  try {
    const externalUrl = `https://ypbooking.chost.com.ua/blog/api/post/get-all${
      page || limit || typeOfPage
        ? `?${page ? `page=${page}&` : ""}${limit ? `limit=${limit}&` : ""}${
            typeOfPage ? `typeOfPage=${typeOfPage}` : ""
          }`
        : ""
    }`;

    const response = await axios.get(externalUrl);

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Proxy get-all error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
