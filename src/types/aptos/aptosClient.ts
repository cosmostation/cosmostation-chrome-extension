import { AptosClient } from 'aptos';

const aptosClient = new AptosClient('https://');

export type RawTransaction = Awaited<ReturnType<typeof aptosClient.generateTransaction>>;
type GenerateTransactionParams = Parameters<typeof aptosClient.generateTransaction>;

export type EntryFunctionPayload = GenerateTransactionParams[1];

export type SubmitTransactionRequest = GenerateTransactionParams[2];

type SimulateTransactionParams = Parameters<typeof aptosClient.simulateTransaction>;

export type Query = SimulateTransactionParams[2];

export type PendingTransaction = Awaited<ReturnType<typeof aptosClient.submitTransaction>>;
