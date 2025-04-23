export interface Social {
  github?: string;
  telegram?: string;
  twitter?: string;
  discord?: string;
  reddit?: string;
}

export type SocialKey = keyof Social;
export interface DappEcosystemInfo {
  id: number;
  name: string;
  description?: string;
  thumbnail?: string;
  link?: string;
  chains?: string[];
  socials?: Social;
  is_default?: boolean;
  type?: string;
}

export type DappEcosystemInfoResponse = DappEcosystemInfo[];
