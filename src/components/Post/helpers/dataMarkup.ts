import { postData } from "@/types/postTypes";
import { editingHTMLData } from "./editingHtmlData";
import { normalizeImageUrl, getImageUrl } from "@/utils/normalizeImageUrl";

const MARKUP_SPLIT_KEY = 'imgUrlByIdx';

export const dataMarkup = async (data: postData) => {
    const updatedMarkup = editingHTMLData(data.markup);
    const normalizedImages = normalizeImageUrl(data.imageUrl as any);

    const splitedMarkup = updatedMarkup.split(MARKUP_SPLIT_KEY);
    let resultMarkup = splitedMarkup[0];

    for (let i = 1; i < splitedMarkup.length; i++) {
      const imageUrl = getImageUrl(normalizedImages, i) || '';
      resultMarkup += imageUrl + splitedMarkup[i];
    }

    return { ...data, markup: resultMarkup };
  };