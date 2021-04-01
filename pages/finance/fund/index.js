import { useState, useEffect, useCallback } from 'react';
import { Layout, Content } from '@components';
import WalletManagement from '@components/Capital/walletManagement';
import PrepaidFreight from '@components/Capital/prepaidFreight';
import PropTypes from 'prop-types';
import { clearState } from '@utils/common';
const Capital = props => {
  // 改变tab
  const onChangeTab = useCallback(key => {
    setCurrentTab(key);
    clearState();
    // 设置存储
    sessionStorage.orderTab = key;
  });
  const routeView = {
    title: '账户资金',
    pageKey: 'fund',
    longKey: 'finance.fund',
    breadNav: '财务中心.账户资金',
    pageTitle: '账户资金',
    activeKey: '',
    changeTab: onChangeTab,
  };
  const [currentTab, setCurrentTab] = useState('walletManagement');

  useEffect(() => {
    const { orderTab } = sessionStorage;
    setCurrentTab(orderTab || 'walletManagement');
  }, []);

  return (
    <Layout {...routeView}>
      <Content>
        <header className="tab-header">
          <div
            className={`tab-item ${currentTab === 'walletManagement' ? 'active' : ''}`}
            onClick={() => onChangeTab('walletManagement')}>
            钱包管理
          </div>
          <div
            className={`tab-item ${currentTab === 'prepaidFreight' ? 'active' : ''}`}
            onClick={() => onChangeTab('prepaidFreight')}>
            预付运费
          </div>
        </header>

        {currentTab === 'walletManagement' && <WalletManagement isServer={props.isServer} />}
        {currentTab === 'prepaidFreight' && <PrepaidFreight isServer={props.isServer} />}
      </Content>
    </Layout>
  );
};

Capital.getInitialProps = async props => {
  const { isServer, userInfo } = props;
  return { isServer, userInfo };
};

Capital.propTypes = {
  children: PropTypes.any,
  paused: PropTypes.bool,
};

export default Capital;
