import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderStatus } from "@/components/order-status";

export const metadata: Metadata = { title: "Захиалга", robots: { index: false } };

export default async function OrderPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  if (!/^TL-\d{6}-[0-9A-F]{6}$/.test(reference)) notFound();
  return (
    <div className="wrap pt-10 pb-24 md:pt-14">
      <OrderStatus reference={reference} />
    </div>
  );
}
