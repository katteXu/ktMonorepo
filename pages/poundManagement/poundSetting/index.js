import { Layout, Content } from '@components';
import PoundPassSetting from '@components/pound/poundSetting/poundPassSetting';
import PoundReportSetting from '@components/pound/poundSetting/poundReportSetting';
import OutboundSetting from '@components/pound/poundSetting/outboundSetting';
import React, { useCallback, useEffect, useState } from 'react';
import { clearState } from '@utils/common';
const PoundSetting = props => {
  // 改变tab
  const onChangeTab = useCallback(key => {
    setCurrentTab(key);
    clearState();
    // 设置存储
    sessionStorage.orderTab = key;
  });
  const routeView = {
    title: '设置',
    pageKey: 'poundSetting',
    longKey: 'poundManagement.poundSetting',
    breadNav: '过磅管理.设置.',
    pageTitle: '设置',
    changeTab: onChangeTab,
  };
  const [currentTab, setCurrentTab] = useState('poundPassSetting');
  useEffect(() => {
    const { orderTab } = sessionStorage;
    setCurrentTab(orderTab || 'poundPassSetting');
  }, []);

  return (
    <Layout {...routeView}>
      <Content>
        <header className="tab-header">
          <div
            className={`tab-item ${currentTab === 'poundPassSetting' ? 'active' : ''}`}
            onClick={() => onChangeTab('poundPassSetting')}>
            磅差设置
          </div>
          <div
            className={`tab-item ${currentTab === 'poundReportSetting' ? 'active' : ''}`}
            onClick={() => onChangeTab('poundReportSetting')}>
            磅单报表设置
          </div>
          <div
            className={`tab-item ${currentTab === 'outboundSetting' ? 'active' : ''}`}
            onClick={() => onChangeTab('outboundSetting')}>
            出站设置
          </div>
        </header>

        {currentTab === 'poundReportSetting' && <PoundReportSetting isServer={props.isServer} />}
        {currentTab === 'outboundSetting' && <OutboundSetting isServer={props.isServer} />}

        {currentTab === 'poundPassSetting' && <PoundPassSetting isServer={props.isServer} />}
      </Content>
    </Layout>
  );
};

PoundSetting.getInitialProps = async props => {
  const { isServer, userInfo } = props;
  return { isServer, userInfo };
};

export default PoundSetting;
