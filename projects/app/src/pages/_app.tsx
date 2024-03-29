import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { appWithTranslation, useTranslation } from 'next-i18next';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { theme } from '@fastgpt/web/styles/theme';
import type { FastGPTFeConfigsType } from '@fastgpt/global/common/system/types/index.d';

import '@/utils/nprogress';
import Layout from '@/components/Layout';
import { clientInitData } from '@/web/common/system/staticData';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { change2DefaultLng, setLngStore } from '@/web/common/utils/i18n';

import '@/web/styles/reset.scss';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      retry: false,
      cacheTime: 10
    }
  }
});

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { hiId } = router.query as { hiId?: string };
  const { i18n } = useTranslation();
  const { setInitd, feConfigs, loadModelList } = useSystemStore();
  const [scripts, setScripts] = useState<FastGPTFeConfigsType['scripts']>([]);
  const [title] = useState('sophonsai');

  useEffect(() => {
    // get init data
    (async () => {
      const {
        feConfigs: { scripts }
      } = await clientInitData();
      await loadModelList();
      setScripts(scripts || []);
      setInitd();
    })();

    // add window error track
    window.onerror = function (msg, url) {
      window.umami?.track('windowError', {
        device: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          appName: navigator.appName
        },
        msg,
        url
      });
    };

    return () => {
      window.onerror = null;
    };
  }, []);

  useEffect(() => {
    // get default language
    const targetLng = change2DefaultLng(i18n.language);
    if (targetLng) {
      setLngStore(targetLng);
      router.replace(router.asPath, undefined, { locale: targetLng });
    }
  }, []);

  useEffect(() => {
    hiId && localStorage.setItem('inviterId', hiId);
  }, [hiId]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0,user-scalable=no, viewport-fit=cover"
        />
        <link rel="icon" href={feConfigs.favicon || process.env.SYSTEM_FAVICON} />
      </Head>
      {scripts?.map((item, i) => <Script key={i} strategy="lazyOnload" {...item}></Script>)}
      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={theme}>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ChakraProvider>
      </QueryClientProvider>
    </>
  );
}

// @ts-ignore
export default appWithTranslation(App);
