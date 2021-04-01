import { useState, useEffect } from 'react';
import {
  BellOutlined,
  DownOutlined,
  LogoutOutlined,
  UserOutlined,
  LockOutlined,
  SwapOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Dropdown, Avatar, Modal, message } from 'antd';
import styles from './topbar.less';
import router from 'next/router';
import { logout } from '@api';
import { clearUserInfo } from '@utils/common';
import PwdForm from '@components/Personal/pwdForm';
import personalApi from '@api/personalCenter';
import { User, Message, Menu as MenuStore } from '@store';
import { useTokenImage } from '@components/Hooks';
function viewMessage() {
  router.push('/message');
}

const TopBar = () => {
  const { userInfo } = User.useContainer();
  const { userMode, setUserMode } = MenuStore.useContainer();
  const { username, headIcon } = userInfo;
  const { images, buildUrl } = useTokenImage(1);

  const { messageList } = Message.useContainer();
  const count = messageList.filter(item => !item.isReaded).length;

  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (userInfo.id) {
      buildUrl([headIcon]);
    }
  }, [userInfo]);

  // 用户中心跳转
  const toUserCenter = () => {
    router.push('/personal');
  };
  // 退出登录
  const out = () => {
    logout().then(res => {
      if (res.status === 0) {
        clearUserInfo();
        window.location.href = '/';
      }
    });
  };

  const edit = () => {
    setShowEditModal(true);
  };

  const menu = (
    <Menu className={styles.menuList} style={{ width: 180, padding: 0, borderRadius: 4 }}>
      {userInfo.isAgent === 1 && (
        <Menu.Item style={{ height: 50, lineHeight: '38px' }}>
          <a
            onClick={() => {
              switchAgent();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '5px 16px',
              color: '#4a4a5a',
            }}>
            <SwapOutlined className={styles['opt-icon']} style={{ fontSize: 16 }} />
            {userMode === 'normal' ? '切换监管模式' : '切换个人模式'}
          </a>
        </Menu.Item>
      )}
      <div style={{ borderBottom: '1px solid #F0F0F0', margin: '0 16px' }}></div>
      <Menu.Item
        style={{
          height: 50,
          lineHeight: '38px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <a
          onClick={toUserCenter}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '5px 16px',
            color: '#4a4a5a',
          }}>
          <UserOutlined className={styles['opt-icon']} style={{ fontSize: 16 }} />
          个人中心
        </a>
        <RightOutlined style={{ fontSize: 14, color: '#848485' }} />
      </Menu.Item>
      <div style={{ borderBottom: '1px solid #F0F0F0', margin: '0 16px' }}></div>
      <Menu.Item style={{ height: 50, lineHeight: '38px' }}>
        <a
          onClick={edit}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '5px 16px',
            color: '#4a4a5a',
          }}>
          <LockOutlined className={styles['opt-icon']} style={{ fontSize: 16 }} />
          修改密码
        </a>
      </Menu.Item>
      <div style={{ borderBottom: '1px solid #F0F0F0', margin: '0 16px' }}></div>
      <Menu.Item style={{ height: 50, lineHeight: '38px' }}>
        <a
          onClick={out}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '5px 16px',
            color: '#4a4a5a',
          }}>
          <LogoutOutlined className={styles['opt-icon']} rotate={270} style={{ fontSize: 16 }} />
          退出控制台
        </a>
      </Menu.Item>
    </Menu>
  );

  const handleSubmit = async values => {
    const params = values;
    const res = await personalApi.resetPasswordBySms({ params });
    if (res.status === 0) {
      message.success('密码修改成功');
      clearUserInfo();
      window.location.href = '/';
    } else {
      message.error(`密码修改失败，${res.detail ? res.detail : res.description}`);
    }
  };

  // 切换代理商
  const switchAgent = () => {
    const _mode = userMode === 'agent' ? 'normal' : 'agent';
    const _value = _mode === 'agent' ? 1 : 0;
    setUserMode(userMode === 'agent' ? 'normal' : 'agent');
    sessionStorage.setItem('isAgent', _value);
    // 设置当前模式
    if (_value === 1) {
      router.replace('/agent/transportAll/');
    } else {
      router.replace('/home/');
    }
  };

  return (
    <Layout.Header style={{ background: '#fff', padding: 0 }}>
      <div className={styles.topbar}>
        {userInfo.is_boss && (
          <a className={styles.news} onClick={() => viewMessage()} style={{ position: 'relative' }}>
            <BellOutlined
              style={{
                fontSize: 20,
                color: ' #5D636B',
                position: 'relative',
                top: 4,
              }}
            />
            {count > 0 ? <span className={styles.count}></span> : ''}
          </a>
        )}

        <Dropdown overlay={menu}>
          <div className={styles.personal}>
            <Avatar icon={<UserOutlined />} size={28} src={images[0]} />
            <span className={styles.name}>{username}</span>
            <DownOutlined style={{ marginLeft: 13 }} />
          </div>
        </Dropdown>
      </div>

      <Modal
        title="修改密码"
        destroyOnClose
        visible={showEditModal}
        onCancel={() => setShowEditModal(false)}
        footer={null}>
        <PwdForm onSubmit={handleSubmit} onClose={() => setShowEditModal(false)} />
      </Modal>
    </Layout.Header>
  );
};

export default TopBar;
