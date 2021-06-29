import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Msg, Icon } from '@components';
import router from 'next/router';
import { transportStatistics } from '@api';
import { Format } from '@utils/common';

const TopMsg = (props, ref) => {
  const [type, setType] = useState(props.type);
  const [waitPayPrice, setWaitPayPrice] = useState(); //待支付费用
  const [checkingPrice, setCheckingPrice] = useState(); // 待结算费用
  const text = {
    transport: '显示司机抢单后的全部运单。待结算：核对运单费用，待支付：支付运单费用;',
    route: '对于车队单按专线批量结算、支付。',
  };
  // 获取数据
  const getData = async () => {
    const res = await transportStatistics.getSaaSTransportPriceData();
    if (res.status === 0) {
      setWaitPayPrice(res.result.waitPayPrice);
      setCheckingPrice(res.result.checkingPrice);
    }
  };

  useImperativeHandle(ref, () => ({
    start: getData,
  }));

  useEffect(() => {
    getData();
  }, []);
  return (
    <div style={{ ...props.style }}>
      <div
        style={{
          padding: 16,
          paddingBottom: 4,
          backgroundColor: '#fff',
          marginBottom: 12,
        }}>
        <div
          style={{
            display: 'flex',
            backgroundColor: '#F6F7F9FF',
            marginBottom: 16,
            padding: '16px 24px',
          }}>
          <img style={{ height: 76, width: 76 }} src={type === 'transport' ? Icon.TransportIcon : Icon.RouteIcon} />
          <div style={{ flex: 1, paddingLeft: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>
              {type === 'transport' ? '运单' : '专线结算支付'}
            </div>
            <div style={{ fontSize: 14, marginTop: 4 }}>{type === 'transport' ? text.transport : text.route}</div>
            <div style={{ fontSize: 14, marginTop: 4 }}>
              如需按{type !== 'transport' ? '运单' : '专线'}结算支付，点击跳转
              {type === 'transport' ? (
                <div
                  style={{
                    display: 'inline-block',
                    marginLeft: 12,
                    color: '#477AEF',
                    cursor: 'pointer',
                  }}>
                  <span onClick={() => router.push('/transportManagement/routeList?tab=CHECKING')}>按专线结算</span>
                  <span
                    onClick={() => router.push('/transportManagement/routeList?tab=WAIT_PAY')}
                    style={{ marginLeft: 12 }}>
                    按专线支付
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    display: 'inline-block',
                    marginLeft: 12,
                    color: '#477AEF',
                    cursor: 'pointer',
                  }}>
                  <span onClick={() => router.push('/transportManagement/transportList?tab=CHECKING')}>按运单结算</span>
                  <span
                    style={{ marginLeft: 12 }}
                    onClick={() => router.push('/transportManagement/transportList?tab=WAIT_PAY')}>
                    按运单支付
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          <Msg
            style={{
              backgroundColor: '#FFB7410D',
              borderColor: '#FFB74173',
              marginBottom: type === 'transport' ? 0 : 12,
              borderRadius: 0,
              height: 48,
              border: '1px solid #FFB74173',
              display: 'flex',
              alignItems: 'center',
            }}>
            <img
              style={{
                height: 20,
                width: 20,
                marginRight: 12,
                position: 'relative',
                top: '-1px',
              }}
              src={Icon.SpeakerIcon}></img>
            <span>
              您有待结算费用
              <span className="total-num" style={{ color: '#333333FF', fontSize: 16 }}>
                {Format.price(checkingPrice)}
              </span>
              元
            </span>
            <span style={{ marginLeft: 32 }}>
              待支付费用
              <span className="total-num" style={{ color: '#333333FF', fontSize: 16 }}>
                {Format.price(waitPayPrice)}
              </span>
              元
            </span>
          </Msg>
        </div>
      </div>
    </div>
  );
};

export default forwardRef(TopMsg);
