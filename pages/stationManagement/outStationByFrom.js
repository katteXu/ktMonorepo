import { Layout, Content, ChildTitle } from '@components';
import { useState, useCallback, useEffect ,useRef} from 'react';
import { Steps } from '@components/Station';
import { Input, Button, Select, Table, Popconfirm, message, Modal } from 'antd';
import { station } from '@api';
import styles from './index.less';
import TruckInfo from '@components/StationManagement/truckInfo.js';
import RouteInfo from '@components/StationManagement/routeInfo.js';
import TruckerInfo from '@components/StationManagement/truckerInfo.js';
import Abnormal from '@components/StationManagement/abnormal.js';
import ConfirmModal from '@components/StationManagement/confirmModal';
import router from 'next/router';
import PoundBox from '@components/StationManagement/poundBox';
import { getQuery } from '@utils/common';
const express = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Za-z]{1}[A-Za-z]{1}[警京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼]{0,1}[A-Za-z0-9]{4}[A-Za-z0-9挂学警港澳]{1}$/;

const Index = () => {
  const routeView = {
    title: '站内管理',
    pageKey: 'stationManagement',
    longKey: 'stationManagement',
    breadNav: '站内管理.发货出站',
    pageTitle: '发货出站',
    useBack: true,
  };
  const [poundMachineList, setPoundMachineList] = useState([]);
  const [truckInfo, setTruckInfo] = useState({});
  const [routeInfo, setRouteInfo] = useState({});
  const [truckerInfo, setTruckerInfo] = useState({});
  const [remark, setRemark] = useState('');
  const [weight, setWeight] = useState(0);
  const [showPrint, setShowPrint] = useState(false);
  const [handlingSwitch, setHandlingSwitch] = useState(false);
  const [allParams, setAllParams] = useState({});

  const [dataInfo, setDataInfo] = useState({});
  const [fromTotalWeight, setFromTotalWeight] = useState();
  const [fromGoodsWeight, setFromGoodsWeight] = useState(0);
  const [fromCarWeight, setFromCarWeight] = useState(0);
  const [showAbnormal, setShowAbnormal] = useState(false);
  const [allWeught, setAllWeught] = useState({});

  const [plateNum, setPlateNum] = useState();
  const [driverInfo, setDriverInfo] = useState({});
  const [routeId, setRouteId] = useState();
  const [showModal, setModal] = useState(false);
  const [confirmInfo, setConfirmInfo] = useState();
  const [goodsWeight, setGoodsWeight] = useState(0);
  const { id } = getQuery();
  const poundBoxRef = useRef();
  const [boxId, setBoxId] = useState();
  useEffect(() => {
    poundMachine_list();
    getDetailInfo();
    let isConnect = sessionStorage.getItem('isConnect') || '{}';
    setBoxId(JSON.parse(isConnect).id);
  }, []);

  //获取详情
  const getDetailInfo = async () => {
    const params = { id };
    const res = await station.outStationDetail({ params });
    if (res.status === 0) {
      setDataInfo(res.result.weigh);
      setRouteInfo({
        id: res.result.weigh.routeId,
        fromCompany: res.result.weigh.route.fromAddress.companyName,
        toCompany: res.result.weigh.route.toAddress.companyName,
        goodsType: res.result.weigh.route.goodsType,
      });
      setTruckerInfo({
        status: res.result.weigh.trucker.status,
        driverNumber: res.result.weigh.trucker.driverLicenseNumber,
        mobile: res.result.weigh.trucker.mobilePhoneNumber,
        name: res.result.weigh.trucker.name,
        qualificationNumber: res.result.weigh.trucker.qualificationNumber,
      });
      setTruckInfo(res.result.weigh.driverTruck);
      setFromCarWeight((res.result.weigh.weight / 1000).toFixed(2));
      setRemark(res.result.remark);
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };
  //获取磅机列表
  const poundMachine_list = async () => {
    const res = await station.pound_machine_list();
    if (res.status === 0) {
      setPoundMachineList(res.result);
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };
  //毛重
  const onChangeFromTotalWeight = e => {
    const { value } = e.target;
    let val;
    val = value.replace(/^(-)*(\d+)\.(\d{1,2}).*$/, '$1$2.$3');
    if (val > 100) {
      return;
    }
    setFromTotalWeight(val);
  };
  //皮重
  const onChangeFromGoodsWeight = e => {
    const { value } = e.target;
    let val;
    val = value.replace(/^(-)*(\d+)\.(\d{1,2}).*$/, '$1$2.$3');
    if (val > 100) {
      return;
    }
    setFromGoodsWeight(val);
  };

  const onChangeFromCarWeight = e => {
    const { value } = e.target;
    let val;
    val = value.replace(/^(-)*(\d+)\.(\d{1,2}).*$/, '$1$2.$3');
    if (val > 100) {
      return;
    }
    setFromCarWeight(val);
  };

  useEffect(() => {
    if (fromCarWeight) {
      const car = fromTotalWeight - fromCarWeight;
      setFromGoodsWeight(car > 0 ? car.toFixed(2) : '');
    }
  }, [fromTotalWeight, fromCarWeight]);

  useEffect(() => {
    if (fromCarWeight) {
      const car = weight - fromCarWeight;
      setGoodsWeight(car > 0 ? car.toFixed(2) : '');
    }
  }, [weight, fromCarWeight]);
  // 取皮重
  const takeTareWeight = () => {
    setFromTotalWeight(weight);
  };

  const newUploadInOneonClick = async () => {
    if (!truckInfo) {
      message.error('请先填写车辆信息');
      return;
    }
    if (!routeInfo) {
      message.error('请先选择车辆信息');
      return;
    }

    if (validationInfo()) {
      setModal(true);
    }
  };

  const submitData = async () => {
    const params = {
      receiveOrSend: 0,
      inStationId: id,
      plateNum,
      remark,
      // fromGoodsWeight: fromGoodsWeight ? fromGoodsWeight * 1000 : 0,
      carWeight: fromCarWeight ? fromCarWeight * 1000 : 0,
      totalWeight: fromTotalWeight ? fromTotalWeight * 1000 : 0,
      ...driverInfo,
      weight: weight ? weight * 1000 : 0,
      routeId: routeInfo.id,
    };
    const res = await station.postOutStation({ params });
    if (res.status === 0) {
      setShowAbnormal(false);
      setModal(false);
      const pdfParams = {
        pid: res.result.pid,
        poundType: 1,
      };
      const resPdf = await poundBoxRef.current.initpdf(pdfParams);

      if (resPdf.status === 0) {
        const printPramas = resPdf.result;
        if (resPdf.result.printType === 3) {
          const PortPrint = await poundBoxRef.current.parallelPortPrint(printPramas);
          message.success('出站成功');
          router.push('/stationManagement');
        } else {
          const resprint = await poundBoxRef.current.print(printPramas);
          message.success('出站成功');
          router.push('/stationManagement');
        }
      } else {
        message.error(resPdf.description || '生成失败。请重试');
      }
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };

  //校验重量
  const validationInfo = () => {
    const totalWeight = fromTotalWeight ? fromTotalWeight : weight;
    const goodsWeightInfo = fromGoodsWeight ? fromGoodsWeight : goodsWeight;
    if (!express.test(plateNum)) {
      message.error('请输入正确的车牌号');
      return;
    } else if (totalWeight === 0) {
      warnInfo('当前毛重异常请检查');
      return;
    } else if (fromCarWeight === 0) {
      warnInfo('当前皮重异常请检查');
      return;
    } else if (goodsWeightInfo === 0 && goodsWeight === 0) {
      warnInfo('当前毛重/皮重异常请检查');
      return;
    } else if (totalWeight * 1 < fromCarWeight * 1) {
      warnInfo('当前毛重/皮重异常请检查');
      return;
    } else if (
      (25 > totalWeight || totalWeight > 50) &&
      (fromCarWeight < 10 || fromCarWeight > 20) &&
      (goodsWeightInfo < 10 || goodsWeightInfo > 40)
    ) {
      setAllWeught({
        totalWeight: totalWeight,
        goodsWeight: goodsWeightInfo,
        carWeight: fromCarWeight,
      });
      setShowAbnormal(true);
      return;
    } else if ((25 > totalWeight || totalWeight > 50) && (fromCarWeight < 10 || fromCarWeight > 20)) {
      setAllWeught({
        totalWeight: totalWeight,
        carWeight: fromCarWeight,
      });
      setShowAbnormal(true);
      return;
    } else if ((25 > totalWeight || totalWeight > 50) && (goodsWeightInfo < 10 || goodsWeightInfo > 40)) {
      setAllWeught({
        totalWeight: totalWeight,
        goodsWeight: goodsWeightInfo,
      });
      setShowAbnormal(true);
      return;
    } else if ((fromCarWeight < 10 || fromCarWeight > 20) && (goodsWeightInfo < 10 || goodsWeightInfo > 40)) {
      setAllWeught({
        goodsWeight: goodsWeightInfo,
        carWeight: fromCarWeight,
      });
      setShowAbnormal(true);
      return;
    } else if (25 > totalWeight || totalWeight > 50) {
      setAllWeught({
        totalWeight: totalWeight,
      });
      setShowAbnormal(true);
      return;
    } else if (goodsWeightInfo < 10 || goodsWeightInfo > 40) {
      setAllWeught({
        goodsWeight: goodsWeightInfo,
      });
      setShowAbnormal(true);
      return;
    } else if (fromCarWeight < 10 || fromCarWeight > 20) {
      setAllWeught({
        carWeight: fromCarWeight,
      });
      setShowAbnormal(true);
      return;
    } else {
      return true;
    }
  };

  const warnInfo = text => {
    Modal.warn({
      title: text,
      onOk() {},
    });
  };

  const handleChangeWeight = val => {
    setWeight(val);
  };
  //异常提醒确认
  const handleOkAbnormal = () => {
    setModal(true);
  };

  useEffect(() => {
    setConfirmInfo({
      plateNum,
      ...routeInfo,
      fromTotalWeight: fromTotalWeight * 1000,
      fromCarWeight: fromCarWeight * 1000,
      fromGoodsWeight: fromGoodsWeight * 1000,
    });
  }, [showModal]);
  return (
    <Layout {...routeView}>
      <Content>
        <section style={{ paddingBottom: 50 }}>
          <div className={styles.top}>
            <PoundBox onChange={handleChangeWeight} style={{ marginLeft: 10 }} ref={poundBoxRef} boxId={boxId} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ChildTitle style={{ margin: '24px 0 16px', fontWeight: 'bold' }}>重量信息</ChildTitle>
              <span onClick={takeTareWeight} className={styles.takeWeight}>
                 取毛重
              </span>
            </div>

            <div className={styles.block1}>
              <span className={styles.lableText}>毛重:</span>
              <Input
                placeholder="请输入毛重"
                addonAfter="吨"
                type="number"
                style={{ width: 264 }}
                value={fromTotalWeight}
                onChange={e => onChangeFromTotalWeight(e)}
              />
            </div>
            <div className={styles.block1}>
              <span className={styles.lableText}>皮重:</span>
              <Input
                placeholder="请输入皮重"
                addonAfter="吨"
                type="number"
                style={{ width: 264 }}
                value={fromCarWeight ? fromCarWeight : ''}
                onChange={e => onChangeFromCarWeight(e)}
              />
            </div>
            <div className={styles.block1}>
              <span className={styles.lableText}>净重:</span>
              <Input
                addonAfter="吨"
                type="number"
                style={{ width: 264 }}
                disabled
                value={fromGoodsWeight ? fromGoodsWeight : ''}
                onChange={e => onChangeFromGoodsWeight(e)}
              />
            </div>
          </div>
          <TruckInfo
            onsubmit={val => setTruckInfo(val)}
            truckData={truckInfo}
            handleChangePlateNum={val => setPlateNum(val)}
          />
          <RouteInfo
            onsubmit={val => setRouteInfo(val)}
            fromRouteData={routeInfo}
            routeId={dataInfo.routeId}
            type="detail"
          />
          <TruckerInfo
            truckInfo={truckInfo}
            routeInfo={routeInfo}
            onsubmit={val => setTruckerInfo(val)}
            fromTruckerData={truckerInfo}
            type="detail"
            handleChangeDriver={val => setDriverInfo(val)}
          />
          <div className={styles.block1} style={{ marginTop: 32, marginBottom: 32 }}>
            <span className={styles.lableText}>备注:</span>
            <Input
              placeholder="请输入备注"
              style={{ width: 264 }}
              onChange={e => setRemark(e.target.value)}
              value={remark}
            />
          </div>
          <Button type="primary" style={{ width: 264, marginLeft: 120 }} onClick={newUploadInOneonClick}>
            出站
          </Button>
        </section>
      </Content>
      <Modal
        title="异常提醒"
        visible={showAbnormal}
        onCancel={() => setShowAbnormal(false)}
        width={300}
        onOk={handleOkAbnormal}>
        <Abnormal allWeught={allWeught} />
      </Modal>
      <Modal title="核对信息" visible={showModal} onOk={submitData} onCancel={() => setModal(false)}>
        <ConfirmModal confirmInfo={confirmInfo} stationType={0}></ConfirmModal>
      </Modal>
    </Layout>
  );
};
export default Index;
