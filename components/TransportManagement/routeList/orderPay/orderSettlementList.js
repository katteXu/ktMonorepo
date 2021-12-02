/** 按运单结算类表 */

import { useState, useEffect, useCallback } from 'react';
import { DatePicker, Input, Button, Table, message, Modal, Tooltip, Dropdown, Menu, Select } from 'antd';
import moment from 'moment';
import { Search, Msg, DrawerInfo } from '@components';
import { keepState, getState, clearState, Format } from '@utils/common';
import Detail from '@components/TransportManagement/routeList/detail';
import { transportStatistics } from '@api';
import router from 'next/router';

const { Option } = Select;

const OrderSettlementList = props => {
  const columns = [
    {
      title: '专线类型',
      dataIndex: 'isFleet',
      key: 'isFleet',
      width: 120,
      render: value => <span>{value ? '车队单' : '个人单'}</span>,
    },
    {
      title: '车牌号',
      dataIndex: 'trailerPlateNumber',
      key: 'trailerPlateNumber',
      width: 100,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '司机姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '发货净重(吨)',
      dataIndex: 'goodsWeight',
      key: 'goodsWeight',
      align: 'right',
      width: 120,
      render: Format.weight,
    },
    {
      title: '收货净重(吨)',
      dataIndex: 'arrivalGoodsWeight',
      key: 'arrivalGoodsWeight',
      width: 120,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '路损(吨)',
      dataIndex: 'loss',
      key: 'loss',
      width: 120,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '预计运费(元)',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      align: 'right',
      render: Format.price,
    },
    {
      title: '付款方式',
      dataIndex: 'payPath',
      key: 'payPath',
      width: 120,
      render: (value, record, index) => <span>{record.isFleet ? (value ? '延时付' : '即时付') : '-'}</span>,
    },
    {
      title: '发货企业',
      dataIndex: 'fromCompany',
      key: 'fromCompany',
      width: 200,
      render: value => {
        return (
          <Tooltip title={value} overlayStyle={{ maxWidth: 'max-content' }}>
            <div className="max-label" style={{ width: 150 }}>
              {value || '-'}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: '收货企业',
      dataIndex: 'toCompany',
      key: 'toCompany',
      width: 200,
      render: value => {
        return (
          <Tooltip title={value} overlayStyle={{ maxWidth: 'max-content' }}>
            <div className="max-label" style={{ width: 150 }}>
              {value || '-'}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: '货品名称',
      dataIndex: 'goodsType',
      key: 'goodsType',
      width: 120,
      render: value => {
        return (
          <Tooltip title={value} overlayStyle={{ maxWidth: 'max-content' }}>
            <div className="max-label" style={{ width: 100 }}>
              {value || '-'}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: '承运时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '操作',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      fixed: 'right',
      align: 'right',
      render: value => {
        return (
          <Button
            type="link"
            size="small"
            // onClick={() => router.push(`/transport/transportStatistics/allDetail?id=${value}`)}
            onClick={() => handleShowDetail(value)}>
            详情
          </Button>
        );
      },
    },
  ];

  // 展示详情
  const handleShowDetail = id => {
    setShowDetail(true);
    setTransportId(id);
  };

  // 查询条件
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    begin: null,
    end: null,
    trailerPlateNumber: '',
    name: '',
    payPath: undefined,
    isFleet: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [dataList, setDataList] = useState({});
  const [disShowType, setDisShowType] = useState(false);
  const [disShowPay, setDisShowPay] = useState(false);
  // 详情展示
  const [showDetail, setShowDetail] = useState(false);
  const [transportId, setTransportId] = useState();
  // 初始化
  useEffect(() => {
    const { isServer } = props;
    if (isServer) {
      clearState();
    }
    // 获取持久化数据
    const state = getState().query;
    setQuery(state);
    getDataList(state);
  }, []);

  // 获取数据
  const getDataList = async ({ begin, end, trailerPlateNumber, name, page, pageSize, payPath, isFleet }) => {
    setLoading(true);
    const params = {
      limit: pageSize,
      page,
      begin: begin || undefined,
      end: end || undefined,
      trailerPlateNumber: trailerPlateNumber || undefined,
      name: name || undefined,
      status: 'CHECKING',
      payPath,
      isFleet,
    };
    const res = await transportStatistics.getWaitPayTransportList({ params });
    if (res.status === 0) {
      setDataList(res.result);
      keepState({
        query: {
          trailerPlateNumber,
          name,
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

  //  查询
  const handleSearch = useCallback(() => {
    setQuery({ ...query, page: 1 });
    getDataList({ ...query, page: 1 });
  }, [query]);

  // 重置
  const handleReset = useCallback(() => {
    const query = {
      page: 1,
      pageSize: 10,
      begin: undefined,
      end: undefined,
      name: '',
      trailerPlateNumber: '',
      payPath: undefined,
      isFleet: undefined,
    };
    setQuery(query);
    getDataList(query);
    setDisShowPay(false);
    setDisShowType(false);
  }, []);

  // 分页
  const onChangePage = useCallback(
    (page, pageSize) => {
      setQuery({ ...query, page, pageSize });
      getDataList({ ...query, page, pageSize });
    },
    [dataList]
  );

  // 切页码
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      getDataList({ ...query, page: 1, pageSize });
    },
    [dataList]
  );

  // 日期输入
  const handleChangeDate = useCallback((value, string) => {
    const begin = value && value[0] && moment(value[0]).format('YYYY-MM-DD HH:mm:ss');
    const end = value && value[1] && moment(value[1]).format('YYYY-MM-DD HH:mm:ss');
    setQuery(() => ({ ...query, begin, end }));
  });

  // 车牌号
  const handleChangetrailerPlateNumber = useCallback(e => {
    const trailerPlateNumber = e.target.value;
    setQuery(() => ({ ...query, trailerPlateNumber }));
  });

  // 司机姓名
  const handleChangename = useCallback(e => {
    const name = e.target.value;
    setQuery(() => ({ ...query, name }));
  });

  //运单类型
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

  return (
    <>
      <Search onSearch={handleSearch} onReset={handleReset} simple>
        <Search.Item label="承运时间" br>
          <DatePicker.RangePicker
            value={query.begin && query.end ? [moment(query.begin), moment(query.end)] : undefined}
            showTime={{
              defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
            }}
            onChange={handleChangeDate}
            style={{ width: 376 }}></DatePicker.RangePicker>
        </Search.Item>
        <Search.Item label="车牌号">
          <Input
            placeholder="请输入车牌号"
            allowClear
            value={query.trailerPlateNumber}
            onChange={handleChangetrailerPlateNumber}
          />
        </Search.Item>
        <Search.Item label="司机姓名">
          <Input placeholder="请输入司机姓名" allowClear value={query.name} onChange={handleChangename} />
        </Search.Item>
        <Search.Item label="专线类型">
          <Select
            value={query.isFleet}
            allowClear
            placeholder="请选择专线类型"
            style={{ width: '100%' }}
            disabled={disShowType}
            onChange={handleChangeRouteType}>
            <Option value="1">车队单</Option>
            <Option value="0">个人单</Option>
          </Select>
        </Search.Item>
        <Search.Item label="付款方式">
          <Select
            value={query.payPath}
            allowClear
            placeholder="请选择付款方式"
            disabled={disShowPay}
            style={{ width: '100%' }}
            onChange={handleChangePayType}>
            <Option value="0">即时付</Option>
            <Option value="1">延时付</Option>
          </Select>
        </Search.Item>
      </Search>

      <header>运单列表</header>

      <Msg>
        <span style={{ marginRight: 32 }}>
          运单数<span className="total-num">{dataList.count}</span>单
        </span>
        <span style={{ marginRight: 32 }}>
          待结算运费<span className="total-num">{Format.price(dataList.waitPayNum || 0)}</span>元
        </span>
        <span style={{ marginRight: 32 }}>
          发货净重<span className="total-num">{Format.weight(dataList.goodsWeight || 0)}</span>吨
        </span>
        <span>
          收货净重<span className="total-num">{Format.weight(dataList.arrivalGoodsWeight || 0)}</span>吨
        </span>
      </Msg>
      <Table
        loading={loading}
        dataSource={dataList.data}
        columns={columns}
        rowKey={item => `${item.id}:${item.price}`}
        scroll={{ x: 'auto' }}
        pagination={{
          onChange: onChangePage,
          pageSize: query.pageSize,
          current: query.page,
          total: dataList.count,
        }}
      />

      <DrawerInfo title="运单详情" onClose={() => setShowDetail(false)} showDrawer={showDetail} width="664">
        {showDetail && <Detail id={transportId} />}
      </DrawerInfo>
    </>
  );
};

export default OrderSettlementList;
