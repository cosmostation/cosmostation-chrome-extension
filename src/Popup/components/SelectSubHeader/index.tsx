import Entry from './Entry';

type SelectSubHeaderProps = {
  isShowChain?: boolean;
};

export default function SelectSubHeader({ isShowChain = true }: SelectSubHeaderProps) {
  return <Entry isShowChain={isShowChain} />;
}
