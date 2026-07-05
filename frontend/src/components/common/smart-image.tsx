import Image, { type ImageProps } from "next/image";

/**
 * next/image wrapper that optimizes real (https) product photos but passes
 * data-URI placeholders and http(dev) URLs through untouched — so the storefront
 * gets automatic resizing/WebP once real photos on a CDN replace the placeholders,
 * without breaking the current SVG placeholders.
 */
export function SmartImage({ src, ...rest }: ImageProps) {
  const s = typeof src === "string" ? src : "";
  const unoptimized = s.startsWith("data:") || s.startsWith("http://");
  return <Image src={src} unoptimized={unoptimized} {...rest} />;
}
