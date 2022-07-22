import React, { useState, useCallback, useEffect } from 'react';
import { Input, Button, Table, message, Tooltip, Select } from 'antd';
import { Layout, Content, Search, Msg } from '@components';
import { Format, keepState, getState } from '@utils/common';
import { inventory } from '@api';
import router from 'next/router';
import RawMaterials from './rawMaterials';
import FinishedGoods from './finishedGoods';

const Index = props => {
  const routeView = {
    title: '库存查询',
    pageKey: 'inventoryQuery',
    longKey: 'inventory.inventoryQuery',
    breadNav: '库存管理.库存查询',
    pageTitle: '库存查询',
  };
  const columns = [
    {
      title: '货品名称',
      dataIndex: 'goodsName',
      key: 'goodsName',
      width: '200px',
      render: value => {
        return (
          <Tooltip title={value} overlayStyle={{ maxWidth: 'max-content' }}>
            <div className="max-label" style={{ width: 180 }}>
              {value || '-'}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: '存货类别',
      dataIndex: 'rawMaterial',
      key: 'rawMaterial',
      width: 120,
      render: value => <span>{value || '-'}</span>,
    },
    {
      title: '当前库存(吨)',
      dataIndex: 'inventoryValue',
      key: 'inventoryValue',
      width: 120,
      align: 'right',
      render: value => <span>{Format.weight(value) || '-'}</span>,
    },
    {
      title: '累计入库(吨)',
      dataIndex: 'inSum',
      key: 'inSum',
      width: 120,
      align: 'right',
      render: value => <span>{Format.weight(value) || '-'}</span>,
    },
    {
      title: '累计出库(吨)',
      dataIndex: 'outSum',
      key: 'outSum',
      width: 120,
      align: 'right',
      render: value => <span>{Format.weight(value) || '-'}</span>,
    },
  ];

  const onChangeTab = useCallback(key => {
    setCurrentTab(key);

    // 设置存储
    sessionStorage.orderTab = key;
  });

  const [currentTab, setCurrentTab] = useState('1');
  return (
    <Layout {...routeView}>
      <Content
        style={{
          fontFamily:
            '-apple-system,BlinkMacSystemFont,Helvetica Neue,Helvetica,Roboto,Arial,PingFang SC,Hiragino Sans GB,Microsoft Yahei,SimSun,sans-serif',
        }}>
        <header className="tab-header" style={{ paddingLeft: 32, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex' }}>
            <div className={`tab-item ${currentTab === '1' ? 'active' : ''}`} onClick={() => onChangeTab('1')}>
              原材料
            </div>
            <div className={`tab-item ${currentTab === '2' ? 'active' : ''}`} onClick={() => onChangeTab('2')}>
              产成品
            </div>
          </div>

          <Button
            ghost
            type="primary"
            onClick={() => router.push('/inventory/inventoryQuery/create')}
            style={{ float: 'right' }}>
            物料设置
          </Button>
        </header>
        <section>
          {currentTab === '1' && <RawMaterials />}
          {currentTab === '2' && <FinishedGoods />}
        </section>
      </Content>
    </Layout>
  );
};

export default Index;
