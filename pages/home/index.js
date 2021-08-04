import { useState, useEffect } from 'react';
import { Layout, Icon, Block } from '@components';
import { Radio, Button } from 'antd';
import styles from './styles.less';
import Trace from '@components/Home/trace';
import Message from '@components/Home/message';
import { getProcessTruckers } from '@api';
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
  const [truckers, setTruckers] = useState({});

  // 余额显示
  const [showMoney, setShowMoney] = useState(true);
  const [cache, setCache] = useState(() => {
    return {
      pound: {
        // yesterday: {},
        // lastweek: {},
        // lastmonth: {},
      },
      transport: {
        // yesterday: {},
        // lastweek: {},
        // lastmonth: {},
      },
    };
  });

  useEffect(() => {
    const { id, companyName } = userInfo;
    setDataList();
    _czc.push(['_trackEvent', `概览`, `${companyName}${id}`, `${router.router.pathname}`]);
  }, []);

  const setDataList = async () => {
    const [truckers] = await Promise.all([_getProcessTruckers()]);

    if (truckers.status === 0) setTruckers(truckers.result);

    setLoading(false);
  };

  // 运货单
  const _getProcessTruckers = () => {
    const params = {
      status: 'HOME',
    };
    return getProcessTruckers({ params });
  };

  // 过磅概况
  const [poundDate, setPoundDate] = useState('yesterday');
  const [pound, setPound] = useState({
    from: { num: '10', weight: '10.00' },
    to: { num: '10', loseWeight: '10.00', fromWeight: '10.00', toWeight: '10.00' },
  });
  const handleChangePound = e => {
    const date = e.target.value;
    setPoundDate(date);
  };
  const getPoundData = async date => {
    return {};
  };
  useEffect(() => {
    // 获取缓存的数据
    const cache_pound = cache.pound[poundDate];
    // 如果有缓存的数据则直接赋值
    if (cache_pound) {
      setPound(cache_pound);
    } else {
      // todo 接口赋值
      // getPoundData.then(res => {
      //   setPound(res);
      // });
    }
  }, [poundDate]);

  // 运单概况
  const [transportDate, setTransportDate] = useState('yesterday');
  const [transport, setTransport] = useState({
    num: '91',
    price: '33.23',
    fromWeight: '123.45',
    toWeight: '321.22',
  });
  const handleChangeTransport = e => {
    const date = e.target.value;
    setTransportDate(date);
  };
  useEffect(() => {}, [transportDate]);

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
              {showMoney ? (
                <span className={styles.money}>{userInfo.wallet ? (userInfo.wallet / 100).toFixed(2) : 0}</span>
              ) : (
                <span className={styles.money}>******</span>
              )}
              <Button type="primary" onClick={() => router.push('/finance/fund')}>
                查看明细
              </Button>
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
          <Message />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.col} style={{ flex: 2, flexBasis: 16 }}>
          <Block
            title="过磅概况"
            right={
              <>
                <div>
                  <Button type="link" size="small" onClick={() => router.push('/poundManagement/poundReport')}>
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
                    onChange={handleChangePound}
                  />
                </div>
              </>
            }>
            <div className={styles.dbcontent}>
              <div className={styles['with-header']}>
                <div className={styles.header}>
                  <img src={Icon.FromIcon} />
                  发货
                </div>
                <div className={styles.content2}>
                  <div className={styles.ctx}>
                    <div className={styles.title}>磅单数(单)</div>
                    <div className={styles.num}>{pound.from.num}</div>
                  </div>
                  <div className={styles.ctx}>
                    <div className={styles.title}>发货重量(吨)</div>
                    <div className={styles.num}>{pound.from.weight}</div>
                  </div>
                </div>
              </div>
              <div className={styles['with-header']}>
                <div className={styles.header}>
                  <img src={Icon.ToIcon} />
                  收货
                </div>
                <div className={styles.content2}>
                  <div className={styles.ctx}>
                    <div className={styles.title}>磅单数(单)</div>
                    <div className={styles.num}>{pound.to.num}</div>
                  </div>
                  <div className={styles.ctx}>
                    <div className={styles.title}>路损(吨)</div>
                    <div className={styles.num}>{pound.to.loseWeight}</div>
                  </div>
                </div>
                <div className={styles.content2}>
                  <div className={styles.ctx}>
                    <div className={styles.title}>发货重量(吨)</div>
                    <div className={styles.num}>{pound.to.fromWeight}</div>
                  </div>
                  <div className={styles.ctx}>
                    <div className={styles.title}>收货重量(吨)</div>
                    <div className={styles.num}>{pound.to.toWeight}</div>
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
                  onChange={handleChangeTransport}
                />
              </div>
            }>
            <div className={styles['no-header']}>
              <div className={styles.content2}>
                <div className={styles.ctx}>
                  <div className={styles.title}>运单数(单)</div>
                  <div className={styles.num}>{transport.num}</div>
                </div>
                <div className={styles.ctx}>
                  <div className={styles.title}>运费(元)</div>
                  <div className={styles.num}>{transport.price}</div>
                </div>
              </div>
              <div className={styles.content2}>
                <div className={styles.ctx}>
                  <div className={styles.title}>发货重量(吨)</div>
                  <div className={styles.num}>{transport.fromWeight}</div>
                </div>
                <div className={styles.ctx}>
                  <div className={styles.title}>收货重量(吨)</div>
                  <div className={styles.num}>{transport.toWeight}</div>
                </div>
              </div>
            </div>
          </Block>
        </div>
      </div>
      <div className={styles.row}>
        <Block title="常用功能">
          <div className={styles['fn-items']}>
            <div className={styles.item} onClick={() => router.push('/railWay/mine/create')}>
              <img src={Icon.DeployIcon} alt="" />
              发布专线
            </div>
            <div className={styles.item} onClick={() => router.push('/transportManagement/transportList')}>
              <img src={Icon.TransportViewIcon} alt="" />
              运单查看
            </div>
            <div className={styles.item} onClick={() => router.push('/transportManagement/routeList')}>
              <img src={Icon.RailWayIcon} alt="" />
              按专线结算
            </div>
          </div>
          <div className={styles['fn-items']}>
            <div className={styles.item} onClick={() => router.push('/finance/fund')}>
              <img src={Icon.RecordIcon} alt="" />
              交易记录
            </div>
            <div className={styles.item} onClick={() => router.push('/finance/main/billing?mode=edit')}>
              <img src={Icon.BillIcon} alt="" />
              索取发票
            </div>
            <div className={styles.item}></div>
          </div>
        </Block>
      </div>
      <div className={styles.row}>
        <Block title="运货追踪">
          <Trace truckers={truckers} loading={loading} />
        </Block>
      </div>
    </Layout>
  );
};

// 日期选择组件
const DateBtnGroup = props => {
  const { options, onChange } = props;

  return (
    <Radio.Group onChange={onChange} size="small" defaultValue="yesterday">
      {options.map(item => (
        <Radio.Button value={item.value}>{item.text}</Radio.Button>
      ))}
    </Radio.Group>
  );
};
export default Home;
