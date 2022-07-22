import Head from 'next/head';
import router from 'next/router';
import { Login } from '@components';
import QueueAnim from 'rc-queue-anim';
import { OverPack } from 'rc-scroll-anim';
import styles from '@styles/index.less';
import { Button } from 'antd';
import { logout } from '@api';
import { Icon, Image } from '@components';
// 文字动效
import Texty from 'rc-texty';
import 'rc-texty/assets/index.css';
// 全局状态
import { User } from '@store';
const Index = () => {
  const { userInfo, loading, indexUrl } = User.useContainer();
  // 根据域名判断
  const host = typeof window !== 'undefined' && window.location.host;
  // 退出登录
  const out = () => {
    logout().then(res => {
      if (res.status === 0) {
        // clearUserInfo();
        window.location.href = '/';
      }
    });
  };

  // 管理中心
  const toManage = () => {
    // const { isAgent } = sessionStorage;
    // // const personalize = usePersonalize({
    // //   indexUrl: "/transportLine/truckLine",
    // // });

    // // 如果是子账号  则跳转个人中心
    // if (!userInfo.is_boss) {
    //   // window.location.href = "/personal";
    //   router.push("/personal");
    //   return;
    // } else if (isAgent) {
    //   if (isAgent === "1") window.location.href = "/agent/transportAll";
    //   if (isAgent === "0") window.location.href = "/home";
    // }
    // // else if (personalize) {
    // //   // 海富通个性化配置
    // //   router.replace(personalize.indexUrl);
    // // }
    // else {
    //   window.location.href = "/home";
    //   sessionStorage.isAgent = "0";
    // }

    router.push(indexUrl);
  };

  return (
    <div className={styles.main}>
      <Head>
        <title>首页</title>
        <link rel="shortcut icon" href={Icon.LinkIcon} />
      </Head>
      {/* logo 登录 */}
      <div
        className={`${styles.floor} ${styles.f1}`}
        style={{
          backgroundImage: `url(${Image.Banner})`,
          backgroundSize: 'auto 100%',
        }}>
        <div className={styles['content-box']}>
          <header style={{ lineHeight: '48px', height: 48 }}>
            <img src={Icon.Logo} alt="" />
            {userInfo.id && (
              <div style={{ float: 'right' }} className={styles.ctrl}>
                <Button type="link" style={{ color: '#fff' }} size="small" onClick={toManage}>
                  管理中心
                </Button>
                <Button type="link" style={{ color: '#fff' }} size="small" onClick={out}>
                  退出登录
                </Button>
              </div>
            )}
          </header>
          <QueueAnim type="left" duration={1000} interval={200} className={styles.content}>
            <h1 key="title">方向云</h1>
            <div key="system" className={styles.system}>
              物流信息系统
            </div>
            <div key="desc" className={styles.desc}>
              用数据改变你运作企业的方式
            </div>
          </QueueAnim>

          <div className={styles.box}>{!loading && <Login />}</div>
        </div>
      </div>

      {/* 运输管理 */}
      <OverPack
        replay={true}
        playScale={0.3}
        key="transport"
        className={`${styles.floor} ${styles.f2} ${styles['f-other']}`}>
        <div className={styles['content-box']}>
          <QueueAnim duration={2000} key="transport-img" type="top" className={styles['img-content']} leaveReverse>
            <img key="img" src={Image.Transport} />
          </QueueAnim>
          <QueueAnim key="transport-txt" type="bottom" className={styles['txt-content']} leaveReverse>
            <div key="txt" className={styles.description}>
              <img src={Icon.Transport} key="img-logo" alt="" />
              <Texty className={styles.title} repeat={-1} type="scale">
                运输管理
              </Texty>
              <div className={styles.line}></div>
              <Texty className={styles.desc}>派单发货、专线管理、运单管理全面提升运营效率</Texty>
            </div>
          </QueueAnim>
        </div>
      </OverPack>

      {/* 物流实时监控 */}
      <OverPack replay={true} key="logistics" className={`${styles.floor} ${styles.f3} ${styles['f-other']}`}>
        <div className={styles['content-box']}>
          <QueueAnim key="logistics-txt" type="bottom" className={styles['txt-content']} leaveReverse>
            <div key="txt" className={styles.description}>
              <img src={Icon.Logistics} key="img-logo" alt="" />
              <Texty className={styles.title} repeat={-1} type="scale">
                物流实时监控
              </Texty>
              <div className={styles.line}></div>
              <Texty className={styles.desc}>司机走到哪里，有无异常情况，尽在掌握</Texty>
            </div>
          </QueueAnim>
          <QueueAnim duration={2000} key="logistics-img" type="top" className={styles['img-content']} leaveReverse>
            <img key="img" src={Image.Logistics} />
          </QueueAnim>
        </div>
      </OverPack>

      {/* 库存管理 */}
      <OverPack replay={true} key="stock" className={`${styles.floor} ${styles.f4} ${styles['f-other']}`}>
        <div className={styles['content-box']}>
          <QueueAnim duration={2000} key="stock-img" type="top" className={styles['img-content']} leaveReverse>
            <img key="img" src={Image.Stock} />
          </QueueAnim>
          <QueueAnim key="stock-txt" type="bottom" className={styles['txt-content']} leaveReverse>
            <div key="txt" className={styles.description}>
              <img src={Icon.Stock} key="img-logo" alt="" />
              <Texty className={styles.title} repeat={-1} type="scale">
                库存管理
              </Texty>
              <div className={styles.line}></div>
              <Texty className={styles.desc}>进、销、存一目了然</Texty>
            </div>
          </QueueAnim>
        </div>
      </OverPack>

      {/* 财务管理 */}
      <OverPack replay={true} key="finance" className={`${styles.floor} ${styles.f5} ${styles['f-other']}`}>
        <div className={styles['content-box']}>
          <QueueAnim key="finance-txt" type="bottom" className={styles['txt-content']} leaveReverse>
            <div key="txt" className={styles.description}>
              <img src={Icon.Finance} key="img-logo" alt="" />
              <Texty className={styles.title} repeat={-1} type="scale">
                财务管理
              </Texty>
              <div className={styles.line}></div>
              <Texty className={styles.desc}>实时反映您的物流财务健康状况</Texty>
            </div>
          </QueueAnim>
          <QueueAnim duration={2000} key="finance-img" type="top" className={styles['img-content']} leaveReverse>
            <img key="img" src={Image.Finance} />
          </QueueAnim>
        </div>
      </OverPack>

      <footer className={styles.footer}>
        <a href="http://beian.miit.gov.cn/" className={styles.record} target="_blank">
          {host && host.includes('jiexiujinneng') ? '晋ICP备 19013795 号' : '京ICP备 15049831 号'}
        </a>
      </footer>
    </div>
  );
};

export default Index;
