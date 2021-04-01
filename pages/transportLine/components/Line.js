import { useState, useCallback, useEffect } from 'react';
import { Search, Content, Image } from '@components';
import Map, { setMarker, setMarkerList, clear, setPolyLine, converTOGD } from '@components/Map';
import { Input, DatePicker, message, Table } from 'antd';
import moment from 'moment';
import styles from './styles.less';
import { getTransportLine } from '@api';

const Line = props => {
  const columns = [
    {
      title: '停车时长',
      dataIndex: 'timeDiff',
      key: 'timeDiff',
      width: 120,
    },
    {
      title: '停车开始时间',
      dataIndex: 'uploadTime',
      key: 'uploadTime',
      width: 120,
    },
    {
      title: '停车结束时间',
      dataIndex: 'leaveTime',
      key: 'leaveTime',
      width: 120,
    },
    {
      title: '停车位置',
      dataIndex: 'address',
      key: 'address',
      width: 120,
      align: 'right',
    },
  ];

  const [mapIntance, setMapIntance] = useState();
  const [mapInfo, setMapInfo] = useState();
  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState({});
  const [query, setQuery] = useState({
    pageSize: 10,
    page: 1,
    plateNum: props.plateNum,
    begin: undefined,
    end: undefined,
  });

  useEffect(() => {
    props.onRemeberPlate(query.plateNum);
  }, [query.plateNum]);
  // 初始化
  useEffect(() => {
    const { plateNum } = props;
    setQuery({ ...query, plateNum });
  }, []);

  // 地图加载完毕
  const mapReady = map => {
    setMapIntance(map);
  };

  // 画路线图
  const drawTruck = async () => {
    const params = {
      trailerPlateNumber: query.plateNum,
      begin: query.begin,
      end: moment(query.end) > moment() ? moment().format('YYYY-MM-DD HH:mm:ss') : query.end,
    };
    const res = await getTransportLine({ params });

    if (res.status === 0) {
      const { distance, beginAddress, endAddress, data, stopPointList } = res.result;
      setDataList({
        data: stopPointList,
      });
      setMapInfo({
        from: beginAddress || '-',
        to: endAddress || '-',
        distance: distance || '-',
      });
      const paths = data.map(item => converTOGD(item.longitude, item.latitude));
      clear(mapIntance);

      if (paths.length > 1) {
        setPolyLine(mapIntance, paths, 8);
      } else if (paths.length === 1) {
        setMarker(mapIntance, paths[0]);
      } else {
      }
      // 描点
      drawPoint(stopPointList);
    } else {
      message.error(res.detail || res.desccription);
    }
  };

  // 日期输入
  const handleChangeDate = useCallback((value, string) => {
    const begin = value && value[0] && moment(value[0]).format('YYYY-MM-DD HH:mm:ss');
    const end = value && value[1] && moment(value[1]).format('YYYY-MM-DD HH:mm:ss');
    setQuery({ ...query, begin, end });
  });

  // 车牌输入
  const handleChangePlate = e => {
    const plateNum = e.target.value;
    setQuery({ ...query, plateNum });
  };

  // 搜索
  const handleSearch = () => {
    if (!validatePlateNum()) {
      message.error('请输入有效的车牌号');
      return;
    }

    if (!validateDate()) {
      message.error('请输入有效的时间范围');
      return;
    }
    drawTruck();
  };

  // 重置
  const handleReset = useCallback(() => {
    clear(mapIntance);
    setQuery({
      plateNum: '',
      begin: undefined,
      end: undefined,
    });
    setMapInfo(undefined);
  }, [mapIntance]);

  // 验证车牌号
  const validatePlateNum = () => {
    const { plateNum } = query;
    const _testPlateNum = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Za-z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/;
    if (_testPlateNum.test(plateNum)) {
      return true;
    }
    return false;
  };

  const validateDate = () => {
    const { begin, end } = query;
    if (begin && end) {
      const _begin = moment(begin);
      const _end = moment(end) > moment() ? moment() : moment(end);
      const result = _end.diff(_begin, 'day');
      if (result < 7) {
        return true;
      }
    }
    return false;
  };

  // 描点
  const drawPoint = pointList => {
    const points = pointList.map(item => converTOGD(item.longitude, item.latitude));
    setMarkerList(mapIntance, points);
  };
  return (
    <>
      <Search onSearch={handleSearch} onReset={handleReset} simple>
        <Search.Item label="车牌号">
          <Input allowClear placeholder="请输入车牌号" value={query.plateNum} onChange={handleChangePlate}></Input>
        </Search.Item>
        <Search.Item label="查询时间">
          <DatePicker.RangePicker
            allowClear
            style={{ width: 376 }}
            value={query.begin && query.end ? [moment(query.begin), moment(query.end)] : null}
            format="YYYY-MM-DD HH:mm:ss"
            showTime={{
              defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
            }}
            placeholder={['开始时间', '结束时间']}
            onChange={handleChangeDate}
          />
        </Search.Item>
      </Search>
      <div style={{ height: 600, position: 'relative' }}>
        <Map ready={mapReady} />
        {mapInfo && (
          <div className={styles['map-info']}>
            <div className={styles.row}>
              <img src={Image.lineFrom} alt="" />
              {mapInfo.from}
            </div>
            <div className={styles.row}>
              <img src={Image.lineTo} alt="" />
              {mapInfo.to}
            </div>
            <div className={styles.row}>
              <img src={Image.linePlace} alt="" />
              轨迹距离：{mapInfo.distance} km
            </div>
          </div>
        )}
      </div>
      <Content style={{ border: '1px solid #ededed', marginTop: 24 }}>
        <header>停车点</header>
        <section>
          <Table
            columns={columns}
            pagination={false}
            dataSource={dataList.data}
            loading={loading}
            scroll={{ x: 'auto' }}
          />
        </section>
      </Content>
    </>
  );
};

export default Line;
