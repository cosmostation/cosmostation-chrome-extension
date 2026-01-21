import type { UniqueChainId } from '@/types/chain';

export interface BalanceFetchOption {
  isMinimal?: boolean;
  chainId?: UniqueChainId;
  priority?: 'high' | 'low';
  updateAssets?: () => void;
  chunkSize?: number;
}
