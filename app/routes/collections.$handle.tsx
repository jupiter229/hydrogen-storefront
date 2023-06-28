import {useLoaderData} from '@remix-run/react';
import type {Collection as CollectionType} from '@shopify/hydrogen/storefront-api-types';
import {LoaderArgs, json} from '@shopify/remix-oxygen';

export async function loader({params, context}: LoaderArgs) {
  const {handle} = params;
  const {collection} = await context.storefront.query<{
    collection: CollectionType;
  }>(COLLECTION_QUERY, {
    variables: {
      handle,
    },
  });

  // Handle 404s
  if (!collection) {
    throw new Response(null, {status: 404});
  }

  // json is a Remix utility for creating application/json responses
  // https://remix.run/docs/en/v1/utils/json
  return json({
    collection,
  });
}

export default function Collection() {
  const {collection} = useLoaderData() as {collection: CollectionType};

  return (
    <>
      <header className="grid w-full gap-4 grid-cols-1 md:grid-cols-2">
        <h1 className="text-4xl font-bold text-center md:text-left">
          {collection.title}
        </h1>

        {collection.description && (
          <div className="flex items-baseline justify-between w-full">
            <p className="text-2xl font-bold text-center md:text-left">
              {collection.description}
            </p>
          </div>
        )}
      </header>
    </>
  );
}

const COLLECTION_QUERY = `#graphql
  query CollectionDetails($handle: String!) {
    collection(handle: $handle) {
      title
      description
      handle
    }
  }
`;
const seo = ({data}: {data: {collection: CollectionType}}) => ({
  title: data?.collection?.title,
  description: data?.collection?.description.substr(0, 154),
});

export const handle = {
  seo,
};
