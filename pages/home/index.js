import { useState, useEffect } from 'react';
import { Layout, Content, TopMessage, Icon } from '@components';
import { Row, Col, Radio, Button } from 'antd';
import styles from '@styles/home.less';
import RouteTable from '@components/Home/route';
import StatisticalEcharts from '@components/Home/echarts';
import Trace from '@components/Home/trace';

import { getRoute, getStatistics, getStatisticsTrend, getProcessTruckers } from '@api';
import router from 'next/router';
import { Menu, User } from '@store';
const Home = () => {
  const routeView = {
    title: '概览',
    pageKey: 'home',
    longKey: 'home',
    breadNav: '',
  };
  const { userInfo } = User.useContainer();
  const { menuList } = Menu.useContainer();
  const [loading, setLoading] = useState(true);
  const [routeList, setRouteList] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [statisticsTrend, setStatisticsTrend] = useState({});
  // const [userInfo, setUserInfo] = useState({});
  const [truckers, setTruckers] = useState({});
  const [cache, setCache] = useState(() => {
    return {
      statisticsTrend_week: {},
      statisticsTrend_month: {},
    };
  });

  useEffect(() => {
    const { userId, companyName } = localStorage;
    setDataList();
  }, []);

  const setDataList = async () => {
    const [route, statistics, trend, truckers] = await Promise.all([
      _getRoute(),
      _getStatistics(),
      _getStatisticsTrend(),
      _getProcessTruckers(),
    ]);

    if (route.status === 0) setRouteList(route.result.data);

    if (statistics.status === 0) setStatistics(statistics.result);
    if (trend.status === 0) setStatisticsTrend(trend.result);
    if (truckers.status === 0) setTruckers(truckers.result);
    if (trend.status === 0) {
      setCache(cache => {
        return {
          statisticsTrend_week: trend.result,
        };
      });
    }

    setLoading(false);
  };

  // 专线统计
  const _getRoute = () => {
    const { userId } = localStorage;
    return getRoute({
      params: { userId },
    });
  };

  // 专线统计
  const _getStatistics = () => {
    return getStatistics();
  };

  // 货运统计
  const _getStatisticsTrend = (type = 'week') => {
    const params = {
      type,
    };
    return getStatisticsTrend({ params });
  };

  // 运货单
  const _getProcessTruckers = () => {
    const params = {
      status: 'HOME',
    };
    return getProcessTruckers({ params });
  };

  // 货运统计时间切换
  const statisticalChange = e => {
    const value = e.target.value;
    if (cache[`statisticsTrend_${value}`]) {
      setStatisticsTrend(cache[`statisticsTrend_${value}`]);
    } else {
      _getStatisticsTrend(value).then(res => {
        setCache(cache => {
          return {
            ...cache,
            [`statisticsTrend_${value}`]: res.result,
          };
        });
        setStatisticsTrend(res.result);
      });
    }
  };

  return (
    <Layout {...routeView}>
      <TopMessage />
      {/* {menuList.findIndex(item => item.module === 'finance') !== -1 && <TopMessage />} */}
      <Row gutter={24}>
        <Col span={8}>
          <Content>
            <header style={{ borderBottom: 0 }}>余额</header>
            <section>
              <div className={styles.wallet}>
                <img src={Icon.Wallet} />
                <span className={styles.money}>{userInfo.wallet ? (userInfo.wallet / 100).toFixed(2) : 0}</span>
                <span className={styles.unit}>元</span>
              </div>
            </section>
          </Content>
        </Col>
        <Col span={16}>
          <Content>
            <header style={{ borderBottom: 0 }}>专线统计</header>
            <section>
              <div className={styles.statistics}>
                <div className={styles.day}>
                  <img src={Icon.Day} />
                  <div className={styles.dataInfo}>
                    <div>今日创建</div>
                    <span className={styles.num}>{statistics.day || 0}</span>
                    <span className={styles.unit}>条</span>
                  </div>
                </div>
                <div className={styles.month}>
                  <img src={Icon.Month} />
                  <div className={styles.dataInfo}>
                    <div>本月创建</div>
                    <span className={styles.num}>{statistics.month || 0}</span>
                    <span className={styles.unit}>条</span>
                  </div>
                </div>
                <div className={styles.total}>
                  <img src={Icon.Cumulative} />
                  <div className={styles.dataInfo}>
                    <div>累计创建</div>
                    <span className={styles.num}>{statistics.total || 0}</span>
                    <span className={styles.unit}>条</span>
                  </div>
                </div>
              </div>
            </section>
          </Content>
        </Col>
      </Row>
      <Row gutter={24} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Content>
            <header style={{ borderBottom: 0 }}>
              <span>最新专线</span>
              {menuList.findIndex(item => item.module === 'railWay') !== -1 && (
                <Button
                  style={{
                    float: 'right',
                  }}
                  type="link"
                  onClick={() => router.push('/railWay/mine/create')}>
                  创建专线
                </Button>
              )}
            </header>
            <section>
              <RouteTable dataList={routeList} loading={loading}></RouteTable>
            </section>
          </Content>
        </Col>
        <Col span={12}>
          <Content>
            <header style={{ borderBottom: 0 }}>
              <span>货运统计</span>
              <Radio.Group
                defaultValue="week"
                onChange={statisticalChange}
                style={{ float: 'right', userSelect: 'none', color: 'rgba(0,0,0,.65)' }}>
                <Radio.Button value="week" style={{ fontSize: 10 }}>
                  过去一周
                </Radio.Button>
                <Radio.Button value="month" style={{ fontSize: 10 }}>
                  过去一个月
                </Radio.Button>
              </Radio.Group>
            </header>
            <section>
              <StatisticalEcharts data={statisticsTrend}></StatisticalEcharts>
            </section>
          </Content>
        </Col>
      </Row>
      <Content style={{ marginTop: 24 }}>
        <header style={{ borderBottom: 0 }}>货运追踪</header>
        <section>
          <Trace truckers={truckers} loading={loading} />
        </section>
      </Content>
    </Layout>
  );
};

export default Home;
