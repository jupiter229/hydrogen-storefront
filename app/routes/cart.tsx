import {Link} from '@remix-run/react';
import {ActionArgs} from '@shopify/remix-oxygen';

export async function action({request, context}: ActionArgs) {
  const {session, storefront} = context;
  const headers = new Headers();

  const [formData, storedCardId, customerAccessToken] = await Promise.all([
    request.formData(),
    session.get('storedCardId'),
    session.get('customerAccessToken'),
  ]);

  const cartId = storedCardId;

  const status = 200;
  let result;
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
