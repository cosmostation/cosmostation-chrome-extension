import { Typography } from '@mui/material';

import { fix } from '~/Popup/utils/big';
import type { NumberTypos } from '~/types/theme';

type NumberProps = {
  children?: string;
  typoOfIntegers?: keyof NumberTypos;
  typoOfDecimals?: keyof NumberTypos;
  fixed?: number;
};

// TODO: 통화 기호 prefix optional 하게 추가 하기

// usd, krw, eur, jpy, cny
// $, ₩, €, ¥, ¥
export default function Number({ children, typoOfIntegers = 'h1n', typoOfDecimals = 'h2n', fixed }: NumberProps) {
  const number = children ? (fixed !== undefined ? fix(children, fixed) : children) : '';

  const splitedNumber = number.split('.');

  return (
    <span>
      {splitedNumber?.[0] && <Typography variant={typoOfIntegers}>{splitedNumber[0].replace(/(.)(?=(\d{3})+$)/g, '$1,')}</Typography>}
      {splitedNumber?.[1] && <Typography variant={typoOfDecimals}>.{splitedNumber[1]}</Typography>}
    </span>
  );
}
