// 运单详情 2021-1-6
import { useState, useEffect } from 'react';
import { transportStatistics } from '@api';
import styles from './styles.less';
import RejectReason from './reject';
import Header from './header';
import Route from './route';
import Pay from './pay';
import Transport from './transport';
import PoundPhoto from './poundPhoto';
import BottomBtn from './bottomBtn';
import Steps from './steps';
import { message, Spin } from 'antd';

// 展示运输信息
const showTransportInfo = [
  'PROCESS',
  'CHECKING',
  'WAIT_PAY',
  'DONE',
  'WAIT_FLEET_CAPTAIN_PAY',
  'FLEET_CAPTAIN_PAYING',
  'REJECT',
  'APPLY_CANCEL',
  'PAYING',
];
// 展示支付信息
const showPayInfo = [
  'WAIT_PAY',
  'CHECKING',
  'DONE',
  'WAIT_FLEET_CAPTAIN_PAY',
  'FLEET_CAPTAIN_PAYING',
  'REJECT',
  'APPLY_CANCEL',
  'PAYING',
];

// 展示底部按钮
const showBottomBtn = [
  'PROCESS',
  'WAIT_PAY',
  'CHECKING',
  'WAIT_FLEET_CAPTAIN_PAY',
  'FLEET_CAPTAIN_PAYING',
  'APPLY_CANCEL',
  'WAIT_CONFIRMED',
];

/**
 * 运单明细
 */
const Detail = props => {
  const [dataInfo, setDataInfo] = useState({});
  const [loading, setLoading] = useState(true);
  // 结算金额
  const [checkPrice, setCheckPrice] = useState();

  useEffect(() => {
    getDetail();
  }, []);

  // 获取详情
  const getDetail = async () => {
    const { id: tid } = props;
    if (!tid) return;
    const params = {
      tid,
    };
    const res = await transportStatistics.getSaaSTransportDetail({ params });
    if (res.status === 0) {
      setDataInfo(res.result);
    } else {
      message.warn(`此运单状态为空`, 1.5, props.close);
    }
    setLoading(false);
  };

  // 刷新
  const reload = () => {
    getDetail();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div className={styles['order-number']} style={{ fontSize: 16 }}>
        运单编号：{dataInfo.orderNo}
      </div>
      <Spin spinning={loading} style={{ flex: 1 }} tip="加载中...">
        {dataInfo.status && <Header dataInfo={dataInfo} />}

        <div style={{ marginTop: 18 }}>
          {dataInfo.status && <Steps dataInfo={dataInfo}></Steps>}
          {/* 驳回原因 */}
          {dataInfo.status === 'REJECT' && dataInfo.applyCancelType === 0 && <RejectReason dataInfo={dataInfo} />}
          {/* 专线信息 */}
          {dataInfo.status && <Route dataInfo={dataInfo} />}
          {/* 支付信息 */}
          {showPayInfo.includes(dataInfo.status) && (
            <Pay dataInfo={dataInfo} reload={reload} onChangePrice={setCheckPrice} />
          )}
          {/* 运输信息 */}
          {showTransportInfo.includes(dataInfo.status) && <Transport dataInfo={dataInfo} />}
          {/* 磅单照片 */}
          {dataInfo.status && dataInfo.status !== 'WAIT_CONFIRMED' && <PoundPhoto dataInfo={dataInfo} />}
          {/* 按钮 */}
          {showBottomBtn.includes(dataInfo.status) && (
            <BottomBtn
              dataInfo={dataInfo}
              reload={reload}
              close={props.close}
              checkPrice={checkPrice}
              userInfo={props.userInfo}
            />
          )}
        </div>
      </Spin>
    </div>
  );
};

export default Detail;
