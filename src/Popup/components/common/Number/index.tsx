import { Typography } from '@mui/material';

import { CURRENCY_SYMBOL } from '~/constants/currency';
import { fix } from '~/Popup/utils/big';
import type { CurrencyType } from '~/types/chromeStorage';
import type { NumberTypos } from '~/types/theme';

type NumberProps = {
  children?: string;
  typoOfIntegers?: keyof NumberTypos;
  typoOfDecimals?: keyof NumberTypos;
  fixed?: number;
  currency?: CurrencyType;
};

// TODO: 통화 기호 prefix optional 하게 추가 하기

export default function Number({ children, typoOfIntegers = 'h3n', typoOfDecimals = 'h4n', fixed, currency }: NumberProps) {
  const number = children ? (fixed !== undefined ? fix(children, fixed) : children) : '';

  const splitedNumber = number.split('.');

  return (
    <span>
      {splitedNumber?.[0] && (
        <Typography variant={typoOfIntegers}>
          {currency && `${CURRENCY_SYMBOL[currency]} `}
          {splitedNumber[0].replace(/(.)(?=(\d{3})+$)/g, '$1,')}
        </Typography>
      )}
      {splitedNumber?.[1] && <Typography variant={typoOfDecimals}>.{splitedNumber[1]}</Typography>}
    </span>
  );
}
