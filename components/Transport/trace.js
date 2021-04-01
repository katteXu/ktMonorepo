import { useState, useEffect } from 'react';
import Map, { setTruckDriving, converFrom } from '../Map';
import styles from '@styles/home.less';
import { List, Avatar } from 'antd';

export default ({ trucker, mapData = [] }) => {
  // map 实例
  const [mapInstance, setMapInstance] = useState(false);

  const mapReady = map => {
    setMapInstance(map);
  };

  // 监听坐标变化
  useEffect(
    e => {
      if (mapData.length !== 0) {
        const path = mapData
          .map(item => `${item.longitude},${item.latitude}`)
          .reduce((total, item) => `${total}|${item}`);
        // 转化坐标
        converFrom({ lnglat: path, type: 'baidu' }).then(res => {
          const newPath = res.locations.split(';').map(item => ({ lnglat: item.split(',') }));
          setTruckDriving(mapInstance, newPath);
        });
      }
    },
    [mapData, mapInstance]
  );
  return (
    <div className={styles.trace}>
      <div className={styles.map}>
        <Map ready={mapReady} />
      </div>
      <div className={styles.list}>
        <div className={styles.data}>
          <List
            size="small"
            loading={!Object.keys(trucker).length}
            dataSource={[trucker]}
            renderItem={(item, index) => (
              <List.Item className={styles.active}>
                <Avatar size={50} src="../../static/img/icon-blue.svg"></Avatar>
                <div className={styles.item}>
                  <div className={styles.name}>{item.name}</div>
                  <div className={styles.phone}>{item.mobilePhoneNumber}</div>
                  <div className={styles.number}>{item.trailerPlateNumber}</div>
                </div>
              </List.Item>
            )}
          />
        </div>
      </div>
    </div>
  );
};
