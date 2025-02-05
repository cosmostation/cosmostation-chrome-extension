import type { SuiTransactionBlockResponse } from '@mysten/sui/client';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';

import type {
  AnalyzedTransaction,
  BasicTransactionInfo,
  FaucetTransactionInfo,
  ImportantTransactionInfo,
  MoveCallTransactionInfo,
  SendTransactionInfo,
  StakingTransactionInfo,
  SuiJsonValue,
} from '@/types/sui/parseTx';

import addressOwner from './addressOwner';
import { getTotalGasUsed } from './calculate';
import { findBalanceChanges } from './transaction';
import { equal, plus, times } from '../numbers';

const FAUCET_COMMANDS = `[{"SplitCoins":["GasCoin",[{"Input":0},{"Input":0},{"Input":0},{"Input":0},{"Input":0}]]},{"TransferObjects":[[{"NestedResult":[0,0]},{"NestedResult":[0,1]},{"NestedResult":[0,2]},{"NestedResult":[0,3]},{"NestedResult":[0,4]}],{"Input":1}]}]`;

export function analyzeTransactions(ownerAddress: string, transactions: SuiTransactionBlockResponse[]) {
  const results: AnalyzedTransaction[] = [];

  for (const transaction of transactions) {
    const isSender = ownerAddress === transaction.transaction?.data?.sender;

    const important: ImportantTransactionInfo = {};

    const stakingTransactions = stakingTransactionAnalysis(ownerAddress, transaction);
    if (stakingTransactions.length > 0) {
      important.staking = stakingTransactions;
    }

    const sendingTransactions = sendTransactionAnalysis(ownerAddress, transaction);
    if (sendingTransactions.length > 0) {
      important.sending = sendingTransactions;
    }

    const moveCallTransactions = moveCallTransactionAnalysis(transaction);
    if (moveCallTransactions.length > 0) {
      important.moveCalls = moveCallTransactions;
    }

    const faucetTransaction = faucetTransactionAnalysis(ownerAddress, transaction);
    if (faucetTransaction) {
      important.faucet = faucetTransaction;
    }

    const basicAnalysis = basicTransactionAnalysis(transaction);
    if (basicAnalysis) {
      important.basic = basicAnalysis;
    }

    const totalGasUsed = transaction?.effects ? getTotalGasUsed(transaction.effects) : undefined;

    const ownerBalanceChanges = findBalanceChanges({
      balanceChanges: transaction.balanceChanges || [],
      ownerAddress: ownerAddress,
    }).reduce(
      (acc, { coinType, amount }) => {
        acc[coinType] = amount;

        if (isSender && coinType.indexOf('::sui::SUI') > -1 && totalGasUsed) {
          acc[coinType] = plus(acc[coinType], totalGasUsed);
        }

        return acc;
      },
      {} as Record<string, string>,
    );

    results.push({
      owner: ownerAddress,
      digest: transaction.digest,
      timestampMs: transaction.timestampMs,
      isSender,
      from: transaction.transaction?.data?.sender,
      totalGasUsed,
      ownerBalanceChanges,
      important,
      status: transaction.effects?.status.status ?? 'failure',
      original: transaction,
    });
  }

  return results;
}

