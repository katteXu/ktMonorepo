/** @format */
// 按专线结算列表
import React, { useState, useEffect, useCallback } from 'react';
import { DatePicker, Input, Button, Table, message, Select } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import moment from 'moment';
import { Search, Msg, Ellipsis } from '@components';
import { keepState, getState, clearState, Format } from '@utils/common';
import { transportStatistics } from '@api';
import router from 'next/router';
const { Option } = Select;

const RailWaySettlementList = props => {
  const columns = [
    {
      title: '专线类型',
      dataIndex: 'fleetCaptionId',
      key: 'fleetCaptionId',
      width: 120,
      render: value => {
        return value ? '车队单' : '个人单';
      },
    },
    {
      title: '专线号',
      dataIndex: 'routeId',
      key: 'routeId',
      width: 150,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '发货企业',
      dataIndex: 'fromCompany',
      key: 'fromCompany',
      width: 180,
      render: value => <Ellipsis value={value} width={150} />,
    },
    {
      title: '收货企业',
      dataIndex: 'toCompany',
      key: 'toCompany',
      width: 180,
      render: value => <Ellipsis value={value} width={150} />,
    },
    {
      title: '货品名称',
      dataIndex: 'goodsType',
      key: 'goodsType',
      width: 150,
      render: value => <Ellipsis value={value} width={130} />,
    },
    {
      title: '运费单价(元)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 180,
      align: 'right',
      render: Format.price,
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
      dataIndex: 'fleetCaptainName',
      key: 'fleetCaptainName',
      width: 180,
      align: 'center',
      render: value => {
        return value || '-';
      },
    },
    {
      title: '待结算车次',
      dataIndex: 'waitPayCount',
      key: 'waitPayCount',
      align: 'center',
      width: 150,
    },
    {
      title: '预计运费(元)',
      dataIndex: 'waitPayPrice',
      key: 'waitPayPrice',
      width: 150,
      align: 'right',
      render: Format.price,
    },

    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
    },
    {
      title: '操作',
      dataIndex: 'ctrl',
      key: 'ctrl',
      width: 80,
      align: 'right',
      fixed: 'right',
      render: (value, record) => {
        return (
          <Button
            type="link"
            size="small"
            onClick={() => router.push(`/transport/settlement/railWaySettlement?id=${record.routeId}`)}>
            详情
          </Button>
        );
      },
    },
  ];

  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    begin: undefined,
    end: undefined,
    routeId: '',
    fromCompany: '',
    toCompany: '',
    fleetCaptainName: '',
    isFleet: undefined,
    payPath: undefined,
  });
  const [errRouteId, setRouteId] = useState('');
  const [disShowType, setDisShowType] = useState(false);
  const [disShowPay, setDisShowPay] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState({});
  const [total, setTotal] = useState({
    waitPaySum: 0,
    arrivalGoodsWeight: 0,
    goodsWeight: 0,
    orderCount: 0,
    railWayCount: 0,
  });
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
  const handleChangeDate = useCallback((value, string) => {
    const begin = value && value[0] && moment(value[0]).format('YYYY-MM-DD HH:mm:ss');
    const end = value && value[1] && moment(value[1]).format('YYYY-MM-DD HH:mm:ss');
    setQuery(() => ({ ...query, begin, end }));
  });

  // 专线号
  const handleChangeRouteId = useCallback(e => {
    // 校验为空
    if (e.target.value === '') {
      setQuery(() => ({ ...query, routeId: undefined }));
      return;
    }
    // 校验数字
    if (!Number(e.target.value)) {
      message.warn('专线号必须是数字');
    } else {
      const routeId = e.target.value;
      setQuery(() => ({ ...query, routeId }));
    }
  }, []);

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

  // 车队长
  const handleChangeFleetCaptainName = useCallback(e => {
    const fleetCaptainName = e.target.value;
    setQuery(() => ({ ...query, fleetCaptainName }));
  });

  // 运单类型
  const handleChangeIsFleet = useCallback(value => {
    const isFleet = value;
    value === '0' ? setDisShowPay(true) : setDisShowPay(false);

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
      routeId: undefined,
      fromCompany: '',
      toCompany: '',
      fleetCaptainName: '',
      isFleet: undefined,
      payPath: undefined,
    };
    setQuery(query);
    getRemoteData(query);
    setDisShowPay(false);
    setDisShowType(false);
  }, []);

  // 分页
  const onChangePage = useCallback(
    page => {
      setQuery({ ...query, page });
      getRemoteData({ ...query, page });
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

  /**
   * 查询数据
   * @param {Object} param0
   */
  const getRemoteData = async ({
    page,
    pageSize,
    begin,
    end,
    routeId,
    fromCompany,
    toCompany,
    fleetCaptainName,
    isFleet,
    payPath,
  }) => {
    setLoading(true);

    const params = {
      status: 'CHECKING',
      page,
      limit: pageSize,
      begin,
      end,
      routeId,
      fromCompany,
      toCompany,
      fleetCaptainName,
      isFleet,
      payPath,
    };

    const res = await transportStatistics.getWaitPayFleetTransportList({ params });

    if (res.status === 0) {
      const { waitPaySum, arrivalGoodsWeight, goodsWeight, count, transportCount } = res.result;

      setDataList(res.result);
      setTotal({
        waitPaySum,
        arrivalGoodsWeight,
        goodsWeight,
        orderCount: transportCount,
        railWayCount: count,
      });
      // 持久化状态
      keepState({
        query: {
          page,
          pageSize,
          begin,
          end,
          routeId,
          fromCompany,
          toCompany,
          fleetCaptainName,
          isFleet,
          payPath,
        },
      });
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };

  return (
    <>
      <Search onSearch={handleSearch} onReset={handleReset} simple>
        <Search.Item label="创建时间" br>
          <DatePicker.RangePicker
            value={query.begin && query.end ? [moment(query.begin), moment(query.end)] : undefined}
            showTime={{
              defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
            }}
            onChange={handleChangeDate}
            style={{ width: 400 }}
          />
        </Search.Item>
        <Search.Item label="专线号">
          <Input placeholder="请输入专线号" allowClear value={query.routeId || ''} onChange={handleChangeRouteId} />
        </Search.Item>
        <Search.Item label="发货企业">
          <Input placeholder="请输入发货企业" allowClear value={query.fromCompany} onChange={handleChangeFromCompany} />
        </Search.Item>
        <Search.Item label="收货企业">
          <Input placeholder="请输入收货企业" allowClear value={query.toCompany} onChange={handleChangeToCompany} />
        </Search.Item>
        <Search.Item label="车队长">
          <Input
            placeholder="请输入车队长姓名"
            allowClear
            value={query.fleetCaptainName}
            onChange={handleChangeFleetCaptainName}
          />
        </Search.Item>
        <Search.Item label="专线类型">
          <Select
            style={{ width: '100%' }}
            value={query.isFleet}
            placeholder="请选择专线类型"
            allowClear
            disabled={disShowType}
            onChange={handleChangeIsFleet}>
            <Select.Option label="0" key={0}>
              个人单
            </Select.Option>
            <Select.Option label="1" key={1}>
              车队单
            </Select.Option>
          </Select>
        </Search.Item>
        <Search.Item label="付款方式">
          <Select
            value={query.payPath}
            allowClear
            placeholder="请选择付款方式"
            style={{ width: '100%' }}
            disabled={disShowPay}
            onChange={handleChangePayType}>
            <Option value="0">即时付</Option>
            <Option value="1">延时付</Option>
          </Select>
        </Search.Item>
      </Search>
      <header style={{ padding: '12px 0', marginTop: 12, border: 0 }}>专线列表</header>
      <Msg>
        <span>
          专线数
          <span className="total-num">
            {!loading ? total.railWayCount || 0 : <LoadingOutlined style={{ fontSize: 20 }} />}
          </span>
          条
        </span>
        <span style={{ marginLeft: 32 }}>
          运单数
          <span className="total-num">
            {!loading ? total.orderCount || 0 : <LoadingOutlined style={{ fontSize: 20 }} />}
          </span>
          单
        </span>
        <span style={{ marginLeft: 32 }}>
          待结算运费
          <span className="total-num">
            {!loading ? Format.price(total.waitPaySum) : <LoadingOutlined style={{ fontSize: 20 }} />}
          </span>
          元
        </span>
        <span style={{ marginLeft: 32 }}>
          发货净重
          <span className="total-num">
            {!loading ? Format.weight(total.goodsWeight) : <LoadingOutlined style={{ fontSize: 20 }} />}
          </span>
          吨
        </span>
        <span style={{ marginLeft: 32 }}>
          收货净重
          <span className="total-num">
            {!loading ? Format.weight(total.arrivalGoodsWeight) : <LoadingOutlined style={{ fontSize: 20 }} />}
          </span>
          吨
        </span>
      </Msg>
      <Table
        loading={loading}
        dataSource={dataList.data}
        columns={columns}
        scroll={{ x: 'auto' }}
        rowKey="routeId"
        pagination={{
          onChange: onChangePage,
          onShowSizeChange: onChangePageSize,
          pageSize: query.pageSize,
          current: query.page,
          total: dataList.count,
        }}
      />
    </>
  );
};

export default RailWaySettlementList;
