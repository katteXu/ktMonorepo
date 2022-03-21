import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { getCommon } from '@api';
import { User } from '@store';

const useWhiteList = () => {
  const [whiteList, setWhiteList] = useState({
    heShun: false,
    luQiao: false,
  }); //税率白名单
  const { userInfo, loading } = User.useContainer();
  useEffect(() => {
    setHiddenDate();
  }, []);

  //白名单接口
  const setHiddenDate = async () => {
    const res = await getCommon();
    if (res.status === 0) {
      const { userId } = localStorage;

      const HE_SHUN_ID = res.result.find(item => item.key === 'HE_SHUN_GOODSOWNER_ID_WHITE').url.split(',');
      const LU_QIAO_ID = res.result.find(item => item.key === 'LU_QIAO_GOODSOWNER_ID_WHITE').url.split(',');

      if (HE_SHUN_ID && HE_SHUN_ID.includes(userId)) {
        setWhiteList({
          ...whiteList,
          heShun: true,
        });
      }

      if (LU_QIAO_ID && LU_QIAO_ID.includes(userId)) {
        setWhiteList({
          ...whiteList,
          heShun: true,
          luQiao: true,
        });
      }
    }
  };
  const reloadWhiteList = () => {
    setWhiteList([]);
  };
  return { whiteList, reloadWhiteList, reloadWhiteList: () => setHiddenDate() };
};
export default createContainer(useWhiteList);
