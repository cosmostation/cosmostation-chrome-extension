import { Typography } from '@mui/material';

import { CURRENCY_DECIMALS, CURRENCY_SYMBOL } from '~/constants/currency';
import { fix } from '~/Popup/utils/big';
import type { CurrencyType } from '~/types/extensionStorage';
import type { NumberTypos } from '~/types/theme';

import { EllipsisAmountContainer } from './styled';

type NumberProps = {
  children?: string;
  typoOfIntegers?: keyof NumberTypos;
  typoOfDecimals?: keyof NumberTypos;
  fixed?: number;
  currency?: CurrencyType;
  ellipsisMaxWidth?: string;
};

export default function Number({ children, typoOfIntegers = 'h3n', typoOfDecimals = 'h4n', fixed, currency, ellipsisMaxWidth }: NumberProps) {
  const number = children ? (fixed !== undefined ? fix(children, fixed) : currency ? fix(children, CURRENCY_DECIMALS[currency]) : children) : '';

  const splitedNumber = number.split('.');

  return ellipsisMaxWidth ? (
    <EllipsisAmountContainer data-max-width={ellipsisMaxWidth}>
      <div>
        {splitedNumber?.[0] && (
          <Typography variant={typoOfIntegers}>
            {currency && `${CURRENCY_SYMBOL[currency]} `}
            {splitedNumber[0].replace(/(.)(?=(\d{3})+$)/g, '$1,')}
          </Typography>
        )}
        {splitedNumber?.[1] && <Typography variant={typoOfDecimals}>.{splitedNumber[1]}</Typography>}
      </div>
    </EllipsisAmountContainer>
  ) : (
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