const stakingTransactionAnalysis = (ownerAddress: string, transaction: SuiTransactionBlockResponse) => {
  const analysis: StakingTransactionInfo[] = [];
  if (!transaction.effects || !transaction.events) return analysis;

  const { isStakingFailure, failedStakingAnalysis } = getStakingFailureInfo(transaction);

  if (isStakingFailure) {
    analysis.push(failedStakingAnalysis);
    return analysis;
  }

  const gasUsed = getTotalGasUsed(transaction.effects) || '0';
  const stakingEvents = transaction.events.filter((event) => event.sender === ownerAddress && event.type === '0x3::validator::StakingRequestEvent');
  const unstakingEvents = transaction.events.filter((event) => event.sender === ownerAddress && event.type === '0x3::validator::UnstakingRequestEvent');

  if (unstakingEvents.length > 0) {
    for (const unstakingEvent of unstakingEvents) {
      let coinType;
      const amount =
        unstakingEvent.parsedJson &&
        typeof unstakingEvent.parsedJson === 'object' &&
        'principal_amount' in unstakingEvent.parsedJson &&
        (typeof unstakingEvent.parsedJson.principal_amount === 'string' ||
          typeof unstakingEvent.parsedJson.principal_amount === 'number' ||
          typeof unstakingEvent.parsedJson.principal_amount === 'bigint' ||
          typeof unstakingEvent.parsedJson.principal_amount === 'boolean')
          ? String(unstakingEvent.parsedJson.principal_amount)
          : '0';

      const rewardAmount =
        unstakingEvent.parsedJson &&
        typeof unstakingEvent.parsedJson === 'object' &&
        'reward_amount' in unstakingEvent.parsedJson &&
        (typeof unstakingEvent.parsedJson.reward_amount === 'string' ||
          typeof unstakingEvent.parsedJson.reward_amount === 'number' ||
          typeof unstakingEvent.parsedJson.reward_amount === 'bigint' ||
          typeof unstakingEvent.parsedJson.reward_amount === 'boolean')
          ? String(unstakingEvent.parsedJson.reward_amount)
          : '0';

      const validator =
        unstakingEvent.parsedJson &&
        typeof unstakingEvent.parsedJson === 'object' &&
        'validator_address' in unstakingEvent.parsedJson &&
        typeof unstakingEvent.parsedJson.validator_address === 'string'
          ? unstakingEvent.parsedJson?.validator_address
          : '';
      if (transaction.balanceChanges) {
        const stakeBalanceChange = transaction.balanceChanges.find(
          (balanceChange) =>
            addressOwner(balanceChange.owner) === unstakingEvent.sender && equal(plus(balanceChange.amount, gasUsed), plus(amount, rewardAmount)),
        );

        if (stakeBalanceChange) {
          coinType = stakeBalanceChange.coinType;
        }
      }

      analysis.push({ coinType, amount, validatorAddress: validator, isUnstaking: true });
    }
  }

  if (stakingEvents.length === 0) return analysis;

  for (const stakingEvent of stakingEvents) {
    let coinType;
    const amount =
      stakingEvent.parsedJson &&
      typeof stakingEvent.parsedJson === 'object' &&
      'amount' in stakingEvent.parsedJson &&
      (typeof stakingEvent.parsedJson.amount === 'string' ||
        typeof stakingEvent.parsedJson.amount === 'number' ||
        typeof stakingEvent.parsedJson.amount === 'bigint' ||
        typeof stakingEvent.parsedJson.amount === 'boolean')
        ? String(stakingEvent.parsedJson.amount)
        : '0';
    const validator =
      stakingEvent.parsedJson &&
      typeof stakingEvent.parsedJson === 'object' &&
      'validator_address' in stakingEvent.parsedJson &&
      typeof stakingEvent.parsedJson.validator_address === 'string'
        ? stakingEvent.parsedJson?.validator_address
        : '';
    if (transaction.balanceChanges) {
      const stakeBalanceChange = transaction.balanceChanges.find(
        (balanceChange) => addressOwner(balanceChange.owner) === stakingEvent.sender && equal(plus(balanceChange.amount, gasUsed), times(amount, '-1')),
      );

      if (stakeBalanceChange) {
        coinType = stakeBalanceChange.coinType;
      }
    }

    analysis.push({ coinType, amount, validatorAddress: validator });
  }

  return analysis;
};

const getStakingFailureInfo = (
  transaction: SuiTransactionBlockResponse,
): {
  isStakingFailure: boolean;
  failedStakingAnalysis: StakingTransactionInfo;
} => {
  if (!transaction.effects || !transaction.events) {
    return {
      isStakingFailure: false,
      failedStakingAnalysis: { amount: '0', validatorAddress: '' },
    };
  }

  const isTxFailure = transaction.effects.status.status === 'failure';
  const tx = transaction.transaction;
  const internalTransaction = tx?.data?.transaction;

  if (internalTransaction?.kind !== 'ProgrammableTransaction') {
    return {
      isStakingFailure: false,
      failedStakingAnalysis: { amount: '0', validatorAddress: '' },
    };
  }

  const { transactions: internalTransactions } = internalTransaction;

  const moveCalls = internalTransactions.filter((transaction) => 'MoveCall' in transaction);

  const isStakingMoveCall = moveCalls.some((call) => {
    if (!('MoveCall' in call)) return undefined;

    return call.MoveCall.function === 'request_add_stake' || call.MoveCall.function === 'request_withdraw_stake';
  });

  if (!isTxFailure || !isStakingMoveCall) {
    return {
      isStakingFailure: false,
      failedStakingAnalysis: { amount: '0', validatorAddress: '' },
    };
  }

  let validatorAddress: SuiJsonValue | undefined;
  let suiAmount: SuiJsonValue | undefined;

  internalTransaction.inputs.forEach((input) => {
    if ('valueType' in input && input.valueType === 'address') {
      validatorAddress = input.value as SuiJsonValue | undefined;
    }
    if ('valueType' in input && input.valueType === 'u64') {
      suiAmount = input.value as SuiJsonValue | undefined;
    }
  });

  return {
    isStakingFailure: true,
    failedStakingAnalysis: {
      coinType: SUI_TYPE_ARG,
      amount: suiAmount?.toString() ?? '0',
      validatorAddress: validatorAddress?.toString() ?? '',
    },
  };
};

