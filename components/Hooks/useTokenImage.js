import { useState } from 'react';
import { getPrivateUrl } from '@api';
const useTokenImage = num => {
  const [images, setImages] = useState(new Array(num));

  const buildUrl = async url => {
    if (url.length > 0) {
      const params = {
        url,
      };
      const res = await getPrivateUrl({ params });
      if (res.status === 0) {
        const _imgs = url.map(key => res.result[key]);
        setImages([..._imgs]);
      } else {
        console.error('加签url失败');
      }
    } else {
      console.error('请传入要加签的图片且为数组格式');
    }
  };
  return { images, buildUrl };
};

export default useTokenImage;
