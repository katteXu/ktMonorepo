/** 运单结算 */

import React, { useCallback, useEffect, useState } from 'react';
import { Layout, Content } from '@components';
import Detail from '@components/contractManagement/detail';
import AssociatedTable from '@components/contractManagement/associatedTable';
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
    title: '合同详情',
    pageKey: 'contractManagement',
    longKey: 'contractManagement',
    breadNav: [
      '合同管理',
      <Link href="/contractManagement">
        <a>合同列表</a>
      </Link>,
      '合同详情',
    ],
    pageTitle: '合同详情',
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
            基本信息
          </div>
          <div
            className={`tab-item ${currentTab === 'associated' ? 'active' : ''}`}
            onClick={() => onChangeTab('associated')}>
            关联合同
          </div>
        </header>
        {currentTab === 'detail' && <Detail isServer={props.isServer} />}
        <section>{currentTab === 'associated' && <AssociatedTable isServer={props.isServer} />}</section>
      </Content>
    </Layout>
  );
};

ContractDetail.getInitialProps = async props => {
  const { isServer, userInfo } = props;
  return { isServer, userInfo };
};

export default ContractDetail;
