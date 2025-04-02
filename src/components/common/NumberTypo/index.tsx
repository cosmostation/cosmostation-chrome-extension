import { Typography } from '@mui/material';

import { CURRENCY_DECIMALS, CURRENCY_SYMBOL } from '@/constants/currency';
import type { NumberTypoVariants } from '@/styles/theme';
import type { CurrencyType } from '@/types/currency';
import { fix } from '@/utils/numbers';

type NumberTypoProps = {
  children?: string;
  typoOfIntegers?: NumberTypoVariants;
  typoOfDecimals?: NumberTypoVariants;
  fixed?: number;
  currency?: CurrencyType;
  isApporximation?: boolean;
  isDisableLeadingCurreny?: boolean;
};

export default function NumberTypo({
  children,
  typoOfIntegers = 'h3n_B',
  typoOfDecimals = 'h4n_M',
  fixed,
  currency,
  isApporximation = false,
  isDisableLeadingCurreny = false,
}: NumberTypoProps) {
  const number = children ? (fixed !== undefined ? fix(children, fixed) : currency ? fix(children, CURRENCY_DECIMALS[currency]) : children) : '';

  const splitedNumber = number.split('.');

  return (
    <span>
      {splitedNumber?.[0] && (
        <Typography variant={typoOfIntegers}>
          {isApporximation && '≈ '}
          <Typography variant={typoOfDecimals}>{currency && !isDisableLeadingCurreny && `${CURRENCY_SYMBOL[currency]} `}</Typography>
          {splitedNumber[0].replace(/(.)(?=(\d{3})+$)/g, '$1,')}
        </Typography>
      )}
      {splitedNumber?.[1] && <Typography variant={typoOfDecimals}>.{splitedNumber[1]}</Typography>}
    </span>
  );
}
