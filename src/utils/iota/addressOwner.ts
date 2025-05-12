import type { ObjectOwner } from '@iota/iota-sdk/client';

const addressOwner = (owner?: ObjectOwner): string | undefined => {
  return (!!owner && !!(typeof owner === 'object') && !!('AddressOwner' in owner) && owner.AddressOwner) || undefined;
};

export default addressOwner;
