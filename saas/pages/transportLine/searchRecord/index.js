import { useEffect, useState } from 'react';
import { Content, Layout } from '@components';
import Line from './components/Line';
import Point from './components/Point';

const Index = props => {
  const routeView = {
    title: '查询记录',
    pageKey: 'searchRecord',
    longKey: 'transportLine.searchRecord',
    breadNav: '车辆轨迹.查询记录',
    pageTitle: '查询记录',
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
            <Line isServer={props.isServer} />
          </div>
          <div style={currentTab === 'point' ? {} : { display: 'none' }}>
            <Point />
          </div>
        </section>
      </Content>
    </Layout>
  );
};

Index.getInitialProps = async props => {
  const { isServer } = props;
  return { isServer };
};

export default Index;
