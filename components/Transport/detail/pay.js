import React, { useState, useEffect } from 'react';
import styles from './styles.less';
import { Button, Select, message, Input } from 'antd';
import { Format } from '@utils/common';
import { transportStatistics } from '@api';
import ValidateTruckrBack from './validateTruckerBack';
import { WhiteList } from '@store';
const { TextArea } = Input;
// TODO: 结算测试  reload函数
const PAY_STATUS = {
  ONLINE_PAY: '线上支付',
  OFFLINE_PAY: '线下支付',
};
/**
 * 支付信息
 */
const Pay = props => {
  console.log(props.dataInfo);
  const {
    truckerInfo,
    status,
    routeInfo,
    unitName,
    price,
    realPrice,
    id,
    payStatus,
    unitInfoFee,
    totalInfoFee,
    taxCharge,
  } = props.dataInfo;
  const { id: rid, payPath } = routeInfo;
  console.log(props.dataInfo);
  const [btnLoading, setBtnLoading] = useState(false);
  const [editUnitPrice, setEditUnitPrice] = useState(false);
  const [unitPrice, setUnitPrice] = useState(Format.price(props.dataInfo.unitPrice));
  const [unitPriceList, setUnitPriceList] = useState([]);
  const [unitPriceStatus, setUnitPriceStatus] = useState(props.dataInfo.unitPriceStatus);
  const [payRemark, setPayRemark] = useState('');

  // whiteList 用于判断用户是否属于和顺
  const { whiteList } = WhiteList.useContainer();

  // 输入结算运费时显示的补差运费
  const [taxes, setTaxes] = useState();

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
    // 验证结算运费格式，通过验证则按结算运费显示 10% 补差运费
    if (/^(\d+)(\.\d{1,2})?$/.test(e.target.value)) {
      setTaxes(Math.ceil(e.target.value * 10));
    } else {
      setTaxes();
    }
  };
  // 结算时备注
  const handleChangeRemark = e => {
    props.handleChangeRemark && props.handleChangeRemark(e.target.value);
  };

  return (
    <div className={styles.floor}>
      <div className={styles.title}>支付信息</div>
      <div className={styles.row}>
        <div
          className={styles.label}
          style={{
            minWidth:
              (status === 'WAIT_PAY' || status === 'CHECKING' || status === 'DONE' || status === 'REJECT') && 84,
          }}>
          {(status === 'WAIT_PAY' || status === 'CHECKING' || status === 'DONE' || status === 'REJECT') && payPath === 1
            ? '运费'
            : '结算'}
          单价：
        </div>
        <div className={styles.data} style={{ overflow: 'unset' }}>
          {editUnitPrice ? (
            <>
              <Select
                style={{ width: 100, marginRight: 10 }}
                placeholder={'单价'}
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
      {(status === 'WAIT_PAY' || status === 'CHECKING' || status === 'DONE' || status === 'REJECT') && payPath === 1 && (
        <div>
          <div className={styles.row}>
            <div className={styles.label} style={{ minWidth: 84 }}>
              信息费单价：
            </div>
            <div className={styles.data}>{Format.price(unitInfoFee)} 元/吨</div>
          </div>
          <div className={styles.row}>
            <div className={styles.label} style={{ minWidth: 84 }}>
              结算单价：
            </div>
            <div className={styles.data}>{Format.addPrice(unitPrice * 100 + unitInfoFee)} 元/吨</div>
          </div>
          <div className={styles.row}>
            <div className={styles.label} style={{ minWidth: 84 }}>
              信息费：
            </div>
            <div className={styles.data}>{Format.price(totalInfoFee)} 元</div>
          </div>
        </div>
      )}
      {status === 'WAIT_PAY' && payPath === 1 ? (
        ''
      ) : (
        <div className={styles.row}>
          <div
            className={styles.label}
            style={{
              minWidth:
                (status === 'WAIT_PAY' || status === 'CHECKING' || status === 'DONE' || status === 'REJECT') && 84,
            }}>
            预计运费：
          </div>
          <div className={styles.data}>{Format.price(price)} 元</div>
        </div>
      )}

      {(status === 'WAIT_PAY' || status === 'DONE' || status === 'CHECKING') && (
        <div className={styles.row}>
          <div className={styles.label} style={{ minWidth: 84 }}>
            费用合计：
          </div>
          <div className={styles.data}>{Format.addPrice(price + totalInfoFee)} 元</div>
        </div>
      )}
      <div className={styles.row}>
        <div
          className={styles.label}
          style={{
            minWidth:
              (status === 'WAIT_PAY' || status === 'CHECKING' || status === 'DONE' || status === 'REJECT') && 84,
          }}>
          结算费用：
        </div>
        <div className={styles.data}>
          {status === 'CHECKING' ? (
            <Input
              onChange={handleChangePrice}
              size="small"
              style={{ width: 120, marginRight: 10 }}
              addonAfter={<span>元</span>}
              placeholder="结算费用"
            />
          ) : (
            <span style={{ display: 'inline-block' }}>
              {realPrice === 0 ? Format.price(price) : Format.price(realPrice)} 元
            </span>
          )}
        </div>
      </div>
      {status === 'CHECKING' && (
        <div className={styles.row}>
          <div className={styles.label} style={{ minWidth: 84 }}>
            补差运费：
          </div>
          <div className={styles.data}>
            {taxes && whiteList.heShun ? Format.price(taxes) : Format.price(taxCharge)} 元
          </div>
        </div>
      )}
      {status === 'CHECKING' && (
        <div className={styles.row}>
          <div className={styles.label} style={{ minWidth: 84 }}>
            备注：
          </div>
          <div className={styles.data}>
            <TextArea maxLength={20} onChange={handleChangeRemark} />
          </div>
        </div>
      )}
      {(status === 'WAIT_PAY' || status === 'DONE' || status === 'REJECT') && (
        <div>
          <div className={styles.row}>
            <div className={styles.label} style={{ minWidth: 84 }}>
              补差运费：
            </div>
            <div className={styles.data}>{Format.price(taxCharge)} 元</div>
          </div>
          {payPath === 1 && (
            <div className={styles.row}>
              <div
                className={styles.label}
                style={{ minWidth: (status === 'WAIT_PAY' || status === 'DONE' || status === 'REJECT') && 84 }}>
                合计：
              </div>
              <div className={styles.data}>
                {realPrice === 0
                  ? Format.addPrice(totalInfoFee + price + taxCharge)
                  : Format.addPrice(realPrice + totalInfoFee + taxCharge)}
                {} 元
              </div>
            </div>
          )}
        </div>
      )}
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
