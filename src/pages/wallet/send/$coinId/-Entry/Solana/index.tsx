type SolanaProps = {
  coinId: string;
};

export default function Solana({ coinId }: SolanaProps) {
  return `Solana Send Page ${coinId}`;
}
