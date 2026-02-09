import Image from "next/image";

interface MDXImageProps {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export function MDXImage({ src, alt, caption, width = 800, height = 450 }: MDXImageProps) {
  return (
    <figure className="my-6">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="rounded-lg"
        loading="lazy"
        sizes="(max-width: 768px) 100vw, 672px"
      />
      {caption && (
        <figcaption className="text-text-secondary mt-2 text-center text-sm">{caption}</figcaption>
      )}
    </figure>
  );
}
