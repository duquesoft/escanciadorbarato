import ProductoClient from "./ProductoClient";
import { getPublicProducts } from "@/lib/products-public";

export const revalidate = 60;

export default async function ProductoPage() {
  const products = await getPublicProducts();

  return <ProductoClient initialProducts={products} />;
}
