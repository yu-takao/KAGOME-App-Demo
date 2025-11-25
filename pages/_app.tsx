import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react';
import '../src/styles.css';
import { configureAmplify } from '../src/amplify/initAmplify';

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // クライアント側のみ設定（SSR時はスキップ）
    configureAmplify();
  }, []);

  return (
    <>
      <Head>
        <title>デザインチェックデモ</title>
        <meta name="application-name" content="デザインチェックデモ" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}


