import { Amplify } from 'aws-amplify';

export async function configureAmplify() {
  try {
    // Vite が import() のパスをビルド時解決するため、fetch で存在確認しつつ読み込む
    const res = await fetch('/amplify_outputs.json', { cache: 'no-store' });
    if (!res.ok) return;
    const config = await res.json();
    if (config) Amplify.configure(config);
  } catch (e) {
    // 初回は設定が無いことがあるため黙って続行
  }
}


