import type { MetadataRoute } from "next";
import { brands, catalogSource, lines } from "@/lib/catalog";
import { FAMILIES } from "@/lib/labels";
import { absoluteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(catalogSource.importedAt);
  const page = (path: string, priority: number) => ({ url: absoluteUrl(path), lastModified, priority });
  return [
    page("/", 1),
    page("/fragrances", 0.9),
    page("/discovery", 0.8),
    page("/brands", 0.8),
    page("/scent-finder", 0.6),
    page("/gift-finder", 0.6),
    page("/notes", 0.5),
    page("/story", 0.5),
    ...FAMILIES.map((f) => page(`/fragrances?f=${f.id}`, 0.6)),
    ...brands.map((b) => page(`/brands/${b.slug}`, 0.6)),
    ...lines.map((l) => page(`/p/${l.slug}`, 0.7)),
  ];
}
