import { useState, useCallback, useEffect } from 'react';
import { Input, Button, Table, message, DatePicker } from 'antd';
import { Layout, Search, Content, Ellipsis, DateRangePicker } from '@components';
import { railWay } from '@api';
import { keepState, getState, clearState, Format } from '@utils/common';
import router from 'next/router';
import moment from 'moment';

const PoundRailWay = props => {
  const routeView = {
    title: '撮合专线',
    pageKey: 'match',
    longKey: 'railWay.match',
    breadNav: '专线管理.撮合专线',
    pageTitle: '撮合专线',
  };

  const columns = [
    {
      title: '发货企业',
      dataIndex: 'fromCompany',
      key: 'fromCompany',
      width: 150,
      render: value => <Ellipsis value={value} width={150} />,
    },
    {
      title: '收货企业',
      dataIndex: 'toCompany',
      key: 'toCompany',
      width: 150,
      render: value => <Ellipsis value={value} width={150} />,
    },
    {
      title: '货品名称',
      dataIndex: 'goodsType',
      key: 'goodsType',
      width: 120,
      render: value => <Ellipsis value={value} width={150} />,
    },
    {
      title: '运费单价(元/吨)',
      dataIndex: 'unitPrice',
      key: 'unitPriceid',
      align: 'right',
      width: 130,
      render: Format.price,
    },
    {
      title: '是否打印',
      dataIndex: 'printPoundBill',
      key: 'printPoundBill',
      width: 110,
      render: value => (value ? '打印' : '不打印'),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
      render: value => <Ellipsis value={value} width={150} />,
    },
    {
      title: '创建时间',
      dataIndex: 'createAt',
      key: 'createAt',
      width: 200,
    },
    {
      title: '操作',
      dataIndex: 'ctrl',
      key: 'ctrl',
      fixed: 'right',
      align: 'right',
      width: 100,
      render: (value, record, index) => {
        return (
          <Button size="small" type="link" key="detail" onClick={() => showDetail(record)}>
            详情
          </Button>
        );
      },
    },
  ];

  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    begin: null,
    end: null,
    fromCompany: '',
    toCompany: '',
    goodsType: '',
  });

  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState({});

  useEffect(() => {
    const { isServer } = props;
    if (isServer) {
      clearState();
    }
    // 获取持久化数据
    const state = getState().query;
    setQuery(state);
    getRemoteData(state);
  }, []);

  // 日期输入
  // 日期输入
  const handleChangeDate = useCallback((value, dateStatus) => {
    const _begin = value ? moment(value[0]).format('YYYY-MM-DD HH:mm:ss') : undefined;
    const _end = value ? moment(value[1]).format('YYYY-MM-DD HH:mm:ss') : undefined;

    setQuery(() => ({ ...query, begin: _begin, end: _end, dateStatus }));
  });

  // 发货企业
  const handleChangeFromCompany = useCallback(e => {
    const fromCompany = e.target.value;
    setQuery(() => ({ ...query, fromCompany }));
  });

  // 收货企业
  const handleChangeToCompany = useCallback(e => {
    const toCompany = e.target.value;
    setQuery(() => ({ ...query, toCompany }));
  });

  // 货品名称
  const handleChangeGoodsType = useCallback(e => {
    const goodsType = e.target.value;
    setQuery(() => ({ ...query, goodsType }));
  });

  // 查询
  const handleSearch = useCallback(() => {
    setQuery({ ...query, page: 1 });
    getRemoteData({ ...query, page: 1 });
  }, [query]);

  // 重置
  const handleReset = useCallback(() => {
    const query = {
      page: 1,
      pageSize: 10,
      begin: null,
      end: null,
      fromCompany: '',
      toCompany: '',
      goodsType: '',
    };
    setQuery(query);
    getRemoteData(query);
  }, []);

  // 分页
  const onChangePage = useCallback(
    (page, pageSize) => {
      setQuery({ ...query, page, pageSize });
      getRemoteData({ ...query, page, pageSize });
    },
    [dataList]
  );

  // 切页码
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      getRemoteData({ ...query, page: 1, pageSize });
    },
    [dataList]
  );

  // 进入详情
  const showDetail = ({ id }) => {
    router.push({
      pathname: '/railWay/match/detail',
      query: {
        id,
      },
    });
  };

  /**
   * 查询数据
   * @param {Object} param0
   */
  const getRemoteData = async ({ fromCompany, toCompany, goodsType, page, pageSize, begin, end }) => {
    setLoading(true);

    const { userId } = localStorage;
    const params = {
      fromCompany,
      toCompany,
      goodsType,
      limit: pageSize,
      page,
      createBegin: begin,
      createEnd: end,
      userId,
      routeKind: 1,
    };

    const res = await railWay.getDataList({ params });

    if (res.status === 0) {
      setDataList(res.result);
      // 持久化状态
      keepState({
        query: {
          fromCompany,
          toCompany,
          goodsType,
          page,
          pageSize,
          begin,
          end,
        },
      });
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };
  return (
    <Layout {...routeView}>
      <Content>
        <section>
          <Button type="primary" style={{ marginBottom: 16 }} onClick={() => router.push('/railWay/match/create')}>
            创建专线
          </Button>
          <Search onSearch={handleSearch} onReset={handleReset}>
            <Search.Item label="创建时间" br>
              <DatePicker.RangePicker
                style={{ width: 376 }}
                value={query.begin && query.end ? [moment(query.begin), moment(query.end)] : null}
                format="YYYY-MM-DD HH:mm:ss"
                showTime={{
                  defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                }}
                onChange={handleChangeDate}
              />
            </Search.Item>
            <Search.Item label="发货企业">
              <Input
                allowClear
                value={query.fromCompany}
                placeholder="请输入发货企业"
                onChange={handleChangeFromCompany}
              />
            </Search.Item>
            <Search.Item label="收货企业">
              <Input allowClear value={query.toCompany} placeholder="请输入收货企业" onChange={handleChangeToCompany} />
            </Search.Item>
            <Search.Item label="货品名称">
              <Input allowClear value={query.goodsType} placeholder="请输入货品名称" onChange={handleChangeGoodsType} />
            </Search.Item>
          </Search>
        </section>

        <section style={{ paddingTop: 0 }}>
          <Table
            loading={loading}
            dataSource={dataList.data}
            columns={columns}
            pagination={{
              onChange: onChangePage,
              pageSize: query.pageSize,
              current: query.page,
              total: dataList.count,
            }}
            scroll={{ x: 'auto' }}
          />
        </section>
      </Content>
    </Layout>
  );
};

PoundRailWay.getInitialProps = async props => {
  const { isServer } = props;
  return { isServer };
};

export default PoundRailWay;
