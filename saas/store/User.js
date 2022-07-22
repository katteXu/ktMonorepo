import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { getUserInfo } from '@api';

// 车辆轨迹页面个性化账号
const personalizeAccount = [
  // 测试环境
  '18612341251',
  // 正式环境
  '17343009665',
  '13500000000',
  '13834469447',
  '16603593307',
];

const useUser = (initialState = {}) => {
  const [userInfo, setUserInfo] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [indexUrl, setIndexUrl] = useState('/home');
  // 个性化菜单
  const [personalizeMenu, setPersonalizeMenu] = useState();
  useEffect(() => {
    const { userId } = window.localStorage;
    getData(userId);
  }, []);

  useEffect(() => {
    generateIndex(userInfo);
  }, [userInfo]);

  const getData = async userId => {
    if (userId) {
      const res = await getUserInfo({ userId });
      if (res.status === 0) {
        // 设置个性化菜单
        if (personalizeAccount.includes(res.result.username)) {
          setPersonalizeMenu(['transportLine']);
        }
        // 设置用户信息
        setUserInfo(res.result);
      }
    }
    setLoading(false);
  };

  // 生成默认入口页
  const generateIndex = userInfo => {
    let url = '/home';
    // 车辆轨迹
    if (personalizeAccount.includes(userInfo.username)) {
      url = '/transportLine/truckLine';
    }

    // 代理商
    if (userInfo.isAgent === 1 && sessionStorage.getItem('isAgent') !== '0') {
      url = '/agent/transportAll';
    }

    // 子账号
    if (!userInfo.is_boss) {
      url = '/personal';
    }
    setIndexUrl(url);
    return url;
  };

  return {
    userInfo,
    reload: getData,
    loading,
    indexUrl,
    generateIndex,
    personalizeMenu,
  };
};
export default createContainer(useUser);
