import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import {Seo} from '@shopify/hydrogen';
import type {Shop} from '@shopify/hydrogen/storefront-api-types';
import type {LinksFunction, LoaderArgs} from '@shopify/remix-oxygen';
import favicon from '../public/favicon.svg';
import {Layout} from './components/Layout';
import styles from './styles/app.css';

export const links: LinksFunction = () => {
  return [
    {rel: 'stylesheet', href: styles},
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
};

export async function loader({context}: LoaderArgs) {
  const layout = await context.storefront.query<{shop: Shop}>(LAYOUT_QUERY);
  return {layout};
}

export default function App() {
  const data = useLoaderData<typeof loader>();

  const {name} = data.layout.shop;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Seo />
        <Meta />
        <Links />
      </head>
      <body>
        <Layout title={name}>
          <Outlet />
        </Layout>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

const LAYOUT_QUERY = `#graphql
  query layout {
    shop {
      name
      description
    }
  }
`;
