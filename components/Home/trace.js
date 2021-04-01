import { useState, useEffect } from 'react';
import Map, { setMarker } from '../Map';
import styles from '../../static/styles/home.less';
import { List, Avatar } from 'antd';
import { Icon } from '@components';
const ICON = [Icon.Blue, Icon.Red, Icon.Yellow, Icon.Green];

const COLOR = [
  '#3D86EF',
  '#E44040',
  '#FE9E43',
  '#23C0B1',
  '#7685DE',
  '#FECF43',
  '#83AFEF',
  '#E4408C',
  '#50ACF2',
  '#31C1DA',
  '#A09CF3',
  '#2390C0',
];

const Trace = ({ truckers = {}, loading }) => {
  // item state
  const [truckerIndex, changeTrucker] = useState(0);
  // map state
  const [mapData, changeMapData] = useState(false);
  // map 实例
  const [mapIntance, setMapIntance] = useState(false);

  // 选择司机
  const selectItem = index => {
    const { longitude, latitude } = truckers.data[index];
    const color = COLOR[index];
    if (index !== truckerIndex) {
      changeTrucker(index);
      // changeMapData([longitude, latitude]);
      setMarker(mapIntance, [longitude, latitude]);
    }
  };

  const mapReady = map => {
    setMapIntance(map);
  };

  // 默认选择第一个
  useEffect(() => {
    mapIntance &&
      truckers.data &&
      truckers.data.length > 0 &&
      setMarker(mapIntance, [truckers.data[0].longitude, truckers.data[0].latitude]);
  }, [truckers, mapIntance]);

  return (
    <div className={styles.trace}>
      <div className={styles.map}>
        <Map ready={mapReady} />
      </div>
      <div className={styles.list}>
        <div className={styles.header}>
          <span className={styles.txt}>运送中运单：</span>
          <span className={styles.number}>{truckers.count || 0}</span>
          <span className={styles.unit}>单</span>
        </div>
        <div className={styles.data}>
          <List
            size="small"
            loading={loading}
            dataSource={truckers.data}
            renderItem={(item, index) => (
              <List.Item
                className={`${styles['item-box']} ${index === truckerIndex ? `${styles.active}` : ''}`}
                onClick={() => selectItem(index)}
                // style={{ width: '48%', background: '#fff' }}
              >
                <Avatar size={44} src={ICON[index % 4]}></Avatar>
                <div className={styles.item}>
                  {item.trailerPlateNumber && <div className={styles.number}>{item.trailerPlateNumber}</div>}
                  <div className={styles.name}>{item.name}</div>
                  <div className={styles.phone}>{item.mobilePhoneNumber}</div>
                </div>
              </List.Item>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default Trace;
