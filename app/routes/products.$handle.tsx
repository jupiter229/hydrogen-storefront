import {useLoaderData} from '@remix-run/react';
import {Money, ShopPayButton} from '@shopify/hydrogen';
import type {
  Product,
  ProductVariant,
  SelectedOptionInput,
} from '@shopify/hydrogen/storefront-api-types';
import type {LoaderArgs} from '@shopify/remix-oxygen';
import {json} from '@shopify/remix-oxygen';
import {ProductGallery} from '~/components/ProductGallery';
import ProductOptions from '~/components/ProductOption';

export async function loader({params, context, request}: LoaderArgs) {
  const storeDomain = context.storefront.getShopifyDomain();

  const {handle} = params;
  const searchParams = new URL(request.url).searchParams;

  const selectedOptions: SelectedOptionInput[] = [];
  searchParams.forEach((value, name) => {
    selectedOptions.push({name, value});
  });

  const {product} = await context.storefront.query<{product: Product}>(
    PRODUCT_QUERY,
    {
      variables: {
        handle,
        selectedOptions,
        storeDomain,
      },
    },
  );

  const selectedVariant: ProductVariant =
    product?.selectedVariant ?? product?.variants?.nodes[0];

  if (!product) {
    throw new Response(null, {status: 404});
  }

  return json({
    product,
    selectedVariant,
    storeDomain,
  });
}

export default function ProductHandle() {
  const {product, selectedVariant, storeDomain} = useLoaderData() as {
    product: Product;
    selectedVariant: ProductVariant;
    storeDomain: string;
  };

  const orderable = selectedVariant?.availableForSale || false;

  return (
    <section className="w-full gap-4 md:gap-8 grid px-6 md:px-8 lg:px-12">
      <div className="grid items-start gap-6 lg:gap-20 md:grid-cols-2 lg:grid-cols-3">
        <div className="grid md:grid-flow-row  md:p-0 md:overflow-x-hidden md:grid-cols-2 md:w-full lg:col-span-2">
          <div className="md:col-span-2 snap-center card-image aspect-square md:w-full w-[80vw] shadow rounded">
            <ProductGallery media={product.media.nodes} />
          </div>
        </div>
        <div className="md:sticky md:mx-auto max-w-xl md:max-w-[24rem] grid gap-8 p-0 md:p-6 md:px-0 top-[6rem] lg:top-[8rem] xl:top-[10rem]">
          <div className="grid gap-2">
            <h1 className="text-4xl font-bold leading-10 whitespace-normal">
              {product.title}
            </h1>
            <span className="max-w-prose whitespace-pre-wrap inherit text-copy opacity-50 font-medium">
              {product.vendor}
            </span>
          </div>
          <ProductOptions
            options={product.options}
            selectedVariant={selectedVariant}
          />
          <Money
            withoutTrailingZeros
            data={selectedVariant.price}
            className="text-2xl font-bold leading-10 whitespace-normal"
          />
          {orderable && (
            <div className="space-y-2">
              <ShopPayButton
                storeDomain={storeDomain}
                variantIds={[selectedVariant?.id]}
                width={'400px'}
              />
              {/* TODO product form */}
            </div>
          )}
          <div
            className="prose border-t border-gray-200 pt-6 text-black text-md"
            dangerouslySetInnerHTML={{__html: product.descriptionHtml}}
          ></div>
        </div>
      </div>
    </section>
  );
}

const PRODUCT_QUERY = `#graphql
  query product($handle: String!, $selectedOptions: [SelectedOptionInput!]!) {
    product(handle: $handle) {
      id
      title
      handle
      vendor
      descriptionHtml
      media(first: 10) {
        nodes {
          ... on MediaImage {
            mediaContentType
            image {
              id
              url
              altText
              width
              height
            }
          }
          ... on Model3d {
            id
            mediaContentType
            sources {
              mimeType
              url
            }
          }
        }
      }
      options {
        name,
        values
      }
      selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions) {
        id
        availableForSale
        selectedOptions {
          name
          value
        }
        image {
          id
          url
          altText
          width
          height
        }
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        sku
        title
        unitPrice {
          amount
          currencyCode
        }
        product {
          title
          handle
        }
      }
      variants(first: 1) {
        nodes {
          id
          title
          availableForSale
          price {
            currencyCode
            amount
          }
          compareAtPrice {
            currencyCode
            amount
          }
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }
`;
