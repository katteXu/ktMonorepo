/** 运单结算 */

import React, { useCallback, useEffect, useState } from 'react';
import { Layout, Content } from '@components';
import RailWayList from '@components/TransportManagement/routeList/byRailWay';
import RailWaySettlementList from '@components/TransportManagement/routeList/railWaySettlementList';
import TopMsg from '@components/TransportManagement/routeList/topMsg';
import { clearState } from '@utils/common';
import { getQuery } from '@utils/common';
const RouteList = props => {
  const [currentTab, setCurrentTab] = useState('railWaySettlement');
  // 改变tab
  const onChangeTab = useCallback(key => {
    setCurrentTab(key);
    clearState();
    // 设置存储
    sessionStorage.orderTab = key;
  });

  const routeView = {
    title: '专线结算支付',
    pageKey: 'routeList',
    longKey: 'transportManagement.routeList',
    breadNav: '运单管理.专线结算支付',
    pageTitle: '专线结算支付',
    activeKey: '',
    changeTab: onChangeTab,
  };

  useEffect(() => {
    const { tab } = getQuery();
    if (tab) {
      if (tab === 'CHECKING') {
        setCurrentTab('railWaySettlement');
      } else if (tab === 'WAIT_PAY') {
        setCurrentTab('railWay');
      }
    } else {
      const { orderTab } = sessionStorage;
      setCurrentTab(orderTab || 'railWaySettlement');
    }
  }, []);

  return (
    <Layout {...routeView}>
      <TopMsg style={{ marginBottom: 16 }}></TopMsg>
      <Content
        style={{
          fontFamily:
            '-apple-system,BlinkMacSystemFont,Helvetica Neue,Helvetica,Roboto,Arial,PingFang SC,Hiragino Sans GB,Microsoft Yahei,SimSun,sans-serif',
        }}>
        <header className="tab-header">
          <div
            className={`tab-item ${currentTab === 'railWaySettlement' ? 'active' : ''}`}
            onClick={() => onChangeTab('railWaySettlement')}>
            按专线结算
          </div>
          <div
            className={`tab-item ${currentTab === 'railWay' ? 'active' : ''}`}
            onClick={() => onChangeTab('railWay')}>
            按专线支付
          </div>
        </header>
        <section>
          {currentTab === 'railWaySettlement' && <RailWaySettlementList />}
          {currentTab === 'railWay' && <RailWayList />}
        </section>
      </Content>
    </Layout>
  );
};

export default RouteList;
