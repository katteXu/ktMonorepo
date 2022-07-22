import { useState, useEffect } from 'react';
import { Layout, Content } from '@components';
import { clearState } from '@utils/common';
import FromOrder from '@components/pound/poundRecord/fromOrder';
import ToOrder from '@components/pound/poundRecord/toOrder';
import moment from 'moment';

const PoundRecord = props => {
  const routeView = {
    title: '磅单列表',
    pageKey: 'poundRecord',
    longKey: 'poundManagement.poundRecord',
    breadNav: '过磅管理.磅单列表.',
    pageTitle: '磅单列表',
  };

  // tab切换
  /**
   * from 发货
   * to 收货
   */
  const [currentTab, setCurrentTab] = useState('from');

  const [dateTime, setDateTime] = useState({
    begin: moment().subtract(1, 'days').format('YYYY-MM-DD 00:00:00'),
    end: moment().subtract(1, 'days').format('YYYY-MM-DD 23:59:59'),
    dateStatus: 'toYesterday',
  });
  // 切换tab
  const onChangeTab = key => {
    setCurrentTab(key);
    clearState();
    // 设置存储
    sessionStorage.listTab = key;
  };

  useEffect(() => {
    const { listTab } = sessionStorage;
    if (['from', 'to'].includes(listTab)) {
      setCurrentTab(listTab);
    } else {
      setCurrentTab('from');
    }
  }, []);
  return (
    <Layout {...routeView}>
      <Content>
        <header className="tab-header">
          <div className={`tab-item ${currentTab === 'from' ? 'active' : ''}`} onClick={() => onChangeTab('from')}>
            发货磅单
          </div>
          <div className={`tab-item ${currentTab === 'to' ? 'active' : ''}`} onClick={() => onChangeTab('to')}>
            收货磅单
          </div>
        </header>
        <section>
          {currentTab === 'from' && (
            <FromOrder isServer={props.isServer} {...props.menu} dateTime={dateTime} setDateTime={setDateTime} />
          )}
          {currentTab === 'to' && (
            <ToOrder isServer={props.isServer} {...props.menu} dateTime={dateTime} setDateTime={setDateTime} />
          )}
        </section>
      </Content>
    </Layout>
  );
};

export default PoundRecord;
