import { useState, useEffect } from 'react';
import Map, { setTruckDriving, converFrom } from '../Map';

export default ({ mapData }) => {
  const [mapInstance, setMapInstance] = useState(false);

  const mapReady = map => {
    setMapInstance(map);
  };
  // 监听坐标变化
  useEffect(() => {
    if (mapData.length !== 0) {
      const path = mapData
        .map(item => `${item.longitude},${item.latitude}`)
        .reduce((total, item) => `${total}|${item}`);
      // 转化坐标
      converFrom({ lnglat: path, type: 'baidu' }).then(res => {
        if (res.status === '1') {
          const newPath = res.locations.split(';').map(item => ({ lnglat: item.split(',') }));
          setTruckDriving(mapInstance, newPath);
        }
      });
    }
  }, [mapData, mapInstance]);
  return <Map ready={mapReady} />;
};