const sendTransactionAnalysis = (ownerAddress: string, transactionResponse: SuiTransactionBlockResponse) => {
  const analysis: SendTransactionInfo[] = [];

  const { effects, events, transaction, balanceChanges, objectChanges } = transactionResponse;
  if (!effects || !events) return analysis;

  const sender = transaction?.data?.sender;

  if (!sender) return analysis;

  const gasUsed = getTotalGasUsed(effects) || '0';

  const ownerBalanceChanges = findBalanceChanges({
    balanceChanges,
    ownerAddress: sender,
  });

  for (const balanceChange of ownerBalanceChanges) {
    if (balanceChange.coinType.indexOf('::sui::SUI') > -1) {
      const recipientBalanceChange = findBalanceChanges({
        balanceChanges,
        value: times(plus(balanceChange.amount, gasUsed), '-1'),
      })[0];

      if (recipientBalanceChange) {
        const recipient = addressOwner(recipientBalanceChange.owner);
        if (recipient) {
          analysis.push({
            isSender: sender === ownerAddress,
            sender,
            recipient,
            coinType: recipientBalanceChange.coinType,
            coinAmount: recipientBalanceChange.amount,
          });
        }
      }
    }
  }

  for (const objectChange of objectChanges || []) {
    if (objectChange.type !== 'mutated') continue;

    const sender = objectChange.sender;
    const recipient = addressOwner(objectChange.owner);
    if (!sender || !recipient || sender === recipient) continue;

    analysis.push({
      isSender: sender === ownerAddress,
      sender,
      recipient,
      objectId: objectChange.objectId,
      objectType: objectChange.objectType,
    });
  }

  return analysis;
};

const moveCallTransactionAnalysis = (transactionResponse: SuiTransactionBlockResponse) => {
  const analysis: MoveCallTransactionInfo[] = [];

  const { transaction, objectChanges } = transactionResponse;

  const internalTransaction = transaction?.data?.transaction;

  if (internalTransaction?.kind !== 'ProgrammableTransaction') return analysis;

  const { transactions } = internalTransaction;

  const moveCalls = transactions.filter((transaction) => 'MoveCall' in transaction);

  if (moveCalls.length === 0) return analysis;

  return moveCalls
    .map((call) => {
      if (!('MoveCall' in call)) return undefined;

      const possibleDisplayObjectIds = (objectChanges ?? [])
        .map((change) => (change.type !== 'published' && change.objectType.search(/0x[0-9]::/) === -1 ? change.objectId : undefined))
        .filter((c) => !!c) as string[];

      return {
        packageObjectId: call.MoveCall.package,
        moduleName: call.MoveCall.module,
        functionName: call.MoveCall.function,
        possibleDisplayObjectIds,
      };
    })
    .filter((call) => call !== undefined) as MoveCallTransactionInfo[];
};

const faucetTransactionAnalysis = (ownerAddress: string, transactionResponse: SuiTransactionBlockResponse) => {
  const analysis: FaucetTransactionInfo | undefined = undefined;

  const { transaction, balanceChanges } = transactionResponse;

  const innerTransaction = transaction?.data?.transaction;
  if (!balanceChanges || innerTransaction?.kind !== 'ProgrammableTransaction') return analysis;

  if (JSON.stringify(innerTransaction.transactions) !== FAUCET_COMMANDS) return analysis;

  const { inputs } = innerTransaction;
  if (inputs.length !== 2) return analysis;

  if (!inputs.find((i) => i.type === 'pure' && i.valueType === 'address' && i.value === ownerAddress)) return analysis;

  const amountInput = inputs.find((i) => i.type === 'pure' && i.valueType === 'u64' && i.value);

  if (amountInput?.type === 'pure') {
    return {
      amount: times(amountInput.value as string, '5'),
    };
  }
};

const basicTransactionAnalysis = (transactionResponse: SuiTransactionBlockResponse) => {
  const analysis: BasicTransactionInfo | undefined = undefined;

  const { transaction } = transactionResponse;

  const innerTransaction = transaction?.data?.transaction;

  if (!innerTransaction) return analysis;

  if (innerTransaction?.kind !== 'ProgrammableTransaction') {
    return {
      type: innerTransaction?.kind,
    };
  }

  return {
    type: innerTransaction.kind,
    commands: innerTransaction.transactions
      .map((command) => Object.keys(command)[0])
      .filter((commandName) => !['SplitCoins', 'MergeCoins', 'MakeMoveVec'].includes(commandName)),
  };
};

export function getHumanReadable(analyzedTransaction: AnalyzedTransaction) {
  const action = getTxAction(analyzedTransaction);

  return {
    timeDisplay: analyzedTransaction.timestampMs,
    action,
  };
}

export type TxAction = 'faucet' | 'send' | 'receive' | 'staking' | 'mint' | 'transfer' | 'function' | 'clone' | 'modify' | 'burn' | 'unknown';

const getTxAction = (analyzedTransaction: AnalyzedTransaction): TxAction => {
  if (analyzedTransaction.important?.faucet) {
    return 'faucet';
  }

  if (analyzedTransaction.important?.staking) {
    return 'staking';
  }

  if (analyzedTransaction.important?.moveCalls) {
    return 'function';
  }

  if (analyzedTransaction.important?.sending) {
    if (analyzedTransaction.important.sending?.[0].isSender) {
      return 'send';
    } else {
      return 'receive';
    }
  }

  return 'unknown';
};
