import s from '../Travel-resources.module.scss';

type TravelToolProps = {
  id: string;
  title: string;
  description: string;
  frameTitle: string;
  src: string;
  sourceUrl: string;
  sourceName: string;
};

export default function TravelTool({ id, title, description, frameTitle, src, sourceUrl, sourceName }: TravelToolProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={s.tool}>
      <h2 id={`${id}-title`} className={s.title}>{title}</h2>
      <p className={s.description}>{description}</p>
      <iframe
        src={src}
        title={frameTitle}
        width={960}
        height={450}
        loading="lazy"
        className={s.iframe}
      />
      <a className={s.source} href={sourceUrl} target="_blank" rel="noopener noreferrer">
        Open {sourceName} in a new tab <span aria-hidden="true">↗</span>
      </a>
    </section>
  );
}
