import type { DelegatedStake, DryRunTransactionBlockResponse, SuiObjectResponse, SuiSystemStateSummary, SuiTransactionBlockResponse } from '@mysten/sui/client';

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
  nextCursor?: string;
  hasNextPage: boolean;
};

export type GetObjectsOwnedByAddressResponse = Result<GetObjectsOwnedByAddress>;

export type GetObjectsResponse = Result<SuiObjectResponse[]>;

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

export type TxInfoResponse = Result<SuiTransactionBlockResponse>;

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
  iconUrl?: string;
  id?: string;
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

export type TokenBalanceObject = {
  coinType: string;
  balance: string;
  objects: SuiObjectResponse[];
  decimals?: number;
  displayDenom?: string;
  name?: string;
  imageURL?: string;
  coinGeckoId?: string;
} & SuiObjectResponse;

export type GetCoinBalanceResponse = Result<GetCoinBalance>;

export type GetAllBalances = GetCoinBalance[];

export type GetAllBalancesResponse = Result<GetAllBalances>;

export type DynamicFieldPage = {
  data: {
    type: 'DynamicField' | 'DynamicObject';
    objectType: string;
    objectId: string;
    version: number;
    digest: string;
    name: {
      type: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value?: any;
    };
    bcsName: string;
  }[];
  nextCursor: string | null;
  hasNextPage: boolean;
};
export type GetDynamicFieldsResponse = Result<DynamicFieldPage>;

export type GetStakesResponse = Result<DelegatedStake[]>;

export type GetLatestSuiSystemStateResponse = Result<SuiSystemStateSummary>;
