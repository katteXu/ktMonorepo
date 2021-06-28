import { Layout, Content, ChildTitle } from '@components';
import { useState, useCallback, useEffect } from 'react';
import { Steps } from '@components/Station';
import { Input, Button, Select, Table, Popconfirm, message, Modal } from 'antd';
import { station } from '@api';
import styles from './index.less';
import TruckInfo from '@components/StationManagement/truckInfo.js';
import RouteInfo from '@components/StationManagement/routeInfo.js';
import TruckerInfo from '@components/StationManagement/truckerInfo.js';
import { QuestionCircleFilled } from '@ant-design/icons';
import router from 'next/router';
import PrintFrom from '@components/StationManagement/printFrom.js';
import PoundBox from '@components/StationManagement/poundBox';
const express = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Za-z]{1}[A-Za-z]{1}[警京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼]{0,1}[A-Za-z0-9]{4}[A-Za-z0-9挂学警港澳]{1}$/;

const Index = () => {
  const routeView = {
    title: '站内管理',
    pageKey: 'stationManagement',
    longKey: 'stationManagement',
    breadNav: '站内管理.发货进站',
    pageTitle: '发货进站',
    useBack: true,
  };
  const [poundMachineList, setPoundMachineList] = useState([]);
  const [truckInfo, setTruckInfo] = useState();
  const [routeInfo, setRouteInfo] = useState();
  const [truckerInfo, setTruckerInfo] = useState();
  const [remark, setRemark] = useState('');
  const [weight, setWeight] = useState();
  const [showPrint, setShowPrint] = useState(false);
  const [handlingSwitch, setHandlingSwitch] = useState(false);
  const [allParams, setAllParams] = useState({});
  const [poundWeight, setPoundWeight] = useState(0);
  const [plateNum, setPlateNum] = useState();
  useEffect(() => {
    poundMachine_list();
    getPrint();
  }, []);
  //获取磅机列表
  const poundMachine_list = async () => {
    const res = await station.pound_machine_list();
    if (res.status === 0) {
      setPoundMachineList(res.result);
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };

  //获取是否开启装卸车状态
  const getPrint = async () => {
    const res = await station.getHandlingAndEraserZeroSwitch();
    if (res.status === 0) {
      setHandlingSwitch(res.result.handlingSwitch);
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };
  // 取皮重
  const takeTareWeight = () => {
    setWeight(poundWeight);
  };

  const newUploadInOneonClick = async () => {
    if (!express.test(plateNum)) {
      message.error('请输入正确的车牌号');
      return;
    }
    if (!truckInfo) {
      message.error('请先填写车辆信息');
      return;
    }
    if (!routeInfo) {
      message.error('请先选择专线信息');
      return;
    }
    const {
      truckId,
      truckType,
      truckLoad,
      trailerPlateNumber,
      truckLicenseNumber,
      shaftNumber,
      roadNumber,
      establishmentName,
    } = truckInfo;
    const { id } = routeInfo;

    const params = {
      truckId,
      truckType,
      receiveOrSend: '0',
      truckLoad,
      businessName: establishmentName,
      weight: weight ? weight * 1000 : poundWeight * 1000,

      remark,
      shaftNumber,
      plateNum: trailerPlateNumber,

      truckLicenseNumber,

      routeId: id,

      roadNumber,

      receiveDriverName: truckerInfo && truckerInfo.name,
      driverNumber: truckerInfo && truckerInfo.driverNumber,
      userId: truckerInfo && truckerInfo.userId,
      qualificationNumber: truckerInfo && truckerInfo.qualificationNumber,
      mobile: truckerInfo ? truckerInfo.mobile : '',
    };
    if (10 <= weight * 1 <= 20) {
      showConfirm(params);
    } else {
      Modal.confirm({
        icon: <QuestionCircleFilled />,
        title: '进站取值重量异常，请检查',
        content: '合理范围：10吨~20吨',
        onOk: async () => {
          showConfirm(params);
        },
      });
    }
  };

  const showConfirm = async params => {
    if (handlingSwitch) {
      setAllParams(params);
      setShowPrint(true);
    } else {
      const res = await station.newUploadInOne({ params });
      if (res.status === 0) {
        message.success('进站成功');
        router.push('/stationManagement');
      } else {
        message.error(`${res.detail || res.description}`);
      }
    }
  };

  const handleOk = async valuse => {
    const params = {
      ...allParams,
      ...valuse,
      price: valuse.price * 100,
    };

    const res = await station.newUploadInOne({ params });
    if (res.status === 0) {
      setShowPrint(false);
      message.success('进站成功');
      router.push('/stationManagement');
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };
  // 磅机重量变更
  const handleChangeWeight = weight => {
    setPoundWeight(weight);
  };

  const onChangeWeight = e => {
    const { value } = e.target;
    let val;
    val = value.replace(/^(-)*(\d+)\.(\d{1,2}).*$/, '$1$2.$3');
    if (val > 100) {
      return;
    }
    setWeight(val);
  };

  return (
    <Layout {...routeView}>
      {/* <Steps /> */}
      <Content>
        <section style={{ paddingBottom: 50 }}>
          <div className={styles.top}>
            <PoundBox onChange={handleChangeWeight} style={{ marginLeft: 10 }} />
          </div>
          <div>
            <ChildTitle style={{ margin: '24px 0 16px', fontWeight: 'bold' }}>重量信息</ChildTitle>
            <div className={styles.block1}>
              <span className={styles.lableText}>皮重:</span>
              <Input
                placeholder="请输入皮重"
                addonAfter="吨"
                style={{ width: 264 }}
                value={weight}
                onChange={onChangeWeight}
              />
              <span onClick={takeTareWeight} className={styles.take}>
                 取皮重
              </span>
            </div>
          </div>
          <TruckInfo onsubmit={val => setTruckInfo(val)} handleChangePlateNum={val => setPlateNum(val)} />
          <RouteInfo onsubmit={val => setRouteInfo(val)} />
          <TruckerInfo truckInfo={truckInfo} routeInfo={routeInfo} onsubmit={val => setTruckerInfo(val)} type="" />
          <div className={styles.block1} style={{ marginTop: 32, marginBottom: 32 }}>
            <span className={styles.lableText}>备注:</span>
            <Input placeholder="请输入备注" style={{ width: 264 }} onChange={e => setRemark(e.target.value)} />
          </div>
          <Button type="primary" style={{ width: 264, marginLeft: 120 }} onClick={newUploadInOneonClick}>
            进站
          </Button>
        </section>
      </Content>
      <Modal title="装车单打印" footer={null} visible={showPrint} onCancel={() => setShowPrint(false)} footer={null}>
        <PrintFrom onSubmit={handleOk} close={() => setShowPrint(false)} />
      </Modal>
    </Layout>
  );
};
export default Index;
