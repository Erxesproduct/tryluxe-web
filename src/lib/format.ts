const nf = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** 25000 → "25,000₮" */
export const formatPrice = (mnt: number) => `${nf.format(mnt)}₮`;

/** "2026-09-24" → "2026.09.24" */
export const formatDate = (iso: string) => iso.slice(0, 10).replaceAll("-", ".");

/** Mongolian plural-free count label: 12 → "12 ном" */
export const countLabel = (n: number, noun = "бараа") => `${nf.format(n)} ${noun}`;
