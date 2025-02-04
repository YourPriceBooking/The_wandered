import { postData } from "@/types/postTypes";
import { editingHTMLData } from "./editingHtmlData";

const MARKUP_SPLIT_KEY = 'imgUrlByIdx';

export const dataMarkup = async (data: postData) => {
    const updatedMarkup = editingHTMLData(data.markup);

    const splitedMarkup = updatedMarkup.split(MARKUP_SPLIT_KEY);
    let resultMarkup = splitedMarkup[0];

    for (let i = 1; i < splitedMarkup.length; i++) {
      resultMarkup += data.imageUrl[i] + splitedMarkup[i];
    }

    return { ...data, markup: resultMarkup };
  };