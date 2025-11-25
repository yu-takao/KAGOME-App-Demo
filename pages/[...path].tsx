import dynamic from 'next/dynamic';

// すべてのパスをSPAに委譲（api などは Next が優先的に解決するため影響なし）
const SpaApp = dynamic(() => import('../src/App'), { ssr: false });

export default function CatchAllPage() {
  return <SpaApp />;
}


