import type { Metadata } from "next";
import { WishlistView } from "@/components/wishlist-view";

export const metadata: Metadata = { title: "Хадгалсан", robots: { index: false } };

export default function WishlistPage() {
  return (
    <div className="wrap pt-10 pb-24 md:pt-14">
      <h1 className="serif mb-10 text-[48px] md:text-[72px]">Хадгалсан</h1>
      <WishlistView />
    </div>
  );
}
