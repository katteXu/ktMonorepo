/** 统计 */

import React, { useCallback, useEffect, useState } from 'react';
import { Layout } from '@components';
import Today from '@components/Statistical/today';
import Yesterday from '@components/Statistical/yesterday';
import { clearState } from '@utils/common';
import styles from './styles.less';
const OrderPay = () => {
  // 改变tab
  const onChangeTab = useCallback(key => {
    setCurrentTab(key);
    clearState();
    // 设置存储
    sessionStorage.orderTab = key;
  });

  const routeView = {
    title: '数据面板',
    pageKey: 'statistical',
    longKey: 'productManagement.statistical',

    activeKey: '',
    changeTab: onChangeTab,
  };

  useEffect(() => {
    setCurrentTab('today');
  }, []);

  const [currentTab, setCurrentTab] = useState('today');

  return (
    <Layout {...routeView}>
      <div className={styles.tab}>
        <div
          className={`${styles.tab_item} ${currentTab === 'today' ? styles.active : ''}`}
          onClick={() => onChangeTab('today')}>
          今天
        </div>
        <div
          className={`${styles.tab_item} ${currentTab === 'yesterday' ? styles.active : ''}`}
          style={{ marginLeft: 24 }}
          onClick={() => onChangeTab('yesterday')}>
          昨天
        </div>
      </div>
      {currentTab === 'today' && <Today />}
      {currentTab === 'yesterday' && <Yesterday />}
    </Layout>
  );
};

OrderPay.getInitialProps = async props => {
  const { isServer, userInfo } = props;
  return { isServer, userInfo };
};

export default OrderPay;
