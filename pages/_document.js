import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head>
          {/* 解决antd服务端渲染闪动问题 */}
          {typeof window === 'undefined' && (
            <style
              id="holderStyle"
              dangerouslySetInnerHTML={{
                __html: `
                *, *::before, *::after {
                  transition: none!important;
                }
                `,
              }}
            />
          )}
        </Head>
        <head>
          <script type="text/javascript" src="https://s9.cnzz.com/z_stat.php?id=1279757257&web_id=1279757257"></script>
        </head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
