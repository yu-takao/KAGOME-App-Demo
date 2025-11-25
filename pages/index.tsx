import dynamic from 'next/dynamic';

// SPA（react-router-dom）をそのままクライアント側で描画
const SpaApp = dynamic(() => import('../src/App'), { ssr: false });

export default function IndexPage() {
  return <SpaApp />;
}


