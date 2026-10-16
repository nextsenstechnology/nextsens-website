// Canonical product pricing/discount logic.
// The product's stored `discount_percentage` (set from the Admin Dashboard)
// is the single source of truth. The discount is applied exactly ONCE, when
// the selling/cart price is derived from the base price. Cart, checkout,
// orders and payment all consume this already-discounted price.

export const getProductDiscountPercentage = (product) => {
  // Coerce numeric/string values from Supabase (e.g. "10.00") reliably.
  const raw = product?.discount_percentage;
  if (raw === null || raw === undefined || raw === '') return 0;
  const value = typeof raw === 'number' ? raw : parseFloat(String(raw).trim());
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.min(value, 100);
};

export const getDiscountedPrice = (product) => {
  if (product?.price === null || product?.price === undefined) return null;
  const discount = getProductDiscountPercentage(product);
  return Math.round(product.price * (1 - discount / 100));
};

// Builds the product object stored in the cart: `price` is the final
// discounted selling price, `base_price` keeps the original MRP for
// invoice/display purposes.
export const toCartProduct = (product) => ({
  ...product,
  base_price: product.price ?? null,
  price: getDiscountedPrice(product),
});
