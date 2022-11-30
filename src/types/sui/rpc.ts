export type GetObjectsOwnedByAddress = {
  objectId: string;
  version: number;
  digest: string;
  type: string;
  owner: {
    AddressOwner: string;
  };
  previousTransaction: string;
};

export type GetObjectsOwnedByAddressResponse = GetObjectsOwnedByAddress[];

export type Data = {
  dataType: string;
  type: string;
  has_public_transfer: boolean;
  fields: {
    balance: number;
    id: { id: string };
  };
};

export type GetObjectDetails = {
  data: Data;
};

export type GetObjectExists = {
  status: 'Exists';
  details: GetObjectDetails;
};
