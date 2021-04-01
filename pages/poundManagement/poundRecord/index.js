import { useState, useEffect } from 'react';
import { Layout, Content } from '@components';
import { clearState } from '@utils/common';
import FromOrder from '@components/pound/poundRecord/fromOrder';
import ToOrder from '@components/pound/poundRecord/toOrder';
import moment from 'moment';

const PoundRecord = () => {
  const routeView = {
    title: '过磅记录',
    pageKey: 'poundRecord',
    longKey: 'poundManagement.poundRecord',
    breadNav: '过磅管理.过磅记录.',
    pageTitle: '过磅记录',
  };

  // tab切换
  /**
   * from 发货
   * to 收货
   */
  const [currentTab, setCurrentTab] = useState('from');

  const [dateTime, setDateTime] = useState({
    begin: moment().format('YYYY-MM-DD 00:00:00'),
    end: moment().format('YYYY-MM-DD 23:59:59'),
    dateStatus: 'toDay',
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
          {currentTab === 'from' && <FromOrder dateTime={dateTime} setDateTime={setDateTime} />}
          {currentTab === 'to' && <ToOrder dateTime={dateTime} setDateTime={setDateTime} />}
        </section>
      </Content>
    </Layout>
  );
};

PoundRecord.getInitialProps = async props => {
  const { isServer, userInfo } = props;
  return { isServer, userInfo };
};

export default PoundRecord;
