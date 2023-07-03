import { useFetcher } from '@remix-run/react';
import type { Collection, Product } from '@shopify/hydrogen/storefront-api-types';
import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';

interface Props {
  collection: Collection;
  url: string;
}
export default function ProductGrid({collection, url}: Props) {
  const [nextPage, setNextPage] = useState<boolean>(
    collection?.products?.pageInfo?.hasNextPage,
  );

  const [endCursor, setEndCursor] = useState(
    collection?.products?.pageInfo?.endCursor,
  );

  const [products, setProducts] = useState<Product[]>(
    collection?.products?.nodes || [],
  );

  const fetcher = useFetcher();

  const fetchMore = async () => {
    fetcher.load(`${url}?index&cursor=${endCursor}`);
  };

  useEffect(() => {
    if (!fetcher.data) return;
    const {collection} = fetcher.data as {collection: Collection};
    setNextPage(collection?.products?.pageInfo?.hasNextPage);
    setEndCursor(collection?.products?.pageInfo?.endCursor);
    setProducts((prev) => [...prev, ...(collection?.products?.nodes || [])]);
  }, [fetcher.data]);

  return (
    <section className="w-full gap-4 md:gap-8 grid">
      <div className="grid-flow-row grid gap-2 gap-y-6 md:gap-4 lg:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {nextPage && (
        <div className="flex items-center justify-center mt-6">
          <button
            className="inline-block rounded font-medium text-center py-3 px-6 border w-full cursor-pointer"
            disabled={fetcher.state !== 'idle'}
            onClick={fetchMore}
          >
            {fetcher.state !== 'idle' ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </section>
  );
}
