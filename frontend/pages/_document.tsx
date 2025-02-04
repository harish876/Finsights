import { Html, Head, Main, NextScript } from "next/document"

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="stylesheet" href="https://unpkg.com/react-pdf@9.2.1/dist/Page/AnnotationLayer.css" />
        <link rel="stylesheet" href="https://unpkg.com/react-pdf@9.2.1/dist/Page/TextLayer.css" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

