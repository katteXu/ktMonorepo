import { useState, useEffect, useCallback, useRef } from 'react';
import { ChildTitle, Content, Search } from '@components';
import { Line } from '@components/Charts';
import Balance from '@components/Capital/balance';
import PrepaidFreightFrom from '@components/Capital/prepaidFreightFrom';
import { capital } from '@api';
import { Row, Col, DatePicker, Empty, Modal, message, Input, Table } from 'antd';
import moment from 'moment';
import styles from './finace.less';
import { keepState } from '@utils/common';
import * as echarts from 'echarts';

const columns = [
  {
    title: '车队长姓名',
    dataIndex: ['fcInfo', 'name'],
    key: 'fcInfo.name',
    width: '200px',
    render: value => {
      return value || '-';
    },
  },
  {
    title: '手机号',
    dataIndex: ['fcInfo', 'username'],
    key: 'fcInfo.username',
    width: '200px',
  },
  {
    title: '预付余额（元）',
    dataIndex: 'remainAmount',
    key: 'remainAmount',
    width: '200px',
    align: 'right',
    render(v) {
      const value = `${(v / 100).toFixed(2)}`;
      return <span>{value}</span> || '-';
    },
  },
  {
    title: '预付总额',
    dataIndex: 'sumAmount',
    key: 'sumAmount',
    width: '200px',
    align: 'right',
    render: v => {
      const value = `${(v / 100).toFixed(2)}`;
      return <span>{value}</span> || '-';
    },
  },
];

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [lineData, setLineData] = useState({});
  const [lineX, setLineX] = useState([]);
  const [prePay, setPrePay] = useState(0);
  const [emptyChart, setEmptyChart] = useState('');
  const [userWallet, setUserWallet] = useState(0);
  const [visible, setVisible] = useState(false);

  const [list, setList] = useState([]);
  const [count, setCount] = useState(0);
  useEffect(() => {
    // 获取持久化数据
    Promise.all([getPrePayList(), getLineData()]).then(([resUser, resLine]) => {
      const key = moment().format('YYYY-MM');
      const { data, xAxis } = formatLineData({ [key]: resLine.result });
      setLineX(xAxis);
      setLineData(data);
      setList(resUser.result.data);
      setPrePay(resUser.result.totalAmount);
      setUserWallet((resUser.result.userWallet / 100).toFixed(2));
      setLoading(false);
    });
  }, []);

  // 查询条件
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    fcName: '',
  });

  const queryRef = useRef(query);

  const setData = async ({ pageSize, page, fcName }) => {
    setLoading(true);
    const params = {
      limit: pageSize,
      page,
      fcName: fcName || undefined,
    };
    const { status, result, detail, description } = await capital.prePayList({
      params,
    });
    if (!status) {
      setCount(result.count);
      setList(result.data);
      setPrePay(result.totalAmount);
      setLoading(false);
      setUserWallet((result.userWallet / 100).toFixed(2));

      keepState({
        query: {
          page,
          pageSize: pageSize,
          fcName,
        },
      });
    } else {
      message.error(detail || description);
      setLoading(false);
    }
  };

  // 重置
  const resetFilter = useCallback(() => {
    const query = {
      page: 1,
      pageSize: 10,
      fcName: '',
    };
    setQuery(query);
    setData(query);
  }, []);

  //  查询
  const search = useCallback(() => {
    setQuery({ ...query, page: 1 });
    setData({ ...query, page: 1 });
  }, [query]);

  // 翻页
  const onChangePage = useCallback(
    page => {
      setQuery({ ...query, page });
      setData({ ...query, page });
    },
    [list]
  );

  // 切页码
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      setData({ ...query, page: 1, pageSize });
    },
    [list]
  );

  // 车队长
  const handleChangeName = useCallback(e => {
    const fcName = e.target.value;
    setQuery(() => ({ ...query, fcName }));
  });

  useEffect(() => {
    queryRef.current = query;
  }, [list]);

  // 获取预付余额
  const getPrePayList = () => {
    return capital.prePayList();
  };

  // 获取折线图数据
  const getLineData = (date = moment().format('YYYY-MM-DD')) => {
    const params = {
      date,
    };
    return capital.prePayLineChart({ params });
  };

  // 设置折线图
  const setLineDataInfo = async (date, key) => {
    const dateString = date.format('YYYY-MM-01');
    const res = await getLineData(dateString);
    const { data, xAxis } = formatLineData({ [key]: res.result });
    setLineData(() => []);
    setLineX(() => []);
    setEmptyChart(res.result.length === 0);
    setLineX(() => xAxis);
    setLineData(() => data);
  };

  // 格式化折线图数据
  const formatLineData = data => {
    if (Object.keys(data).length !== 0) {
      const xAxis = [];
      let result = {};
      Object.keys(data).forEach((key, index) => {
        // 生成x轴坐标
        if (index === 0) {
          xAxis.push(...data[key].map(item => moment(item.time).format('M.D')));
        }
        result[key] = data[key].map(item => item.sumAmount / 100);
      });
      return { data: result, xAxis };
    }
    return { data: {}, xAxis: [] };
  };

  const refresh = () => {
    setLineDataInfo(moment(), moment().format('YYYY-MM'));
    setData({ ...query, page: 1 });
  };

  const lineStyle = {
    // 系列级个性化折线样式
    width: 2,
    type: 'solid',
    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
      {
        offset: 0,
        color: '#007AFF',
      },
      {
        offset: 1,
        color: '#00B2FF',
      },
    ]), //线条渐变色
  };
  return (
    <>
      <Row gutter={24} style={{ padding: '16px 28px' }}>
        <Col span={9} style={{ padding: 0 }}>
          <div className={styles.bgWallet}>
            <Balance wallet={prePay} loading={loading} prepaidFreight={() => setVisible(true)} prepaid={true}>
              余额
            </Balance>
          </div>
        </Col>
        <Col span={15} style={{ paddingLeft: 16, paddingRight: 0 }}>
          <div className={styles.rightLine}>
            <div
              style={{
                padding: 16,
                paddingTop: 12,
                lineHeight: '32px',
                fontSize: '16px',
                fontWeight: 'bold',
              }}>
              预付账单
              <DatePicker.MonthPicker
                style={{ float: 'right' }}
                onChange={setLineDataInfo}
                allowClear={false}
                defaultValue={moment()}
                disabledDate={date => date > moment()}
              />
            </div>
            <section style={{ padding: '0px 16px 16px' }}>
              {/* <div className={styles.sumAmount}>
                ￥{Format.price(sumAmount)}
                <span style={{ fontSize: 12, marginLeft: 2 }}>元</span>
              </div> */}
              {emptyChart ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                <Line size={170} data={lineData} xAxis={lineX} customlineStyle={lineStyle} />
              )}
            </section>
          </div>
        </Col>
      </Row>

      <Content>
        <section style={{ paddingTop: 8 }}>
          <div style={{ marginBottom: 16, fontSize: 16, fontWeight: 'bold' }}>
            <ChildTitle className="hei14">预付明细</ChildTitle>
          </div>
          <Search onSearch={search} onReset={resetFilter} simple>
            <Search.Item label="车队长姓名">
              <Input allowClear placeholder="请输入车队长姓名" value={query.fcName} onChange={handleChangeName} />
            </Search.Item>
          </Search>
          <Table
            style={{ marginTop: 16 }}
            loading={loading}
            dataSource={list}
            columns={columns}
            rowKey={record => record.fcInfo.id}
            pagination={{
              onChange: onChangePage,
              pageSize: query.pageSize,
              current: query.page,
              total: count,
              onShowSizeChange: onChangePageSize,
            }}
          />
        </section>
      </Content>
      <Modal visible={visible} title="预付运费" onCancel={() => setVisible(false)} footer={null}>
        <PrepaidFreightFrom onCancel={() => setVisible(false)} amount={userWallet} refresh={refresh} />
      </Modal>
    </>
  );
};

export default Index;
