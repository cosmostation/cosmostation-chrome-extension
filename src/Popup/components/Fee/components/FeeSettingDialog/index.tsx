import type { DialogProps } from '@mui/material';
import { Typography } from '@mui/material';

import Dialog from '~/Popup/components/common/Dialog';
import DialogHeader from '~/Popup/components/common/Dialog/Header';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { toDisplayDenomAmount } from '~/Popup/utils/big';
import type { FeeCoin } from '~/types/chain';

import {
  Container,
  FeeCoinContainerButton,
  FeeCoinLeftContainer,
  FeeCoinLeftHeaderTitleContainer,
  FeeCoinLeftImageContainer,
  FeeCoinLeftInfoContainer,
  FeeCoinListContainer,
  FeeCoinTitleContainer,
} from './styled';

type FeeSettingDialogProps = Omit<DialogProps, 'children'> & {
  // TODO 현재 선택된 fee코인 정보도가져와서 선택되어있는 코인이면 체크 표시 되도록
  feeCoin: FeeCoin;
  feeCoinList?: FeeCoin[];
  onChangeFeeCoin?: (feeCoinbaseDenom: string) => void;
};

export default function FeeSettingDialog({ onClose, feeCoinList, onChangeFeeCoin, ...remainder }: FeeSettingDialogProps) {
  const { t } = useTranslation();

  const handleOnClose = () => {
    onClose?.({}, 'backdropClick');
  };

  const onClickFeeCoin = (coin: FeeCoin) => {
    onChangeFeeCoin?.(coin.baseDenom);
    handleOnClose();
  };

  return (
    <Dialog {...remainder} onClose={handleOnClose}>
      <DialogHeader onClose={handleOnClose}>{t('components.Fee.components.FeeSettingDialog.index.feeSettings')}</DialogHeader>
      <Container>
        <FeeCoinListContainer>
          {feeCoinList &&
            feeCoinList.map((item) => (
              <FeeCoinContainerButton
                key={item.baseDenom}
                type="button"
                onClick={() => {
                  onClickFeeCoin(item);
                }}
              >
                <FeeCoinLeftContainer>
                  <FeeCoinLeftImageContainer>
                    <Image src={item.imageURL} />
                  </FeeCoinLeftImageContainer>
                  <FeeCoinLeftInfoContainer>
                    <FeeCoinTitleContainer>
                      <Typography variant="h5">{item.displayDenom}</Typography>
                    </FeeCoinTitleContainer>
                    <FeeCoinLeftHeaderTitleContainer>
                      <Typography variant="h6n">Available</Typography>
                      <Typography variant="h6n"> :</Typography>{' '}
                      <Tooltip title={toDisplayDenomAmount(item.availableAmount ?? '', item.decimals)} arrow placement="top">
                        <span>
                          <Number typoOfDecimals="h8n" typoOfIntegers="h6n" fixed={item.decimals}>
                            {item.availableAmount}
                          </Number>
                        </span>
                      </Tooltip>{' '}
                      <Typography variant="h6n">{item.displayDenom}</Typography>
                    </FeeCoinLeftHeaderTitleContainer>
                  </FeeCoinLeftInfoContainer>
                </FeeCoinLeftContainer>
              </FeeCoinContainerButton>
            ))}
        </FeeCoinListContainer>
      </Container>
    </Dialog>
  );
}
