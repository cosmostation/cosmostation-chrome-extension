import { useLocation } from '@tanstack/react-router';

export default function About() {
  const aa = useLocation();

  console.log('🚀 ~ Index ~ aa:', aa.pathname);

  return (
    <div className="p-2">
      <h3>Welcome About!</h3>
    </div>
  );
}
