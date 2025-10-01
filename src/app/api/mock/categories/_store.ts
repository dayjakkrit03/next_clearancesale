// src/app/api/mock/categories/_store.ts
export type UICategory = {
  id: number | string;
  name: string;
  slug: string;
  image_url?: string;
  visible?: boolean;
  order: number;
};

// seed เริ่มต้น
const seed: Omit<UICategory, "order">[] = [
    { id: 1, slug: "lan-utp", name: "LAN (UTP) System", image_url: "/assets/category-lan-utp.jpg", visible: true},
    { id: 2, slug: "fiber-optic", name: "FIBER OPTIC System", image_url: "/assets/category-fiber-optic.jpg", visible: true},
    { id: 3, slug: "telephone", name: "Telephone CABLE", image_url: "/assets/category-telephone.jpg", visible: true},
    { id: 4, slug: "fttr-fttx", name: "FTTR/FTTx OVAL / FLAT CABLE", image_url: "/assets/category-fttr-fttx.jpg", visible: true},
    { id: 5, slug: "data-center", name: "DATA CENTER System", image_url: "/assets/category-data-center.jpg", visible: true},
    { id: 6, slug: "coaxial", name: "COAXIAL (RG) System", image_url: "/assets/category-coaxial.jpg", visible: true},
    { id: 7, slug: "solar", name: "SOLAR CABLE", image_url: "/assets/category-solar.jpg", visible: true},
    { id: 8, slug: "security-control", name: "SECURITY AND CONTROL System", image_url: "/assets/category-security-control.jpg", visible: true},
    { id: 9, slug: "networking", name: "NETWORKING System", image_url: "/assets/category-networking.jpg", visible: true},
    { id: 10, slug: "germany-rack", name: "GERMANY RACK", image_url: "/assets/category-germany-rack.jpg", visible: true},
    { id: 11, slug: "cctv-cabinet", name: "CCTV OUTDOOR CABINET", image_url: "/assets/category-cctv-cabinet.jpg", visible: true},
    { id: 12, slug: "link-rack", name: "LINK RACK", image_url: "/assets/category-link-rack.jpg", visible: true},
  // …เติมตามต้องการ
];

// module-level state
let state: UICategory[] = seed.map((x, i) => ({ ...x, order: i }));

export function getAll(): UICategory[] {
  // ส่งแบบเรียงตาม order เสมอ
  return [...state].sort((a, b) => a.order - b.order);
}

export function setVisible(id: UICategory["id"], visible: boolean) {
  state = state.map((x) => (x.id === id ? { ...x, visible } : x));
}

export function remove(id: UICategory["id"]) {
  state = state.filter((x) => x.id !== id).map((x, i) => ({ ...x, order: i }));
}

export function reorder(orders: { id: UICategory["id"]; order: number }[]) {
  const map = new Map(orders.map((o) => [o.id, o.order]));
  state = state.map((x) => ({ ...x, order: map.get(x.id) ?? x.order }))
               .sort((a, b) => a.order - b.order)
               .map((x, i) => ({ ...x, order: i }));
}
