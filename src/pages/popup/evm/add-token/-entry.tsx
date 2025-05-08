import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import Button from '@/components/common/Button';
import NumberTypo from '@/components/common/NumberTypo';
import SplitButtonsLayout from '@/components/common/SplitButtonsLayout';
import PaginationControls from '@/components/PaginationControls';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { useSiteIconURL } from '@/hooks/common/useSiteIconURL';
import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import { useCurrentEVMNetwork } from '@/hooks/evm/useCurrentEvmNetwork';
import { useTokenBalance } from '@/hooks/evm/useTokenBalance';
import { useCoinList } from '@/hooks/useCoinList';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentCustomERC20Tokens } from '@/hooks/useCurrentCustomERC20Tokens';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { getAddress, getKeypair } from '@/libs/address';
import { sendMessage } from '@/libs/extension';
import type { ResponseAppMessage } from '@/types/message/content';
import type { EthcAddTokens } from '@/types/message/inject/evm';
import { toDisplayDenomAmount } from '@/utils/numbers';
import { isEqualsIgnoringCase } from '@/utils/string';
import { getSiteTitle } from '@/utils/website';

import { AmountContainer, DetailWrapper, Divider, LabelContainer, LineDivider, MsgTitle, MsgTitleContainer } from './-styled';
import AssetContainer from '../../-components/AssetContainer';
import { AddressContainer } from '../../-components/CommonTxMessageStyle';
import DappInfo from '../../-components/DappInfo';

type EntryProps = {
  request: EthcAddTokens;
};

