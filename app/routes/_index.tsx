import { Link, type V2_MetaFunction } from "@remix-run/react";
import { useLoaderData } from "@remix-run/react";
import { LoaderArgs } from "@shopify/remix-oxygen";
import { Image } from "@shopify/hydrogen";
import type { 
  CollectionConnection,
  Collection as CollectionType 
} from "@shopify/hydrogen/storefront-api-types";

export const meta: V2_MetaFunction = () => {
  const description =
    "Learn Hydrogen and laugh at the same time!";

  return [
    { name: "description", content: description },
    { name: "twitter:description", content: description },
    { title: "Hydrogen: So great, it's funny!" },
  ];
};

export async function loader({ context }: LoaderArgs) {
  return await context.storefront.query<{ 
    collection: CollectionType;
    collections: CollectionConnection;
  }>(
    COLLECTION_QUERY
  );
}

export default function Index() {
  const {collections} = useLoaderData(); 
  
  return (
    <section className="w-full gap-4">
      <h2 className="whitespace-pre-wrap max-w-prose font-bold text-lead">
        Collections
      </h2>
      <div className="grid-flow-row grid gap-2 gap-y-6 md:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-3">
        {collections.nodes.map((collection: CollectionType) => (
          <Link
            key={collection.id}
            to={`/collections/${collection.handle}`}
            className="flex flex-col items-center justify-center w-full h-full gap-4"
          >
            {collection?.image?.url && (
              <Image data={collection?.image} />
            )}
            <h3 className="text-2xl font-bold text-center">
              {collection.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );

}

const COLLECTION_QUERY = `#graphql
  query FeaturedCollections {
    collections(first: 3, query: "collection_type:smart") {
      nodes {
        id
        title
        handle
        image {
          altText
          width
          height
          url
        }
      }
    }
  }
`;