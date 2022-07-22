import { useState, useEffect, useCallback } from 'react';
import { Layout, Content, Ellipsis, AutoInputSelect, Icon, Image } from '@components';
import { Table, Input, Modal, Form, message } from 'antd';
import router from 'next/router';
import s from './index.less';
import styles from './equipmentManagement.less';
import { useRTTask, useMqtt } from '@components/Hooks';
import { Format } from '@utils/common';
import { product } from '@api';
import Regulation from '@components/ProductManagement/EquipmentManagement/regulation';
const chuansong = Image.ChuanSongGif;
const dibang = Image.DiBangGif;
const hezi = Image.HeZi;
const tiaotai = Image.TiaoTaiGif;
const chuansongGrey = Image.ChuanSongGray;
const dibangGrey = Image.DiBangGray;
const fenxuanGrey = Image.FenXuanGray;
const fuxuanGrey = Image.FuXuanGray;
const zhuKong = Image.ZhuKong;
const zhuKongGrey = Image.ZhuKongGray;
const fuxuan = Image.FuXuan;
const tiaotaiGrey = Image.TiaoTaiGray;
const connection = Icon.ConnectionIcon;
const notConnected = Icon.NoConnectionIcon;

const Index = props => {
  const routeView = {
    title: '设备管理',
    pageKey: 'equipmentManagement',
    longKey: 'productManagement.equipmentManagement',
    breadNav: '智慧工厂.设备管理',
    pageTitle: '设备管理',
  };
  // category: 设备类型
  //   0: 磅机
  //   1: 原煤皮带秤
  //   2: 跳汰机
  //   3: 旋流分选机
  //   4: 浮选机
  //   5: 精煤皮带秤
  const columns = [
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: value => value,
    },

    {
      title: '运行状态',
      dataIndex: 'runStatusZn',
      key: 'runStatusZn',
      width: 120,
      render: value => value,
    },
    {
      title: '连接状态',
      dataIndex: 'connectionStatusZn',
      key: 'connectionStatusZn',
      width: 120,
      render: value => value,
    },
    {
      title: '设备接入时间',
      dataIndex: 'connectionTime',
      key: 'connectionTime',
      width: 200,
      render: value => <Ellipsis value={value} width={200} />,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 120,
      render: value => value,
    },
    {
      title: '操作',
      dataIndex: 'ctrl',
      key: 'ctrl',
      width: 120,
      align: 'right',
      render: (value, record) => {
        return (
          <>
            <span
              style={{ color: '#477AEF', cursor: 'pointer' }}
              onClick={() => {
                setDid(record.id);
                form1.setFieldsValue({ name: record.name, remark: record.remark });
                setVisible2(true);
              }}>
              编辑
            </span>
          </>
        );
      },
    },
  ];
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const { start, destory } = useRTTask({ interval: 500000 });
  const { start: start2, destory: destory2 } = useRTTask({ interval: 500000 });
  const [visible, setVisible] = useState(false);
  const [visible2, setVisible2] = useState(false);
  const [dataList, setDataList] = useState({});
  const [data, setData] = useState({});
  const [did, setDid] = useState(0);

  const [macThickness, setMacThickness] = useState();
  const { init, connectionStatus, client } = useMqtt();
  const [macAddress, setMacAddress] = useState();
  const getData = async () => {
    return product.getDeviceTotalData();
  };
  const getDataList = async () => {
    setLoading(true);
    return product.getIndustryDeviceList();
  };

  const config = {
    child_topic: 'proton/jigger', // 过磅topic
    parent_topic: 'testSaas',
  };

  useEffect(() => {
    if (client && macAddress) {
      window.ClientEnd = client;
      console.log('开始订阅--->订阅消息--->监听消息');
      subscribe();
      // 监听信息
      console.log('kkkkkkkk');
      client.on('message', (topic, message) => {
        if (topic.includes(config.child_topic)) {
          console.log('接收消息', `${message}`);
          const res = JSON.parse(message);
          console.log(res);
          if (res.status === 0) {
            setMacThickness(res.result.jiggerData);
          } else {
            console.log('失败');
          }
        }
      });
    }
  }, [client, macAddress]);

  // 开始订阅
  const subscribe = async () => {
    const _topic = `${config.parent_topic}/${config.child_topic}/${macAddress}`;
    console.log(_topic);
    client.subscribe(_topic, { qos: 0 }, e => {
      if (!e) {
        console.log('订阅成功:' + _topic);
      } else {
        console.log('订阅错误', e);
      }
    });
  };

  useEffect(() => {
    init();
    startData();

    return () => {
      destory();
      destory2();
      window.ClientEnd.end();
    };
  }, []);

  const startData = () => {
    start({
      api: () => {
        return getData();
      },
      callback: res => {
        if (res.status === 0) {
          setData(res.result);
          setMacAddress(res.result.jiggerData.macAddress);
        } else {
          message.error(`${res.detail || res.description}`);
        }
      },
    });
    start2({
      api: () => {
        return getDataList();
      },
      callback: res => {
        if (res.status === 0) {
          setDataList(res.result);
        } else {
          message.error(`${res.detail || res.description}`);
        }
        setLoading(false);
      },
    });
  };

  const confirmChangeName = async id => {
    const { name, remark } = form1.getFieldValue();
    const params = {
      did: id,
      name,
      remark,
    };
    const res = await product.deviceEdit({ params });
    if (res.status === 0) {
      message.success('设置成功');
    } else {
      message.warn(`${res.detail || res.description}`);
    }
  };

  const handleChangeGoodsType = async () => {
    const { inventoryIn, inventoryOut } = form.getFieldValue();
    const params = { inventoryInId: inventoryIn, inventoryOutId: inventoryOut };
    const res = await product.setBeltGoodsType({ params });
    if (res.status === 0) {
      message.success('设置成功');
    } else {
      message.warn(`${res.detail || res.description}`);
    }
  };

  const [currentTab, setCurrentTab] = useState('total');
  useEffect(() => {
    const { orderTab } = sessionStorage;
    setCurrentTab(orderTab || 'total');
  }, []);

  // 改变tab
  const onChangeTab = useCallback(key => {
    setCurrentTab(key);

    if (key === 'total') {
      startData();
    } else if (key === 'regulation') {
      destory();
      destory2();
    }
    // 设置存储
    sessionStorage.orderTab = key;
  });

  useEffect(() => {
    if (currentTab === 'regulation') {
      destory();
      destory2();
    }
  }, [currentTab]);
  return (
    <Layout {...routeView}>
      <Content>
        <header className="tab-header" style={{ paddingLeft: 32 }}>
          <div className={`tab-item ${currentTab === 'total' ? 'active' : ''}`} onClick={() => onChangeTab('total')}>
            设备总览
          </div>
          <div
            className={`tab-item ${currentTab === 'regulation' ? 'active' : ''}`}
            onClick={() => onChangeTab('regulation')}>
            设备调控
          </div>
        </header>
      </Content>
      {currentTab === 'total' && (
        <div>
          <Content>
            <section className={styles.root}>
              {/* 上面的三个card */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div className={styles.cardItem}>
                  <div className={styles.cardTitle}>
                    磅机
                    <img
                      src={
                        data.poundData &&
                          data.poundData.connectionStatusZn &&
                          data.poundData.connectionStatusZn != '未连接'
                          ? connection
                          : notConnected
                      }
                      className={styles.connection}
                    />
                  </div>
                  <div className={styles.row}>
                    <div className={styles.col}>
                      <div className={styles.cardLabel}>设备工作状态</div>
                      <div className={styles.cardText}>
                        {(data.poundData && data.poundData.connectionStatusZn) || '-'}
                      </div>
                    </div>
                  </div>
                  <div className={styles.row}>
                    <div className={styles.col}>
                      <div className={styles.cardLabel}>昨日发货总量</div>
                      <div
                        className={`${styles.cardText} ${styles.fontcolorblue}`}
                        onClick={() => router.push('/poundManagement/poundReport?subTab=from')}>
                        {(data.poundData && Format.weight(data.poundData.dataOut)) || '-'}
                      </div>
                      <div className={styles.unitName} style={{ marginLeft: 4 }}>
                        吨
                      </div>
                    </div>
                  </div>
                  <div className={styles.row}>
                    <div className={styles.col}>
                      <div className={styles.cardLabel}>昨日收货总量</div>
                      <div
                        className={`${styles.cardText} ${styles.fontcolorblue}`}
                        onClick={() => router.push('/poundManagement/poundReport?subTab=to')}>
                        {(data.poundData && Format.weight(data.poundData.dataIn)) || '-'}
                      </div>
                      <div className={styles.unitName} style={{ marginLeft: 4 }}>
                        吨
                      </div>
                    </div>
                  </div>
                  <div
                    className={`${styles.imgBox} ${styles.imgstyle1}`}
                    style={
                      data.poundData &&
                        data.poundData.connectionStatusZn &&
                        data.poundData.connectionStatusZn != '未连接'
                        ? {}
                        : { cursor: 'unset' }
                    }
                    onClick={() => {
                      if (
                        data.poundData &&
                        data.poundData.connectionStatusZn &&
                        data.poundData.connectionStatusZn != '未连接'
                      ) {
                        let id = dataList.data.find(item => item.category == 0)['id'];
                        router.push(`/productManagement/equipmentManagement/detail?id=${id}`);
                      }
                    }}>
                    <img
                      src={
                        data.poundData &&
                          data.poundData.connectionStatusZn &&
                          data.poundData.connectionStatusZn != '未连接'
                          ? dibang
                          : dibangGrey
                      }
                      className={styles.img}
                      style={{ width: 273 }}
                    />
                  </div>
                </div>
                <div className={styles.item} style={{ position: 'relative' }}>
                  {/* <Arrow title="进厂" direction="right" up={true}></Arrow> */}
                </div>
                <div className={styles.cardItem}>
                  <div className={styles.cardTitle}>
                    原煤皮带秤
                    <img
                      src={
                        data.beltInData &&
                          data.beltInData.connectionStatusZn &&
                          data.beltInData.connectionStatusZn != '未连接'
                          ? connection
                          : notConnected
                      }
                      className={styles.connection}
                    />
                  </div>
                  <div className={styles.row}>
                    <div className={styles.col}>
                      <div className={styles.cardLabel}>连接状态</div>
                      <div className={styles.cardText}>
                        {(data.beltInData && data.beltInData.connectionStatusZn) || '-'}
                      </div>
                    </div>
                    <div className={styles.col} style={{ marginLeft: 56 }}>
                      <div className={styles.cardLabel}>皮带速度</div>
                      <div className={styles.cardText}>
                        {(data.beltInData && data.beltInData.beltSpeed / 10) || '-'}
                      </div>
                      <div className={styles.unitName}>m/s</div>
                    </div>
                  </div>
                  <div className={styles.row}>
                    <div className={styles.col}>
                      <div className={styles.cardLabel}>本次运输总量</div>
                      <div className={styles.cardText}>
                        {(data.beltInData && Format.weight(data.beltInData.weight)) || '-'}
                      </div>
                      <div className={styles.unitName} style={{ marginLeft: 4 }}>
                        吨
                      </div>
                    </div>
                  </div>
                  <div className={styles.row}>
                    <div className={styles.col}>
                      <div className={styles.cardLabel}>当前运输货品</div>
                      <div className={styles.cardText}>{(data.beltInData && data.beltInData.goodsType) || '-'}</div>
                      <div
                        className={styles.fontcolorblue}
                        style={{ marginLeft: 12 }}
                        onClick={() => {
                          setVisible(true);
                        }}>
                        设置
                      </div>
                    </div>
                  </div>
                  <div
                    className={`${styles.imgBox} ${styles.imgstyle1}`}
                    style={
                      data.beltInData &&
                        data.beltInData.connectionStatusZn &&
                        data.beltInData.connectionStatusZn != '未连接'
                        ? {}
                        : { cursor: 'unset' }
                    }
                    onClick={() => {
                      if (
                        data.beltInData &&
                        data.beltInData.connectionStatusZn &&
                        data.beltInData.connectionStatusZn != '未连接'
                      ) {
                        let id = dataList.data.find(item => item.category == 1)['id'];
                        router.push(`/productManagement/equipmentManagement/detail?id=${id}`);
                      }
                    }}>
                    <img
                      src={
                        data.beltInData &&
                          data.beltInData.connectionStatusZn &&
                          data.beltInData.connectionStatusZn != '未连接'
                          ? chuansong
                          : chuansongGrey
                      }
                      style={{ width: 272 }}></img>
                  </div>
                </div>
                <div className={styles.item} style={{ position: 'relative' }}>
                  {/* <Arrow title="破碎给料" direction="right" up={true}></Arrow> */}
                </div>
                <div className={styles.cardItem}>
                  <div className={styles.cardTitle}>
                    跳汰机
                    <img
                      src={
                        data.jiggerData &&
                          data.jiggerData.connectionStatusZn &&
                          data.jiggerData.connectionStatusZn != '未连接'
                          ? connection
                          : notConnected
                      }
                      className={styles.connection}
                    />
                  </div>
                  <div className={styles.row}>
                    <div className={styles.col}>
                      <div className={styles.cardLabel}>连接状态</div>
                      <div className={styles.cardText}>
                        {(data.jiggerData && data.jiggerData.connectionStatusZn) || '-'}
                      </div>
                    </div>
                  </div>
                  <div className={styles.row}>
                    <div className={styles.col}>
                      <div className={styles.cardLabel}>床层厚度</div>
                      <div className={styles.cardText}>
                        {macAddress != ''
                          ? macThickness
                            ? macThickness.thicknessFirstSetValue
                            : data.jiggerData && data.jiggerData.thickness_first_show_value
                          : (data.jiggerData && data.jiggerData.thickness_first_show_value) || '-'}
                      </div>
                      <div>(一段)</div>
                    </div>
                    <div className={styles.col}>
                      <div className={styles.cardLabel}></div>
                      <div className={styles.cardText}>
                        {macAddress != ''
                          ? macThickness
                            ? macThickness.thicknessSecondSetValue
                            : data.jiggerData && data.jiggerData.thickness_second_show_value
                          : (data.jiggerData && data.jiggerData.thickness_second_show_value) || '-'}
                      </div>
                      <div>(二段)</div>
                    </div>
                    <div className={styles.col}>
                      <div className={styles.cardLabel}></div>
                      <div className={styles.cardText}>
                        {macAddress != ''
                          ? macThickness
                            ? macThickness.thicknessThirdSetValue
                            : data.jiggerData && data.jiggerData.thickness_third_show_value
                          : (data.jiggerData && data.jiggerData.thickness_third_show_value) || '-'}
                      </div>
                      <div>(三段)</div>
                    </div>
                  </div>
                  <div className={styles.row}>
                    <div className={styles.col}>
                      <div className={styles.cardLabel}>风阀速率</div>
                      <div className={styles.cardText}>
                        {(data.jiggerData && data.jiggerData.frequencyFirstValue) || '-'}
                      </div>
                      <div>(一段)</div>
                    </div>
                    <div className={styles.col}>
                      <div className={styles.cardLabel}></div>
                      <div className={styles.cardText}>
                        {(data.jiggerData && data.jiggerData.frequencySecondValue) || '-'}
                      </div>
                      <div>(二段)</div>
                    </div>
                    <div className={styles.col}>
                      <div className={styles.cardLabel}></div>
                      <div className={styles.cardText}>
                        {(data.jiggerData && data.jiggerData.frequencyThirdValue) || '-'}
                      </div>
                      <div>(三段)</div>
                    </div>
                  </div>
                  <div
                    className={`${styles.imgBox} ${styles.imgstyle1}`}
                    style={
                      data.jiggerData &&
                        data.jiggerData.connectionStatusZn &&
                        data.jiggerData.connectionStatusZn != '未连接'
                        ? {}
                        : { cursor: 'unset' }
                    }
                    onClick={() => {
                      if (
                        data.jiggerData &&
                        data.jiggerData.connectionStatusZn &&
                        data.jiggerData.connectionStatusZn != '未连接'
                      ) {
                        let id = dataList.data.find(item => item.category == 2)['id'];

                        router.push(`/productManagement/equipmentManagement/detail?id=${id}`);
                      }
                    }}>
                    <img
                      src={
                        data.jiggerData &&
                          data.jiggerData.connectionStatusZn &&
                          data.jiggerData.connectionStatusZn != '未连接'
                          ? tiaotai
                          : tiaotaiGrey
                      }
                      style={{ width: 243 }}></img>
                  </div>
                </div>
              </div>

              {/* 中间的图 */}
              <div className={styles.mid}>
                <div className={styles.row} style={{ justifyContent: 'center' }}>
                  <div className={styles.img} style={{ cursor: 'unset' }}>
                    <img src={hezi} style={{ height: 218, width: 750 }} />
                  </div>
                </div>
              </div>

              {/* 下面的三个card */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div className={styles.cardItem}>
                  <div
                    className={`${styles.imgBox} ${styles.imgstyle1}`}
                    style={
                      data.beltOutData &&
                        data.beltOutData.connectionStatusZn &&
                        data.beltOutData.connectionStatusZn != '未连接'
                        ? {}
                        : { cursor: 'unset' }
                    }
                    onClick={() => {
                      if (
                        data.beltOutData &&
                        data.beltOutData.connectionStatusZn &&
                        data.beltOutData.connectionStatusZn != '未连接'
                      ) {
                        let id = dataList.data.find(item => item.category == 5)['id'];
                        router.push(`/productManagement/equipmentManagement/detail?id=${id}`);
                      }
                    }}>
                    <img
                      src={
                        data.beltOutData &&
                          data.beltOutData.connectionStatusZn &&
                          data.beltOutData.connectionStatusZn != '未连接'
                          ? chuansong
                          : chuansongGrey
                      }
                      style={{ width: 272 }}></img>
                  </div>
                  <div className={styles.cardTitle} style={{ marginTop: 16 }}>
                    精煤皮带秤
                    <img
                      src={
                        data.beltOutData &&
                          data.beltOutData.connectionStatusZn &&
                          data.beltOutData.connectionStatusZn != '未连接'
                          ? connection
                          : notConnected
                      }
                      className={styles.connection}
                    />
                  </div>
                  <div className={styles.row}>
                    <div className={styles.col}>
                      <div className={styles.cardLabel}>连接状态</div>
                      <div className={styles.cardText}>
                        {(data.beltOutData && data.beltOutData.connectionStatusZn) || '-'}
                      </div>
                    </div>
                    <div className={styles.col} style={{ marginLeft: 56 }}>
                      <div className={styles.cardLabel}>皮带速度</div>
                      <div className={styles.cardText}>
                        {(data.beltOutData && data.beltOutData.beltSpeed / 10) || '-'}
                      </div>
                      <div className={styles.unitName}>m/s</div>
                    </div>
                  </div>
                  <div className={styles.row}>
                    <div className={styles.col}>
                      <div className={styles.cardLabel}>本次运输总量</div>
                      <div className={styles.cardText}>
                        {(data.beltOutData && Format.weight(data.beltOutData.weight)) || '-'}
                      </div>
                      <div className={styles.unitName} style={{ marginLeft: 4 }}>
                        吨
                      </div>
                    </div>
                  </div>
                  <div className={styles.row}>
                    <div className={styles.col}>
                      <div className={styles.cardLabel}>当前运输货品</div>
                      <div className={styles.cardText}>{(data.beltOutData && data.beltOutData.goodsType) || '-'}</div>
                      <div
                        className={styles.fontcolorblue}
                        style={{ marginLeft: 12 }}
                        onClick={() => {
                          setVisible(true);
                        }}>
                        设置
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.item} style={{ position: 'relative', justifyContent: 'center' }}>
                  {/* <Arrow title="成品" direction="left" up={true}></Arrow> */}
                </div>
                <div className={styles.cardItem}>
                  <div
                    className={`${styles.imgBox} ${styles.imgstyle1}`}
                    style={
                      data.flotation_data &&
                        data.flotation_data.connectionStatusZn &&
                        data.flotation_data.connectionStatusZn != '未连接'
                        ? {}
                        : { cursor: 'unset' }
                    }
                    onClick={() => {
                      if (
                        data.flotation_data &&
                        data.flotation_data.connectionStatusZn &&
                        data.flotation_data.connectionStatusZn != '未连接'
                      ) {
                        let id = dataList.data.find(item => item.category == 4)['id'];
                        router.push(`/productManagement/equipmentManagement/detailOther?id=${id}`);
                      }
                    }}>
                    <img
                      src={
                        data.flotation_data &&
                          data.flotation_data.connectionStatusZn &&
                          data.flotation_data.connectionStatusZn != '未连接'
                          ? fuxuan
                          : fuxuanGrey
                      }
                      style={{ width: 268 }}></img>
                  </div>
                  <div className={styles.cardTitle} style={{ marginTop: 16 }}>
                    浮选机
                    <img
                      src={
                        data.flotation_data &&
                          data.flotation_data.connectionStatusZn &&
                          data.flotation_data.connectionStatusZn != '未连接'
                          ? connection
                          : notConnected
                      }
                      className={styles.connection}
                    />
                  </div>
                  <div className={styles.row}>
                    <div className={styles.col}>
                      <div className={styles.cardLabel}>连接状态</div>
                      <div className={styles.cardText}>
                        {(data.flotation_data && data.flotation_data.connectionStatusZn) || '-'}
                      </div>
                    </div>
                  </div>
                  <div className={styles.row}>
                    <div className={styles.col}>
                      <div className={styles.cardLabel}>控制设备数量</div>
                      <div className={styles.cardText}>{(data.flotation_data && data.flotation_data.count) || '-'}</div>
                    </div>
                  </div>
                  <div className={styles.row}>
                    <div className={styles.col}>
                      <div className={styles.cardLabel}>当前运行设备数量</div>
                      <div className={styles.cardText}>
                        {(data.flotation_data &&
                          data.flotation_data.connectionStatusZn != '未连接' &&
                          data.flotation_data.run_count) ||
                          '-'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.item} style={{ position: 'relative', justifyContent: 'center' }}>
                  {/* <Arrow title="泡沫剂" direction="left" up={true}></Arrow> */}
                </div>
                <div className={styles.cardItem}>
                  <div
                    className={`${styles.imgBox} ${styles.imgstyle1}`}
                    style={
                      data.master_data &&
                        data.master_data.connectionStatusZn &&
                        data.master_data.connectionStatusZn != '未连接'
                        ? {}
                        : { cursor: 'unset' }
                    }
                    onClick={() => {
                      if (
                        data.master_data &&
                        data.master_data.connectionStatusZn &&
                        data.master_data.connectionStatusZn != '未连接'
                      ) {
                        let id = dataList.data.find(item => item.category == 6)['id'];
                        router.push(`/productManagement/equipmentManagement/detailOther?id=${id}`);
                      }
                    }}>
                    <img
                      src={
                        data.master_data &&
                          data.master_data.connectionStatusZn &&
                          data.master_data.connectionStatusZn != '未连接'
                          ? zhuKong
                          : zhuKongGrey
                      }
                      style={{ width: 209 }}></img>
                  </div>
                  <div className={styles.cardTitle} style={{ marginTop: 16 }}>
                    主控机
                    <img
                      src={
                        data.master_data &&
                          data.master_data.connectionStatusZn &&
                          data.master_data.connectionStatusZn != '未连接'
                          ? connection
                          : notConnected
                      }
                      className={styles.connection}
                    />
                  </div>
                  <div className={styles.row}>
                    <div className={styles.col}>
                      <div className={styles.cardLabel}>连接状态</div>
                      <div className={styles.cardText}>
                        {(data.master_data && data.master_data.connectionStatusZn) || '-'}
                      </div>
                    </div>
                  </div>
                  <div className={styles.row}>
                    <div className={styles.col}>
                      <div className={styles.cardLabel}>控制设备数量</div>
                      <div className={styles.cardText}>{(data.master_data && data.master_data.count) || '-'}</div>
                    </div>
                  </div>
                  <div className={styles.row}>
                    <div className={styles.col}>
                      <div className={styles.cardLabel}>当前运行设备数量</div>
                      <div className={styles.cardText}>
                        {(data.master_data &&
                          data.master_data.connectionStatusZn != '未连接' &&
                          data.master_data.run_count) ||
                          '-'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </Content>
          <Content style={{ marginTop: 16 }}>
            <header>设备列表</header>
            <section className={styles.root}>
              <Table
                loading={loading}
                dataSource={dataList.data}
                columns={columns}
                scroll={{ x: 'auto' }}
                pagination={
                  {
                    // onChange: onChangePage,
                    // pageSize: query.pageSize,
                    // current: query.page,
                    // total: count,
                    // onShowSizeChange: onChangePageSize,
                  }
                }
              />
              <Modal
                visible={visible}
                title="修改传送货品"
                destroyOnClose
                onCancel={() => {
                  setVisible(false);
                }}
                onOk={() => {
                  handleChangeGoodsType();
                  setVisible(false);
                }}>
                <Form form={form}>
                  <Form.Item label="原煤名称" name="inventoryIn" style={{ height: 32 }}>
                    <AutoInputSelect
                      style={{ width: 264 }}
                      placeholder="请选择原煤名称"
                      mode="goodsType"></AutoInputSelect>
                  </Form.Item>
                  <Form.Item
                    label="精煤名称"
                    name="inventoryOut"
                    style={{ height: 32, marginTop: 24, marginBottom: 8 }}>
                    <AutoInputSelect
                      style={{ width: 264 }}
                      placeholder="请选择精煤名称"
                      mode="goodsType"></AutoInputSelect>
                  </Form.Item>
                </Form>
              </Modal>
              <Modal
                visible={visible2}
                title="修改设备信息"
                destroyOnClose
                width={640}
                onCancel={() => {
                  setVisible2(false);
                }}
                onOk={() => {
                  confirmChangeName(did);
                  setVisible2(false);
                }}>
                <Form form={form1} className={s.editForm}>
                  <Form.Item style={{ height: 32 }} label="设备名称" name="name">
                    <Input style={{ width: 200 }} placeholder="请输入设备名称" />
                  </Form.Item>
                  <Form.Item style={{ marginTop: 24 }} label="备注" name="remark">
                    <Input.TextArea style={{ height: 80, width: 450 }} placeholder="请输入备注" />
                  </Form.Item>
                </Form>
              </Modal>
            </section>
          </Content>
        </div>
      )}
      {currentTab === 'regulation' && <Regulation macThicknessData={macThickness} />}
    </Layout>
  );
};

export default Index;
