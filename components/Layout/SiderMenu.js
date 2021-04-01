import { Menu } from 'antd';
import router from 'next/router';
import { clearState } from '@utils/common';
import { useState, useEffect } from 'react';
import Icon from './IconMap';
import styles from './sider.less';
import { Menu as StoreMenu } from '@store';
// 更改页面
function changeView(e) {
  const { key, keyPath, item } = e;
  const _url = item.props.url;
  const path = `/${keyPath.reverse().join('/')}`;
  // 如果是当前页面则不做跳转
  if (key && router.asPath !== path) {
    const url = _url || path;
    router.push(url, path);
    // 切换路由时 清除持久化状态
    clearState();
  }
}

const SiderMenu = ({ pageKey, longKey }) => {
  const { menuList } = StoreMenu.useContainer();

  const [openKeys, setOpenKeys] = useState([longKey.split('.')[0]]);

  const onOpenChange = keys => {
    const lastKeys = keys.pop();
    setOpenKeys([lastKeys]);
  };

  return (
    <>
      <Menu
        className={styles.main}
        theme="dark"
        selectedKeys={[pageKey]}
        defaultOpenKeys={[longKey.split('.')[0]]}
        mode="inline"
        onOpenChange={onOpenChange}
        openKeys={openKeys}
        onClick={e => {
          changeView(e);
        }}>
        {menuList.map(item => {
          if (item.children && item.children.length > 0) {
            return (
              <Menu.SubMenu
                key={item.key}
                title={
                  <span>
                    {Icon[item.icon]}
                    <span>{item.name}</span>
                  </span>
                }>
                {item.children.map(c_item => (
                  <Menu.Item key={c_item.key} url={c_item.url}>
                    <span>{c_item.name}</span>
                  </Menu.Item>
                ))}
              </Menu.SubMenu>
            );
          } else {
            return (
              <Menu.Item key={item.key} url={item.url}>
                {Icon[item.icon]}
                <span>{item.name}</span>
              </Menu.Item>
            );
          }
        })}
      </Menu>
    </>
  );
};
export default SiderMenu;
