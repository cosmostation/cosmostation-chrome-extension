import { useEffect, useMemo, useState } from 'react';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { Typography } from '@mui/material';

import { COSMOS_DEFAULT_SWAP_GAS } from '~/constants/chain';
import { COSMOS } from '~/constants/chain/cosmos/cosmos';
import { CURRENCY_SYMBOL } from '~/constants/currency';
import Button from '~/Popup/components/common/Button';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useAssetsSWR } from '~/Popup/hooks/SWR/cosmos/useAssetsSWR';
import { useBalanceSWR } from '~/Popup/hooks/SWR/cosmos/useBalanceSWR';
import type { CoinInfo as BaseCoinInfo } from '~/Popup/hooks/SWR/cosmos/useCoinListSWR';
import { usePoolsAssetSWR } from '~/Popup/hooks/SWR/cosmos/usePoolsAssetSWR';
import { usePoolSWR } from '~/Popup/hooks/SWR/cosmos/usePoolsSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { ceil, divide, fix, gt, gte, isDecimal, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '~/Popup/utils/big';
import { convertAssetNameToCosmos } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type { AssetV3 } from '~/types/cosmos/asset';

import CoinListBottomSheet from './components/CoinListBottomSheet';
import SlippageSettingDialog from './components/SlippageSettingDialog';
import {
  BackButton,
  BottomContainer,
  Container,
  MaxButton,
  SideButton,
  StyledInput,
  SwapCoinContainer,
  SwapCoinContainerButton,
  SwapCoinHeaderContainer,
  SwapCoinLeftContainer,
  SwapCoinLeftHeaderContainer,
  SwapCoinLeftIconButton,
  SwapCoinLeftImageContainer,
  SwapCoinLeftInfoContainer,
  SwapCoinLeftSubTitleContainer,
  SwapCoinLeftTitleContainer,
  SwapCoinRightContainer,
  SwapCoinRightHeaderContainer,
  SwapCoinRightSubTitleContainer,
  SwapCoinRightTitleContainer,
  SwapContainer,
  SwapIconButton,
  SwapInfoContainer,
  SwapInfoHeaderContainer,
  SwapInfoSubContainer,
  SwapInfoSubLeftContainer,
  SwapInfoSubRightContainer,
  SwapInfoSubRightTextContainer,
  TextContainer,
  TopContainer,
} from './styled';

import BottomArrow24Icon from '~/images/icons/BottomArrow24.svg';
import LeftArrow16Icon from '~/images/icons/LeftArrow16.svg';
import Management24Icon from '~/images/icons/Mangement24.svg';
import SwapIcon from '~/images/icons/Swap.svg';

export type CoinInfo = BaseCoinInfo;
export type ChainAssetInfo = AssetV3 & { chainName: string; availableAmount?: string };

type EntryProps = {
  chain: CosmosChain;
};

