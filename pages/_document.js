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
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
