import React, { useState, useEffect } from 'react';
import styles from './styles.less';
import { Button, Select, message, Input } from 'antd';
import { Format } from '@utils/common';
import { transportStatistics } from '@api';
import ValidateTruckrBack from './validateTruckerBack';

// TODO: 结算测试  reload函数
const PAY_STATUS = {
  ONLINE_PAY: '线上支付',
  OFFLINE_PAY: '线下支付',
};
/**
 * 支付信息
 */
const Pay = props => {
  const { truckerInfo, status, routeInfo, unitName, price, realPrice, id, payStatus } = props.dataInfo;
  const { id: rid } = routeInfo;

  const [btnLoading, setBtnLoading] = useState(false);
  const [editUnitPrice, setEditUnitPrice] = useState(false);
  const [unitPrice, setUnitPrice] = useState(Format.price(props.dataInfo.unitPrice));
  const [unitPriceList, setUnitPriceList] = useState([]);
  const [unitPriceStatus, setUnitPriceStatus] = useState(props.dataInfo.unitPriceStatus);

  useEffect(() => {
    setHistoryUnitPrice();
  }, []);

  useEffect(() => {
    // 回显
    setUnitPrice(Format.price(props.dataInfo.unitPrice));
    // 重新复制金额状态
    setUnitPriceStatus(props.dataInfo.unitPriceStatus);
  }, [props.dataInfo]);

  // 保存运费单价
  const saveUnitPrice = async () => {
    const params = {
      id: id * 1,
      unitPrice: parseInt(unitPrice * 100),
    };

    setBtnLoading(true);

    const res = await transportStatistics.modifyUnitPrice({ params });

    if (res.status === 0) {
      setEditUnitPrice(false);
      setUnitPriceStatus('reload');
    } else {
      message.error(res.detail || res.description);
    }

    setBtnLoading(false);
  };

  // 获取历史单价
  const setHistoryUnitPrice = async () => {
    const params = {
      limit: 1000,
      rid: rid,
    };
    const res = await transportStatistics.getRouteHistoryUnitPrice({ params });
    if (res.status === 0) {
      setUnitPriceList(res.result.data);
    }
  };

  // 结算运费变更
  const handleChangePrice = e => {
    props.onChangePrice && props.onChangePrice(e.target.value);
  };

  return (
    <div className={styles.floor}>
      <div className={styles.title}>支付信息</div>
      <div className={styles.row}>
        <div className={styles.label}>结算单价：</div>
        <div className={styles.data} style={{ overflow: 'unset' }}>
          {editUnitPrice ? (
            <>
              <Select
                style={{ width: 100, marginRight: 10 }}
                placeholder="结算单价"
                value={unitPrice}
                size="small"
                onChange={value => setUnitPrice(value)}
                getPopupContainer={trigger => trigger.parentElement}>
                {unitPriceList.map(_price => (
                  <Select.Option key={_price} value={Format.price(_price)}>
                    {Format.price(_price)}
                  </Select.Option>
                ))}
              </Select>
              <Button onClick={saveUnitPrice} type="primary" size="small" style={{ fontSize: 12 }}>
                确定
              </Button>
              <Button
                style={{ marginLeft: 8, fontSize: 12 }}
                size="small"
                onClick={() => {
                  setEditUnitPrice(false);
                  setUnitPrice(Format.price(props.dataInfo.unitPrice));
                }}>
                取消
              </Button>
            </>
          ) : (
            <>
              <span style={{ display: 'inline-block' }}>
                {unitPrice} 元/{unitName || '吨'}
              </span>
              {status === 'CHECKING' ? (
                <span
                  style={{ color: '#477AEF', marginLeft: 9, cursor: 'pointer' }}
                  onClick={() => setEditUnitPrice(true)}>
                  修改
                </span>
              ) : (
                ''
              )}
            </>
          )}
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.label}>预计运费：</div>
        <div className={styles.data}>{Format.price(price)} 元</div>
      </div>
      <div className={styles.row}>
        <div className={styles.label}>结算运费：</div>
        <div className={styles.data}>
          {status === 'CHECKING' ? (
            <Input
              onChange={handleChangePrice}
              size="small"
              style={{ width: 100, marginRight: 10 }}
              suffix="元"
              placeholder="结算运费"
            />
          ) : (
            <span style={{ display: 'inline-block' }}>
              {realPrice === 0 ? Format.price(price) : Format.price(realPrice)}元
            </span>
          )}
        </div>
      </div>
      {/* 支付方式  */}
      {status !== 'WAIT_PAY' && status !== 'CHECKING' && (
        <div className={styles.row}>
          <div className={styles.label}>支付方式：</div>
          <div className={styles.data}>{PAY_STATUS[payStatus] || '-'}</div>
        </div>
      )}

      {/* 验证司机反馈信息 */}
      <ValidateTruckrBack
        status={unitPriceStatus}
        phone={truckerInfo.mobilePhoneNumber}
        onCancel={() => props.reload && props.reload()} // 刷新
        dataId={id}
      />
    </div>
  );
};

export default Pay;
