// src/app/admin/components/products/type.ts

// types shared across admin product components

export type UIProduct = {
  id: number | string;
  name: string;
  brand?: string;
  sku?: string;
  price: number;
  discountPercent?: number;
  image_url?: string;
  visible?: boolean;
  order?: number;
  rating?: number;
  reviews?: number;
  category_id?: number | string;
  uom?: string;
};

export type UIMeta = { title: string; subtitle: string };
export type UICategoryLite = { id: number | string; name: string; slug?: string };

export type DiscountRuleLite = {
  id: number | string;
  minPercent: number;
  maxPercent?: number;
  borderWidth: number;
  borderColorHex: string;
  enabled: boolean;
};

export type ListResponse = {
  items: UIProduct[];
  total?: number;
  page?: number;
  pageSize?: number;
  meta?: UIMeta;
};
