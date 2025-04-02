import { Typography } from '@mui/material';

import { CURRENCY_DECIMALS, CURRENCY_SYMBOL } from '@/constants/currency';
import type { NumberTypoVariants } from '@/styles/theme';
import type { CurrencyType } from '@/types/currency';
import { fix } from '@/utils/numbers';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

type BalanceDisplayProps = {
  children?: string;
  typoOfIntegers?: NumberTypoVariants;
  typoOfDecimals?: NumberTypoVariants;
  fixed?: number;
  currency?: CurrencyType;
  isApporximation?: boolean;
  isDisableLeadingCurreny?: boolean;
  isDisableHidden?: boolean;
};

export default function BalanceDisplay({
  children,
  typoOfIntegers = 'h3n_B',
  typoOfDecimals,
  fixed,
  currency,
  isApporximation = false,
  isDisableLeadingCurreny = false,
  isDisableHidden = false,
}: BalanceDisplayProps) {
  const { isBalanceVisible } = useExtensionStorageStore((state) => state);

  if (!children) return null;

  const decimalPlaces = fixed ?? (currency ? CURRENCY_DECIMALS[currency] : undefined) ?? 6;
  const minDisplayValue = 10 ** -decimalPlaces;
  const numericValue = parseFloat(children);
  const isBelowMinValue = numericValue > 0 && numericValue < minDisplayValue;
  const number = isBelowMinValue ? fix(minDisplayValue.toString(), decimalPlaces) : fix(children, decimalPlaces);

  const [integerPart, decimalPart] = number.split('.');

  return (
    <span>
      {!isBalanceVisible && !isDisableHidden ? (
        <Typography variant={typoOfIntegers}>****</Typography>
      ) : (
        <span>
          <Typography variant={typoOfIntegers} component="span">
            {isApporximation && '≈ '}
            {isBelowMinValue && '< '}
            {currency && !isDisableLeadingCurreny && (
              <Typography variant={typoOfDecimals || typoOfIntegers} component="span">{`${CURRENCY_SYMBOL[currency]} `}</Typography>
            )}
            {integerPart.replace(/(\d)(?=(\d{3})+$)/g, '$1,')}
          </Typography>
          {decimalPart && <Typography variant={typoOfDecimals || 'h4n_M'}>.{decimalPart}</Typography>}
        </span>
      )}
    </span>
  );
}
