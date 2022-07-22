import React, { useState, useCallback, useEffect } from 'react';
import { Layout, Content } from '@components';
import Storage from '@components/Inventory/inventoryWater/storage';
import Outbound from '@components/Inventory/inventoryWater/outbound';
import { clearState, getQuery } from '@utils/common';
const InventoryWater = props => {
  // 改变tab
  const onChangeTab = useCallback(key => {
    setCurrentTab(key);
    clearState();
    // 设置存储
    sessionStorage.orderTab = key;
  });
  const routeView = {
    title: '库存流水',
    pageKey: 'inventoryWater',
    longKey: 'inventory.inventoryWater',
    breadNav: '库存管理.库存流水',
    pageTitle: '库存流水',
  };
  const [currentTab, setCurrentTab] = useState('storage');
  useEffect(() => {
    const { waterTab } = getQuery();
    if (waterTab) {
      setCurrentTab(waterTab || 'storage');
    } else {
      const { orderTab } = sessionStorage;
      setCurrentTab(orderTab || 'storage');
    }
  }, []);
  return (
    <Layout {...routeView}>
      <Content>
        <header className="tab-header" style={{ paddingLeft: 32 }}>
          <div
            className={`tab-item ${currentTab === 'storage' ? 'active' : ''}`}
            onClick={() => onChangeTab('storage')}>
            入库
          </div>
          <div
            className={`tab-item ${currentTab === 'outbound' ? 'active' : ''}`}
            onClick={() => onChangeTab('outbound')}>
            出库
          </div>
        </header>

        {currentTab === 'storage' && <Storage />}
        {currentTab === 'outbound' && <Outbound />}
      </Content>
    </Layout>
  );
};

export default InventoryWater;