export default function Entry({ chain }: EntryProps) {
  const { t } = useTranslation();
  const { navigateBack } = useNavigate();
  const { chromeStorage } = useChromeStorage();
  const { currency } = chromeStorage;
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const currentChainAssets = useAssetsSWR(chain);
  const balance = useBalanceSWR(chain);

  const poolsAssetData = usePoolsAssetSWR(chain.chainName.toLowerCase());
  const poolDenomList = poolsAssetData.data ? [...poolsAssetData.data.map((item) => item.adenom), ...poolsAssetData.data.map((item) => item.bdenom)] : [];
  const uniquePoolDenomList = poolDenomList.filter((denom, idx, arr) => arr.findIndex((item) => item === denom) === idx);

  const availableSwapCoinList: ChainAssetInfo[] = useMemo(() => {
    const nameMap = {
      'dig-chain': 'Dig',
    } as Record<string, string>;

    const swapCoinList =
      currentChainAssets.data
        .filter((item) => uniquePoolDenomList.includes(item.denom))
        .map((item) => ({
          ...item,
          chainName:
            convertAssetNameToCosmos(item.prevChain || item.origin_chain)?.chainName ||
            nameMap[item.origin_chain] ||
            item.origin_chain.charAt(0).toUpperCase().concat(item.origin_chain.slice(1)),
          availableAmount: balance.data?.balance ? balance.data?.balance.find((coin) => coin.denom === item.denom)?.amount : '0',
        })) || [];

    const sortedAvailableSwapCoinList = [
      ...swapCoinList.filter((item) => gt(item?.availableAmount || 0, 0) && (item.type === 'staking' || item.type === 'native')),
      ...swapCoinList.filter((item) => gt(item?.availableAmount || 0, 0) && item.type === 'ibc').sort((a, b) => a.symbol.localeCompare(b.symbol)),
      ...swapCoinList.filter((item) => !gt(item?.availableAmount || 0, 0)).sort((a, b) => a.symbol.localeCompare(b.symbol)),
    ];
    return sortedAvailableSwapCoinList;
  }, [balance, currentChainAssets.data, uniquePoolDenomList]);

  const [inputCoinBaseDenom, setInputCoinBaseDenom] = useState<string | undefined>('uosmo');
  const [outputCoinBaseDenom, setoutputCoinBaseDenom] = useState<string | undefined>('ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2');

  const [inputDisplayAmount, setInputAmout] = useState<string>('');
  const [outputDisplayAmount, setOutputAmout] = useState<string>('0');

  const currentPool = useMemo(
    () =>
      poolsAssetData.data?.find(
        (item) =>
          (item.adenom === outputCoinBaseDenom && item.bdenom === inputCoinBaseDenom) ||
          (item.adenom === inputCoinBaseDenom && item.bdenom === outputCoinBaseDenom),
      ),
    [inputCoinBaseDenom, outputCoinBaseDenom, poolsAssetData.data],
  );
  // TODO 소수점 rounding 처리
  // FIXME 아웃풋 코인 풀이 없어서 강제로 첫번쨰로 변환될 떄 그 떄 풀 값을 다시 안가져와서 아웃풋 어마운트가 이상하게 잡힘
  const availableSwapOutputCoinList = useMemo(
    () =>
      availableSwapCoinList.filter((coin) =>
        poolsAssetData.data?.find(
          (item) => (item.adenom === coin.denom && item.bdenom === inputCoinBaseDenom) || (item.adenom === inputCoinBaseDenom && item.bdenom === coin.denom),
        ),
      ),
    [availableSwapCoinList, inputCoinBaseDenom, poolsAssetData.data],
  );

  const inputCoin = useMemo(() => availableSwapCoinList.find((item) => item.denom === inputCoinBaseDenom), [availableSwapCoinList, inputCoinBaseDenom]);
  const outputCoin = useMemo(
    () => availableSwapOutputCoinList.find((item) => item.denom === outputCoinBaseDenom) || availableSwapOutputCoinList[0],
    [availableSwapOutputCoinList, outputCoinBaseDenom],
  );

  const currentTokenOutAmount = useMemo(() => toBaseDenomAmount(outputDisplayAmount, outputCoin?.decimals || 0), [outputCoin?.decimals, outputDisplayAmount]);

  const currentPoolId = useMemo(() => currentPool?.id || '1', [currentPool?.id]);

  const poolsData = usePoolSWR(currentPoolId);

  const poolAsssets = useMemo(() => poolsData.data?.pool.pool_assets, [poolsData.data?.pool.pool_assets]);

  const currentSwapRate = useMemo(() => {
    const tokenList = poolAsssets ? poolAsssets.map((item) => item.token) : [];

    const inputTokenPoolAmount = tokenList.find((item) => item.denom === inputCoinBaseDenom)?.amount || 1;
    const outputTokenPoolAmount = tokenList.find((item) => item.denom === outputCoin?.denom)?.amount || 1;

    return divide(outputTokenPoolAmount, inputTokenPoolAmount);
  }, [inputCoinBaseDenom, outputCoin?.denom, poolAsssets]);

  const transitionRatio = useMemo(() => times(1, currentSwapRate, outputCoin?.decimals), [outputCoin, currentSwapRate]);

  const currentInputCoinAvailableAmount = useMemo(() => inputCoin?.availableAmount || '1', [inputCoin]);

  const currentInputCoinDisplayAvailableAmount = useMemo(
    () => toDisplayDenomAmount(currentInputCoinAvailableAmount, inputCoin?.decimals || 1),
    [currentInputCoinAvailableAmount, inputCoin],
  );

  const swapFeePercentage = useMemo(() => fix(poolsData.data?.pool.pool_params.swap_fee ?? '0', 3), [poolsData.data?.pool.pool_params.swap_fee]);

  // NOTE 멀티 코인
  const currentFeeCoin = chain;

  const currentFeeAmount = useMemo(() => times(COSMOS_DEFAULT_SWAP_GAS, swapFeePercentage), [swapFeePercentage]);

  // NOTE 실제 msg에 들어가는 값인데 SwapInfo에서 보여주는 예상 swap fee랑 일치하지 않음 기준이 필요함
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentCeilFeeAmount = useMemo(() => ceil(currentFeeAmount), [currentFeeAmount]);

  const currentDisplayFeeAmount = useMemo(
    () => (inputDisplayAmount ? times(inputDisplayAmount, swapFeePercentage) : '0'),
    [inputDisplayAmount, swapFeePercentage],
  );

  const maxDisplayAmount = useMemo(() => {
    const maxAmount = minus(currentInputCoinDisplayAvailableAmount, currentDisplayFeeAmount);
    if (inputCoin?.denom === currentFeeCoin.baseDenom) {
      return gt(maxAmount, '0') ? maxAmount : '0';
    }

    return currentInputCoinDisplayAvailableAmount;
  }, [currentInputCoinDisplayAvailableAmount, currentDisplayFeeAmount, inputCoin?.denom, currentFeeCoin.baseDenom]);

  const [currentSlippage, setCurrentSlippage] = useState('1');

  const [debouncedInputDisplayAmount] = useDebounce(inputDisplayAmount, 200);

  const [debouncedCurrentSwapRate] = useDebounce(currentSwapRate, 200);

  useEffect(() => {
    if (debouncedInputDisplayAmount && debouncedCurrentSwapRate) {
      setOutputAmout(times(debouncedInputDisplayAmount, debouncedCurrentSwapRate, 6));
    } else {
      setOutputAmout('0');
    }
  }, [debouncedInputDisplayAmount, debouncedCurrentSwapRate]);

  const swapCoin = useDebouncedCallback(() => {
    setInputCoinBaseDenom(outputCoin?.denom);
    setoutputCoinBaseDenom(inputCoin?.denom);
    if (inputDisplayAmount) {
      setInputAmout(outputDisplayAmount);
      setOutputAmout(debouncedInputDisplayAmount);
    }
  }, 200);

  const tokenOutMinAmount = useMemo(
    () => (currentSlippage && currentTokenOutAmount ? minus(currentTokenOutAmount, times(currentTokenOutAmount, divide(currentSlippage, 100))) : '0'),
    [currentSlippage, currentTokenOutAmount],
  );

  const tokenOutMinDisplayAmount = useMemo(() => toDisplayDenomAmount(tokenOutMinAmount, outputCoin?.decimals || 0), [outputCoin?.decimals, tokenOutMinAmount]);

  const [isOpenSlippageDialog, setisOpenSlippageDialog] = useState(false);

  const [isOpenedInputCoinList, setIsOpenedInputCoinList] = useState(false);
  const [isOpenedOutputCoinList, setIsOpenedOutputCoinList] = useState(false);

  const inputChainPrice = useMemo(
    () => (inputCoin?.coinGeckoId && coinGeckoPrice.data?.[inputCoin?.coinGeckoId]?.[chromeStorage.currency]) || 0,
    [chromeStorage.currency, coinGeckoPrice.data, inputCoin?.coinGeckoId],
  );
  const outputChainPrice = useMemo(
    () => (outputCoin?.coinGeckoId && coinGeckoPrice.data?.[outputCoin?.coinGeckoId]?.[chromeStorage.currency]) || 0,
    [chromeStorage.currency, coinGeckoPrice.data, outputCoin?.coinGeckoId],
  );

  const inputChainAmoutPrice = useMemo(() => (inputDisplayAmount ? times(inputDisplayAmount, inputChainPrice) : '0'), [inputDisplayAmount, inputChainPrice]);
  const outputChainAmoutPrice = useMemo(
    () => (inputDisplayAmount ? times(outputDisplayAmount, outputChainPrice) : '0'),
    [inputDisplayAmount, outputDisplayAmount, outputChainPrice],
  );

  const swapFeePrice = useMemo(
    () => (inputDisplayAmount ? times(inputChainAmoutPrice, swapFeePercentage) : '0'),
    [inputDisplayAmount, inputChainAmoutPrice, swapFeePercentage],
  );

  const errorMessage = useMemo(() => {
    if (!inputDisplayAmount || !gt(inputDisplayAmount, '0')) {
      return t('pages.Wallet.Swap.entry.invalidAmount');
    }
    if (!gte(currentInputCoinDisplayAvailableAmount, inputDisplayAmount)) {
      return t('pages.Wallet.Swap.entry.insufficientAmount');
    }
    if (!gte(currentInputCoinDisplayAvailableAmount, plus(inputDisplayAmount, currentDisplayFeeAmount))) {
      return t('pages.Wallet.Swap.entry.insufficientAmount');
    }
    if (!gte(currentInputCoinDisplayAvailableAmount, currentDisplayFeeAmount)) {
      return t('pages.Wallet.Swap.entry.insufficientFeeAmount');
    }
    return '';
  }, [currentDisplayFeeAmount, currentInputCoinDisplayAvailableAmount, inputDisplayAmount, t]);
  return (
    <>
      <Container>
        <TopContainer>
          <BackButton onClick={() => navigateBack()}>
            <LeftArrow16Icon />
          </BackButton>
          <TextContainer>
            <Typography variant="h3">{t('pages.Wallet.Swap.entry.title')}</Typography>
          </TextContainer>
          <SideButton onClick={() => setisOpenSlippageDialog(true)}>
            <Management24Icon />
          </SideButton>
        </TopContainer>
        <SwapContainer>
          {/* NOTE InPut */}
          <SwapCoinContainer>
            <SwapCoinHeaderContainer>
              <SwapCoinLeftHeaderContainer>
                <Typography variant="h6">Input Coin</Typography>
              </SwapCoinLeftHeaderContainer>
              <SwapCoinRightHeaderContainer>
                <Typography variant="h6n">Available :</Typography>
                &nbsp;
                <Number typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={inputCoin?.decimals}>
                  {currentInputCoinDisplayAvailableAmount}
                </Number>
                <MaxButton
                  onClick={() => {
                    setInputAmout(maxDisplayAmount);
                  }}
                >
                  <Typography variant="h6n">MAX</Typography>
                </MaxButton>
              </SwapCoinRightHeaderContainer>
            </SwapCoinHeaderContainer>
            <SwapCoinContainerButton>
              <SwapCoinLeftContainer>
                <SwapCoinLeftImageContainer>
                  <Image src={inputCoin?.image || chain.imageURL} />
                </SwapCoinLeftImageContainer>
                <SwapCoinLeftInfoContainer>
                  <SwapCoinLeftTitleContainer>
                    <Typography variant="h4">{inputCoin?.symbol || chain.displayDenom}</Typography>
                  </SwapCoinLeftTitleContainer>
                  <SwapCoinLeftSubTitleContainer>
                    <Typography variant="h6">{inputCoin?.chainName || chain.chainName}</Typography>
                  </SwapCoinLeftSubTitleContainer>
                </SwapCoinLeftInfoContainer>
                <SwapCoinLeftIconButton onClick={() => setIsOpenedInputCoinList(true)} data-is-active={isOpenedInputCoinList}>
                  <BottomArrow24Icon />
                </SwapCoinLeftIconButton>
              </SwapCoinLeftContainer>
              <SwapCoinRightContainer>
                <SwapCoinRightTitleContainer>
                  <StyledInput
                    placeholder={`${inputDisplayAmount || '0'}`}
                    value={inputDisplayAmount}
                    onChange={(e) => {
                      if (!isDecimal(e.currentTarget.value, inputCoin?.decimals || 6) && e.currentTarget.value) {
                        return;
                      }
                      setInputAmout(e.currentTarget.value);
                    }}
                  />
                </SwapCoinRightTitleContainer>
                <SwapCoinRightSubTitleContainer>
                  {inputDisplayAmount && (
                    <Tooltip title={inputChainAmoutPrice} arrow placement="top">
                      <span>
                        <Number typoOfDecimals="h7n" typoOfIntegers="h5n" fixed={2} currency={currency}>
                          {inputChainAmoutPrice}
                        </Number>
                      </span>
                    </Tooltip>
                  )}
                </SwapCoinRightSubTitleContainer>
              </SwapCoinRightContainer>
            </SwapCoinContainerButton>
          </SwapCoinContainer>
          {/* NOTE OutPut */}
          <SwapCoinContainer>
            <SwapCoinHeaderContainer>
              <SwapCoinLeftHeaderContainer>
                <Typography variant="h6">Output Coin</Typography>
              </SwapCoinLeftHeaderContainer>
            </SwapCoinHeaderContainer>
            <SwapCoinContainerButton>
              <SwapCoinLeftContainer>
                <SwapCoinLeftImageContainer>
                  <Image src={outputCoin?.image || COSMOS.imageURL} />
                </SwapCoinLeftImageContainer>
                <SwapCoinLeftInfoContainer>
                  <SwapCoinLeftTitleContainer>
                    <Typography variant="h4">{outputCoin?.symbol || COSMOS.displayDenom}</Typography>
                  </SwapCoinLeftTitleContainer>
                  <SwapCoinLeftSubTitleContainer>
                    <Typography variant="h6">{outputCoin?.chainName || COSMOS.chainName}</Typography>
                  </SwapCoinLeftSubTitleContainer>
                </SwapCoinLeftInfoContainer>
                <SwapCoinLeftIconButton onClick={() => setIsOpenedOutputCoinList(true)} data-is-active={isOpenedOutputCoinList}>
                  <BottomArrow24Icon />
                </SwapCoinLeftIconButton>
              </SwapCoinLeftContainer>
              <SwapCoinRightContainer>
                <SwapCoinRightTitleContainer data-is-active={outputDisplayAmount !== '0'}>
                  <Number typoOfIntegers="h4n">{outputDisplayAmount}</Number>
                </SwapCoinRightTitleContainer>
                <SwapCoinRightSubTitleContainer>
                  {outputDisplayAmount && debouncedInputDisplayAmount && (
                    <Tooltip title={outputChainAmoutPrice} arrow placement="top">
                      <span>
                        <Number typoOfDecimals="h7n" typoOfIntegers="h5n" fixed={2} currency={currency}>
                          {outputChainAmoutPrice}
                        </Number>
                      </span>
                    </Tooltip>
                  )}
                </SwapCoinRightSubTitleContainer>
              </SwapCoinRightContainer>
            </SwapCoinContainerButton>
          </SwapCoinContainer>
          <SwapIconButton onClick={swapCoin}>
            <SwapIcon />
          </SwapIconButton>
        </SwapContainer>
        <SwapInfoContainer>
          <SwapInfoHeaderContainer>
            <Number typoOfIntegers="h6n" typoOfDecimals="h7n">
              1
            </Number>
            &nbsp;
            <Typography variant="h6n">{inputCoin?.symbol} ≈</Typography>
            &nbsp;
            <Number typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={outputCoin?.decimals}>
              {transitionRatio}
            </Number>
            &nbsp;
            <Typography variant="h6n">{outputCoin?.symbol}</Typography>
          </SwapInfoHeaderContainer>
          <SwapInfoSubContainer>
            <SwapInfoSubLeftContainer>
              <Typography variant="h6">Price Impact</Typography>
              <SwapInfoSubRightContainer>
                {debouncedInputDisplayAmount ? (
                  <SwapInfoSubRightTextContainer>
                    <Typography variant="h6n">-</Typography>
                    &nbsp;
                    <Typography variant="h6n">{'<'}</Typography>
                    &nbsp;
                    <Number typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={2}>
                      {swapFeePrice}
                    </Number>
                    <Typography variant="h6n">%</Typography>
                  </SwapInfoSubRightTextContainer>
                ) : (
                  <Typography variant="h6">-</Typography>
                )}
              </SwapInfoSubRightContainer>
            </SwapInfoSubLeftContainer>
            <SwapInfoSubLeftContainer>
              <Typography variant="h6">Swap Fee ({swapFeePercentage}%)</Typography>
              <SwapInfoSubRightContainer>
                {debouncedInputDisplayAmount && swapFeePrice ? (
                  <SwapInfoSubRightTextContainer>
                    <Typography variant="h6">≈</Typography>
                    &nbsp;
                    <Typography variant="h6n">{'<'}</Typography>
                    &nbsp;
                    <Typography variant="h5n">{currency && `${CURRENCY_SYMBOL[currency]} `}</Typography>
                    &nbsp;
                    <Number typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={2}>
                      {swapFeePrice}
                    </Number>
                  </SwapInfoSubRightTextContainer>
                ) : (
                  <Typography variant="h6">-</Typography>
                )}
              </SwapInfoSubRightContainer>
            </SwapInfoSubLeftContainer>
            <SwapInfoSubLeftContainer>
              <Typography variant="h6">Expected Output</Typography>
              <SwapInfoSubRightContainer>
                {debouncedInputDisplayAmount && outputDisplayAmount ? (
                  <SwapInfoSubRightTextContainer>
                    <Number typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={outputCoin?.decimals}>
                      {outputDisplayAmount}
                    </Number>
                    &nbsp;
                    <Typography variant="h6n">{outputCoin?.symbol}</Typography>
                  </SwapInfoSubRightTextContainer>
                ) : (
                  <Typography variant="h6">-</Typography>
                )}
              </SwapInfoSubRightContainer>
            </SwapInfoSubLeftContainer>
            <SwapInfoSubLeftContainer>
              {/* TODO 이거 Minimim received 아닌지 여쭤보기 */}
              <Typography variant="h6">Minimum after slippage ({currentSlippage}%)</Typography>
              <SwapInfoSubRightContainer>
                {debouncedInputDisplayAmount && tokenOutMinDisplayAmount ? (
                  <SwapInfoSubRightTextContainer>
                    <Number typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={outputCoin?.decimals}>
                      {tokenOutMinDisplayAmount}
                    </Number>
                    &nbsp;
                    <Typography variant="h6n">{outputCoin?.symbol}</Typography>
                  </SwapInfoSubRightTextContainer>
                ) : (
                  <Typography variant="h6">-</Typography>
                )}
              </SwapInfoSubRightContainer>
            </SwapInfoSubLeftContainer>
          </SwapInfoSubContainer>
        </SwapInfoContainer>
        <BottomContainer>
          <Tooltip varient="error" title={errorMessage} placement="top" arrow>
            <div>
              <Button
                type="button"
                disabled={!!errorMessage}
                // onClick={ }
              >
                {t('pages.Wallet.Swap.Entry.swapButton')}
              </Button>
            </div>
          </Tooltip>
        </BottomContainer>
      </Container>
      <SlippageSettingDialog
        selectedSlippage={currentSlippage}
        open={isOpenSlippageDialog}
        onClose={() => setisOpenSlippageDialog(false)}
        onSubmitSlippage={(customSlippage) => {
          setCurrentSlippage(customSlippage);
        }}
      />
      <CoinListBottomSheet
        currentSelectedCoin={inputCoin}
        availableCoinList={availableSwapCoinList}
        open={isOpenedInputCoinList}
        onClose={() => setIsOpenedInputCoinList(false)}
        onClickCoin={(clickedCoin) => setInputCoinBaseDenom(clickedCoin.denom)}
      />
      <CoinListBottomSheet
        currentSelectedCoin={outputCoin}
        availableCoinList={availableSwapOutputCoinList}
        open={isOpenedOutputCoinList}
        onClose={() => setIsOpenedOutputCoinList(false)}
        onClickCoin={(clickedCoin) => setoutputCoinBaseDenom(clickedCoin.denom)}
      />
      );
    </>
  );
}
