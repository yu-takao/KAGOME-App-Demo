import { Amplify } from 'aws-amplify';

export async function configureAmplify() {
  try {
    // Amplify の設定ファイルURLを環境変数で指定されている場合のみ読みに行く（404ノイズ回避）
    const url = process.env.NEXT_PUBLIC_AMPLIFY_OUTPUTS_URL;
    if (!url) return;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return;
    const config = await res.json();
    if (config) Amplify.configure(config);
  } catch (e) {
    // 初回は設定が無いことがあるため黙って続行
  }
}


