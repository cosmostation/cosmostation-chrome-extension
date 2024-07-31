import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';

import { COSMOS_DEFAULT_SEND_GAS } from '~/constants/chain';
import AccountAddressBookBottomSheet from '~/Popup/components/AccountAddressBookBottomSheet';
import AddressBookBottomSheet from '~/Popup/components/AddressBookBottomSheet';
import Button from '~/Popup/components/common/Button';
import Tooltip from '~/Popup/components/common/Tooltip';
import Fee from '~/Popup/components/Fee';
import InputAdornmentIconButton from '~/Popup/components/InputAdornmentIconButton';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useNFTOwnerSWR } from '~/Popup/hooks/SWR/cosmos/NFT/useNFTOwnerSWR';
import { useAccountSWR } from '~/Popup/hooks/SWR/cosmos/useAccountSWR';
import { useCurrentFeesSWR } from '~/Popup/hooks/SWR/cosmos/useCurrentFeesSWR';
import { useGasMultiplySWR } from '~/Popup/hooks/SWR/cosmos/useGasMultiplySWR';
import { useICNSSWR } from '~/Popup/hooks/SWR/cosmos/useICNSSWR';
import { useNodeInfoSWR } from '~/Popup/hooks/SWR/cosmos/useNodeinfoSWR';
import { useSimulateSWR } from '~/Popup/hooks/SWR/cosmos/useSimulateSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentCosmosNFTs } from '~/Popup/hooks/useCurrent/useCurrentCosmosNFTs';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { ceil, gt, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getPublicKeyType } from '~/Popup/utils/cosmos';
import { protoTx, protoTxBytes } from '~/Popup/utils/proto';
import { getCosmosAddressRegex } from '~/Popup/utils/regex';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { CosmosChain, GasRateKey } from '~/types/chain';
import type { CosmosNFT } from '~/types/cosmos/nft';

import NFTButton from './components/NFTButton';
import NFTPopover from './components/NFTPopover';
import { Address, AddressContainer, BottomContainer, CheckAddressIconContainer, Container, Div, StyledInput, StyledTextarea } from './styled';

import AccountAddressIcon from '~/images/icons/AccountAddress.svg';
import AddressBook24Icon from '~/images/icons/AddressBook24.svg';
import CheckAddress16Icon from '~/images/icons/CheckAddress16.svg';

type CosmosProps = {
  chain: CosmosChain;
};

