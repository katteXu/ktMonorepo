import { Layout, Content, ChildTitle, DrawerInfo } from '@components';
import { useState, useCallback, useEffect } from 'react';
import { Steps } from '@components/Station';
import { Input, Button, Select, Table, Popconfirm, message, Drawer, Modal } from 'antd';
import { station } from '@api';
import styles from './index.less';
import { Format, getQuery } from '@utils/common';
import ChooseTucker from './chooseTrucker';
import { PlusOutlined, RightOutlined } from '@ant-design/icons';
import TruckerInfoError from './truckerInfoError';
import router from 'next/router';
import Item from 'antd/lib/list/Item';
const Index = ({ truckInfo, routeInfo, onsubmit, fromTruckerData, type, handleChangeDriver, stationType }) => {
  const [visible, setVisible] = useState(false);
  const [truckerInfo, setTruckerInfo] = useState({});
  const [showInfoError, setShowInfoError] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [truckerDataStatus, setTruckerDataStatus] = useState(false);
  const replaceTouteInfo = () => {
    setVisible(true);
  };

  const chooseTrucker = () => {
    if (truckInfo && routeInfo) {
      setVisible(true);
    } else {
      message.warning('请先选择车辆/专线');
    }
  };

  const handleSubmitChange = async item => {
    if (type === 'detail') {
      const { id } = getQuery();
      const params = {
        truckerInfo: {
          ...item,
        },
        id: id,
      };
      const res = await station.modifyInStationRecordV2({ params });
      if (res.status === 0) {
        setTruckerInfo(item);
        setVisible(false);
        setShowInfo(true);
        onsubmit(item);
      } else {
        message.error(`${res.detail || res.description}`);
      }
    } else {
      setTruckerInfo(item);
      setVisible(false);
      setShowInfo(false);
      onsubmit(item);
    }
  };

  useEffect(() => {
    if (fromTruckerData) {
      if (fromTruckerData.status === false && fromTruckerData.mobile === '') {
        setShowInfo(true);
        setTruckerDataStatus(false);
      } else if (fromTruckerData.status === false && fromTruckerData.mobile != '') {
        setShowInfo(false);
        setTruckerDataStatus(true);
      } else {
        setShowInfo(false);
        setTruckerDataStatus(false);
      }
      setTruckerInfo(fromTruckerData);
    } else {
      setShowInfo(true);
    }
  }, [fromTruckerData]);
  useEffect(() => {
    handleChangeDriver && handleChangeDriver(truckerInfo);
  }, [truckerInfo]);

  const handleOkTruckerInfo = values => {
    setShowInfoError(false);

    setTruckerInfo({
      ...values,
    });
    setTruckDataStatus(false);
  };

  return (
    <>
      <div className={styles.truck}>
        <div className={styles.topTitle}>
          <ChildTitle style={{ margin: '24px 0 16px', fontWeight: 'bold' }}>
            司机信息{stationType == 1 ? '(非必填)' : ''}
          </ChildTitle>

          {truckerDataStatus ? (
            <span className={styles.replace} onClick={() => setShowInfoError(true)}>
              选择
            </span>
          ) : (
            !showInfo && (
              <span className={styles.replace} onClick={replaceTouteInfo}>
                更换
              </span>
            )
          )}
        </div>
        {showInfo ? (
          <Button onClick={chooseTrucker} block style={{ width: 264, marginLeft: 168 }} ghost type="primary">
            <PlusOutlined />
            选择司机
          </Button>
        ) : (
          <div>
            <div className={styles.row}>
              <span className={styles.lableText}>手机号:</span>
              <span className={styles.info}>{truckerInfo.mobile || '-'}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.lableText}>姓名:</span>
              <span className={styles.info}>{truckerInfo.name || '-'}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.lableText}>驾驶证号:</span>
              <span className={styles.info}>{truckerInfo.driverNumber || '-'}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.lableText}>从业资格证号:</span>
              <span className={styles.info}>{truckerInfo.qualificationNumber || '-'}</span>
            </div>
          </div>
        )}
        {stationType != 1 && truckerDataStatus && (
          <Button className={styles.informationNo} onClick={() => setShowInfoError(true)}>
            信息不全 ，点击录入信息
            <RightOutlined />
          </Button>
        )}
      </div>
      <Drawer title="选择司机" width={664} onClose={() => setVisible(false)} visible={visible}>
        <ChooseTucker onSubmit={handleSubmitChange} trailerPlateNumber={truckInfo && truckInfo.trailerPlateNumber} />
      </Drawer>

      <Modal title="司机信息录入" visible={showInfoError} onCancel={() => setShowInfoError(false)} footer={null}>
        <TruckerInfoError
          truckDataInfo={truckerInfo}
          onsubmit={handleOkTruckerInfo}
          onclose={() => setShowInfoError(false)}
        />
      </Modal>
    </>
  );
};

export default Index;
