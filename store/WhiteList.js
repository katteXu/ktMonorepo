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
      console.log(HE_SHUN_ID);
      console.log(userId);
      console.log(HE_SHUN_ID && HE_SHUN_ID.includes(userId));
      if (HE_SHUN_ID && HE_SHUN_ID.includes(userId)) {
        setWhiteList({
          ...whiteList,
          heShun: true,
        });
      }
    }
  };
  console.log(whiteList);
  return { whiteList, reloadHeShun: () => setHiddenDate };
};
export default createContainer(useWhiteList);
