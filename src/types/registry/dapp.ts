import type { UniqueChainId } from '../chain';

export interface DappEcosystemInfo {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  link?: string;
  chains?: string[];

  socials?: {
    github?: string;
    telegram?: string;
    twitter?: string;
    discord?: string;
    reddit?: string;
  };
  is_default?: boolean;
  type?: string;
}

export interface FormattedDappEcosystemInfo {
  id: string;
  name?: string;
  description?: string;
  thumbnail?: string;
  link?: string;
  chainIds?: UniqueChainId[];
  socials?: {
    github?: string;
    telegram?: string;
    twitter?: string;
    discord?: string;
    reddit?: string;
  };
  is_default?: boolean;
  type?: string;
}
