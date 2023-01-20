/* eslint-disable @typescript-eslint/consistent-type-imports */
declare module '*.gif' {
  const value: string;
  export default value;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  import type { VFC, SVGProps } from 'react';

  const SVG: VFC<SVGProps<SVGSVGElement>>;
  export default SVG;
}

type ValueOf<T> = T[keyof T];

type SvgElement = VFC<SVGProps<SVGSVGElement>>;

type PublicKey = {
  pk?: string;
  compressed_pk: Uint8Array;
  return_code: number;
  error_message: string;
};

type GetVersion = {
  return_code: number;
  error_message: string;
  test_mode?: boolean;
  major?: number;
  minor?: number;
  patch?: number;
  device_locked?: boolean;
  target_id?: string;
};

type Sign = {
  return_code: number;
  error_message: string;
  signature: Uint8Array;
};
declare module 'ledger-cosmos-js' {
  export default class CosmosApp {
    constructor(transport?: import('@ledgerhq/hw-transport').default, scrambleKey?: string);

    async publicKey(path: number[]): Promise<PublicKey>;

    async getVersion(): Promise<GetVersion>;

    async sign(path: number[], message: Uint8Array): Promise<Sign>;
  }
}
