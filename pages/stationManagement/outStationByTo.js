import { useState, useEffect, useCallback, useRef } from 'react';
import { Layout, Content, ChildTitle } from '@components';
import { Input, Button, Select, Table, Popconfirm, message, Modal } from 'antd';
import { station } from '@api';
import styles from './index.less';
import TruckInfo from '@components/StationManagement/truckInfo.js';
import RouteInfo from '@components/StationManagement/routeInfo.js';
import TruckerInfo from '@components/StationManagement/truckerInfo.js';
import Abnormal from '@components/StationManagement/abnormal.js';
import PrimaryWeight from '@components/StationManagement/primaryWeight.js';
import ReceiveWeight from '@components/StationManagement/receiveWeight.js';
import { QuestionCircleFilled } from '@ant-design/icons';
import PoundBox from '@components/StationManagement/poundBox';
import ConfirmModal from '@components/StationManagement/confirmModal';
import { Format, getQuery } from '@utils/common';
const express = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Za-z]{1}[A-Za-z]{1}[警京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼]{0,1}[A-Za-z0-9]{4}[A-Za-z0-9挂学警港澳]{1}$/;

const { TextArea } = Input;
import router from 'next/router';
const Index = () => {
  const receiveWeightRef = useRef();
  const routeView = {
    title: '站内管理',
    pageKey: 'stationManagement',
    longKey: 'stationManagement',
    breadNav: '站内管理.收货出站',
    pageTitle: '收货出站',
    useBack: true,
  };
  const [receiveInfo, setReceiveInfo] = useState();
  const [poundMachineList, setPoundMachineList] = useState([]);
  const [truckInfo, setTruckInfo] = useState();
  const [routeInfo, setRouteInfo] = useState();
  const [truckerInfo, setTruckerInfo] = useState();
  const [remark, setRemark] = useState('');
  const [weight, setWeight] = useState(0);
  const [primaryWeight, setPrimaryWeight] = useState({});
  const [receiveWeight, setReceiveWeight] = useState({});
  const [receiveCarWeight, setReceiveCarWeight] = useState();
  const [plateNum, setPlateNum] = useState();
  const [driverInfo, setDriverInfo] = useState({});
  const [routeId, setRouteId] = useState();
  const [confirmInfo, setConfirmInfo] = useState();
  const [showModal, setModal] = useState(false);
  const [showAbnormal, setShowAbnormal] = useState(false);
  const [allWarnWeight, setAllWarnWeight] = useState({});
  const [lossChangeWeight, setLossChangeWeight] = useState();
  const [outStationCarVal, setOutStationCarVal] = useState(); //没有输入皮重直接出站的皮重
  const [outStationGoodsVal, setOutStationGoodsVal] = useState(); //没有输入皮重直接出站的净重
  const { id } = getQuery();
  const poundBoxRef = useRef();
  const [boxId, setBoxId] = useState();
  // 取皮重
  const takeTareWeight = () => {
    setReceiveCarWeight(weight);
    if (weight == 0) {
      receiveWeightRef.current.refreshCarWeight();
    }
  };

  //获取详情
  const getDetailInfo = async () => {
    const params = { id };
    console.log(params);
    const res = await station.outStationDetail({ params });
    if (res.status === 0) {
      setReceiveInfo(res.result.weigh);
      setTruckInfo(res.result.weigh.driverTruck);
      setRouteInfo({
        id: res.result.weigh.routeId,
        fromCompany: res.result.weigh.route.fromAddress.companyName,
        toCompany: res.result.weigh.route.toAddress.companyName,
        goodsType: res.result.weigh.route.goodsType,
      });
      setTruckerInfo({
        status: !res.result.weigh.trucker.status,
        driverNumber: res.result.weigh.trucker.driverLicenseNumber,
        mobile: res.result.weigh.trucker.mobilePhoneNumber,
        name: res.result.weigh.trucker.name,
        qualificationNumber: res.result.weigh.trucker.qualificationNumber,
      });
      setRouteId(res.result.weigh.routeId);
      setRemark(res.result.remark);
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };

  //出站校验是否正常
  const handleOutStation = () => {
    const totalVal = Format.weight(receiveWeight.totalWeight);
    const carVal = receiveWeight.carWeight != NaN ? Format.weight(receiveWeight.carWeight) : weight;
    const goodsVal = receiveWeight.fromGoodsWeight
      ? Format.weight(receiveWeight.fromGoodsWeight)
      : (totalVal - carVal).toFixed(2);
    const totalValSection = 25 > totalVal || totalVal > 50;
    const carValSection = carVal < 10 || carVal > 20;
    const goodsValSection = goodsVal < 20 || goodsVal > 50;
    setOutStationCarVal(carVal * 1000);
    setOutStationGoodsVal(goodsVal * 1000);
    if (!express.test(plateNum)) {
      message.error('请输入正确的车牌号');
      return;
    } else if (totalVal == 0) {
      warnInfo('当前毛重异常请检查');
      return;
    } else if (carVal == 0) {
      warnInfo('当前皮重异常请检查');
      return;
    } else if (goodsVal == 0) {
      warnInfo('当前毛重/皮重异常请检查');
      return;
    } else if (totalVal < carVal) {
      warnInfo('当前毛重/皮重异常请检查');
      return;
    } else if (totalValSection && carValSection && goodsValSection) {
      setAllWarnWeight({
        totalWeight: totalVal,
        goodsWeight: carVal,
        carWeight: goodsVal,
      });
      setShowAbnormal(true);
      return;
    } else if (totalValSection && carValSection) {
      setAllWarnWeight({
        totalWeight: totalVal,
        carWeight: carVal,
      });
      setShowAbnormal(true);
      return;
    } else if (totalValSection && goodsValSection) {
      setAllWarnWeight({
        totalWeight: totalVal,
        goodsWeight: goodsVal,
      });
      setShowAbnormal(true);
      return;
    } else if (carValSection && goodsValSection) {
      setAllWarnWeight({
        carWeight: carVal,
        goodsWeight: goodsVal,
      });
      setShowAbnormal(true);
      return;
    } else if (totalValSection) {
      setAllWarnWeight({
        totalWeight: totalVal,
      });
      setShowAbnormal(true);
      return;
    } else if (carValSection) {
      setAllWarnWeight({
        carWeight: carVal,
      });
      setShowAbnormal(true);
      return;
    } else if (goodsValSection) {
      setAllWarnWeight({
        goodsWeight: goodsVal,
      });
      setShowAbnormal(true);
      return;
    }
    setModal(true);
  };

  //出站调接口
  const submitOutStationFunc = async () => {
    const params = {
      receiveOrSend: 1,
      inStationId: id,
      plateNum,
      remark,
      ...receiveWeight,
      ...primaryWeight,
      ...driverInfo,
      weight: weight ? weight * 1000 : 0,
      routeId,
    };
    const res = await station.postOutStation({ params });
    if (res.status === 0) {
      const pdfParams = {
        pid: res.result.pid,
        poundType: 2,
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

  //获取修改后的专线信息
  const handleChangeRoute = data => {
    data.id && setRouteId(data.id);
    setRouteInfo(data);
  };

  const handleChangeDriver = data => {
    const params = {
      receiveDriverName: data.name,
      mobile: data.mobile,
    };
    setDriverInfo(params);
  };

  // 磅机重量变更
  const handleChangeWeight = weight => {
    setWeight(weight);
  };

  //确认信息
  const handleOk = () => {
    submitOutStationFunc();
  };

  //取消信息
  const handleCancel = () => {
    setModal(false);
  };

  const warnInfo = text => {
    Modal.warn({
      title: text,
      onOk() {},
    });
  };

  //异常提醒确认
  const handleOkAbnormal = () => {
    setModal(true);
    // submitOutStationFunc();
  };

  //原发净重改变的时候改变实收重量的路损
  const handleChangeReceiveLoss = data => {
    if (data) setLossChangeWeight(Format.weight(data * 1000 - receiveWeight.fromGoodsWeight));
  };

  useEffect(() => {
    getDetailInfo();
    let isConnect = sessionStorage.getItem('isConnect') || '{}';
    setBoxId(JSON.parse(isConnect).id);
  }, []);

  useEffect(() => {
    setConfirmInfo({
      plateNum,
      ...routeInfo,
      ...receiveWeight,
      ...primaryWeight,
      carWeight: outStationCarVal,
      goodsWeight: outStationGoodsVal,
    });
  }, [showModal]);
  return (
    <Layout {...routeView}>
      <Content>
        <section style={{ paddingBottom: 50 }}>
          <div className={styles.top}>
            <PoundBox onChange={handleChangeWeight} style={{ marginLeft: 10 }} ref={poundBoxRef} boxId={boxId} />
          </div>
          <ReceiveWeight
            ref={receiveWeightRef}
            receiveWeight={receiveInfo}
            getFromGoodsWeightFunc={takeTareWeight}
            receiveCarWeight={receiveCarWeight}
            outStationByToVisible={true}
            currentPrimaryGoodsWeight={primaryWeight.fromGoodsWeight}
            onWeightAll={(fromTotalWeight, fromGoodsWeight, fromCarWeight) => {
              setReceiveWeight({
                totalWeight: fromTotalWeight,
                carWeight: fromCarWeight,
                fromGoodsWeight,
              });
            }}
            lossChangeWeight={lossChangeWeight}
          />
          <PrimaryWeight
            weightData={receiveInfo}
            handleChangeReceiveLoss={val => handleChangeReceiveLoss(val)}
            onWeightAll={(fromTotalWeight, fromGoodsWeight, fromCarWeight) =>
              setPrimaryWeight({ fromTotalWeight, fromGoodsWeight, fromCarWeight })
            }
          />
          <TruckInfo
            stationType={1}
            onsubmit={val => setTruckInfo(val)}
            truckData={truckInfo}
            handleChangePlateNum={val => setPlateNum(val)}
          />
          <RouteInfo
            onsubmit={val => handleChangeRoute(val)}
            type="detail"
            fromRouteData={routeInfo}
            routeId={routeId}
          />
          <TruckerInfo
            type="detail"
            fromTruckerData={truckerInfo}
            truckInfo={truckInfo}
            routeInfo={routeInfo}
            stationType={1}
            onsubmit={val => setTruckerInfo(val)}
            handleChangeDriver={val => handleChangeDriver(val)}
          />
          <div className={styles.block1} style={{ marginTop: 32, marginBottom: 32 }}>
            <span className={styles.lableText}>备注:</span>
            <TextArea
              rows={4}
              placeholder="请输入备注"
              style={{ width: 264 }}
              value={remark}
              onChange={e => setRemark(e.target.value)}
            />
          </div>
          <Button type="primary" style={{ width: 264, marginLeft: 120 }} onClick={handleOutStation}>
            出站
          </Button>
        </section>
      </Content>
      <Modal title="核对信息" visible={showModal} onOk={handleOk} onCancel={handleCancel}>
        <ConfirmModal confirmInfo={confirmInfo} stationType={1}></ConfirmModal>
      </Modal>
      <Modal
        title="异常提醒"
        visible={showAbnormal}
        onCancel={() => setShowAbnormal(false)}
        width={300}
        onOk={handleOkAbnormal}>
        <Abnormal allWeught={allWarnWeight} />
      </Modal>
    </Layout>
  );
};
export default Index;
