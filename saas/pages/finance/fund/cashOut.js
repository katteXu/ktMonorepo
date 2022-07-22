/** @format */
import { useState, useEffect, useCallback } from 'react';
import Layout from '@components/Layout';
import Link from 'next/link';
import Content from '@components/Content';
import CashOutForm from '@components/Capital/cashOutForm';
import { getUserInfo } from '@api';

const Index = props => {
  const routeView = {
    title: '提现申请',
    pageKey: 'fund',
    longKey: 'finance.fund',
    breadNav: [
      '财务中心',
      <Link href="/finance/fund">
        <a>账户资金</a>
      </Link>,
      '提现申请',
    ],
    pageTitle: '提现申请',
    useBack: true,
  };
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const { userId } = localStorage;
    const res = await getUserInfo({ userId });
    if (res.status === 0) {
      setAmount((res.result.wallet / 100).toFixed(2));
    }
  };

  const getMoney = async data => {
    console.log(data);
  };

  return (
    <Layout {...routeView}>
      <Content>
        <section style={{ paddingTop: 24, paddingLeft: 48 }}>
          <CashOutForm amount={amount} onSubmit={getMoney} />
        </section>
      </Content>
    </Layout>
  );
};

export default Index;
