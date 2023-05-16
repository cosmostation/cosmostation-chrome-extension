import { useIntersectionObserver } from '~/Popup/hooks/useIntersectionObserver';

type IntersectionObserverDivProps = {
  onIntersect: () => void;
};

export default function IntersectionObserver({ onIntersect }: IntersectionObserverDivProps) {
  const onIntersection: IntersectionObserverCallback = ([{ isIntersecting }]) => {
    if (isIntersecting) {
      onIntersect();
    }
  };

  const { setIntersectionObserver } = useIntersectionObserver(onIntersection, 0.3);

  return <div ref={setIntersectionObserver} />;
}
