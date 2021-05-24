import React, { useState, useEffect } from 'react';
import { Layout, Content, Ellipsis, ChildTitle, Image, Icon } from '@components';
import ItemCard from '@components/ProductManagement/productionMonitoring/ItemCard';
import moment from 'moment';
import { Input, Button, Table, Modal } from 'antd';
import styles from './productionMonitoring.less';
import router from 'next/router';
import { QuestionCircleFilled } from '@ant-design/icons';
import { useThrottle } from 'ahooks';

const tiaotai = '../../../static/img/productionMonitoring/tiaotai.png';
const tiaotaiGif = '../../../static/img/productionMonitoring/tiaotai.gif';
const chuansong = '../../../static/img/productionMonitoring/chuansong.png';
const chuansongGif = '../../../static/img/productionMonitoring/chuansong.gif';

const routeView = {
  title: '生产监控',
  pageKey: 'productionMonitoring',
  longKey: 'productManagement.productionMonitoring',
  breadNav: '智慧工厂.生产监控',
  pageTitle: '生产监控',
};

const Index = props => {
  const columns = [
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: 120,
      render: value => value,
    },
    {
      title: '调节时间',
      dataIndex: 'changeTime',
      key: 'changeTime',
      width: 200,
      render: value => <Ellipsis value={value} width={200} />,
    },
    {
      title: '调节方式',
      dataIndex: 'changeWay',
      key: 'changeWay',
      width: 150,
      render: value => value,
    },
    {
      title: '调节参数',
      dataIndex: 'changeArg',
      key: 'changeArg',
      width: 120,
      render: value => {
        return (
          <span>
            {value[0]} {value[1]}
            <img
              src={Image.BlueArr}
              style={{ width: 16, height: 7, margin: '0 4px', lineHeight: '16px', position: 'relative', bottom: 1 }}
            />
            {value[2]}
          </span>
        );
      },
    },
    {
      title: '是否关联质检单',
      dataIndex: 'hasSheet',
      key: 'hasSheet',
      width: 120,
      render: value => value,
    },
    {
      title: '质检单号',
      dataIndex: 'sheetId',
      key: 'sheetId',
      width: 120,
      render: value => {
        return (
          <span
            className={value[1] ? styles.sheetId : ''}
            style={value ? { color: '#3d86ef', cursor: value[1] ? 'pointer' : 'none' } : {}}
            onClick={() => {
              if (value[1]) {
                router.push(`/productManagement/qualityManagement/detail?id=${value[1]}`);
              }
            }}>
            {value[0] || value || '无'}
          </span>
        );
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 120,
      render: value => value,
    },
  ];
  const [dataList, setDataList] = useState([
    {
      deviceName: '跳汰机',
      changeTime: moment('2021-03-02 17:34:52').format('YYYY-MM-DD HH:mm:ss'),
      changeWay: '自动调整',
      changeArg: ['床层三', '88', '85'],
      hasSheet: '是',
      sheetId: ['000140', '97'],
      remark: '灰分过高',
    },
    {
      deviceName: '跳汰机',
      changeTime: moment('2021-03-02 15:03:20').format('YYYY-MM-DD HH:mm:ss'),
      changeWay: '自动调整',
      changeArg: ['床层二', '82', '80'],
      hasSheet: '是',
      sheetId: ['000139', '96'],
      remark: '灰分过高',
    },
    {
      deviceName: '皮带秤',
      changeTime: moment('2021-03-01 14:01:27').format('YYYY-MM-DD HH:mm:ss'),
      changeWay: '手动调整',
      changeArg: ['皮带速度', '2', '3'],
      hasSheet: '否',
      sheetId: '',
      remark: '',
    },
    {
      deviceName: '皮带秤',
      changeTime: moment('2021-03-01 13:25:12').format('YYYY-MM-DD HH:mm:ss'),
      changeWay: '手动调整',
      changeArg: ['运行状态', '关闭', '开启'],
      hasSheet: '否',
      sheetId: '',
      remark: '',
    },
    {
      deviceName: '跳汰机',
      changeTime: moment('2021-03-01 13:24:56').format('YYYY-MM-DD HH:mm:ss'),
      changeWay: '手动调整',
      changeArg: ['运行状态', '关闭', '开启'],
      hasSheet: '否',
      sheetId: '',
      remark: '',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPaused2, setIsPaused2] = useState(false);
  let seconds =
    new Date().getTime() -
    new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0).getTime();
  const [total, setTotal] = useState(1561.5 * 1000);
  const [cleanCoal, setCleanCoal] = useState(468.32 * 1000);
  const [times, setTimes] = useState(0);
  const [times2, setTimes2] = useState(0);
  const [conveyorSpeed, setConveyorSpeed] = useState(3);
  const [conveyorSpeedBefore, setConveyorSpeedBefore] = useState(3);
  const [bedThinkness1, setBedThinkness1] = useState(75);
  const [bedThinkness1Show, setBedThinkness1Show] = useState(75);
  const [bedThinkness1Before, setBedThinkness1Before] = useState(75);
  const [bedThinkness2, setBedThinkness2] = useState(80);
  const [bedThinkness2Show, setBedThinkness2Show] = useState(80);
  const [bedThinkness2Before, setBedThinkness2Before] = useState(80);
  const [bedThinkness, setBedThinkness] = useState(85);
  const [bedThinknessShow, setBedThinknessShow] = useState(85);
  const [bedThinknessBefore, setBedThinknessBefore] = useState(85);

  const [active, setActive] = useState(true);

  const [runningTime, setRunningTime] = useState(13053);
  const getRunningTime = () => {
    return `${parseInt(runningTime / 60)}h ${parseInt(runningTime % 60)}min`;
  };

  const [runningTime2, setRunningTime2] = useState(13053);
  const getRunningTime2 = () => {
    return `${parseInt(runningTime2 / 60)}h ${parseInt(runningTime2 % 60)}min`;
  };

  const handleActive = () => {
    if (active) {
      setTimeout(() => {
        setActive(false);
      }, 300000);
      // }, 10000);
    } else {
      setTimeout(() => {
        setActive(true);
      }, 60000);
      // }, 10000);
    }
  };

  useEffect(() => {
    let timer = null;
    timer = setTimeout(() => {
      setTimes(times + 1);
      setBedThinkness1Show(parseInt(Math.random() * 10 + 90));
      setBedThinkness2Show(parseInt(Math.random() * 10 + 80));
      setBedThinknessShow(parseInt(Math.random() * 10 + 60));
    }, 1000);
    if (isPaused2) {
      clearTimeout(timer);
      timer = null;
    }
  }, [isPaused2, times]);

  useEffect(() => {
    setTimes(times + 1);
  }, [isPaused2]);

  useEffect(() => {
    handleActive();
  }, [active]);

  const handleTime = useThrottle(
    () => {
      if (!isPaused) {
        setRunningTime(runningTime + 1);
      }
    },
    { wait: 60000 }
  );
  useEffect(() => {
    if (isPaused) {
      setRunningTime(0);
    }
    handleTime;
  }, [isPaused, runningTime]);

  const handleTime2 = useThrottle(
    () => {
      if (!isPaused2) {
        setRunningTime2(runningTime2 + 1);
      }
    },
    { wait: 60000 }
  );
  useEffect(() => {
    if (isPaused2) {
      setRunningTime2(0);
    }
    handleTime2;
  }, [isPaused2, runningTime2]);

  useEffect(() => {
    let timer = null;
    timer = setTimeout(() => {
      setTotal(total + 0.0347 * 1000);
    }, 1000);
    if (isPaused || !active) {
      clearTimeout(timer);
      timer = null;
    }
    return;
  }, [total, isPaused, active]);

  useEffect(() => {
    let timer = null;
    timer = setTimeout(() => {
      setCleanCoal(cleanCoal + 0.052 * 1000);
    }, 1000);
    if (isPaused2 || active) {
      clearTimeout(timer);
      timer = null;
    }
    return;
  }, [cleanCoal, isPaused2, active]);

  useEffect(() => {
    if (!isPaused) {
      setConveyorSpeedBefore(conveyorSpeed);
    }
    if (isPaused) {
      setRunningTime(0);
    }
  }, [isPaused]);
  useEffect(() => {
    if (!isPaused2) {
      setBedThinkness1Before(bedThinkness1);
      setBedThinkness2Before(bedThinkness2);
      setBedThinknessBefore(bedThinkness);
    }
    if (isPaused) {
      setRunningTime2(0);
    }
  }, [isPaused2]);

  return (
    <Layout {...routeView}>
      <div style={{ display: 'flex' }}>
        <ItemCard title="今日送料出量" content="送料总量（今日）" number={total} icon={Icon.TotalPic}></ItemCard>
        <ItemCard
          style={{ marginRight: 0 }}
          title="今日精煤出量"
          content="精煤出量（今日）"
          number={cleanCoal}
          icon={Icon.CleanCoalPic}></ItemCard>
        {/* <ItemCard title="今日中煤出量" content="中煤出量（今日）" number={midCoal} icon={midCoalPic}></ItemCard>
        <ItemCard
          title="今日矸石出量"
          content="矸石出量（今日）"
          style={{ marginRight: 0 }}
          number={gangue}
          icon={ganguePic}></ItemCard> */}
      </div>
      <Content style={{ marginTop: 16 }}>
        <section>
          <div style={{ display: 'flex', paddingRight: 80 }}>
            <div
              style={{
                height: 32,
                minWidth: 56,
                color: '#4A4A5A',
                border: '1px solid #F6F7F9',
                fontSize: 16,
                lineHeight: '30px',
                textAlign: 'center',
                position: 'relative',
                top: 92,
                marginLeft: '16px',
                backgroundColor: '#F6F7F9',
                borderRadius: 2,
              }}>
              送 煤
            </div>
            <div>
              <img
                src={Image.GrewArr}
                style={{
                  height: 38,
                  width: 92,
                  position: 'relative',
                  top: 89,
                  margin: '0 32px',
                }}
              />
            </div>
            <div style={{ display: 'flex', width: 384 }}>
              <div style={{ flex: 1 }}>
                <div style={{ height: 216, width: 384, position: 'relative', fontSize: 14 }}>
                  <img
                    style={{ height: 216, width: 384, backgroundColor: '#f6f7f9' }}
                    src={isPaused ? Image.ChuanSongStatic : Image.ChuanSongOldGif}
                  />
                </div>
                <div style={{ marginTop: 16 }}>
                  <span>设备工作状态</span>
                  <span style={{ marginLeft: 24, color: isPaused ? 'red' : '#3d86ef' }}>
                    {isPaused ? '已关闭' : '正常'}
                  </span>
                </div>
                <div style={{ marginTop: 16 }}>
                  <span>设备运行时间</span>
                  <span style={{ marginLeft: 24 }}>{getRunningTime()}</span>
                </div>
                <div style={{ width: '100%', height: 332, border: '1px solid #d8d8d8', padding: 16, marginTop: 24 }}>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>皮带秤</div>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: 16 }}>
                    <span style={{ marginRight: 24 }}>运行状态</span>
                    <span style={isPaused ? { color: 'red' } : { color: '#66BD7E' }}>
                      {isPaused ? '已停止' : '运行中'}
                    </span>
                    <Button
                      type="primary"
                      style={{ marginLeft: 32 }}
                      onClick={() => {
                        const arr = [];
                        if (isPaused) {
                          Modal.confirm({
                            icon: <QuestionCircleFilled />,
                            title: '确认运行吗？',
                            onOk: async () => {
                              setIsPaused(false);
                              if (conveyorSpeed != conveyorSpeedBefore) {
                                arr.push({
                                  deviceName: '皮带秤',
                                  changeTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                                  changeWay: '手动调整',
                                  changeArg: ['皮带速度', conveyorSpeedBefore, conveyorSpeed],
                                  hasSheet: '否',
                                  sheetId: '',
                                  remark: '',
                                });
                              }
                              arr.push({
                                deviceName: '皮带秤',
                                changeTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                                changeWay: '手动调整',
                                changeArg: ['运行状态', '关闭', '开启'],
                                hasSheet: '否',
                                sheetId: '',
                                remark: '',
                              });
                              setDataList([...arr, ...dataList]);
                            },
                            okText: '确认',
                            cancelText: '取消',
                          });
                        } else {
                          Modal.confirm({
                            icon: <QuestionCircleFilled />,
                            title: '确认停止运行吗？',
                            onOk: async () => {
                              setIsPaused(true);
                              setDataList([
                                {
                                  deviceName: '皮带秤',
                                  changeTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                                  changeWay: '手动调整',
                                  changeArg: ['运行状态', '开启', '关闭'],
                                  hasSheet: '否',
                                  sheetId: '',
                                  remark: '',
                                },
                                ...dataList,
                              ]);
                            },
                            okText: '确认',
                            cancelText: '取消',
                          });
                        }
                      }}>
                      {isPaused ? '开始' : '停止'}
                    </Button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: 24 }}>
                    <span>皮带速度</span>
                    <span
                      onClick={() => {
                        if (conveyorSpeed <= 1) {
                          setConveyorSpeed(1);
                        } else {
                          setConveyorSpeed(conveyorSpeed - 1);
                        }
                      }}
                      style={{
                        marginLeft: 24,
                        marginRight: 9,
                        display: 'inline-block',
                        fontSize: 14,
                        height: 14,
                        width: 14,
                        border: '1px solid #4a4a5a',
                        lineHeight: '10px',
                        textAlign: 'center',
                        cursor: 'pointer',
                      }}>
                      -
                    </span>
                    <Input
                      value={conveyorSpeed}
                      onChange={e => {
                        let value = e.target.value.replace(/^(\-)*(\d+).*$/, '$1$2');
                        if (e.target.value <= 1) {
                          value = 1;
                        }
                        if (e.target.value >= 6) {
                          value = 6;
                        }
                        setConveyorSpeed(value);
                      }}
                      style={{ display: 'inline-block', width: 56, marginRight: 4 }}
                    />
                    m/s
                    <span
                      onClick={() => {
                        if (conveyorSpeed >= 6) {
                          setConveyorSpeed(6);
                        } else {
                          setConveyorSpeed(conveyorSpeed + 1);
                        }
                      }}
                      style={{
                        marginLeft: 9,
                        display: 'inline-block',
                        fontSize: 14,
                        height: 14,
                        width: 14,
                        border: '1px solid #4a4a5a',
                        lineHeight: '10px',
                        textAlign: 'center',
                        cursor: 'pointer',
                      }}>
                      +
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <img
                src={Image.GrewArr}
                style={{
                  height: 38,
                  width: 92,
                  position: 'relative',
                  top: 89,
                  margin: '0 32px',
                }}
              />
            </div>
            <div style={{ display: 'flex', width: 384 }}>
              <div style={{ flex: 1 }}>
                <div style={{ height: 216, width: 384, position: 'relative', fontSize: 12 }}>
                  <img
                    style={{ height: 216, width: 384, backgroundColor: '#f6f7f9' }}
                    src={isPaused2 ? Image.TiaoTaiStatic : Image.TiaoTaiOldGif}
                  />
                  <div style={{ position: 'absolute', right: 46, top: 38 }}>
                    <div style={{ display: 'flex', alignItems: 'center', height: 14 }}>
                      <img
                        style={{ height: 12, width: 12, marginRight: 8, position: 'relative', top: -1 }}
                        src={Image.JingMei}></img>
                      精煤
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 12, height: 14 }}>
                      <img
                        style={{ height: 12, width: 12, marginRight: 8, position: 'relative', top: -1 }}
                        src={Image.ZhongMei}></img>
                      中煤
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 12, height: 14 }}>
                      <img
                        style={{ height: 12, width: 12, marginRight: 8, position: 'relative', top: -1 }}
                        src={Image.GanShi}></img>
                      矸石
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <span>设备工作状态</span>
                  <span style={{ marginLeft: 24, color: isPaused2 ? 'red' : '#3d86ef' }}>
                    {isPaused2 ? '已关闭' : '正常'}
                  </span>
                </div>
                <div style={{ marginTop: 16 }}>
                  <span>设备运行时间</span>
                  <span style={{ marginLeft: 24 }}>{getRunningTime2()}</span>
                </div>
                <div style={{ width: '100%', height: 332, border: '1px solid #d8d8d8', padding: 16, marginTop: 24 }}>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>跳汰机</div>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: 16 }}>
                    <span style={{ marginRight: 24 }}>运行状态</span>
                    <span style={isPaused2 ? { color: 'red' } : { color: '#66BD7E' }}>
                      {isPaused2 ? '已停止' : '运行中'}
                    </span>
                    <Button
                      type="primary"
                      style={{ marginLeft: 32 }}
                      onClick={() => {
                        const arr = [];
                        if (isPaused2) {
                          Modal.confirm({
                            icon: <QuestionCircleFilled />,
                            title: '确认运行吗？',
                            onOk: async () => {
                              setIsPaused2(false);
                              if (bedThinkness1 != bedThinkness1Before) {
                                arr.push({
                                  deviceName: '跳汰机',
                                  changeTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                                  changeWay: '手动调整',
                                  changeArg: ['床层一', bedThinkness1Before, bedThinkness1],
                                  hasSheet: '否',
                                  sheetId: '',
                                  remark: '',
                                });
                              }
                              if (bedThinkness2 != bedThinkness2Before) {
                                arr.push({
                                  deviceName: '跳汰机',
                                  changeTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                                  changeWay: '手动调整',
                                  changeArg: ['床层二', bedThinkness2Before, bedThinkness2],
                                  hasSheet: '否',
                                  sheetId: '',
                                  remark: '',
                                });
                              }
                              if (bedThinkness != bedThinknessBefore) {
                                arr.push({
                                  deviceName: '跳汰机',
                                  changeTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                                  changeWay: '手动调整',
                                  changeArg: ['床层三', bedThinknessBefore, bedThinkness],
                                  hasSheet: '否',
                                  sheetId: '',
                                  remark: '',
                                });
                              }
                              arr.push({
                                deviceName: '跳汰机',
                                changeTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                                changeWay: '手动调整',
                                changeArg: ['运行状态', '关闭', '开启'],
                                hasSheet: '否',
                                sheetId: '',
                                remark: '',
                              });
                              setDataList([...arr, ...dataList]);
                            },
                            okText: '确认',
                            cancelText: '取消',
                          });
                          setDataList([...arr, ...dataList]);
                        } else {
                          Modal.confirm({
                            icon: <QuestionCircleFilled />,
                            title: '确认停止运行吗？',
                            onOk: async () => {
                              setIsPaused2(true);
                              setDataList([
                                {
                                  deviceName: '跳汰机',
                                  changeTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                                  changeWay: '手动调整',
                                  changeArg: ['运行状态', '开启', '关闭'],
                                  hasSheet: '否',
                                  sheetId: '',
                                  remark: '',
                                },
                                ...dataList,
                              ]);
                            },
                            okText: '确认',
                            cancelText: '取消',
                          });
                        }
                      }}>
                      {isPaused2 ? '开始' : '停止'}
                    </Button>
                  </div>
                  <div style={{ marginTop: 16 }}>第一段</div>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                    <span>床层厚度</span>
                    <span
                      onClick={() => {
                        if (bedThinkness1 <= 50) {
                          setBedThinkness1(50);
                        } else {
                          setBedThinkness1(bedThinkness1 * 1 - 1);
                        }
                      }}
                      style={{
                        marginLeft: 24,
                        marginRight: 9,
                        display: 'inline-block',
                        fontSize: 14,
                        height: 14,
                        width: 14,
                        border: '1px solid #4a4a5a',
                        lineHeight: '10px',
                        textAlign: 'center',
                        cursor: 'pointer',
                      }}>
                      -
                    </span>
                    <Input
                      value={bedThinkness1}
                      onChange={e => {
                        let value = e.target.value.replace(/^(\-)*(\d+).*$/, '$1$2');
                        if (e.target.value <= 50) {
                          value = 50;
                        }
                        if (e.target.value >= 150) {
                          value = 150;
                        }
                        setBedThinkness1(value);
                      }}
                      style={{ display: 'inline-block', width: 56, marginRight: 4 }}
                    />
                    mm
                    <span
                      onClick={() => {
                        if (bedThinkness1 >= 150) {
                          setBedThinkness1(150);
                        } else {
                          setBedThinkness1(bedThinkness1 * 1 + 1);
                        }
                      }}
                      style={{
                        marginLeft: 9,
                        display: 'inline-block',
                        fontSize: 14,
                        height: 14,
                        width: 14,
                        border: '1px solid #4a4a5a',
                        lineHeight: '10px',
                        textAlign: 'center',
                        cursor: 'pointer',
                      }}>
                      +
                    </span>
                    <span style={{ marginLeft: 24 }}>床层显示</span>
                    <span style={{ marginLeft: 8 }}>{bedThinkness1Show}</span>
                  </div>
                  <div style={{ marginTop: 16 }}>第二段</div>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                    <span>床层厚度</span>
                    <span
                      onClick={() => {
                        if (bedThinkness2 <= 50) {
                          setBedThinkness2(50);
                        } else {
                          setBedThinkness2(bedThinkness2 * 1 - 1);
                        }
                      }}
                      style={{
                        marginLeft: 24,
                        marginRight: 9,
                        display: 'inline-block',
                        fontSize: 14,
                        height: 14,
                        width: 14,
                        border: '1px solid #4a4a5a',
                        lineHeight: '10px',
                        textAlign: 'center',
                        cursor: 'pointer',
                      }}>
                      -
                    </span>
                    <Input
                      value={bedThinkness2}
                      onChange={e => {
                        let value = e.target.value.replace(/^(\-)*(\d+).*$/, '$1$2');
                        if (e.target.value <= 50) {
                          value = 50;
                        }
                        if (e.target.value >= 150) {
                          value = 150;
                        }
                        console.log(value);
                        setBedThinkness2(value);
                      }}
                      style={{ display: 'inline-block', width: 56, marginRight: 4 }}
                    />
                    mm
                    <span
                      onClick={() => {
                        if (bedThinkness2 >= 150) {
                          setBedThinkness2(150);
                        } else {
                          setBedThinkness2(bedThinkness2 * 1 + 1);
                        }
                      }}
                      style={{
                        marginLeft: 9,
                        display: 'inline-block',
                        fontSize: 14,
                        height: 14,
                        width: 14,
                        border: '1px solid #4a4a5a',
                        lineHeight: '10px',
                        textAlign: 'center',
                        cursor: 'pointer',
                      }}>
                      +
                    </span>{' '}
                    <span style={{ marginLeft: 24 }}>床层显示</span>
                    <span style={{ marginLeft: 8 }}>{bedThinkness2Show}</span>
                  </div>
                  <div style={{ marginTop: 16 }}>第三段</div>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                    <span>床层厚度</span>
                    <span
                      onClick={() => {
                        if (bedThinkness <= 50) {
                          setBedThinkness(50);
                        } else {
                          setBedThinkness(bedThinkness * 1 - 1);
                        }
                      }}
                      style={{
                        marginLeft: 24,
                        marginRight: 9,
                        display: 'inline-block',
                        fontSize: 14,
                        height: 14,
                        width: 14,
                        border: '1px solid #4a4a5a',
                        lineHeight: '10px',
                        textAlign: 'center',
                        cursor: 'pointer',
                      }}>
                      -
                    </span>
                    <Input
                      value={bedThinkness}
                      onChange={e => {
                        let value = e.target.value.replace(/^(\-)*(\d+).*$/, '$1$2');
                        if (e.target.value <= 150) {
                          value = 150;
                        }
                        if (e.target.value >= 250) {
                          value = 250;
                        }
                        setBedThinkness(value);
                      }}
                      style={{ display: 'inline-block', width: 56, marginRight: 4 }}
                    />
                    mm
                    <span
                      onClick={() => {
                        if (bedThinkness >= 250) {
                          setBedThinkness(250);
                        } else {
                          setBedThinkness(bedThinkness * 1 + 1);
                        }
                      }}
                      style={{
                        marginLeft: 9,
                        display: 'inline-block',
                        fontSize: 14,
                        height: 14,
                        width: 14,
                        border: '1px solid #4a4a5a',
                        lineHeight: '10px',
                        textAlign: 'center',
                        cursor: 'pointer',
                      }}>
                      +
                    </span>
                    <span style={{ marginLeft: 24 }}>床层显示</span>
                    <span style={{ marginLeft: 8 }}>{bedThinknessShow}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <ChildTitle style={{ marginLeft: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>设备动态记录</div>
        </ChildTitle>

        <section>
          <Table loading={loading} dataSource={dataList} columns={columns} scroll={{ x: 'auto' }} />
        </section>
      </Content>
    </Layout>
  );
};

export default Index;
