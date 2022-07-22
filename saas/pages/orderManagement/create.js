import { useState, useEffect } from 'react';
import Layout from '@components/Layout';
import Link from 'next/link';
import { Content } from '@components';
import AddOrderFrom from '@components/orderManagement/orderFrom';
import { getQuery, clearState } from '@utils/common';
import router from 'next/router';
import { order } from '@api';
import { message } from 'antd';

import styles from './customer.less';

const createOrder = props => {
  const routeView = {
    title: '新增订单',
    pageKey: 'orderManagement',
    longKey: 'orderManagement',
    breadNav: [
      '订单管理',
      <Link href="/orderManagement">
        <a>订单列表</a>
      </Link>,
      '新增订单',
    ],
    pageTitle: '新增订单',
    useBack: true,
  };

  const [modalVisible, setModalVisible] = useState(false);
  const handleSubmit = async data => {
    const res = await order.createOrder(data);

    if (res.status === 0) {
      if (res.result?.check_failed_list?.length) {
        setModalVisible(true);
      } else {
        message.success('订单提交审核成功');
        clearState();
        router.push('/orderManagement');
      }
    } else {
      message.error(res.detail || res.description);
    }
  };

  const changeModal = status => {
    setModalVisible(status);
  };

  return (
    <Layout {...routeView}>
      <Content>
        <section style={{ paddingTop: 24 }}>
          <div className={styles.root}>
            <AddOrderFrom onSubmit={handleSubmit} modalVisible={modalVisible} changeModal={changeModal} />
          </div>
        </section>
      </Content>
    </Layout>
  );
};

export default createOrder;
