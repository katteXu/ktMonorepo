import { Layout, Content, ChildTitle, DrawerInfo } from '@components';
import { useState, useCallback, useEffect } from 'react';
import { Steps } from '@components/Station';
import { Input, Button, Select, Table, Popconfirm, message, Drawer } from 'antd';
import { station } from '@api';
import styles from './index.less';
import { Format } from '@utils/common';
import ChooseRouteModal from './chooseRouteModal';
import { PlusOutlined } from '@ant-design/icons';
import router from 'next/router';
const Index = ({ onsubmit, fromRouteData, routeId, type }) => {
  const [visible, setVisible] = useState(false);
  const [railInfo, setRailInfo] = useState({});
  const [userId, setUserId] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const { userId } = localStorage;
    setUserId(userId);
  }, []);

  // 选择专线
  const handleRailChange = async (
    id,
    fromCompany,
    toCompany,
    goodsType,
    unitPrice,
    totalAmount,
    sendAmount,
    ruleLeavingAmount
  ) => {
    if (totalAmount - sendAmount <= 0) {
      message.warning('此专线已无余量');
    } else if (totalAmount - sendAmount < ruleLeavingAmount) {
      message.warning('此专线余量不足');
    }

    if (type === 'detail') {
      const params = {
        routeId: id,
        id: router.query.id,
      };
      const res = await station.changeInStationRoute({ params });
      if (res.status === 0) {
        setRailInfo({ id, fromCompany, toCompany, goodsType, unitPrice });
        setVisible(false);
        setShowInfo(true);
        onsubmit({ id, fromCompany, toCompany, goodsType, unitPrice });
      } else {
        message.error(`${res.detail || res.description}`);
      }
    } else {
      setRailInfo({ id, fromCompany, toCompany, goodsType, unitPrice });
      setVisible(false);
      setShowInfo(true);
      onsubmit({ id, fromCompany, toCompany, goodsType, unitPrice });
    }
  };

  const replaceTouteInfo = () => {
    setVisible(true);
  };

  useEffect(() => {
    if (fromRouteData) {
      if (Object.keys(fromRouteData).length > 0) {
        setShowInfo(true);
        setRailInfo(fromRouteData);
      }
    }
  }, [fromRouteData, routeId]);

  return (
    <>
      <div className={styles.truck}>
        <div className={styles.topTitle}>
          <ChildTitle style={{ margin: '24px 0 16px', fontWeight: 'bold' }}>专线信息</ChildTitle>
          {showInfo && (
            <span className={styles.replace} onClick={replaceTouteInfo}>
              更换
            </span>
          )}
        </div>
        {showInfo ? (
          <div>
            <div className={styles.row}>
              <span className={styles.lableText}>发货企业:</span>
              <span className={styles.info}>{railInfo.fromCompany || '-'}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.lableText}>收货企业:</span>
              <span className={styles.info}>{railInfo.toCompany || '-'}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.lableText}>货品名称:</span>
              <span className={styles.info}>{railInfo.goodsType || '-'}</span>
            </div>
          </div>
        ) : (
          <Button onClick={() => setVisible(true)} block style={{ width: 264, marginLeft: 120 }} ghost type="primary">
            <PlusOutlined />
            选择专线
          </Button>
        )}
      </div>
      <Drawer title="选择专线" width={664} onClose={() => setVisible(false)} visible={visible}>
        <ChooseRouteModal handleSureChooseRoute={handleRailChange} userId={userId} />
      </Drawer>
    </>
  );
};

export default Index;
