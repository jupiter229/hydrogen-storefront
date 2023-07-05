import { Link } from '@remix-run/react';
import { ActionArgs, json } from '@shopify/remix-oxygen';

export async function action({request, context}: ActionArgs) {
  const {session, storefront} = context;
  const headers = new Headers();

  const [formData, storedCardId, customerAccessToken] = await Promise.all([
    request.formData(),
    session.get('storedCardId'),
    session.get('customerAccessToken'),
  ]);

  let cartId = storedCardId;

  const status = 200;
  let result;

  const cartAction = formData.get('cartAction');
  const countryCode = formData.get('countryCode')
    ? formData.get('countryCode')
    : null;

  switch (cartAction) {
    case 'ADD_TO_CART':
      const lines = formData.get('lines')
        ? JSON.parse(String(formData.get('lines')))
        : [];

      if (!cartId) {
        result = await cartCreate({
          input: countryCode ? {lines, buyerIdentity: {countryCode}} : {lines},
          storefront,
        });
      } else {
        result = await cartAdd({
          cartId,
          lines,
          storefront,
        });
      }

      cartId = result.cart.id;
      break;
    case 'REMOVE_FROM_CART':
      const lineIds = formData.get('linesIds')
        ? JSON.parse(String(formData.get('linesIds')))
        : [];

      if (!lineIds.length) {
        throw new Error('No lines to remove');
      }

      result = await cartRemove({
        cartId,
        lineIds,
        storefront,
      });

      cartId = result.cart.id;
      break;
    default:
      throw new Error('Invalid cart action');
  }

  /**
   * The Cart ID may change after each mutation. We need to update it each time in the session.
   */
  session.set('cartId', cartId);
  headers.set('Set-Cookie', await session.commit());

  const {cart, errors} = result;
  return json({cart, errors}, {status, headers});
}

export default function Cart() {
  return (
    <div className="flex flex-col space-y-7 justify-center items-center md:py-8 md:px-12 px-4 py-6 h-screen">
      <h2 className="whitespace-pre-wrap max-w-prose font-bold text-lead min-w-[4rem]">
        Your cart is empty
      </h2>
      <Link
        to="/"
        className="inline-block rounded-sm font-medium text-center py-3 px-6 max-wxl leading-none bg-black text-white w-full"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

export async function cartCreate({input, storefront}) {
  const {cartCreate} = await storefront.mutate(CART_CREATE_MUTATION, {
    variables: {input},
  });
  return cartCreate;
}

export async function cartAdd({cartId, lines, storefront}) {
  const {cartLinesAdd} = await storefront.mutate(CART_LINES_ADD_MUTATION, {
    variables: {cartId, lines},
  });
  return cartLinesAdd;
}

export async function cartRemove({cartId, lineIds, storefront}) {
  const {cartLinesRemove} = await storefront.mutate(
    CART_LINES_REMOVE_MUTATION,
    {
      variables: {cartId, lineIds},
    },
  );
  if (!cartLinesRemove) {
    throw new Error('No data returned from remove lines mutation');
  }
  return cartLinesRemove;
}

const USER_ERROR_FRAGMENT = `#graphql
  fragment ErrorFragment on CartUserError {
    message
    field
    code
  }
`;
const LINES_CART_FRAGMENT = `#graphql
  fragment CartLinesFragment on Cart {
    id
    totalQuantity
  }
`;

const CART_CREATE_MUTATION = `#graphql
  mutation ($input: CartInput!, $country: CountryCode = ZZ, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    cartCreate(input: $input) {
      cart {
        ...CartLinesFragment
      }
      errors: userErrors {
        ...ErrorFragment
      }
    }
  }
  ${LINES_CART_FRAGMENT}
  ${USER_ERROR_FRAGMENT}
`;

const CART_LINES_ADD_MUTATION = `#graphql
  mutation ($cartId: ID!, $lines: [CartLineInput!]!, $country: CountryCode = ZZ, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartLinesFragment
      }
      errors: userErrors {
        ...ErrorFragment
      }
    }
  }
  ${LINES_CART_FRAGMENT}
  ${USER_ERROR_FRAGMENT}
`;

const CART_LINES_REMOVE_MUTATION = `#graphql
mutation ($cartId: ID!, $lineIds: [ID!]!, $language: LanguageCode, $country: CountryCode)
@inContext(country: $country, language: $language) {
  cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
    cart {
      id
      totalQuantity
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            merchandise {
              ...on ProductVariant {
                id
              }
            }
          }
        }
      }
    }
    errors: userErrors {
      message
      field
      code
    }
  }
}
`;