export default function Cosmos({ chain }: CosmosProps) {
  const { t } = useTranslation();
  const { enQueue } = useCurrentQueue();

  const account = useAccountSWR(chain, true);
  const nodeInfo = useNodeInfoSWR(chain);
  const { currentAccount } = useCurrentAccount();

  const { currentCosmosNFTs } = useCurrentCosmosNFTs();

  const params = useParams();

  const [isDisabled, setIsDisabled] = useState(false);

  const { gas, gasRate } = chain;

  const accounts = useAccounts(true);

  const address = useMemo(
    () => accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '',
    [accounts.data, chain.id, currentAccount.id],
  );

  const [currentMemo, setCurrentMemo] = useState('');

  const [recipientAddress, setRecipientAddress] = useState('');
  const [debouncedRecipientAddress] = useDebounce(recipientAddress, 500);

  const addressRegex = useMemo(() => getCosmosAddressRegex(chain.bech32Prefix.address, [39]), [chain.bech32Prefix.address]);

  const { data: ICNS } = useICNSSWR({ name: addressRegex.test(debouncedRecipientAddress) ? '' : debouncedRecipientAddress });

  const currentReceipientAddress = useMemo(() => ICNS?.data.bech32_address || recipientAddress, [ICNS?.data.bech32_address, recipientAddress]);

  const [currentNFT, setCurrentNFT] = useState<CosmosNFT>(currentCosmosNFTs.find((item) => isEqualsIgnoringCase(item.id, params.id)) || currentCosmosNFTs[0]);

  const isOwnedNFT = useNFTOwnerSWR({ contractAddress: currentNFT.address, ownerAddress: address, tokenId: currentNFT.tokenId, chain });

  const { feeCoins } = useCurrentFeesSWR(chain);

  const [currentFeeBaseDenom, setCurrentFeeBaseDenom] = useState(feeCoins[0].baseDenom);

  const currentFeeCoin = useMemo(() => feeCoins.find((item) => item.baseDenom === currentFeeBaseDenom) ?? feeCoins[0], [currentFeeBaseDenom, feeCoins]);

  const currentFeeCoinDisplayAvailableAmount = useMemo(
    () => toDisplayDenomAmount(currentFeeCoin.availableAmount, currentFeeCoin.decimals),
    [currentFeeCoin.availableAmount, currentFeeCoin.decimals],
  );

  const sendGas = useMemo(() => gas.send || COSMOS_DEFAULT_SEND_GAS, [gas.send]);

  const [customGas, setCustomGas] = useState<string | undefined>();

  const [currentGasRateKey, setCurrentGasRateKey] = useState<GasRateKey>('low');

  const [currentFeeAmount, setCurrentFeeAmount] = useState(times(sendGas, gasRate[currentGasRateKey]));

  const currentCeilFeeAmount = useMemo(() => ceil(currentFeeAmount), [currentFeeAmount]);

  const currentFeeGasRate = useMemo(() => currentFeeCoin.gasRate ?? chain.gasRate, [chain.gasRate, currentFeeCoin.gasRate]);

  const [isOpenedAddressBook, setIsOpenedAddressBook] = useState(false);
  const [isOpenedMyAddressBook, setIsOpenedMyAddressBook] = useState(false);

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);

  const memoizedSendAminoTx = useMemo(() => {
    if (account.data?.value.account_number && addressRegex.test(currentReceipientAddress)) {
      const sequence = String(account.data?.value.sequence || '0');

      return {
        account_number: String(account.data.value.account_number),
        sequence,
        chain_id: nodeInfo.data?.default_node_info?.network ?? chain.chainId,
        fee: {
          amount: [
            {
              denom: currentFeeCoin.baseDenom,
              amount: chain.type === 'ETHERMINT' ? times(currentFeeGasRate[currentGasRateKey], COSMOS_DEFAULT_SEND_GAS, 0) : '1',
            },
          ],
          gas: COSMOS_DEFAULT_SEND_GAS,
        },
        memo: currentMemo,
        msgs: [
          {
            type: 'wasm/MsgExecuteContract',
            value: {
              sender: address,
              contract: currentNFT.address,
              msg: {
                transfer_nft: {
                  recipient: currentReceipientAddress,
                  token_id: currentNFT.tokenId,
                },
              },
              funds: [],
            },
          },
        ],
      };
    }
    return undefined;
  }, [
    account.data?.value.account_number,
    account.data?.value.sequence,
    addressRegex,
    currentReceipientAddress,
    nodeInfo.data?.default_node_info?.network,
    chain.chainId,
    chain.type,
    currentFeeCoin.baseDenom,
    currentFeeGasRate,
    currentGasRateKey,
    currentMemo,
    address,
    currentNFT.address,
    currentNFT.tokenId,
  ]);

  const [sendAminoTx] = useDebounce(memoizedSendAminoTx, 700);

  const sendProtoTx = useMemo(() => {
    if (sendAminoTx) {
      const pTx = protoTx(sendAminoTx, [Buffer.from(new Uint8Array(64)).toString('base64')], { type: getPublicKeyType(chain), value: '' });

      return pTx ? protoTxBytes({ ...pTx }) : null;
    }
    return null;
  }, [chain, sendAminoTx]);

  const simulate = useSimulateSWR({ chain, txBytes: sendProtoTx?.tx_bytes });

  const { data: gasMultiply } = useGasMultiplySWR(chain);

  const simulatedGas = useMemo(
    () => (simulate.data?.gas_info?.gas_used ? times(simulate.data.gas_info.gas_used, gasMultiply, 0) : undefined),
    [gasMultiply, simulate.data?.gas_info?.gas_used],
  );

  const currentGas = useMemo(() => customGas || simulatedGas || sendGas, [customGas, sendGas, simulatedGas]);

  const errorMessage = useMemo(() => {
    if (isOwnedNFT.error) {
      return t('pages.Wallet.NFTSend.Entry.Cosmos.index.networkError');
    }

    if (!isOwnedNFT.isOwnedNFT) {
      return t('pages.Wallet.NFTSend.Entry.Cosmos.index.notOwnedNFT');
    }

    if (!addressRegex.test(currentReceipientAddress)) {
      return t('pages.Wallet.NFTSend.Entry.Cosmos.index.invalidAddress');
    }

    if (isEqualsIgnoringCase(address, currentReceipientAddress)) {
      return t('pages.Wallet.NFTSend.Entry.Cosmos.index.invalidAddress');
    }

    if (currentFeeCoinDisplayAvailableAmount === '0') {
      return t('pages.Wallet.NFTSend.Entry.Cosmos.index.invalidAmount');
    }

    if (gt(currentCeilFeeAmount, currentFeeCoin.availableAmount)) {
      return t('pages.Wallet.NFTSend.Entry.Cosmos.index.insufficientAmount');
    }

    return '';
  }, [
    isOwnedNFT.error,
    isOwnedNFT.isOwnedNFT,
    addressRegex,
    currentReceipientAddress,
    address,
    currentFeeCoinDisplayAvailableAmount,
    currentCeilFeeAmount,
    currentFeeCoin.availableAmount,
    t,
  ]);

  const debouncedEnabled = useDebouncedCallback(() => {
    setTimeout(() => {
      setIsDisabled(false);
    }, 700);
  }, 700);

  useEffect(() => {
    setIsDisabled(true);

    debouncedEnabled();
  }, [debouncedEnabled, memoizedSendAminoTx]);

  useEffect(() => {
    setCurrentFeeAmount(times(currentGas, currentFeeGasRate[currentGasRateKey]));
  }, [currentGas, currentGasRateKey, currentFeeGasRate]);

  return (
    <>
      <Container>
        <Div>
          <NFTButton
            chain={chain}
            currentNFT={currentNFT}
            isActive={isOpenPopover}
            onClick={(event) => {
              setPopoverAnchorEl(event.currentTarget);
            }}
          />
        </Div>

        <Div sx={{ margin: '0.8rem 0' }}>
          <StyledInput
            endAdornment={
              <>
                <InputAdornment position="end">
                  <InputAdornmentIconButton onClick={() => setIsOpenedMyAddressBook(true)}>
                    <AccountAddressIcon />
                  </InputAdornmentIconButton>
                </InputAdornment>
                <InputAdornment position="start">
                  <InputAdornmentIconButton onClick={() => setIsOpenedAddressBook(true)} edge="end">
                    <AddressBook24Icon />
                  </InputAdornmentIconButton>
                </InputAdornment>
              </>
            }
            placeholder={t('pages.Wallet.NFTSend.Entry.Cosmos.index.recipientAddressPlaceholder')}
            onChange={(e) => setRecipientAddress(e.currentTarget.value)}
            value={recipientAddress}
          />
        </Div>

        {ICNS?.data.bech32_address && (
          <AddressContainer>
            <CheckAddressIconContainer>
              <CheckAddress16Icon />
            </CheckAddressIconContainer>
            <Address>
              <Typography variant="h7">{ICNS.data.bech32_address}</Typography>
            </Address>
          </AddressContainer>
        )}

        <StyledTextarea
          multiline
          minRows={3}
          maxRows={3}
          placeholder={t('pages.Wallet.NFTSend.Entry.Cosmos.index.memoPlaceholder')}
          onChange={(e) => setCurrentMemo(e.currentTarget.value)}
          value={currentMemo}
        />

        <Fee
          feeCoin={currentFeeCoin}
          feeCoinList={feeCoins}
          gasRate={currentFeeGasRate}
          baseFee={currentFeeAmount}
          gas={currentGas}
          onChangeFeeCoin={(selectedFeeCoin) => {
            setCurrentFeeBaseDenom(selectedFeeCoin.baseDenom);
          }}
          onChangeGas={(g) => setCustomGas(g)}
          onChangeGasRateKey={(gasRateKey) => setCurrentGasRateKey(gasRateKey)}
          isEdit
        />
        <BottomContainer>
          <Tooltip varient="error" title={errorMessage} placement="top" arrow>
            <div>
              <Button
                type="button"
                disabled={!!errorMessage || !sendAminoTx || isDisabled}
                onClick={async () => {
                  if (sendAminoTx) {
                    await enQueue({
                      messageId: '',
                      origin: '',
                      channel: 'inApp',
                      message: {
                        method: 'cos_signAmino',
                        params: {
                          chainName: chain.chainName,
                          doc: { ...sendAminoTx, fee: { amount: [{ denom: currentFeeCoin.baseDenom, amount: currentCeilFeeAmount }], gas: currentGas } },
                          isEditFee: false,
                          isEditMemo: false,
                          isCheckBalance: true,
                        },
                      },
                    });
                  }
                }}
              >
                {t('pages.Wallet.NFTSend.Entry.Cosmos.index.sendButton')}
              </Button>
            </div>
          </Tooltip>
        </BottomContainer>

        <AddressBookBottomSheet
          open={isOpenedAddressBook}
          onClose={() => setIsOpenedAddressBook(false)}
          onClickAddress={(a) => {
            setRecipientAddress(a.address);
          }}
        />

        <AccountAddressBookBottomSheet
          open={isOpenedMyAddressBook}
          hasCurrentAccount={false}
          chain={chain}
          onClose={() => setIsOpenedMyAddressBook(false)}
          onClickAddress={(a) => {
            setRecipientAddress(a);
          }}
        />
      </Container>
      <NFTPopover
        chain={chain}
        marginThreshold={0}
        currentNFT={currentNFT}
        open={isOpenPopover}
        onClose={() => setPopoverAnchorEl(null)}
        onClickNFT={(nft) => {
          if (currentNFT !== nft) {
            setCurrentNFT(nft);
          }
        }}
        anchorEl={popoverAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      />
    </>
  );
}
