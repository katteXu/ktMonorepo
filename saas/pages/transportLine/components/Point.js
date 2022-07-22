import { useState, useCallback, useEffect } from 'react';
import { Search } from '@components';
import Map, { setMarker, clear } from '@components/Map';
import { Input, message } from 'antd';
import styles from './styles.less';
import { getTransportPoint } from '@api';
const Point = props => {
  const [mapIntance, setMapIntance] = useState();

  const [query, setQuery] = useState({
    plateNum: '',
  });

  const [nowInfo, setNowInfo] = useState({});

  useEffect(() => {
    props.onRemeberPlate(query.plateNum);
  }, [query.plateNum]);
  // 初始化
  useEffect(() => {
    const { plateNum } = props;
    setQuery({ ...query, plateNum });
  }, []);

  // 初始化
  useEffect(() => {
    const { plateNum } = props;
    setQuery({ ...query, plateNum });
  }, []);

  // 地图加载完毕
  const mapReady = map => {
    setMapIntance(map);
  };

  const handleChangePlate = e => {
    const plateNum = e.target.value;
    setQuery({ ...query, plateNum });
  };

  const handleSearch = async () => {
    if (!validatePlateNum()) {
      message.error('请输入有效的车牌号');
      return;
    }

    const params = {
      trailerPlateNumber: query.plateNum,
    };

    const res = await getTransportPoint({ params });

    if (res.status === 0) {
      const { trailerPlateNumber, address, uploadTime, longitude, latitude } = res.result;
      setNowInfo({
        plateNum: trailerPlateNumber,
        date: uploadTime,
        place: address,
      });
      setMarker(mapIntance, [longitude, latitude]);
    } else {
      message.error(res.detail || res.desccription);
    }
  };

  const handleReset = useCallback(() => {
    setQuery({ plateNum: '' });
    setNowInfo({});
    clear(mapIntance);
  }, [mapIntance]);

  const validatePlateNum = () => {
    const { plateNum } = query;
    const _testPlateNum = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Za-z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/;
    if (_testPlateNum.test(plateNum)) {
      return true;
    }
    return false;
  };
  return (
    <>
      <Search onSearch={handleSearch} onReset={handleReset} simple>
        <Search.Item label="车牌号">
          <Input allowClear placeholder="请输入车牌号" value={query.plateNum} onChange={handleChangePlate}></Input>
        </Search.Item>
      </Search>
      <div className={styles['truck-info']}>
        <div className={styles.col}>
          <span className={styles['label']}>车牌号：</span>
          <span className={styles['data']}>{nowInfo.plateNum || '-'}</span>
        </div>
        <div className={styles.col}>
          <span className={styles['label']}>上报时间：</span>
          <span className={styles['data']}>{nowInfo.date || '-'}</span>
        </div>
        <div className={styles.col}>
          <span className={styles['label']}>实时位置：</span>
          <span className={styles['data']}>{nowInfo.place || '-'}</span>
        </div>
      </div>
      <div style={{ height: 600, position: 'relative' }}>
        <Map ready={mapReady} />
        {nowInfo && (
          <div className={styles['map-info']}>
            <div className={styles.row}>车牌号：{nowInfo.plateNum || '-'}</div>
            <div className={styles.row}>上报时间：{nowInfo.date || '-'}</div>
            <div className={styles.row}>实时位置：{nowInfo.place || '-'}</div>
          </div>
        )}
      </div>
    </>
  );
};

export default Point;
