"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPrice } from "@/lib/format";
import { useLocalOrders } from "@/lib/local-orders";

const STATUS: Record<string, string> = { paid: "Төлөгдсөн", pending: "Төлбөр хүлээгдэж байна", failed: "Амжилтгүй", cancelled: "Цуцлагдсан", expired: "Хугацаа дууссан", rejected: "Татгалзсан", refunded: "Буцаагдсан" };

export function TrackForm() {
  const orders = useLocalOrders();
  const router = useRouter();
  const [ref, setRef] = useState("");
  const [miss, setMiss] = useState(false);
  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const r = ref.trim().toUpperCase();
          if (orders.some((o) => o.reference === r)) router.push(`/order/${r}`);
          else setMiss(true);
        }}
        className="flex flex-wrap gap-2"
      >
        <label htmlFor="ref" className="sr-only">
          Захиалгын дугаар
        </label>
        <input id="ref" value={ref} onChange={(e) => (setRef(e.target.value), setMiss(false))} placeholder="TL-261118-A1B2C3" className="field mt-0 max-w-sm flex-1 uppercase" />
        <button type="submit" className="btn btn-ink">
          Шалгах
        </button>
      </form>
      {miss && <p className="mt-3 text-[14px] text-wine">Энэ дугаар энэ төхөөрөмж дээр олдсонгүй. Захиалгаа утсаар лавлана уу.</p>}
      {orders.length > 0 && (
        <div className="mt-10">
          <p className="eyebrow text-taupe-2">Энэ төхөөрөмжөөс өгсөн захиалга</p>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {orders.map((o) => (
              <li key={o.reference}>
                <Link href={`/order/${o.reference}`} className="flex flex-wrap items-center justify-between gap-3 py-4 hover:text-gold-ink">
                  <span className="font-semibold">{o.reference}</span>
                  <span className="text-[13.5px] text-ink-2">{o.createdAt.slice(0, 10).replaceAll("-", ".")}</span>
                  <span className="text-[13.5px]">{o.status ? (STATUS[o.status] ?? o.status) : "Нэхэмжлэл хүлээгдэж байна"}</span>
                  <span className="tabular-nums">{formatPrice(o.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
