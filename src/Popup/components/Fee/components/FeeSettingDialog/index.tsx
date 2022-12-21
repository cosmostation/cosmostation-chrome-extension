import { useEffect, useRef } from 'react';
import type { DialogProps } from '@mui/material';
import { Typography } from '@mui/material';

import Dialog from '~/Popup/components/common/Dialog';
import DialogHeader from '~/Popup/components/common/Dialog/Header';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getDisplayMaxDecimals } from '~/Popup/utils/common';
import type { FeeCoin } from '~/types/chain';

import {
  Container,
  FeeCoinButton,
  FeeCoinLeftContainer,
  FeeCoinLeftHeaderTitleContainer,
  FeeCoinLeftImageContainer,
  FeeCoinLeftInfoContainer,
  FeeCoinListContainer,
  FeeCoinRightContainer,
  FeeCoinTitleContainer,
} from './styled';

import Check16Icon from '~/images/icons/Check16.svg';

type FeeSettingDialogProps = Omit<DialogProps, 'children'> & {
  currentFeeCoin: FeeCoin;
  feeCoinList: FeeCoin[];
  onChangeFeeCoin?: (selectedFeeCoin: FeeCoin) => void;
};

export default function FeeSettingDialog({ currentFeeCoin, feeCoinList, onClose, onChangeFeeCoin, ...remainder }: FeeSettingDialogProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const { t } = useTranslation();

  const handleOnClose = () => {
    onClose?.({}, 'backdropClick');
  };

  const onClickFeeCoin = (selectedFeeCoin: FeeCoin) => {
    onChangeFeeCoin?.(selectedFeeCoin);
    handleOnClose();
  };

  useEffect(() => {
    if (remainder.open) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }, [remainder.open]);

  return (
    <Dialog {...remainder} onClose={handleOnClose}>
      <DialogHeader onClose={handleOnClose}>{t('components.Fee.components.FeeSettingDialog.index.feeSettings')}</DialogHeader>
      <Container>
        <FeeCoinListContainer>
          {feeCoinList &&
            feeCoinList.map((item) => {
              const isActive = currentFeeCoin.baseDenom === item.baseDenom;
              const displayFee = toDisplayDenomAmount(item.availableAmount, item.decimals);
              const isAvailable = gt(item.availableAmount, '0');
              return (
                <FeeCoinButton
                  type="button"
                  key={item.baseDenom}
                  ref={isActive ? ref : undefined}
                  data-is-active={isActive}
                  onClick={() => {
                    onClickFeeCoin(item);
                  }}
                  disabled={!isAvailable}
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
                        <Tooltip title={displayFee} arrow placement="top">
                          <span>
                            <Number typoOfDecimals="h8n" typoOfIntegers="h6n" fixed={getDisplayMaxDecimals(item.decimals)}>
                              {displayFee}
                            </Number>
                          </span>
                        </Tooltip>
                      </FeeCoinLeftHeaderTitleContainer>
                    </FeeCoinLeftInfoContainer>
                  </FeeCoinLeftContainer>
                  <FeeCoinRightContainer>{isActive && <Check16Icon />}</FeeCoinRightContainer>
                </FeeCoinButton>
              );
            })}
        </FeeCoinListContainer>
      </Container>
    </Dialog>
  );
}
