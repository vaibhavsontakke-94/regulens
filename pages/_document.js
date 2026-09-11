import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" data-scroll-behavior="smooth">
      <Head>
        <meta
          name="description"
          content="REGULENS — Regulatory Intelligence Platform. From Regulation to Resolution."
        />
        <meta name="theme-color" content="#ffffff" />
        <meta name="color-scheme" content="light dark" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('regulens-theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var t=(s==='dark'||(s!=='light'&&d))?'dark':'light';var r=document.documentElement;if(t==='dark'){r.classList.add('dark')}else{r.classList.remove('dark')}r.style.colorScheme=t;}catch(e){}})();`,
          }}
        />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}