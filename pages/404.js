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
          <img src={Image.Error404} className={styles.imgError} />
          <div className={styles.right}>
            <h1>404</h1>
            <div>抱歉，您访问的资源不存在！</div>
            <Button type="primary" onClick={() => router.back()}>
              返回上一页
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
