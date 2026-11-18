import { Cormorant_Garamond, Manrope } from "next/font/google";

// Both carry Mongolian Ө ө Ү ү (cyrillic-ext subset).
/** Editorial high-contrast serif for headlines. */
export const serif = Cormorant_Garamond({ subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"], weight: ["300", "400", "500", "600"], style: ["normal", "italic"], variable: "--nf-serif", display: "swap" });
/** Clean sans for reading, prices and spaced capitals. */
export const sans = Manrope({ subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"], variable: "--nf-sans", display: "swap" });
