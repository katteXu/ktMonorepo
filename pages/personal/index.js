/** @format */
import { useState, useEffect, useCallback } from 'react';
import { Layout, Content } from '@components';
import styles from './styles.less';
import Invoice from '@components/Personal/invoice';
import Verify from '@components/Personal/verify';
import Wechat from '@components/Personal/wechat';
import { Icon, Image } from '@components';
import { User } from '@store';
import { useTokenImage } from '@components/Hooks';
const Personal = () => {
  const { userInfo, loading } = User.useContainer();
  const {
    images: [userIcon],
    buildUrl,
  } = useTokenImage(1);
  const routeView = {
    title: '个人中心',
    pageKey: 'personal',
    longKey: 'personal',
    breadNav: '个人中心',
    pageTitle: '个人中心',
  };

  const [currentTab, setCurrentTab] = useState('verify');
  useEffect(() => {
    if (userInfo.id) {
      buildUrl([userInfo.headIcon]);
    }
  }, [loading]);

  // 改变tab
  const onChangeTab = useCallback(key => {
    setCurrentTab(key);
  });
  return (
    <Layout {...routeView}>
      <div className={styles.root}>
        <div style={{ width: '25%' }}>
          <Content>
            <header>个人信息</header>
            <div className={styles.picVer} style={{ marginTop: 16 }}>
              <div className={styles.picBack}>
                {userInfo.verifyStatus == 'VERIFY_SUCCESS' ? (
                  <img src={Icon.VerifyIcon} className={styles.certification} />
                ) : (
                  <img src={Icon.VerifyNone} className={`${styles.certification} ${styles.nocertification}`} />
                )}
                <img src={userIcon || Icon.User} className={styles.userIcon} />
              </div>
            </div>

            <div className={styles.personalData} style={{ padding: '0 16px' }}>
              <div className={styles.picVer}></div>
              <div className={styles.content}>
                <p className={styles.company}>
                  <span>认证状态:</span>
                  {userInfo && userInfo.verifyStatus == 'VERIFYING'
                    ? '认证中'
                    : userInfo && userInfo.verifyStatus == 'VERIFY_FAILED'
                    ? '认证失败'
                    : userInfo && userInfo.verifyStatus == 'NO_VERIFY'
                    ? '未认证'
                    : '认证成功'}
                </p>
                <p className={styles.company}>
                  <span>姓名:</span>
                  {userInfo.name}
                </p>
                <p className={styles.company}>
                  <span>手机号:</span>
                  {userInfo.username}
                </p>
                <p className={styles.company}>
                  <span>地址:</span>
                  {userInfo.companyAddress}
                </p>
                <p className={styles.company}>
                  <span>企业:</span>
                  {userInfo.companyName === null ? '' : userInfo.companyName}
                </p>
              </div>
            </div>
            <div style={{ marginTop: 36 }}>
              <div
                className={styles.qrcodeImg}
                style={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  margin: '0 auto',
                }}>
                <img src={Image.QrCode} alt="" style={{ maxWidth: '100%' }} />
              </div>
              <div>
                <p
                  style={{
                    marginBottom: 0,
                    marginTop: 10,
                    textAlign: 'center',
                  }}>
                  关注微信公众号并绑定微信
                </p>
                <p
                  style={{
                    marginBottom: 32,
                    marginTop: 4,
                    textAlign: 'center',
                  }}>
                  获取磅室每日报表推送
                </p>
              </div>
            </div>
          </Content>
        </div>
        <div
          style={{
            flex: 1,
            marginLeft: 16,
            background: '#fff',
          }}>
          <div className={styles.tab}>
            <div
              className={`${styles.tab_item} ${currentTab === 'verify' ? styles.active : ''}`}
              onClick={() => onChangeTab('verify')}>
              认证详情
            </div>
            <div
              className={`${styles.tab_item} ${currentTab === 'invoive' ? styles.active : ''}`}
              style={{ marginLeft: 24 }}
              onClick={() => onChangeTab('invoive')}>
              开票信息
            </div>
            {userInfo.is_boss && (
              <div
                className={`${styles.tab_item} ${currentTab === 'wechat' ? styles.active : ''}`}
                style={{ marginLeft: 24 }}
                onClick={() => onChangeTab('wechat')}>
                微信绑定
              </div>
            )}
          </div>

          {currentTab === 'verify' && <Verify />}
          {currentTab === 'invoive' && <Invoice />}
          {currentTab === 'wechat' && <Wechat />}
        </div>
      </div>
    </Layout>
  );
};

export default Personal;
