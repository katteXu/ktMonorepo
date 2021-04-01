import { Layout, Content } from '@components';
import MonthFromReport from '@components/pound/poundReport/monthFromReport';
import MonthToReport from '@components/pound/poundReport/monthToReport';
import TotalFromReport from '@components/pound/poundReport/totalFromReport';
import TotalToReport from '@components/pound/poundReport/totalToReport';
import React, { useCallback, useEffect, useState } from 'react';
import { clearState } from '@utils/common';
import styles from './poundReport.less';
import moment from 'moment';

const PoundReport = props => {
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
  const routeView = {
    title: '磅单报表',
    pageKey: 'poundReport',
    longKey: 'poundManagement.poundReport',
    breadNav: '过磅管理.磅单报表.',
    pageTitle: '磅单报表',
  };
  const [currentTab, setCurrentTab] = useState('totalFrom');
  const [currentMonthTab, setCurrentMonthTab] = useState('monthFrom');
  const [tabReport, setTabReport] = useState(true);

  const [totalDateTime, setTotalDateTime] = useState({
    begin: moment().format('YYYY-MM-DD 00:00:00'),
    end: moment().format('YYYY-MM-DD 23:59:59'),
    dateStatus: 'toDay',
  });

  const [detailDateTime, setDetailDateTime] = useState();

  useEffect(() => {
    const { orderTab } = sessionStorage;
    setCurrentTab(orderTab || 'totalFrom');
  }, []);

  return (
    <Layout {...routeView}>
      <div className={styles.tabs}>
        <div
          onClick={() => setTabReport(true)}
          className={`${styles.totalReport} ${tabReport ? styles.activeTotal : ''}`}>
          汇总报表
        </div>
        <div
          style={{ marginLeft: 24 }}
          onClick={() => setTabReport(false)}
          className={`${styles.totalReport} ${!tabReport ? styles.activeTotal : ''}`}>
          明细月报表
        </div>
      </div>

      {tabReport ? (
        <Content>
          <header className="tab-header">
            <div
              className={`tab-item ${currentTab === 'totalFrom' ? 'active' : ''}`}
              onClick={() => onChangeTotalTab('totalFrom')}>
              发货磅单
            </div>
            <div
              className={`tab-item ${currentTab === 'totalTo' ? 'active' : ''}`}
              onClick={() => onChangeTotalTab('totalTo')}>
              收货磅单
            </div>
          </header>

          {currentTab === 'totalFrom' && (
            <TotalFromReport isServer={props.isServer} dateTime={totalDateTime} setDateTime={setTotalDateTime} />
          )}
          {currentTab === 'totalTo' && (
            <TotalToReport isServer={props.isServer} dateTime={totalDateTime} setDateTime={setTotalDateTime} />
          )}
        </Content>
      ) : (
        <Content>
          <header className="tab-header">
            <div
              className={`tab-item ${currentMonthTab === 'monthFrom' ? 'active' : ''}`}
              onClick={() => onChangeMonthTab('monthFrom')}>
              发货磅单
            </div>
            <div
              className={`tab-item ${currentMonthTab === 'monthTo' ? 'active' : ''}`}
              onClick={() => onChangeMonthTab('monthTo')}>
              收货磅单
            </div>
          </header>

          {currentMonthTab === 'monthFrom' && (
            <MonthFromReport isServer={props.isServer} dateTime={detailDateTime} setDateTime={setDetailDateTime} />
          )}
          {currentMonthTab === 'monthTo' && (
            <MonthToReport isServer={props.isServer} dateTime={detailDateTime} setDateTime={setDetailDateTime} />
          )}
        </Content>
      )}
    </Layout>
  );
};

PoundReport.getInitialProps = async props => {
  const { isServer, userInfo } = props;
  return { isServer, userInfo };
};

export default PoundReport;
