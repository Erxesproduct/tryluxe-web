import data from "@/data/catalog.json";

/**
 * Business facts from tryluxe.mn (Zochil shop 29401: shop settings, payment / delivery rules, delivery option, terms,
 * FAQ), read on 2026-11-18. Nothing here is invented; open points are listed in docs/erxes/MANUAL-STEPS.md.
 */
const shop = data.shop;
const city = shop.delivery.find((d) => !d.countryside);

export const business = {
  name: "tryLuxé",
  domain: "tryluxe.mn",
  /** Zochil shop name. */
  tagline: "Discover the Luxury & Try the Experience",
  description: "tryLuxé: дэлхийн тансаг брэндүүдийн оригинал мини үнэртэй ус, vial тестер, discovery багц, бүтэн хэмжээний үнэртэй ус. Эхлээд туршаад, дараа нь дурла.",
  phone: { display: "8010-4205", tel: `+976${shop.phone}` },
  email: shop.email,
  instagram: shop.instagram,
  facebook: shop.facebook,
  /** Zochil payment rule: the order is confirmed after 100% payment of goods and delivery. QPay is enabled on Zochil. */
  payments: [{ id: "qpay", name: "QPay", note: "Аль ч банкны аппаар QR уншуулж төлнө." }],
  minOrder: 0,
  /** Zochil delivery option «Улаанбаатар хот доторх хүргэлт - 7000»: 7,000₮, free from 1,000,000₮ (`delivery_price_limit`). */
  cityFee: city?.price ?? 7000,
  freeFrom: city?.freeFrom ?? 1000000,
  delivery: [{ id: "city", name: "Улаанбаатар хот дотор", note: "Бэлэн бараа 24–48 цагт, урьдчилсан захиалга 7–9 хоногт" }],
  rules: {
    /** Zochil payment_rule */
    payment: shop.paymentRule,
    /** Zochil delivery_rule */
    delivery: shop.deliveryRule,
    /** Zochil terms_of_service */
    returns: shop.terms,
    preorder: "Урьдчилсан захиалгын бараа захиалга баталгаажсанаас хойш 7–9 хоногт ирж хүргэгдэнэ.",
    ebarimt: "И-баримтыг төлбөр баталгаажсаны дараа erxes-ээс албан ёсоор олгоно. Байгууллагаар авах бол 7 оронтой регистрийн дугаараа бичнэ үү.",
    countryside: "Одоогоор зөвхөн Улаанбаатар хот дотор хүргэнэ. Орон нутаг руу илгээх бол утсаар лавлана уу.",
  },
  /** FAQ on tryluxe.mn/faq (abridged, same facts). */
  faq: [
    { q: "Бүтээгдэхүүний гарал үүсэл хаанаас вэ?", a: "Бүх бүтээгдэхүүнийг брэндийн бутик, duty free, албан ёсны борлуулагч зэрэг баталгаат эх сурвалжаас оруулж ирдэг." },
    { q: "Мини семпл гэж юу вэ?", a: "Дэлхийн алдартай брэндүүдийн оригинал мини хэмжээтэй хувилбар. Үнэртэй танилцах, туршихад тохиромжтой, аялалд авч явахад хөнгөн. tryLuxé-ийн мини семплүүд бүгд оригинал, бэлэн худалдаалагдаж байна." },
    { q: "Full size бүтээгдэхүүн бүгд захиалгаар ирдэг үү?", a: "Үгүй. Зарим бүтэн хэмжээний бүтээгдэхүүн бэлэн байгаа бөгөөд 24–48 цагт хүргэгдэнэ. Бусдыг урьдчилсан захиалгаар авна." },
    { q: "Урьдчилсан захиалгаар юу авах боломжтой вэ?", a: "Chanel, Dior, Jo Malone, YSL, Lancôme, Estée Lauder зэрэг 20+ luxury брэндийн албан ёсны бүтээгдэхүүнийг duty free үнийн нөхцөлөөр захиалж болно." },
    { q: "Урьдчилсан захиалга хэдэн хоногт ирэх вэ?", a: "Дунджаар 7–9 хоногт таны гарт хүргэгдэнэ. Захиалгын явцыг бид хянаж, мэдээллийг цаг тухайд нь өгнө." },
    { q: "Full size бүтээгдэхүүний үнэ яагаад өөрчлөгддөг вэ?", a: "Валютын ханш, тухайн улсын бутик эсвэл албан ёсны дэлгүүрийн үнэ, duty free эсэхээс хамаарч үнэ хэлбэлзэж болно." },
    { q: "Төлбөрөө яаж төлөх вэ?", a: "QPay-ээр төлнө. Бараа болон хүргэлтийн төлбөр 100% төлөгдсөний дараа захиалга баталгаажиж, хүргэлт эхэлнэ." },
  ],
} as const;

export type DeliveryId = (typeof business.delivery)[number]["id"];
export type PaymentId = (typeof business.payments)[number]["id"];
export const deliveryOption = (id: DeliveryId) => business.delivery.find((d) => d.id === id)!;
export const paymentOption = (id: PaymentId) => business.payments.find((p) => p.id === id)!;

/** Delivery fee for a goods subtotal: city 7,000₮, free from 1,000,000₮. */
export function deliveryFee(_id: DeliveryId, subtotal: number): number {
  return subtotal >= business.freeFrom ? 0 : business.cityFee;
}

/** Order statuses staff move an order through (erxes Sales pipeline stages, see MANUAL-STEPS.md). */
export const ORDER_STATUSES = [
  { id: "pending", name: "Хүлээгдэж байна", note: "Захиалга ирсэн, төлбөр хүлээгдэж байна" },
  { id: "confirmed", name: "Баталгаажсан", note: "Төлбөр 100% төлөгдсөн" },
  { id: "preparing", name: "Бэлтгэж байна", note: "Савлаж байна; урьдчилсан захиалга ирэхийг хүлээж байна" },
  { id: "shipped", name: "Хүргэлтэд гарсан", note: "Жолоочид хүлээлгэн өгсөн" },
  { id: "delivered", name: "Хүргэгдсэн", note: "Хүлээн авсан" },
  { id: "cancelled", name: "Цуцлагдсан", note: "Төлбөр төлөгдөөгүй эсвэл цуцалсан" },
] as const;
