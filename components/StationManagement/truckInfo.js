import { Layout, Content, ChildTitle } from '@components';
import { useState, useCallback, useEffect } from 'react';
import { Steps } from '@components/Station';
import { Input, Button, Select, Table, Popconfirm, message, Modal } from 'antd';
import { station } from '@api';
import styles from './index.less';
import { RightOutlined, TrophyOutlined } from '@ant-design/icons';
import { Format } from '@utils/common';
import TruckInfoError from './truckInfoError';
const express = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Za-z]{1}[A-Za-z]{1}[警京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼]{0,1}[A-Za-z0-9]{4}[A-Za-z0-9挂学警港澳]{1}$/;
const Index = ({ onsubmit, truckData, handleChangePlateNum, stationType }) => {
  const [trailerPlateNumber, setTrailerPlateNumber] = useState('');
  const [truckInfo, setTruckInfo] = useState({});
  const [showInfo, setShowInfo] = useState(false);
  const [showInfoError, setShowInfoError] = useState(false);
  const [truckDataStatus, setTruckDataStatus] = useState(true);
  const handleSubmitPlateNum = async params => {
    const res = await station.queryTruckInfo({ params });
    if (res.status === 0) {
      setTruckInfo(res.result.data);
      setShowInfo(true);
      onsubmit(res.result.data);
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };
  const replaceTruck = () => {
    setShowInfo(false);
  };
  const onChangeNumber = (data, type) => {
    setTrailerPlateNumber(data);
    if (express.test(data)) {
      const params = {
        trailerPlateNumber: data.toUpperCase(),
      };
      if (data != trailerPlateNumber) handleSubmitPlateNum(params);
    } else {
      if (type == 1) message.error('请输入正确的车牌号');
    }
  };

  useEffect(() => {
    if (truckData) {
      setTrailerPlateNumber(truckData.trailerPlateNumber);
      setShowInfo(true);
      setTruckInfo(truckData);
      setTruckDataStatus(truckData.status);
    }
  }, [truckData]);
  useEffect(() => {
    handleChangePlateNum && handleChangePlateNum(trailerPlateNumber);
  }, [trailerPlateNumber]);

  //车辆信息录入
  const handleOkTruckInfo = values => {
    setShowInfoError(false);
    setTruckInfo({
      ...values,
      trailerPlateNumber: values.trailerPlateNumber,
      truckLoad: values.truckLoad * 1000,
    });
    setTruckDataStatus(true);
  };

  return (
    <div className={styles.truck}>
      <div className={styles.topTitle}>
        <ChildTitle style={{ margin: '24px 0 16px', fontWeight: 'bold' }}>车辆信息</ChildTitle>
        {/* {showInfo && (
          <span className={styles.replace} onClick={replaceTruck}>
            更换
          </span>
        )} */}
      </div>

      <div className={styles.row}>
        <span className={styles.lableText}>车牌号:</span>
        {/* {showInfo ? (
          <div>
            <span className={styles.info}>{truckInfo.trailerPlateNumber}</span>
          </div>
        ) : ( */}
        <div>
          <Input
            placeholder="请输入车牌号"
            style={{ width: 264 }}
            value={trailerPlateNumber}
            onChange={e => onChangeNumber(e.target.value)}
            onBlur={e => onChangeNumber(e.target.value, 1)}
          />
          {/* <Button type="primary" style={{ marginLeft: 16 }} onClick={onClickTruck}>
            确定
          </Button> */}
        </div>
        {/* )} */}
      </div>
      {showInfo && (
        <div>
          <div className={styles.row}>
            <span className={styles.lableText}>行驶证档案编号:</span>
            <span className={styles.info}>{truckInfo.truckLicenseNumber || '-'}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.lableText}>道路运输证号:</span>
            <span className={styles.info}>{truckInfo.roadNumber || '-'}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.lableText}>总质量限值:</span>
            <span className={styles.info}>{truckInfo.truckLoad ? Format.weight(truckInfo.truckLoad) : '-'}</span>
          </div>
        </div>
      )}
      {stationType != 1 && !truckDataStatus && (
        <Button className={styles.informationNo} onClick={() => setShowInfoError(true)}>
          信息不全 ，点击录入信息
          <RightOutlined />
        </Button>
      )}
      <Modal title="车辆信息录入" visible={showInfoError} onCancel={() => setShowInfoError(false)} footer={null}>
        <TruckInfoError
          truckDataInfo={truckData}
          onsubmit={handleOkTruckInfo}
          onclose={() => setShowInfoError(false)}
        />
      </Modal>
    </div>
  );
};

export default Index;
