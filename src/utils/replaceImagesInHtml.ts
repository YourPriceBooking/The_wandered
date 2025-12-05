export function replaceImagesInHtml(htmlString: string, images: Array<{ url: string; context?: { alt?: string; caption?: string } }>) {

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  const imgTags = doc.querySelectorAll("img");

  imgTags.forEach((img, index) => {
	const imageObj = images[index + 1]; 
	if (imageObj) {
	  img.setAttribute("src", imageObj.url);
	  if (imageObj.context?.alt) {
		img.setAttribute("alt", imageObj.context.alt);
	  }
	  if (imageObj.context?.caption) {

		const captionEl = doc.createElement("p");
		captionEl.textContent = imageObj.context.caption;
		img.insertAdjacentElement("afterend", captionEl);
	  }
	}
  });

  return doc.body.innerHTML;
}