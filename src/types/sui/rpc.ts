import type { DryRunTransactionBlockResponse, SuiObjectResponse } from '@mysten/sui.js';

export type Body = {
  method: string;
  params: unknown;
  jsonrpc: string;
  id?: string | number;
};

export type Payload = Body[];

export type Owner = {
  AddressOwner: string;
};

export type Data = {
  dataType: string;
  type: string;
  has_public_transfer: boolean;
  fields: {
    balance: number;
    id: { id: string };
  };
  owner: Owner;
};

export type ErrorResponse = {
  code: number;
  message: string;
};

export type Result<T> = {
  jsonrpc: string;
  id: string | number;
  result?: T;
  error?: ErrorResponse;
};

export type Reference = {
  objectId: string;
  version: number;
  digest: string;
};

export type GetObjectsOwnedByAddress = {
  data: {
    data: {
      objectId: string;
      version: number;
      digest: string;
      type: string;
    };
  }[];
};

export type GetObjectsOwnedByAddressResponse = Result<GetObjectsOwnedByAddress>;

export type GetObjectsResponse = Result<SuiObjectResponse>;

export type DryRunTransactionBlockSWRResponse = Result<DryRunTransactionBlockResponse>;

export type GetCoins = {
  data: {
    version: number;
    digest: string;
    coinType: string;
    previousTransaction: string;
    coinObjectId: string;
    balance: number;
    lockedUntilEpoch: number | null;
  }[];
  nextCursor: string | null;
  hasNextPage: boolean;
};

export type GetCoinsResponse = Result<GetCoins>;

export type ExistsDetails = {
  data: Data;
  owner: Owner;
  previousTransaction: string;
  storageRebase: number;
  reference: Reference;
};

export type DeletedDetails = {
  objectId: string;
  version: number;
  digest: string;
};

export type NotExistsDetails = string;

export type GetObjectExists = {
  status: 'Exists';
  details: ExistsDetails;
};

export type GetObjectDeleted = {
  status: 'Deleted';
  details: DeletedDetails;
};

export type GetObjectNotExists = {
  status: 'NotExists';
  details: NotExistsDetails;
};

export type GetObject = GetObjectNotExists | GetObjectDeleted | GetObjectExists;

export type GetObjectResponse = Result<GetObject>;

export type GetCoinMetadata = {
  decimals: number;
  description: string;
  iconUrl: string | null;
  id: string | null;
  name: string;
  symbol: string;
};

export type GetCoinMetadataResponse = Result<GetCoinMetadata>;

export type lockedBalance = {
  epochId: number;
  number: number;
};

export type GetCoinBalance = {
  coinObjectCount: number;
  coinType: string;
  lockedBalance: lockedBalance;
  totalBalance: string;
};

export type GetCoinBalanceResponse = Result<GetCoinBalance>;

export type GetAllBalances = GetCoinBalance[];

export type GetAllBalancesResponse = Result<GetAllBalances>;
