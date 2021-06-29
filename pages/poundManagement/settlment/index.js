/** @format */

import { useState, useEffect } from 'react';
import { Button, message, Spin } from 'antd';
import { Layout, Content, Image, Icon } from '@components';
import { Panel, SettlmentList, FromSettlment, ToSettlment, SettlmentSet } from '@components/pound/Settlment';
import styles from './styles.less';
import router from 'next/router';
import { pound } from '@api';
import { clearState } from '@utils/common';

const Settlment = props => {
  const routeView = {
    title: '人工结算',
    pageKey: 'settlment',
    longKey: 'poundManagement.settlment',
    breadNav: '过磅管理.人工结算',
    pageTitle: '人工结算',
  };

  const [currentTab, setCurrentTab] = useState('');
  const [total, setTotal] = useState({
    waitApproveCountSend: 0,
    waitApproveCountReceive: 0,
    approvedCountReceive: 0,
    approvedCountSend: 0,
  });
  const onChangeTab = tab => {
    setCurrentTab(tab);
    sessionStorage.setItem('settlment_tab', tab);
    clearState();
  };

  useEffect(() => {
    getData();
    initTab();
  }, []);

  const initTab = () => {
    const tab = sessionStorage.getItem('settlment_tab') || 'from';
    setCurrentTab(tab);
  };

  const getData = async () => {
    const res = await pound.getStatisticsData();

    if (res.status === 0) {
      setTotal(res.result);
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };
  return (
    <Layout {...routeView}>
      <div className={styles.panels}>
        <Panel style={{ flex: 1 }}>
          <div className="header" style={{ backgroundImage: `url(${Image.SettlmentLeftBg})` }}>
            <img src={Icon.SettlmentLeftIcon} alt="" />
            <span className="title">待审核面板</span>
          </div>
          <div className="content">
            <div className={styles['content-item']}>
              <div className={styles.status}>发货</div>
              <div className={styles.count}>
                磅单数量<span className={styles.num}>{total.waitApproveCountSend}</span>单
              </div>
              <div className={styles.btn}>
                <Button type="primary" onClick={() => router.push('/poundManagement/settlment/fromCheck')}>
                  去审核
                </Button>
              </div>
            </div>
            <div className={styles['content-item']}>
              <div className={styles.status}>收货</div>
              <div className={styles.count}>
                磅单数量<span className={styles.num}>{total.waitApproveCountReceive}</span>单
              </div>
              <div className={styles.btn}>
                <Button type="primary" onClick={() => router.push('/poundManagement/settlment/toCheck')}>
                  去审核
                </Button>
              </div>
            </div>
          </div>
        </Panel>
        <Panel style={{ flex: 1, marginLeft: 24 }}>
          <div className="header" style={{ backgroundImage: `url(${Image.SettlmentRightBg})` }}>
            <img src={Icon.SettlmentRightIcon} alt="" />
            <span className="title">已审核面板</span>
          </div>
          <div className="content">
            <div className={styles['content-item']}>
              <div className={styles.status}>发货</div>
              <div className={styles.count}>
                磅单数量<span className={styles.num}>{total.approvedCountSend}</span>单
              </div>
              <div className={styles.btn}>
                <Button type="primary" onClick={() => router.push('/poundManagement/settlment/fromView')}>
                  查看
                </Button>
              </div>
            </div>
            <div className={styles['content-item']}>
              <div className={styles.status}>收货</div>
              <div className={styles.count}>
                磅单数量<span className={styles.num}>{total.approvedCountReceive}</span>单
              </div>
              <div className={styles.btn}>
                <Button type="primary" onClick={() => router.push('/poundManagement/settlment/toView')}>
                  查看
                </Button>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <Content style={{ marginTop: 24, position: 'relative', marginBottom: 56 }}>
        <header className="tab-header">
          <div className={`tab-item ${currentTab === 'from' ? 'active' : ''}`} onClick={() => onChangeTab('from')}>
            发货结算
          </div>
          <div className={`tab-item ${currentTab === 'to' ? 'active' : ''}`} onClick={() => onChangeTab('to')}>
            收货结算
          </div>
          <div className={`tab-item ${currentTab === 'list' ? 'active' : ''}`} onClick={() => onChangeTab('list')}>
            结算单列表
          </div>
          <div className={`tab-item ${currentTab === 'set' ? 'active' : ''}`} onClick={() => onChangeTab('set')}>
            设置
          </div>
        </header>
        <section style={{ margiBottom: 50 }}>
          {currentTab === 'from' && <FromSettlment isServer={props.isServer} onReload={getData} />}
          {currentTab === 'to' && <ToSettlment isServer={props.isServer} onReload={getData} />}
          {currentTab === 'list' && <SettlmentList isServer={props.isServer} />}
          {currentTab === 'set' && <SettlmentSet isServer={props.isServer} />}
          {currentTab === '' && (
            <div className={styles['loading-component']}>
              <Spin size="large" tip="加载中..." />
            </div>
          )}
        </section>
      </Content>
    </Layout>
  );
};
Settlment.getInitialProps = async props => {
  const { isServer } = props;
  return { isServer };
};

export default Settlment;
