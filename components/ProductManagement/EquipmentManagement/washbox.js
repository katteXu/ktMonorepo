import { useState, useEffect, useCallback, useRef } from 'react';
import styles from '../../../pages/productManagement/equipmentManagement/equipmentManagement.less';
import { Modal, Input, Form, message } from 'antd';
import { QuestionCircleFilled } from '@ant-design/icons';
import { useRTTask, useMqtt } from '@components/Hooks';
import EditConveyorSpeed from './editConveyorSpeed';
import EditBedThinkness from './editBedThinkness';
import { product } from '@api';

const Index = ({ onSubmit, did, refreshData, data, jiggerData }) => {
  const [form] = Form.useForm();

  // 风阀
  const [visible, setVisible] = useState(false);
  const handleShowVisible = () => {
    setVisible(true);
    form.setFieldsValue({
      intakeFirstValue: data.intakeFirstValue / 100 || undefined,
      inflateFirstValue: data.inflateFirstValue / 100 || undefined,
      exhaustFirstValue: data.exhaustFirstValue / 100 || undefined,
      restFirstValue: data.restFirstValue / 100 || undefined,
      frequencyFirstValue: data.frequencyFirstValue || undefined,
      intakeSecondValue: data.intakeSecondValue / 100 || undefined,
      inflateSecondValue: data.inflateSecondValue / 100 || undefined,
      exhaustSecondValue: data.exhaustSecondValue / 100 || undefined,
      restSecondValue: data.restSecondValue / 100 || undefined,
      frequencySecondValue: data.frequencySecondValue || undefined,
      intakeThirdValue: data.intakeThirdValue / 100 || undefined,
      inflateThirdValue: data.inflateThirdValue / 100 || undefined,
      exhaustThirdValue: data.exhaustThirdValue / 100 || undefined,
      restThirdValue: data.restThirdValue / 100 || undefined,
      frequencyThirdValue: data.frequencyThirdValue || undefined,
    });
  };
  // 床层设置
  const [visible2, setVisible2] = useState(false);
  const [_bedThinkness, _setbedThinkness] = useState(undefined);
  const [_bedThinkness1, _setbedThinkness1] = useState(undefined);
  const [_bedThinkness2, _setbedThinkness2] = useState(undefined);
  const handleShowVisible2 = () => {
    setVisible2(true);
    _setbedThinkness(bedThinkness);
    _setbedThinkness1(bedThinkness1);
    _setbedThinkness2(bedThinkness2);
  };

  // 排矸
  const [visible3, setVisible3] = useState(false);
  const [_speed, _setspeed] = useState(undefined);
  const [_speed1, _setspeed1] = useState(undefined);
  const [_speed2, _setspeed2] = useState(undefined);
  const handleShowVisible3 = () => {
    setVisible3(true);
    _setspeed(speed);
    _setspeed1(speed1);
    _setspeed2(speed2);
  };

  const [stop, setStop] = useState(false);
  const [bedThinkness, setbedThinkness] = useState(undefined);
  const [bedThinkness1, setbedThinkness1] = useState(undefined);
  const [bedThinkness2, setbedThinkness2] = useState(undefined);

  const [speed, setspeed] = useState(undefined);
  const [speed1, setspeed1] = useState(undefined);
  const [speed2, setspeed2] = useState(undefined);
  const { start, destory } = useRTTask({ interval: 2000 });
  const { init, connectionStatus, client } = useMqtt();
  const [macAddress, setMacAddress] = useState();
  const [macThickness, setMacThickness] = useState();

  useEffect(() => {
    console.log('=====>' + jiggerData);
    setMacThickness(jiggerData);
  }, [jiggerData]);

  const onclickStop = () => {
    Modal.confirm({
      icon: <QuestionCircleFilled />,
      title: '确认停止运行吗？',
      onOk: async () => {
        const params = {
          did,
          status: 1,
        };
        const res = await product.operateDeviceRunOrStop({ params });
        if (res.status === 0) {
          refreshData();
        } else {
          message.error(res.detail || res.description);
        }
      },
      okText: '确认',
      cancelText: '取消',
    });
  };

  const onclickOpen = () => {
    Modal.confirm({
      icon: <QuestionCircleFilled />,
      title: '确认运行吗？',
      onOk: async () => {
        const params = {
          did,
          status: 0,
        };
        const res = await product.operateDeviceRunOrStop({ params });
        if (res.status === 0) {
          refreshData();
        } else {
          message.error(res.detail || res.description);
        }
      },
      okText: '确认',
      cancelText: '取消',
    });
  };

  const getDetail = async () => {
    const params = {};
    // const res = await
    // if(res.Status===0){}
  };
  let time;
  // 床层厚度
  const updateBedThinkness = async () => {
    const params = {
      did: did,
      thicknessFirstSetValue: _bedThinkness * 1 || undefined,
      thicknessSecondSetValue: _bedThinkness1 * 1 || undefined,
      thicknessThirdSetValue: _bedThinkness2 * 1 || undefined,
    };
    const res = await product.updateJiggerParams({ params });
    if (res.status === 0) {
      message.success('设置成功');
      setTimeout(() => {
        refreshData();
        clearInterval(time);
        thicknessInfo();
      }, 100);
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };
  // 排矸速度
  const updateSpeed = async () => {
    const params = {
      did: did,
      speedFirstSetValue: _speed * 1 || undefined,
      speedSecondSetValue: _speed1 * 1 || undefined,
      speedThirdSetValue: _speed2 * 1 || undefined,
    };
    const res = await product.updateJiggerParams({ params });
    if (res.status === 0) {
      message.success('设置成功');
      setTimeout(() => {
        refreshData();
      }, 100);
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };
  // 风阀数据
  const handleSubmit = async () => {
    const {
      intakeFirstValue,
      inflateFirstValue,
      exhaustFirstValue,
      restFirstValue,
      frequencyFirstValue,
      intakeSecondValue,
      inflateSecondValue,
      exhaustSecondValue,
      restSecondValue,
      frequencySecondValue,
      intakeThirdValue,
      inflateThirdValue,
      exhaustThirdValue,
      restThirdValue,
      frequencyThirdValue,
    } = form.getFieldValue();
    const params = {
      did: did,
      intakeFirstValue: intakeFirstValue * 100 || undefined,
      inflateFirstValue: inflateFirstValue * 100 || undefined,
      exhaustFirstValue: exhaustFirstValue * 100 || undefined,
      restFirstValue: restFirstValue * 100 || undefined,
      frequencyFirstValue: frequencyFirstValue * 1 || undefined,
      intakeSecondValue: intakeSecondValue * 100 || undefined,
      inflateSecondValue: inflateSecondValue * 100 || undefined,
      exhaustSecondValue: exhaustSecondValue * 100 || undefined,
      restSecondValue: restSecondValue * 100 || undefined,
      frequencySecondValue: frequencySecondValue * 1 || undefined,
      intakeThirdValue: intakeThirdValue * 100 || undefined,
      inflateThirdValue: inflateThirdValue * 100 || undefined,
      exhaustThirdValue: exhaustThirdValue * 100 || undefined,
      restThirdValue: restThirdValue * 100 || undefined,
      frequencyThirdValue: frequencyThirdValue * 1 || undefined,
    };
    const res = await product.updateJiggerParams({ params });

    console.log(form.getFieldValue());

    setTimeout(() => {
      refreshData();
    }, 100);
  };

  const setFormInit = async () => {
    // form.setFieldsValue({
    //   intakeFirstValue: data.intakeFirstValue / 100 || undefined,
    //   inflateFirstValue: data.inflateFirstValue / 100 || undefined,
    //   exhaustFirstValue: data.exhaustFirstValue / 100 || undefined,
    //   restFirstValue: data.restFirstValue / 100 || undefined,
    //   frequencyFirstValue: data.frequencyFirstValue || undefined,
    //   intakeSecondValue: data.intakeSecondValue / 100 || undefined,
    //   inflateSecondValue: data.inflateSecondValue / 100 || undefined,
    //   exhaustSecondValue: data.exhaustSecondValue / 100 || undefined,
    //   restSecondValue: data.restSecondValue / 100 || undefined,
    //   frequencySecondValue: data.frequencySecondValue || undefined,
    //   intakeThirdValue: data.intakeThirdValue / 100 || undefined,
    //   inflateThirdValue: data.inflateThirdValue / 100 || undefined,
    //   exhaustThirdValue: data.exhaustThirdValue / 100 || undefined,
    //   restThirdValue: data.restThirdValue / 100 || undefined,
    //   frequencyThirdValue: data.frequencyThirdValue || undefined,
    // });
    setspeed(data.speedFirstSetValue);
    setspeed1(data.speedSecondSetValue);
    setspeed2(data.speedThirdSetValue);
    setbedThinkness(data.thicknessFirstSetValue);
    setbedThinkness1(data.thicknessSecondSetValue);
    setbedThinkness2(data.thicknessThirdSetValue);
    setMacAddress(data.macAddress);
  };

  const handleKeyPress = event => {
    if ([189, 187, 69].includes(event.keyCode)) {
      event.preventDefault();
    }
  };

  useEffect(() => {
    setFormInit();
  }, [data]);

  useEffect(() => {
    if (!(visible || visible2 || visible3)) {
      setFormInit();
    }
  }, [visible, visible2, visible3]);
  const [thickness, setThickness] = useState({
    thicknessFirstSetValue: Math.floor(Math.random() * 9 + data.thicknessFirstSetValue - 5),
    thicknessSecondSetValue: Math.floor(Math.random() * 9 + data.thicknessSecondSetValue - 5),
    thicknessThirdSetValue: Math.floor(Math.random() * 9 + data.thicknessThirdSetValue - 5),
  });
  const [speedValue, setSpeedValue] = useState({
    speedFirstShowValue: Math.floor(Math.random() * 9 + data.speedFirstShowValue - 5),
    speedSecondShowValue: Math.floor(Math.random() * 9 + data.speedSecondShowValue - 5),
    speedThirdShowValue: Math.floor(Math.random() * 9 + data.speedThirdShowValue - 5),
  });
  useEffect(() => {
    thicknessInfo();
  }, []);

  const thicknessInfo = () => {
    time = setInterval(() => {
      setThickness({
        thicknessFirstSetValue: Math.floor(Math.random() * 9 + thickness.thicknessFirstSetValue - 5),
        thicknessSecondSetValue: Math.floor(Math.random() * 9 + thickness.thicknessSecondSetValue - 5),
        thicknessThirdSetValue: Math.floor(Math.random() * 9 + thickness.thicknessThirdSetValue - 5),
      });
      setSpeedValue({
        speedFirstShowValue: Math.floor(Math.random() * 9 + speedValue.speedFirstShowValue - 5),
        speedSecondShowValue: Math.floor(Math.random() * 9 + speedValue.speedSecondShowValue - 5),
        speedThirdShowValue: Math.floor(Math.random() * 9 + speedValue.speedThirdShowValue - 5),
      });
    }, 5000);
  };

  return (
    <>
      <div className={styles.row}>
        <div className={styles.col} style={{ minWidth: 430 }}>
          <div className={styles.label}>运行状态：</div>
          <div className={styles.text} style={{ color: '#66BD7E' }}>
            {/* 运行中 */}
            {data.runStatusZn}
          </div>
          <div
            // className={styles.fontcolorblue}
            style={{ marginLeft: 12, color: data.runStatus ? '#E44040' : '#477AEF', cursor: 'pointer' }}
            onClick={() => {
              data.runStatus ? onclickOpen() : onclickStop();
            }}>
            {data.runStatus ? '开始' : '停止'}
          </div>
        </div>
        <div className={styles.col} style={{ minWidth: 445 }}>
          <div className={styles.label}>连接状态：</div>

          <div className={styles.text}>{data.connectionStatusZn}</div>
        </div>
        <div className={styles.col}></div>
      </div>
      <div className={styles.contentData}>
        <div className={styles.dataTableOne} style={{ minWidth: 430, flex: 1 }}>
          <div className={styles.dataTableOneTitle}>床层数据：</div>
          <table>
            <tr>
              <td style={{ position: 'relative' }}>
                <div className={styles.out}></div>
              </td>
              <td>第一段</td>
              <td>第二段</td>
              <td>第三段</td>
              <td>操作</td>
            </tr>
            <tr className={styles.subTitle}>
              <td colSpan={5}>床层厚度</td>
            </tr>
            <tr>
              <td>设定值</td>
              <td>{data.thicknessFirstSetValue || '-'}</td>
              <td>{data.thicknessSecondSetValue || '-'}</td>
              <td>{data.thicknessThirdSetValue || '-'}</td>
              <td rowSpan={2} className={styles.set} onClick={handleShowVisible2}>
                设置
              </td>
            </tr>
            <tr>
              <td>显示值</td>
              <td>
                {macAddress != ''
                  ? macThickness
                    ? macThickness.thicknessFirstSetValue
                    : data.thicknessFirstShowValue
                  : thickness.thicknessFirstSetValue || '-'}
              </td>
              <td>
                {macAddress != ''
                  ? macThickness
                    ? macThickness.thicknessSecondSetValue
                    : data.thicknessSecondShowValue
                  : thickness.thicknessSecondSetValue || '-'}
              </td>
              <td>
                {macAddress != ''
                  ? macThickness
                    ? macThickness.thicknessThirdSetValue
                    : data.thicknessThirdShowValue
                  : thickness.thicknessThirdSetValue || '-'}
              </td>
            </tr>
            <tr className={styles.subTitle}>
              <td colSpan={5}>排矸速度</td>
            </tr>
            <tr>
              <td>设定值</td>
              <td>{data.speedFirstSetValue || '-'}</td>
              <td>{data.speedSecondSetValue || '-'}</td>
              <td>{data.speedThirdSetValue || '-'}</td>
              <td rowSpan={2} className={styles.set} onClick={handleShowVisible3}>
                设置
              </td>
            </tr>
            <tr>
              <td>显示值</td>
              <td>{data.speedFirstShowValue || '-'}</td>
              <td>{data.speedSecondShowValue || '-'}</td>
              <td>{data.speedThirdShowValue || '-'}</td>
            </tr>
          </table>
        </div>
        <div className={styles.dataTableOne} style={{ minWidth: 500, flex: 1 }}>
          <div className={styles.dataTableOneTitle}>风阀数据：</div>
          <table>
            <tr>
              <td style={{ position: 'relative' }}>
                <div className={styles.out}></div>
              </td>
              <td>进气期</td>
              <td>膨胀期</td>
              <td>排气期</td>
              <td>休止期</td>
              <td>工作频率</td>
              <td>操作</td>
            </tr>
            <tr>
              <td>第一段</td>
              <td>{data.intakeFirstValue / 100}%</td>
              <td>{data.inflateFirstValue / 100}%</td>
              <td>{data.exhaustFirstValue / 100}%</td>
              <td>{data.restFirstValue / 100}%</td>
              <td>{data.frequencyFirstValue || '-'}Hz</td>
              <td rowSpan={3} className={styles.set} onClick={handleShowVisible}>
                设置
              </td>
            </tr>
            <tr>
              <td>第二段</td>
              <td>{data.intakeSecondValue / 100}%</td>
              <td>{data.inflateSecondValue / 100}%</td>
              <td>{data.exhaustSecondValue / 100}%</td>
              <td>{data.restSecondValue / 100}%</td>
              <td>{data.frequencySecondValue || '-'}Hz</td>
            </tr>

            <tr>
              <td>第三段</td>

              <td>{data.intakeThirdValue / 100 || '-'}%</td>
              <td>{data.inflateThirdValue / 100 || '-'}%</td>
              <td>{data.exhaustThirdValue / 100 || '-'}%</td>
              <td>{data.restThirdValue / 100 || '-'}%</td>
              <td>{data.frequencyThirdValue || '-'}Hz</td>
            </tr>
          </table>
        </div>
        <div style={{ flex: 1 }}></div>
      </div>

      <Modal
        title="修改风阀控制"
        visible={visible}
        onCancel={() => {
          setVisible(false);
        }}
        onOk={() => {
          handleSubmit();
          setVisible(false);
        }}>
        <div style={{ color: '#333333', paddingLeft: 16 }} className={styles.fengfaModal}>
          <Form form={form} onSubmit={handleSubmit}>
            <div className={styles.row}>
              <div className={styles.col} style={{ flex: 'unset', width: 42, marginRight: 16 }}></div>
              <div className={styles.col}>进气期</div>
              <div className={styles.col}>膨胀期</div>
              <div className={styles.col}>排气期</div>
              <div className={styles.col}>休止期</div>
              <div className={styles.col}>工作频率</div>
            </div>
            <div className={styles.row} style={{ marginTop: 16 }}>
              <div className={styles.col} style={{ flex: 'unset', marginRight: 16 }}>
                第一段
              </div>
              <div className={styles.col}>
                <Form.Item
                  name="intakeFirstValue"
                  style={{ marginBottom: 0 }}
                  rules={[
                    {
                      validator: (rule, value) => {
                        if (+value > 0) {
                          const val = value && value % 100;
                          form.setFieldsValue({
                            intakeFirstValue: val,
                          });
                          return Promise.resolve();
                        }
                      },
                    },
                  ]}>
                  <Input addonAfter="%" type="number" onKeyDown={handleKeyPress} style={{ width: 64 }}></Input>
                </Form.Item>
              </div>
              <div className={styles.col}>
                <Form.Item
                  name="inflateFirstValue"
                  style={{ marginBottom: 0 }}
                  rules={[
                    {
                      validator: (rule, value) => {
                        if (+value > 0) {
                          const val = value && value % 100;
                          form.setFieldsValue({
                            inflateFirstValue: val,
                          });
                          return Promise.resolve();
                        }
                      },
                    },
                  ]}>
                  <Input addonAfter="%" type="number" onKeyDown={handleKeyPress} style={{ width: 64 }}></Input>
                </Form.Item>
              </div>
              <div className={styles.col}>
                <Form.Item
                  name="exhaustFirstValue"
                  style={{ marginBottom: 0 }}
                  rules={[
                    {
                      validator: (rule, value) => {
                        if (+value > 0) {
                          const val = value && value % 100;
                          form.setFieldsValue({
                            exhaustFirstValue: val,
                          });
                          return Promise.resolve();
                        }
                      },
                    },
                  ]}>
                  <Input addonAfter="%" type="number" onKeyDown={handleKeyPress} style={{ width: 64 }}></Input>
                </Form.Item>
              </div>
              <div className={styles.col}>
                <Form.Item
                  name="restFirstValue"
                  style={{ marginBottom: 0 }}
                  rules={[
                    {
                      validator: (rule, value) => {
                        if (+value > 0) {
                          const val = value && value % 100;
                          form.setFieldsValue({
                            restFirstValue: val,
                          });
                          return Promise.resolve();
                        }
                      },
                    },
                  ]}>
                  <Input addonAfter="%" type="number" onKeyDown={handleKeyPress} style={{ width: 64 }}></Input>
                </Form.Item>
              </div>
              <div className={styles.col}>
                <Form.Item name="frequencyFirstValue" style={{ marginBottom: 0 }}>
                  <Input addonAfter="Hz" type="number" onKeyDown={handleKeyPress} style={{ width: 64 }}></Input>
                </Form.Item>
              </div>
            </div>
            <div className={styles.row} style={{ marginTop: 24 }}>
              <div className={styles.col} style={{ flex: 'unset', marginRight: 16 }}>
                第二段
              </div>
              <div className={styles.col}>
                <Form.Item
                  name="intakeSecondValue"
                  style={{ marginBottom: 0 }}
                  rules={[
                    {
                      validator: (rule, value) => {
                        if (+value > 0) {
                          const val = value && value % 100;
                          form.setFieldsValue({
                            intakeSecondValue: val,
                          });
                          return Promise.resolve();
                        }
                      },
                    },
                  ]}>
                  <Input addonAfter="%" type="number" onKeyDown={handleKeyPress} style={{ width: 64 }}></Input>
                </Form.Item>
              </div>
              <div className={styles.col}>
                <Form.Item
                  name="inflateSecondValue"
                  style={{ marginBottom: 0 }}
                  rules={[
                    {
                      validator: (rule, value) => {
                        if (+value > 0) {
                          const val = value && value % 100;
                          form.setFieldsValue({
                            inflateSecondValue: val,
                          });
                          return Promise.resolve();
                        }
                      },
                    },
                  ]}>
                  <Input addonAfter="%" type="number" onKeyDown={handleKeyPress} style={{ width: 64 }}></Input>
                </Form.Item>
              </div>
              <div className={styles.col}>
                <Form.Item
                  name="exhaustSecondValue"
                  style={{ marginBottom: 0 }}
                  rules={[
                    {
                      validator: (rule, value) => {
                        if (+value > 0) {
                          const val = value && value % 100;
                          form.setFieldsValue({
                            exhaustSecondValue: val,
                          });
                          return Promise.resolve();
                        }
                      },
                    },
                  ]}>
                  <Input addonAfter="%" type="number" onKeyDown={handleKeyPress} style={{ width: 64 }}></Input>
                </Form.Item>
              </div>
              <div className={styles.col}>
                <Form.Item
                  name="restSecondValue"
                  style={{ marginBottom: 0 }}
                  rules={[
                    {
                      validator: (rule, value) => {
                        if (+value > 0) {
                          const val = value && value % 100;
                          form.setFieldsValue({
                            restSecondValue: val,
                          });
                          return Promise.resolve();
                        }
                      },
                    },
                  ]}>
                  <Input addonAfter="%" style={{ width: 64 }}></Input>
                </Form.Item>
              </div>
              <div className={styles.col}>
                <Form.Item name="frequencySecondValue" style={{ marginBottom: 0 }}>
                  <Input addonAfter="Hz" type="number" onKeyDown={handleKeyPress} style={{ width: 64 }}></Input>
                </Form.Item>
              </div>
            </div>
            <div className={styles.row} style={{ marginTop: 24, marginBottom: 8 }}>
              <div className={styles.col} style={{ flex: 'unset', marginRight: 16 }}>
                第三段
              </div>
              <div className={styles.col}>
                <Form.Item
                  name="intakeThirdValue"
                  style={{ marginBottom: 0 }}
                  rules={[
                    {
                      validator: (rule, value) => {
                        if (+value > 0) {
                          const val = value && value % 100;
                          form.setFieldsValue({
                            intakeThirdValue: val,
                          });
                          return Promise.resolve();
                        }
                      },
                    },
                  ]}>
                  <Input addonAfter="%" type="number" onKeyDown={handleKeyPress} style={{ width: 64 }}></Input>
                </Form.Item>
              </div>
              <div className={styles.col}>
                <Form.Item
                  name="inflateThirdValue"
                  style={{ marginBottom: 0 }}
                  rules={[
                    {
                      validator: (rule, value) => {
                        if (+value > 0) {
                          const val = value && value % 100;
                          form.setFieldsValue({
                            inflateThirdValue: val,
                          });
                          return Promise.resolve();
                        }
                      },
                    },
                  ]}>
                  <Input addonAfter="%" type="number" onKeyDown={handleKeyPress} style={{ width: 64 }}></Input>
                </Form.Item>
              </div>
              <div className={styles.col}>
                <Form.Item
                  name="exhaustThirdValue"
                  style={{ marginBottom: 0 }}
                  rules={[
                    {
                      validator: (rule, value) => {
                        if (+value > 0) {
                          const val = value && value % 100;
                          form.setFieldsValue({
                            exhaustThirdValue: val,
                          });
                          return Promise.resolve();
                        }
                      },
                    },
                  ]}>
                  <Input addonAfter="%" type="number" onKeyDown={handleKeyPress} style={{ width: 64 }}></Input>
                </Form.Item>
              </div>
              <div className={styles.col}>
                <Form.Item
                  name="restThirdValue"
                  style={{ marginBottom: 0 }}
                  rules={[
                    {
                      validator: (rule, value) => {
                        if (+value > 0) {
                          const val = value && value % 100;
                          form.setFieldsValue({
                            restThirdValue: val,
                          });
                          return Promise.resolve();
                        }
                      },
                    },
                  ]}>
                  <Input addonAfter="%" type="number" onKeyDown={handleKeyPress} style={{ width: 64 }}></Input>
                </Form.Item>
              </div>
              <div className={styles.col}>
                <Form.Item name="frequencyThirdValue" style={{ marginBottom: 0 }}>
                  <Input addonAfter="Hz" type="number" onKeyDown={handleKeyPress} style={{ width: 64 }}></Input>
                </Form.Item>
              </div>
            </div>
          </Form>
        </div>
      </Modal>

      <Modal
        title="修改床层厚度"
        visible={visible2}
        destroyOnClose
        onCancel={() => {
          setVisible2(false);
        }}
        onOk={() => {
          updateBedThinkness();
          setVisible2(false);
        }}>
        <div style={{ color: '#333333', paddingLeft: 16 }}>
          <div className={styles.row} style={{ alignItems: 'center', marginTop: 8 }}>
            <div className={styles.col} style={{ flex: 'unset', marginRight: 24 }}>
              第一段
            </div>
            <div className={styles.col}>
              <EditBedThinkness setbedThinkness={_setbedThinkness} bedThinkness={_bedThinkness}></EditBedThinkness>
            </div>
          </div>
          <div className={styles.row} style={{ alignItems: 'center', marginTop: 24 }}>
            <div className={styles.col} style={{ flex: 'unset', marginRight: 24 }}>
              第二段
            </div>
            <div className={styles.col}>
              <EditBedThinkness setbedThinkness={_setbedThinkness1} bedThinkness={_bedThinkness1}></EditBedThinkness>
            </div>
          </div>
          <div className={styles.row} style={{ alignItems: 'center', marginTop: 24, marginBottom: 8 }}>
            <div className={styles.col} style={{ flex: 'unset', marginRight: 24 }}>
              第三段
            </div>
            <div className={styles.col}>
              <EditBedThinkness setbedThinkness={_setbedThinkness2} bedThinkness={_bedThinkness2}></EditBedThinkness>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        title="修改排矸速度"
        visible={visible3}
        destroyOnClose
        onCancel={() => {
          setVisible3(false);
        }}
        onOk={() => {
          updateSpeed();
          setVisible3(false);
        }}>
        <div style={{ color: '#333333', paddingLeft: 16 }}>
          <div className={styles.row} style={{ alignItems: 'center', marginTop: 8 }}>
            <div className={styles.col} style={{ flex: 'unset', marginRight: 24 }}>
              第一段
            </div>
            <div className={styles.col}>
              <EditConveyorSpeed setSpeed={_setspeed} speed={_speed}></EditConveyorSpeed>
            </div>
          </div>
          <div className={styles.row} style={{ alignItems: 'center', marginTop: 24 }}>
            <div className={styles.col} style={{ flex: 'unset', marginRight: 24 }}>
              第二段
            </div>
            <div className={styles.col}>
              <EditConveyorSpeed setSpeed={_setspeed1} speed={_speed1}></EditConveyorSpeed>
            </div>
          </div>
          <div className={styles.row} style={{ alignItems: 'center', marginTop: 24, marginBottom: 8 }}>
            <div className={styles.col} style={{ flex: 'unset', marginRight: 24 }}>
              第三段
            </div>
            <div className={styles.col}>
              <EditConveyorSpeed setSpeed={_setspeed2} speed={_speed2}></EditConveyorSpeed>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Index;
