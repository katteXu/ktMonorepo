import { useState, useEffect } from 'react';
import { CheckCircleTwoTone, ExclamationCircleTwoTone } from '@ant-design/icons';
import { Divider, Avatar } from 'antd';
import styles from './styles.less';
import QueueAnim from 'rc-queue-anim';
import PwdForm from './pwdForm';
import CaptchaForm from './captchaForm';
import { User } from '@store';
import { Icon } from '@components';
import Store from './store';
import { useTokenImage } from '@components/Hooks';
const Login = () => {
  const { userInfo, loading } = User.useContainer();
  const [mode, setMode] = useState(0);
  const { images, buildUrl } = useTokenImage(1);

  useEffect(() => {
    if (userInfo.id) {
      buildUrl([userInfo.headIcon]);
    }
  }, [loading]);

  return (
    <QueueAnim type="right" duration={1500} forcedReplay={true}>
      {userInfo.id ? (
        <div key="user-box" className={styles['user-card']}>
          <Avatar size={100} src={images[0] || Icon.User} />
          <h1>{userInfo.name}</h1>
          <div className={styles.verified}>
            {userInfo.verifyStatus === 'VERIFY_SUCCESS' ? (
              <>
                <CheckCircleTwoTone twoToneColor="#52c41a" />
                <span style={{ color: '#52c41a', marginLeft: 5 }}>已认证</span>
              </>
            ) : (
              <>
                <ExclamationCircleTwoTone twoToneColor="#faad14" />
                <span style={{ color: '#faad14', marginLeft: 5 }}>未认证</span>
              </>
            )}
          </div>
          <p className={styles.username}>{userInfo.username}</p>
          <p className={styles.companyName}>{userInfo.companyName}</p>
        </div>
      ) : (
        <div key="box" className={styles.login}>
          <div className={styles.title}>
            <h1 className={styles.txt}>欢迎登录</h1>
            <Divider className={styles['logo-txt']}>方向云物流信息系统</Divider>
          </div>

          {/* 登录模式 */}
          <Store.Provider initialState={{ mode, setMode }}>
            {mode === 0 && <PwdForm />}
            {mode === 1 && <CaptchaForm />}
          </Store.Provider>
        </div>
      )}
    </QueueAnim>
  );
};

export default Login;
