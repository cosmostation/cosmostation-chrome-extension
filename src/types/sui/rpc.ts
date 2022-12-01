export type Owner = {
  AddressOwner: string;
};

export type Details = {
  data: Data;
};

export type GetObjectsOwnedByAddress = {
  objectId: string;
  version: number;
  digest: string;
  type: string;
  owner: Owner;
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
  owner: Owner;
};

export type GetObjectExists = {
  status: 'Exists';
  details: Details;
};
