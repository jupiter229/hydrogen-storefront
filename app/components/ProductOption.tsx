import {
  Link,
  Path,
  useLocation,
  useNavigate,
  useSearchParams,
} from '@remix-run/react';
import type {
  ProductOption,
  ProductVariant,
} from '@shopify/hydrogen/storefront-api-types';
import {Key} from 'react';

interface Location extends Path {
  state: any;
  key: Key;
}

export default function ProductOptions({
  options,
  selectedVariant,
}: {
  options: ProductOption[];
  selectedVariant: ProductVariant;
}) {
  const {pathname, search} = useLocation() as Location;
  const [currentSearchParams] = useSearchParams();
  const navigation = useNavigate();

  const paramsWithDefaults = (() => {
    const defaultParams = new URLSearchParams(currentSearchParams);
    if (!selectedVariant) return defaultParams;

    selectedVariant.selectedOptions.forEach((option) => {
      if (!currentSearchParams.has(option.name)) {
        defaultParams.set(option.name, option.value);
      }
    });
    return defaultParams;
  })();

  const searchParams = navigation.location
    ? new URLSearchParams(navigation.location.search)
    : paramsWithDefaults;

  return (
    <div className="grid gap-4 mb-6">
      {options.map((option) => {
        if (!option.values.length) {
          return;
        }

        // get the currently selected option value
        const currentOptionVal = searchParams.get(option.name);
        return (
          <div
            key={option.name}
            className="flex flex-col flex-wrap mb-4 gap-y-2 last:mb-0"
          >
            <h3 className="whitespace-pre-wrap max-w-prose font-bold text-lead min-w-[4rem]">
              {option.name}
            </h3>

            <div className="flex flex-wrap items-baseline gap-4">
              {option.values.map((value) => {
                const linkParams = new URLSearchParams(searchParams);
                const isSelected = currentOptionVal === value;
                linkParams.set(option.name, value);
                return (
                  <Link
                    key={value}
                    to={`${pathname}?${linkParams.toString()}`}
                    preventScrollReset
                    replace
                    className={`leading-none py-1 border-b-[1.5px] cursor-pointer transition-all duration-200 ${
                      isSelected ? 'border-gray-500' : 'border-neutral-50'
                    }`}
                  >
                    {value}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
