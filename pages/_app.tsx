// pages/_app.tsx
import { AppProps } from "next/app";
import { Noto_Sans_KR } from "next/font/google";
import Layout from "../components/Layout";
import "../styles/globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <main className={notoSansKr.className}>
        <Component {...pageProps} />
      </main>
    </Layout>
  );
}
