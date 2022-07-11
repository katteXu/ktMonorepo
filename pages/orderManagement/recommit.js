import { useState, useEffect } from 'react';
import Layout from '@components/Layout';
import Link from 'next/link';
import { Content } from '@components';
import AddOrderFrom from '@components/orderManagement/orderFrom';
import { getQuery, clearState } from '@utils/common';
import router from 'next/router';
import { order } from '@api';
import { message, Spin } from 'antd';

import styles from './customer.less';

const createOrder = props => {
  const routeView = {
    title: '重新提交',
    pageKey: 'orderManagement',
    longKey: 'orderManagement',
    breadNav: [
      '订单管理',
      <Link href="/orderManagement">
        <a>订单列表</a>
      </Link>,
      '重新提交',
    ],
    pageTitle: '重新提交',
    useBack: true,
  };

  const [id, setId] = useState();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { id } = getQuery();
    if (id && window.location.pathname.split('/')[2] === 'recommit') {
      getDetail(id);
    }
    setId(id);
  }, []);

  useEffect(() => {
    if (Object.keys(data).length > 0 && data.status && data.status !== 3) {
      router.push('/orderManagement');
      return;
    }
  }, [data]);

  const getDetail = async id => {
    setLoading(true);
    const res = await order.transportOrderDetail({ id });
    if (res.status === 0) {
      setData(res.result);
    } else {
      message.error(res.detail || res.description);
    }
    setLoading(false);
  };

  const handleSubmit = async data => {
    const res = await order.resubmitTransportOrder({ id, ...data });

    if (res.status === 0) {
      message.success('订单重新提交审核成功');
      clearState();
      router.push('/orderManagement');
    } else {
      message.error(res.detail || res.description);
    }
  };

  return (
    <Layout {...routeView}>
      <Content>
        <section style={{ paddingTop: 24 }}>
          <div className={styles.root}>
            <Spin spinning={loading}>
              {id && (
                <div className={styles.reason}>
                  <div className={styles.content}>{data?.reason || '-'}</div>
                </div>
              )}
              <AddOrderFrom onSubmit={handleSubmit} data={data} orderId={id} />
            </Spin>
          </div>
        </section>
      </Content>
    </Layout>
  );
};

export default createOrder;
