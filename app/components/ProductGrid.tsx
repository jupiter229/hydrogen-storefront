import type {Collection} from '@shopify/hydrogen/storefront-api-types';
import ProductCard from './ProductCard';

interface Props {
  collection: Collection;
  url: string;
}
export default function ProductGrid({collection, url}: Props) {
  return (
    <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {collection.products.nodes.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
