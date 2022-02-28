import { useState, useEffect, useCallback } from 'react';
import router from 'next/router';
import moment from 'moment';
import { Layout, Search, Content, Status, Ellipsis } from '@components';
import { Input, Button, Table, message, DatePicker, Select } from 'antd';
import { keepState, getState, clearState, Format } from '@utils/common';
import { railWay, downLoadFile } from '@api';
import LoadingBtn from '@components/LoadingBtn';
import { DateRangePicker } from '@components';
import { WhiteList } from '@store';

const { Option } = Select;
const RailWay = props => {
  const routeView = {
    title: '开票专线',
    pageKey: 'mine',
    longKey: 'railWay.mine',
    breadNav: '专线管理.开票专线',
    pageTitle: '开票专线',
  };

  // 查询条件
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    begin: null,
    end: null,
    fromCompany: '',
    toCompany: '',
    goodsType: '',
    payPath: undefined,
    isFleet: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [dataList, setDataList] = useState({});
  const [disShowType, setDisShowType] = useState(false);
  const [disShowPay, setDisShowPay] = useState(false);

  const { whiteList } = WhiteList.useContainer();

  // 列数据
  const columns = [
    {
      title: '专线类型',
      dataIndex: 'fleetCaptionId',
      key: 'fleetCaptionId',
      width: 120,
      render: value => <span>{value ? '车队单' : '个人单'}</span>,
    },
    {
      title: '发货企业',
      dataIndex: 'fromCompany',
      key: 'fromCompany',
      width: 150,
      render: value => <Ellipsis value={value} width={130} />,
    },
    {
      title: '收货企业',
      dataIndex: 'toCompany',
      key: 'toCompany',
      width: 150,
      render: value => <Ellipsis value={value} width={130} />,
    },
    {
      title: '货品名称',
      dataIndex: 'goodsType',
      key: 'goodsType',
      width: 120,
      render: value => <Ellipsis value={value} width={100} />,
    },
    {
      title: `结算单价${whiteList.luQiao ? '' : '(元/吨)'}`,
      dataIndex: 'unitPrice',
      key: 'unitPriceid',
      align: 'right',
      width: 120,
      render: (value, record, index) => {
        return <span>{Format.price((value + record.unitInfoFee).toFixed(0))}</span>;
      },
    },
    {
      title: '付款方式',
      dataIndex: 'payPath',
      key: 'payPath',
      width: 120,
      render: (value, record, index) => <span>{record.fleetCaptionId ? (value ? '延时付' : '即时付') : '-'}</span>,
    },
    {
      title: '车队长',
      dataIndex: ['fleetCaption', 'name'],
      key: 'fleetCaption.name',
      width: 120,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
      render: value => <Ellipsis value={value} width={130} />,
    },
    {
      title: '专线状态',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render(value) {
        return <Status.Route code={value} />;
      },
    },
    {
      title: '发货净重(吨)',
      dataIndex: 'goodsWeight',
      key: 'goodsWeight',
      align: 'right',
      width: 140,
      render: Format.weight,
    },
    {
      title: '收货净重(吨)',
      dataIndex: 'arrivalGoodsWeight',
      key: 'arrivalGoodsWeight',
      align: 'right',
      width: 140,
      render: Format.weight,
    },
    {
      title: '待支付车次',
      dataIndex: 'waitPayNum',
      key: 'waitPayNum',
      align: 'right',
      width: 150,
    },
    {
      title: '待支付运费(元)',
      dataIndex: 'waitPayPrice',
      key: 'waitPayPrice',
      align: 'right',
      width: 150,
      render: (value, record, index) => {
        return <span>{Format.price((value + record.waitPayInfoFee).toFixed(0))}</span>;
      },
    },
    {
      title: '已支付车次',
      dataIndex: 'payNum',
      key: 'payNum',
      align: 'right',
      width: 150,
    },
    {
      title: '已支付运费(元)',
      dataIndex: 'payPrice',
      key: 'payPrice',
      align: 'right',
      width: 150,
      render: (value, record, index) => {
        return <span>{Format.price((value + record.payInfoFee).toFixed(0))}</span>;
      },
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
      width: 80,
      align: 'right',
      fixed: 'right',
      render: (value, record, index) => (
        <Button
          size="small"
          type="link"
          key="detail"
          onClick={() => router.push(`/railWay/mine/detail?id=${record.id}`)}>
          详情
        </Button>
      ),
    },
  ];

  // 初始化
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

  //专线类型
  const handleChangeRouteType = useCallback(e => {
    const isFleet = e;
    e === '0' ? setDisShowPay(true) : setDisShowPay(false);
    setQuery(() => ({ ...query, isFleet, payPath: undefined }));
  });

  //付款方式
  const handleChangePayType = useCallback(e => {
    const payPath = e;
    e === undefined ? setDisShowType(false) : setDisShowType(true);
    setQuery(() => ({ ...query, payPath, isFleet: '1' }));
  });

  //  查询
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
      payPath: undefined,
      isFleet: undefined,
    };
    setQuery(query);
    getRemoteData(query);
    setDisShowPay(false);
    setDisShowType(false);
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
  // 导出
  const handleExport = useCallback(async () => {
    if (dataList && dataList.data && dataList.data.length > 0) {
      setExportLoading(true);
      const { userId } = localStorage;
      const params = {
        fromCompany: query.fromCompany,
        toCompany: query.toCompany,
        goodsType: query.goodsType,
        createBegin: query.begin,
        createEnd: query.end,
        userId,
        onlyPound: 0,
        dump: true,
        payPath: query.payPath,
        isFleet: query.isFleet,
      };

      const res = await railWay.getDataList({ params });

      await downLoadFile(res.result, '开票专线列表');

      setExportLoading(false);
    } else {
      message.warning('数据导出失败，原因:没有数据可以导出');
    }
  }, [dataList]);

  /**
   * 查询数据
   * @param {Object} param0
   */
  const getRemoteData = async ({ fromCompany, toCompany, goodsType, page, pageSize, begin, end, payPath, isFleet }) => {
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
      onlyPound: 0,
      payPath,
      isFleet,
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
          payPath,
          isFleet,
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
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" onClick={() => router.push('/railWay/mine/create')}>
              创建专线
            </Button>
          </div>
          <Search onSearch={handleSearch} onReset={handleReset} exportLoading={exportLoading} onExport={handleExport}>
            <Search.Item label="创建时间" br>
              {/* <DateRangePicker
                // quickBtn={true}
                style={{ width: 376 }}
                value={{ begin: query.begin, end: query.end }}
                dateStatus={query.dateStatus}
                onChange={handleChangeDate}></DateRangePicker> */}
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
            <Search.Item label="专线类型">
              <Select
                value={query.isFleet}
                allowClear
                disabled={disShowType}
                placeholder="请选择专线类型"
                style={{ width: '100%' }}
                onChange={handleChangeRouteType}>
                <Option value="1">车队单</Option>
                <Option value="0">个人单</Option>
              </Select>
            </Search.Item>
            <Search.Item label="付款方式">
              <Select
                value={query.payPath}
                allowClear
                disabled={disShowPay}
                placeholder="请选择付款方式"
                style={{ width: '100%' }}
                onChange={handleChangePayType}>
                <Option value="0">即时付</Option>
                <Option value="1">延时付</Option>
              </Select>
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
              showSizeChanger: true,
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

RailWay.getInitialProps = async props => {
  const { isServer } = props;
  return { isServer };
};
export default RailWay;
