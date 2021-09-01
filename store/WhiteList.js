import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { getCommon } from '@api';
import { User } from '@store';

const useWhiteList = () => {
  const [whiteList, setWhiteList] = useState({
    heShun: false,
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

      const HE_SHUN_ID = res.result.find(item => item.key === 'HE_SHUN_GOODSOWNER_ID_WHITE').url;
      if (HE_SHUN_ID && HE_SHUN_ID.includes(userId)) {
        setWhiteList({
          ...whiteList,
          heShun: true,
        });
      }
    }
  };
  const reloadWhiteList = () => {
    setWhiteList([]);
  };
  console.log(whiteList);
  return { whiteList, reloadWhiteList, reloadWhiteList: () => setHiddenDate() };
};
export default createContainer(useWhiteList);
