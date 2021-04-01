import React, { useState, useEffect } from 'react';
import { Layout, Content, Msg, Icon } from '@components';
import InvoiceListComponent from '@components/Finance/main/InvoiceList';
import StayInvoiceComponent from '@components/Finance/main/StayInvoice';
import NeverInvoiceComponent from '@components/Finance/main/NeverInvoice';
import StayInvoiceByOrderComponent from '@components/Finance/main/StayInvoiceByOrder';
import NeverInvoiceByOrderComponent from '@components/Finance/main/NeverInvoiceByOrder';
import router from 'next/router';
import { finance } from '@api';
import { Format, getQuery } from '@utils/common';
const speakerIcon = '../../../static/img/transport/speakerIcon.svg';
const routeView = {
  title: '开票信息',
  pageKey: 'main',
  longKey: 'finance.main',
  breadNav: '财务中心.开票信息',
  pageTitle: '开票信息',
};

const InvoiceList = props => {
  const [status, setStatus] = useState('STAY_INVOICE');
  const [totalData, setTotalData] = useState({});
  useEffect(() => {
    const { tab } = getQuery();
    if (tab) {
      setStatus(tab);
      router.replace('/finance/main');
    }

    // getTotalData();
  }, []);

  // 状态切换
  useEffect(() => {
    getTotalData();
  }, [status]);
  const [byOrder, setByOrder] = useState(false);
  const [never_byOrder, setNeverByOrder] = useState(false);
  // 按运单开票组
  const [orderDetail, setOrderDetail] = useState({
    fromCompany: '',
    toCompany: '',
    fromAddress: '',
    toAddress: '',
    fromAddressId: '',
    toAddressId: '',
    goodsType: '',
  });
  const [tabCount, setTabCount] = useState({
    UN_APPROVE: 0,
    REJECT_APPROVE: 0,
    UN_PAY: 0,
    UN_INVOICE: 0,
    INVOICED: 0,
  });

  // 切换tab
  const changeTab = s => {
    setStatus(s);
    // router.replace(`/finance/main?tab=${s}`);
    // history.replaceState({ tab: s }, '');
  };

  /**
   * 改变tab数值
   */
  const onChangeTabNum = ({ status, value } = {}) => {
    setTabCount({
      ...tabCount,
      [status]: value || 0,
    });
  };

  // 按运单列表
  const changeByOrder = group => {
    setByOrder(true);
    setOrderDetail(group);
  };

  const changeByRoute = () => {
    setByOrder(false);
    setOrderDetail({});
  };

  // 暂不开票
  const neverChangeByOrder = group => {
    setNeverByOrder(true);
    setOrderDetail(group);
  };

  const neverChangeByRoute = () => {
    setNeverByOrder(false);
    setOrderDetail({});
  };

  // 获取总体数据
  const getTotalData = async () => {
    const res = await finance.getTotalInvoiceData();
    if (res.status === 0) {
      const { waitApproveInvoicePrice, waitPayInvoicePrice } = res.result;
      setTotalData({
        waitApproveInvoicePrice,
        waitPayInvoicePrice,
      });
    }
  };

  return (
    <Layout {...routeView}>
      <Msg
        style={{
          backgroundColor: '#FFFBF4FF',
          borderColor: '#FFB74173',
          marginBottom: 16,
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
          您有待申请开票(含税)
          <span className="total-num" style={{ color: '#4A4A5AFF', fontSize: 16 }}>
            {Format.price(totalData.waitApproveInvoicePrice)}
          </span>
          元
        </span>
        <span style={{ marginLeft: 32 }}>
          待支付税费
          <span className="total-num" style={{ color: '#4A4A5AFF', fontSize: 16 }}>
            {Format.price(totalData.waitPayInvoicePrice)}
          </span>
          元
        </span>
      </Msg>
      <Content>
        <header className="tab-header">
          <div
            className={`tab-item ${status === 'STAY_INVOICE' ? 'active' : ''}`}
            onClick={() => changeTab('STAY_INVOICE')}>
            待申请开票
          </div>
          <div
            className={`tab-item ${status === 'UN_APPROVE' ? 'active' : ''}`}
            onClick={() => changeTab('UN_APPROVE')}>
            待审核({tabCount.UN_APPROVE})
          </div>
          <div className={`tab-item ${status === 'UN_PAY' ? 'active' : ''}`} onClick={() => changeTab('UN_PAY')}>
            待支付({tabCount.UN_PAY})
          </div>
          <div
            className={`tab-item ${status === 'UN_INVOICE' ? 'active' : ''}`}
            onClick={() => changeTab('UN_INVOICE')}>
            待开票({tabCount.UN_INVOICE})
          </div>
          <div className={`tab-item ${status === 'INVOICED' ? 'active' : ''}`} onClick={() => changeTab('INVOICED')}>
            已完成({tabCount.INVOICED})
          </div>
          <div
            className={`tab-item ${status === 'REJECT_APPROVE' ? 'active' : ''}`}
            onClick={() => changeTab('REJECT_APPROVE')}>
            被驳回({tabCount.REJECT_APPROVE})
          </div>
          <div
            className={`tab-item ${status === 'NEVER_INVOICED' ? 'active' : ''}`}
            onClick={() => changeTab('NEVER_INVOICED')}>
            暂不开票
          </div>
        </header>
        <section>
          {status === 'STAY_INVOICE' &&
            (byOrder ? (
              <StayInvoiceByOrderComponent
                refreshTotalData={getTotalData}
                orderDetail={orderDetail}
                back={changeByRoute}
              />
            ) : (
              <StayInvoiceComponent
                refreshTotalData={getTotalData}
                isServer={props.isServer}
                changeByOrder={changeByOrder}
              />
            ))}
          {/* 不同状态引用不同 */}
          <div style={status === 'UN_APPROVE' ? {} : { display: 'none' }}>
            <InvoiceListComponent
              reload={status === 'UN_APPROVE'}
              status="UN_APPROVE"
              refreshTotalData={getTotalData}
              onChangeTabNum={onChangeTabNum}></InvoiceListComponent>
          </div>
          <div style={status === 'REJECT_APPROVE' ? {} : { display: 'none' }}>
            <InvoiceListComponent
              reload={status === 'REJECT_APPROVE'}
              status="REJECT_APPROVE"
              refreshTotalData={getTotalData}
              onChangeTabNum={onChangeTabNum}></InvoiceListComponent>
          </div>
          <div style={status === 'UN_PAY' ? {} : { display: 'none' }}>
            <InvoiceListComponent
              reload={status === 'UN_PAY'}
              status="UN_PAY"
              refreshTotalData={getTotalData}
              onChangeTabNum={onChangeTabNum}></InvoiceListComponent>
          </div>
          <div style={status === 'UN_INVOICE' ? {} : { display: 'none' }}>
            <InvoiceListComponent
              reload={status === 'UN_INVOICE'}
              status="UN_INVOICE"
              refreshTotalData={getTotalData}
              onChangeTabNum={onChangeTabNum}></InvoiceListComponent>
          </div>
          <div style={status === 'INVOICED' ? {} : { display: 'none' }}>
            <InvoiceListComponent
              reload={status === 'INVOICED'}
              status="INVOICED"
              refreshTotalData={getTotalData}
              onChangeTabNum={onChangeTabNum}></InvoiceListComponent>
          </div>
          <div style={status === 'NEVER_INVOICED' ? {} : { display: 'none' }}>
            {never_byOrder ? (
              <NeverInvoiceByOrderComponent
                reload={status === 'NEVER_INVOICED'}
                refreshTotalData={getTotalData}
                orderDetail={orderDetail}
                back={neverChangeByRoute}
              />
            ) : (
              <NeverInvoiceComponent
                reload={status === 'NEVER_INVOICED'}
                refreshTotalData={getTotalData}
                isServer={props.isServer}
                changeByOrder={neverChangeByOrder}
              />
            )}
          </div>
        </section>
      </Content>
    </Layout>
  );
};

export default InvoiceList;
