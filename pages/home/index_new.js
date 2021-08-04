import { useState, useEffect } from 'react';
import { Layout, Content, TopMessage, Icon, Block } from '@components';
import { Row, Col, Radio, Button } from 'antd';
// import styles from '@styles/home.less';
import styles from './styles.less';
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
  const [truckers, setTruckers] = useState({});

  // 余额显示
  const [showMoney, setShowMoney] = useState(true);
  const [cache, setCache] = useState(() => {
    return {
      statisticsTrend_week: {},
      statisticsTrend_month: {},
    };
  });

  useEffect(() => {
    const { id, companyName } = userInfo;
    setDataList();
    _czc.push(['_trackEvent', `概览`, `${companyName}${id}`, `${router.router.pathname}`]);
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
      <div className={styles.row}>
        <div className={styles.col}>
          <Block
            title="余额(元)"
            right={
              <div onClick={() => setShowMoney(!showMoney)} className={styles['show-btn']}>
                <img src={showMoney ? Icon.ShowIcon : Icon.HideIcon} />
              </div>
            }>
            <div className={styles.content1}>
              <span className={styles.money}>455.71</span>
              <Button type="primary">查看明细</Button>
            </div>
          </Block>
        </div>
        <div className={styles.col}>
          <Block title="待办事项">
            <div className={styles.content1}>
              <div className={styles.ctx}>
                <div className={styles.title}>待结算运单(单)</div>
                <div className={styles.num}>30</div>
              </div>
              <div className={styles.ctx}>
                <div className={styles.title}>待支付运单(单)</div>
                <div className={styles.num}>30</div>
              </div>
            </div>
          </Block>
        </div>
        <div className={styles.col}>
          <Block title="重要提醒"></Block>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.col} style={{ flex: 2, flexBasis: 16 }}>
          <Block
            title="过磅概况"
            right={
              <>
                <div>
                  <Button type="link" size="small">
                    查看报表
                  </Button>
                </div>
                <div className={styles['date-btn']}>
                  <DateBtnGroup
                    options={[
                      { text: '昨日', value: 'yesterday' },
                      { text: '上周', value: 'lastweek' },
                      { text: '上月', value: 'lastmonth' },
                    ]}
                    onChange={e => console.log(e.target.value)}
                  />
                </div>
              </>
            }>
            <div className={styles.dbcontent}>
              <div className={styles['with-header']}>
                <div className={styles.header}>发货</div>
                <div className={styles.content2}>
                  <div className={styles.ctx}>
                    <div className={styles.title}>磅单数(单)</div>
                    <div className={styles.num}>24</div>
                  </div>
                  <div className={styles.ctx}>
                    <div className={styles.title}>发货重量(吨)</div>
                    <div className={styles.num}>3232.12</div>
                  </div>
                </div>
              </div>
              <div className={styles['with-header']}>
                <div className={styles.header}>收货</div>
                <div className={styles.content2}>
                  <div className={styles.ctx}>
                    <div className={styles.title}>磅单数(单)</div>
                    <div className={styles.num}>24</div>
                  </div>
                  <div className={styles.ctx}>
                    <div className={styles.title}>路损(吨)</div>
                    <div className={styles.num}>343.43</div>
                  </div>
                </div>
                <div className={styles.content2}>
                  <div className={styles.ctx}>
                    <div className={styles.title}>发货重量(吨)</div>
                    <div className={styles.num}>2434.43</div>
                  </div>
                  <div className={styles.ctx}>
                    <div className={styles.title}>收货重量(吨)</div>
                    <div className={styles.num}>343.43</div>
                  </div>
                </div>
              </div>
            </div>
          </Block>
        </div>
        <div className={styles.col}>
          <Block
            title="运单概况"
            right={
              <div className={styles['date-btn']}>
                <DateBtnGroup
                  options={[
                    { text: '昨日', value: 'yesterday' },
                    { text: '上周', value: 'lastweek' },
                    { text: '上月', value: 'lastmonth' },
                  ]}
                  onChange={e => console.log(e.target.value)}
                />
              </div>
            }>
            <div className={styles['no-header']}>
              <div className={styles.content2}>
                <div className={styles.ctx}>
                  <div className={styles.title}>运单数(单)</div>
                  <div className={styles.num}>24</div>
                </div>
                <div className={styles.ctx}>
                  <div className={styles.title}>运费(元)</div>
                  <div className={styles.num}>343.43</div>
                </div>
              </div>
              <div className={styles.content2}>
                <div className={styles.ctx}>
                  <div className={styles.title}>发货重量(吨)</div>
                  <div className={styles.num}>2434.43</div>
                </div>
                <div className={styles.ctx}>
                  <div className={styles.title}>收货重量(吨)</div>
                  <div className={styles.num}>343.43</div>
                </div>
              </div>
            </div>
          </Block>
        </div>
      </div>
      <div className={styles.row}>
        <Block title="常用功能">
          <div></div>
        </Block>
      </div>
      <div className={styles.row}>
        <Block title="运货追踪"></Block>
      </div>
    </Layout>
  );
};

// 日期选择组件
const DateBtnGroup = props => {
  const { options, onChange } = props;

  return (
    <Radio.Group onChange={onChange} size="small">
      {options.map(item => (
        <Radio.Button value={item.value}>{item.text}</Radio.Button>
      ))}
    </Radio.Group>
  );
};
export default Home;
