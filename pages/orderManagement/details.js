/** 订单详情 */

import React, { useCallback, useEffect, useState } from 'react';
import { Layout, Content } from '@components';
import Detail from '@components/orderManagement/detail';
import Log from '@components/orderManagement/log';
import { clearState } from '@utils/common';
import Link from 'next/link';
const ContractDetail = props => {
  // 改变tab
  const onChangeTab = useCallback(key => {
    setCurrentTab(key);
    clearState();
    // 设置存储
    sessionStorage.orderTab = key;
  });

  const routeView = {
    title: '订单详情',
    pageKey: 'orderManagement',
    longKey: 'orderManagement',
    breadNav: [
      '订单管理',
      <Link href="/orderManagement">
        <a>订单列表</a>
      </Link>,
      '订单详情',
    ],
    pageTitle: '订单详情',
    activeKey: '',
    useBack: true,
    changeTab: onChangeTab,
  };

  useEffect(() => {
    const { orderTab } = sessionStorage;
    setCurrentTab(orderTab || 'detail');
  }, []);

  const [currentTab, setCurrentTab] = useState('detail');

  return (
    <Layout {...routeView}>
      <Content>
        <header className="tab-header">
          <div className={`tab-item ${currentTab === 'detail' ? 'active' : ''}`} onClick={() => onChangeTab('detail')}>
            订单信息
          </div>
          <div className={`tab-item ${currentTab === 'log' ? 'active' : ''}`} onClick={() => onChangeTab('log')}>
            日志
          </div>
        </header>
        {currentTab === 'detail' && <Detail isServer={props.isServer} />}
        {currentTab === 'log' && <Log isServer={props.isServer} />}
      </Content>
    </Layout>
  );
};

ContractDetail.getInitialProps = async props => {
  const { isServer, userInfo } = props;
  return { isServer, userInfo };
};

export default ContractDetail;
