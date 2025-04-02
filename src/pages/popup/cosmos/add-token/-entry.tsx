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
import { useTokenBalance } from '@/hooks/cosmos/useTokenBalance';
import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import { useCoinList } from '@/hooks/useCoinList';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentCustomCW20Tokens } from '@/hooks/useCurrentCustomCW20Tokens';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { getAddress, getKeypair } from '@/libs/address';
import { sendMessage } from '@/libs/extension';
import type { CosmosChain } from '@/types/chain';
import type { CosAddTokensCW20Internal, CosAddTokensCW20Response } from '@/types/message/inject/cosmos';
import { toDisplayDenomAmount } from '@/utils/numbers';
import { getSiteTitle } from '@/utils/website';

import { AmountContainer, DetailWrapper, Divider, LabelContainer, LineDivider, MsgTitle, MsgTitleContainer } from './-styled';
import AssetContainer from '../../-components/AssetContainer';
import { AddressContainer } from '../../-components/CommonTxMessageStyle';
import DappInfo from '../../-components/DappInfo';

type EntryProps = {
  request: CosAddTokensCW20Internal;
  chain: CosmosChain;
};

export default function Entry({ request, chain }: EntryProps) {
  const { t } = useTranslation();

  const { currentRequestQueue, deQueue } = useCurrentRequestQueue();
  const { data } = useCoinList();

  const [isProcessing, setIsProcessing] = useState(false);

  const { chainName, tokens } = request.params;

  const [currentStep, setCurrentStep] = useState(0);

  const wrappedTokens = useMemo(() => {
    return tokens.map((token) => ({
      ...token,
      image: data?.cw20Assets.find((coin) => coin.id === token.id)?.image,
      coinGeckoId: data?.cw20Assets.find((coin) => coin.id === token.id)?.coinGeckoId,
    }));
  }, [data?.cw20Assets, tokens]);

  const currentToken = useMemo(() => wrappedTokens[currentStep], [currentStep, wrappedTokens]);

  const { addCustomCW20Tokens } = useCurrentCustomCW20Tokens();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const keyPair = getKeypair(chain, currentAccount, currentPassword);
  const address = getAddress(chain, keyPair.publicKey);

  const { data: tokenBalance } = useTokenBalance({
    chain,
    address,
    contractAddress: currentToken.id,
  });

  const { siteIconURL } = useSiteIconURL(request.origin);
  const siteTitle = getSiteTitle(request.origin);

  const currentTokenDiplayAmount = useMemo(
    () => toDisplayDenomAmount(tokenBalance?.data.balance ?? '0', currentToken.decimals || 0),
    [currentToken.decimals, tokenBalance?.data.balance],
  );

  const handleOnClickAdd = async () => {
    try {
      setIsProcessing(true);

      await addCustomCW20Tokens(wrappedTokens);

      const result: CosAddTokensCW20Response = null;
      sendMessage({
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
            <MsgTitle variant="h3_B">{t('pages.popup.cosmos.add-token.entry.addCustomToken')}</MsgTitle>
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
            {t('pages.popup.cosmos.add-token.entry.tokenToAdd')}
          </Base1000Text>
          <AssetContainer
            tokenimageURL={currentToken.image || 'unknown'}
            leftHeaderComponent={<Base1300Text variant="b2_M">{currentToken.symbol}</Base1300Text>}
            leftSubHeaderComponent={<Base1000Text variant="b4_R">{chainName}</Base1000Text>}
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
              {t('pages.popup.cosmos.add-token.entry.contractAddress')}
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
              {t('pages.popup.cosmos.add-token.entry.type')}
            </Base1000Text>
            <Base1300Text variant="b3_M">{'CW20'}</Base1300Text>
          </LabelContainer>
          <LabelContainer>
            <Base1000Text
              variant="b3_R"
              sx={{
                marginBottom: '0.4rem',
              }}
            >
              {t('pages.popup.cosmos.add-token.entry.decimals')}
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
              {t('pages.popup.cosmos.add-token.entry.reject')}
            </Button>
          }
          confirmButton={
            <Button isProgress={isProcessing} onClick={handleOnClickAdd}>
              {t('pages.popup.cosmos.add-token.entry.addToken')}
            </Button>
          }
        />
      </BaseFooter>
    </>
  );
}
