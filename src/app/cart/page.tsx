import type { Metadata } from "next";
import { Checkout } from "@/components/checkout";

export const metadata: Metadata = { title: "Сагс", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="wrap pt-10 pb-24 md:pt-14">
      <h1 className="serif mb-10 text-[48px] md:text-[72px]">Сагс</h1>
      <Checkout />
    </div>
  );
}
