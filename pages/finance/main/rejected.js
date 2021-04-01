import React, { useState } from 'react';
import { Layout, Content } from '@components';
import StayInvoiceComponent from '@components/Finance/main/StayInvoice';
import StayInvoiceByOrderComponent from '@components/Finance/main/StayInvoiceByOrder';
import Link from 'next/link';
import router from 'next/router';

const routeView = {
  title: '驳回补充',
  pageKey: 'main',
  longKey: 'finance.main',
  breadNav: [
    '财务中心',
    <Link href="/finance/main">
      <a>开票信息</a>
    </Link>,
    <Link href="">
      <a onClick={() => router.back()}>查看对账单</a>
    </Link>,
    '驳回补充',
  ],
  pageTitle: '驳回补充',
  useBack: true,
};
const Rejected = props => {
  const [byOrder, setByOrder] = useState(false);
  const [orderDetail, setOrderDetail] = useState({});

  // 按运单列表
  const changeByOrder = group => {
    setByOrder(true);
    setOrderDetail(group);
  };

  const changeByRoute = () => {
    setByOrder(false);
    setOrderDetail({});
  };
  return (
    <Layout {...routeView}>
      <Content>
        <section>
          {byOrder ? (
            <StayInvoiceByOrderComponent orderDetail={orderDetail} back={changeByRoute} />
          ) : (
            <StayInvoiceComponent isServer={props.isServer} changeByOrder={changeByOrder} />
          )}
        </section>
      </Content>
    </Layout>
  );
};
Rejected.getInitialProps = props => {
  const { isServer } = props;
  return { isServer };
};
export default Rejected;
