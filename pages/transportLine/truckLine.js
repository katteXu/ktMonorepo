/** @format */

import React, { useState } from 'react';
import { Layout, Content } from '@components';
import Line from './components/Line';
import Point from './components/Point';
const TransportLine = () => {
  const routeView = {
    title: '车辆轨迹',
    pageKey: 'truckLine',
    longKey: 'transportLine.truckLine',
    breadNav: '车辆轨迹.车辆轨迹',
    pageTitle: '轨迹路线',
  };

  const [plateNum, setPlateNum] = useState('');

  const [currentTab, setCurrentTab] = useState('line'); // line  point
  // 切换tab
  const onChangeTab = key => {
    setCurrentTab(key);
  };
  return (
    <Layout {...routeView}>
      <Content>
        <header className="tab-header">
          <div className={`tab-item ${currentTab === 'line' ? 'active' : ''}`} onClick={() => onChangeTab('line')}>
            轨迹查询
          </div>
          <div className={`tab-item ${currentTab === 'point' ? 'active' : ''}`} onClick={() => onChangeTab('point')}>
            实时位置查询
          </div>
        </header>
        <section>
          <div style={currentTab === 'line' ? {} : { display: 'none' }}>
            <Line onRemeberPlate={setPlateNum} plateNum={plateNum} />
          </div>
          <div style={currentTab === 'point' ? {} : { display: 'none' }}>
            <Point onRemeberPlate={setPlateNum} plateNum={plateNum} />
          </div>
        </section>
      </Content>
    </Layout>
  );
};

export default TransportLine;
