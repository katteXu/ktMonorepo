import styles from '@styles/error.less';
import { Button } from 'antd';
import router from 'next/router';
import { Image, Layout } from '@components';

const Index = props => {
  const routeView = {
    title: '',
    pageKey: '',
    longKey: '',
    breadNav: '',
  };
  return (
    <Layout {...routeView}>
      <div className={styles.root}>
        <div className={styles.box}>
          <img src={Image.Error500} className={styles.imgError} />
          <div className={styles.right}>
            <h1>500</h1>
            <div>抱歉服务器出错了！</div>
            <Button type="primary" onClick={() => router.reload()}>
              重试
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
