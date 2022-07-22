import { Layout, Content } from '@components';
import MonthFromReport from '@components/pound/poundReport/monthFromReport';
import MonthToReport from '@components/pound/poundReport/monthToReport';
import TotalFromReport from '@components/pound/poundReport/totalFromReport';
import TotalToReport from '@components/pound/poundReport/totalToReport';
import React, { useCallback, useEffect, useState } from 'react';
import { Tabs } from 'antd';
import { clearState, getQuery } from '@utils/common';
import moment from 'moment';
import { useRouter } from 'next/router';
import LicenseRecord from '../licenseRecord';
import Register from '../register';
import MonthReport from '../monthReport';
const { TabPane } = Tabs;
const PoundReport = props => {
  const routeView = {
    title: '数据报表',
    pageKey: 'poundReport',
    longKey: 'poundManagement.poundReport',
    breadNav: '过磅管理.数据报表',
    pageTitle: '数据报表',
  };
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState('1');
  const [currentMonthTab, setCurrentMonthTab] = useState('1');
  const [currentRegistrationTab, setCurrentRegistrationTab] = useState('1');
  const [tabReport, setTabReport] = useState(1);

  useEffect(() => {
    const { orderTab } = sessionStorage;
    setCurrentTab(orderTab || '1');
  }, []);

  useEffect(() => {
    const { tab, subTab } = getQuery();

    if (tab === 'register') {
      setCurrentRegistrationTab('1');
    }
    if (subTab === 'from') {
      setCurrentTab('1');
    } else if (subTab === 'to') {
      setTabReport(1);
      setCurrentTab('2');
    }
  }, []);

  // 改变tab
  const onChangeTotalTab = useCallback(key => {
    setCurrentTab(key);
    clearState();
    // 设置存储
    sessionStorage.orderTab = key;
  });

  // 改变tab
  const onChangeMonthTab = useCallback(key => {
    setCurrentMonthTab(key);
    clearState();
    // 设置存储
    sessionStorage.orderMonthTab = key;
  });
  // 改变tab
  const onChangeRegistrationTab = useCallback(key => {
    setCurrentRegistrationTab(key);
    clearState();
  });

  const [totalDateTime, setTotalDateTime] = useState({
    begin: moment().subtract(1, 'days').format('YYYY-MM-DD 00:00:00'),
    end: moment().subtract(1, 'days').format('YYYY-MM-DD 23:59:59'),
    dateStatus: 'toYesterday',
  });

  const [detailDateTime, setDetailDateTime] = useState('2020-06');

  return (
    <Layout {...routeView}>
      <Content>
        <header className="tab-header">
          <div
            className={`tab-item ${tabReport === 1 ? 'active' : ''}`}
            onClick={() => {
              setTabReport(1);
              setCurrentTab('1');
              clearState();
            }}>
            汇总报表
          </div>
          <div
            className={`tab-item ${tabReport === 2 ? 'active' : ''}`}
            onClick={() => {
              setTabReport(2);
              setCurrentMonthTab('1');
              clearState();
            }}>
            明细月报表
          </div>
          <div
            className={`tab-item ${tabReport === 3 ? 'active' : ''}`}
            onClick={() => {
              setTabReport(3);
              clearState();
            }}>
            车牌识别报表
          </div>
          <div
            className={`tab-item ${tabReport === 4 ? 'active' : ''}`}
            onClick={() => {
              setTabReport(4);
              setCurrentRegistrationTab('1');
              clearState();
            }}>
            车辆装载报表
          </div>
        </header>

        {tabReport === 1 && (
          <Tabs
            defaultActiveKey="1"
            type="card"
            size="small"
            activeKey={currentTab}
            onChange={e => onChangeTotalTab(e)}
            style={{ margin: '16px 16px 0' }}>
            <TabPane tab="发货磅单" key="1">
              {currentTab === '1' && (
                <TotalFromReport isServer={props.isServer} dateTime={totalDateTime} setDateTime={setTotalDateTime} />
              )}
            </TabPane>
            <TabPane tab="收货磅单" key="2">
              {currentTab === '2' && (
                <TotalToReport isServer={props.isServer} dateTime={totalDateTime} setDateTime={setTotalDateTime} />
              )}
            </TabPane>
          </Tabs>
        )}
        {tabReport === 2 && (
          <Tabs
            defaultActiveKey="1"
            type="card"
            size="small"
            onChange={e => onChangeMonthTab(e)}
            style={{ margin: '16px 16px 0' }}>
            <TabPane tab="发货磅单" key="1">
              {currentMonthTab === '1' && (
                <MonthFromReport isServer={props.isServer} dateTime={detailDateTime} setDateTime={setDetailDateTime} />
              )}
            </TabPane>
            <TabPane tab="收货磅单" key="2">
              {currentMonthTab === '2' && (
                <MonthToReport isServer={props.isServer} dateTime={detailDateTime} setDateTime={setDetailDateTime} />
              )}
            </TabPane>
          </Tabs>
        )}
        {tabReport === 3 && <LicenseRecord isServer={props.isServer} />}
        {tabReport === 4 && (
          <Tabs
            defaultActiveKey="1"
            type="card"
            size="small"
            activeKey={currentRegistrationTab}
            onChange={e => onChangeRegistrationTab(e)}
            style={{ margin: '16px 16px 0' }}>
            <TabPane tab="车辆装载登记表" key="1">
              {currentRegistrationTab === '1' && <Register isServer={props.isServer} />}
            </TabPane>
            <TabPane tab="车辆装载月报表" key="2">
              {currentRegistrationTab === '2' && <MonthReport isServer={props.isServer} />}
            </TabPane>
          </Tabs>
        )}
      </Content>
    </Layout>
  );
};

export default PoundReport;
