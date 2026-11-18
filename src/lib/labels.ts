/** Labels shared by server and client components. Keys match scripts/import-zochil.mjs. */

export const FAMILIES = [
  { id: "floral", name: "Цэцэглэг", en: "Floral", line: "Сарнай, жасмин, цагаан цэцэг", tone: "#e9d3cf" },
  { id: "fruity", name: "Жимслэг", en: "Fruity", line: "Лийр, интоор, халуун орны жимс", tone: "#efd9c6" },
  { id: "gourmand", name: "Амтлаг", en: "Gourmand", line: "Ваниль, кофе, карамель", tone: "#e6d2bb" },
  { id: "amber", name: "Амбер ба халуун ногоо", en: "Amber & Spice", line: "Амбер, дулаан халуун ногоо", tone: "#e3c9a6" },
  { id: "woody", name: "Модлог", en: "Woody", line: "Зандан, ветивер, арьс, chypre", tone: "#d6cbbb" },
  { id: "fresh", name: "Сэргэг", en: "Fresh", line: "Цитрус, ногоон, далайн, aromatic", tone: "#dfe2d5" },
  { id: "musk", name: "Мускус ба пудр", en: "Musk & Powder", line: "Зөөлөн мускус, пудрлаг", tone: "#ece3da" },
] as const;
export type FamilyId = (typeof FAMILIES)[number]["id"];

export const OCCASIONS = [
  { id: "everyday", name: "Өдөр тутам" },
  { id: "office", name: "Оффис" },
  { id: "evening", name: "Орой" },
  { id: "date", name: "Болзоо" },
  { id: "special", name: "Онцгой арга хэмжээ" },
  { id: "vacation", name: "Амралт, аялал" },
] as const;
export type OccasionId = (typeof OCCASIONS)[number]["id"];

export const SEASONS = [
  { id: "spring", name: "Хавар" },
  { id: "summer", name: "Зун" },
  { id: "autumn", name: "Намар" },
  { id: "winter", name: "Өвөл" },
] as const;

export const INTENSITY = [
  { id: "light", name: "Хөнгөн", line: "Cologne, mist" },
  { id: "moderate", name: "Дунд", line: "Eau de Toilette" },
  { id: "strong", name: "Тод", line: "Eau de Parfum" },
  { id: "intense", name: "Хүчтэй", line: "Parfum, Extrait, Elixir, Intense" },
] as const;
export type IntensityId = (typeof INTENSITY)[number]["id"];

export const KINDS = [
  { id: "full", name: "Бүтэн хэмжээ", plural: "Бүтэн хэмжээний үнэртэй ус" },
  { id: "mini", name: "Мини үнэртэй ус", plural: "Мини үнэртэй ус" },
  { id: "vial", name: "Vial тестер", plural: "Vial тестер" },
  { id: "petit", name: "PETIT by tryLuxé", plural: "PETIT by tryLuxé" },
  { id: "set", name: "Бэлгийн багц", plural: "Бэлэг, discovery багц" },
  { id: "makeup", name: "Нүүр будаг", plural: "Нүүр будаг" },
  { id: "skincare", name: "Арьс арчилгаа", plural: "Арьс арчилгаа" },
  { id: "body", name: "Бие арчилгаа", plural: "Бие, үс арчилгаа" },
  { id: "accessory", name: "Pouch, аксессуар", plural: "Pouch, bag charm" },
  { id: "bag", name: "Мини цүнх", plural: "Мини цүнх" },
  { id: "wrap", name: "Бэлгийн уут, хайрцаг", plural: "Бэлгийн уут, хайрцаг" },
  { id: "other", name: "Бусад", plural: "Бусад" },
] as const;
export type KindId = (typeof KINDS)[number]["id"];

export const GENDERS = [
  { id: "women", name: "Эмэгтэй" },
  { id: "men", name: "Эрэгтэй" },
] as const;

export const familyName = (id: string) => FAMILIES.find((f) => f.id === id)?.name ?? id;
export const occasionName = (id: string) => OCCASIONS.find((f) => f.id === id)?.name ?? id;
export const seasonName = (id: string) => SEASONS.find((f) => f.id === id)?.name ?? id;
export const kindName = (id: string) => KINDS.find((k) => k.id === id)?.name ?? id;
export const intensityName = (id: string) => INTENSITY.find((k) => k.id === id)?.name ?? id;

/** "1.5ml · EDP" */
export const sizeLine = (size: string | null | undefined, conc: string | null | undefined) => [size, conc].filter(Boolean).join(" · ");