export default function Entry({ request }: EntryProps) {
  const { t } = useTranslation();

  const { currentRequestQueue, deQueue } = useCurrentRequestQueue();

  const { currentEVMNetwork } = useCurrentEVMNetwork();
  const { data } = useCoinList();

  const [isProcessing, setIsProcessing] = useState(false);

  const tokens = request.params;

  const [currentStep, setCurrentStep] = useState(0);

  const wrappedTokens = useMemo(() => {
    return tokens.map((token) => {
      const selectedToken = data?.erc20Assets.find((coin) => isEqualsIgnoringCase(coin.id, token.id));
      if (selectedToken) {
        return {
          ...token,
          id: selectedToken.id,
          chainId: selectedToken.chainId,
          symbol: selectedToken.symbol,
          decimals: selectedToken.decimals,
          image: selectedToken.image,
          coinGeckoId: selectedToken.coinGeckoId,
        };
      }
      return token;
    });
  }, [data?.erc20Assets, tokens]);

  const currentToken = useMemo(() => wrappedTokens[currentStep], [currentStep, wrappedTokens]);

  const { addCustomERC20Tokens } = useCurrentCustomERC20Tokens();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const keyPair = useMemo(
    () => currentEVMNetwork && getKeypair(currentEVMNetwork, currentAccount, currentPassword),
    [currentAccount, currentEVMNetwork, currentPassword],
  );
  const address = useMemo(
    () => currentEVMNetwork && keyPair?.publicKey && getAddress(currentEVMNetwork, keyPair.publicKey),
    [currentEVMNetwork, keyPair?.publicKey],
  );

  const { data: tokenBalance } = useTokenBalance({
    address,
    tokenContractAddress: currentToken.id,
  });

  const { siteIconURL } = useSiteIconURL(request.origin);
  const siteTitle = getSiteTitle(request.origin);

  const currentTokenDiplayAmount = useMemo(() => toDisplayDenomAmount(tokenBalance ?? '0', currentToken.decimals || 0), [currentToken.decimals, tokenBalance]);

  const handleOnClickAdd = async () => {
    try {
      setIsProcessing(true);

      await addCustomERC20Tokens(wrappedTokens);

      const result = null;

      sendMessage<ResponseAppMessage<EthcAddTokens>>({
        target: 'CONTENT',
        method: 'responseApp',
        origin: request.origin,
        requestId: request.requestId,
        tabId: request.tabId,
        params: {
          id: request.requestId,
          result,
        },
      });
    } catch {
      sendMessage({
        target: 'CONTENT',
        method: 'responseApp',
        origin: request.origin,
        requestId: request.requestId,
        tabId: request.tabId,
        params: {
          id: request.requestId,
          error: {
            code: RPC_ERROR.INVALID_INPUT,
            message: `${RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_INPUT]}`,
          },
        },
      });
    } finally {
      setIsProcessing(false);

      await deQueue();
    }
  };

  return (
    <>
      <BaseBody>
        <EdgeAligner>
          <DappInfo image={siteIconURL} name={siteTitle} url={currentRequestQueue?.origin} />
          <LineDivider />
          <MsgTitleContainer>
            <MsgTitle variant="h3_B">{t('pages.popup.evm.add-token.entry.addCustomToken')}</MsgTitle>
            {wrappedTokens.length > 1 && (
              <PaginationControls
                currentPage={currentStep}
                totalPages={wrappedTokens.length}
                onPageChange={(page) => {
                  setCurrentStep(page);
                }}
              />
            )}
          </MsgTitleContainer>
        </EdgeAligner>
        <Divider />

        <LabelContainer>
          <Base1000Text
            variant="b3_R"
            sx={{
              margin: '1.2rem 0 1rem',
            }}
          >
            {t('pages.popup.evm.add-token.entry.tokenToAdd')}
          </Base1000Text>
          <AssetContainer
            tokenimageURL={currentToken.image || 'unknown'}
            leftHeaderComponent={<Base1300Text variant="b2_M">{currentToken.symbol}</Base1300Text>}
            leftSubHeaderComponent={<Base1000Text variant="b4_R">{currentEVMNetwork?.name}</Base1000Text>}
            rightHeaderComponent={
              <AmountContainer>
                <NumberTypo typoOfIntegers="h4n_M" typoOfDecimals="h6n_R" fixed={6}>
                  {currentTokenDiplayAmount}
                </NumberTypo>
              </AmountContainer>
            }
          />
        </LabelContainer>
        <Divider
          sx={{
            margin: '1.6rem 0 1.2rem',
          }}
        />
        <DetailWrapper>
          <LabelContainer>
            <Base1000Text
              variant="b3_R"
              sx={{
                marginBottom: '0.4rem',
              }}
            >
              {t('pages.popup.evm.add-token.entry.contractAddress')}
            </Base1000Text>
            <AddressContainer>
              <Base1300Text variant="b3_M">{currentToken.id}</Base1300Text>
            </AddressContainer>
          </LabelContainer>
          <LabelContainer>
            <Base1000Text
              variant="b3_R"
              sx={{
                marginBottom: '0.4rem',
              }}
            >
              {t('pages.popup.evm.add-token.entry.type')}
            </Base1000Text>
            <Base1300Text variant="b3_M">{'ERC20'}</Base1300Text>
          </LabelContainer>
          <LabelContainer>
            <Base1000Text
              variant="b3_R"
              sx={{
                marginBottom: '0.4rem',
              }}
            >
              {t('pages.popup.evm.add-token.entry.decimals')}
            </Base1000Text>
            <Base1300Text variant="b3_M">{currentToken.decimals}</Base1300Text>
          </LabelContainer>
        </DetailWrapper>
      </BaseBody>
      <BaseFooter>
        <SplitButtonsLayout
          cancelButton={
            <Button
              onClick={async () => {
                sendMessage({
                  target: 'CONTENT',
                  method: 'responseApp',
                  origin: request.origin,
                  requestId: request.requestId,
                  tabId: request.tabId,
                  params: {
                    id: request.requestId,
                    error: {
                      code: RPC_ERROR.USER_REJECTED_REQUEST,
                      message: `${RPC_ERROR_MESSAGE[RPC_ERROR.USER_REJECTED_REQUEST]}`,
                    },
                  },
                });

                await deQueue();
              }}
              variant="dark"
            >
              {t('pages.popup.evm.add-token.entry.reject')}
            </Button>
          }
          confirmButton={
            <Button isProgress={isProcessing} onClick={handleOnClickAdd}>
              {t('pages.popup.evm.add-token.entry.addToken')}
            </Button>
          }
        />
      </BaseFooter>
    </>
  );
}
