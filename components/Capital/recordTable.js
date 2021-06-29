import { Table, Input, DatePicker, message, Select } from 'antd';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Status } from '@components';
import moment from 'moment';
import { capital } from '@api';
import { getState, clearState, Format } from '@utils/common';
const { RangePicker } = DatePicker;
const Option = Select.Option;
import TransportTable from './transportTable';
import InvoiceTable from './invoiceTable';
import EmptyList from './emptyList';
import DrawerInfo from '@components/DrawerInfo';

const titleDrawer = {
  0: { title: '', width: 664 },
  1: { title: '运单列表', width: 1280 },
  2: { title: '开票信息', width: 1000 },
};

const tradingType = {
  FARE: '运费',
  FLEET_FARE: '车队运费',
  PRE_FARE: '预付运费',
  PRE_FARE_REFUND: '预付退还',
  PAY_TAX_CHARGE: '税费',
  SERVICE_CHARGE: '服务费',
  WITHDRAWAL: '提现',
  ZX_CHANGE: '充值',
  OFFICIAL_CHARGE: '官方充值',
  CHARGE: '对公充值',
  OFFICIAL_WITHHOLD: '官方扣款',
  TRANSFER: '转账',
};

const Index = props => {
  const [loading, setLoading] = useState(true);

  const [list, setList] = useState([]);
  const [count, setCount] = useState(0);
  const [showDrawer, setShowDrawer] = useState(false);
  const [retType, setRetType] = useState(0);
  const [walletId, setWalletId] = useState(0);
  const columns = [
    {
      title: '交易时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '100px',
      render: value => {
        return value || '-';
      },
    },
    {
      title: '交易类型',
      dataIndex: 'typeZn',
      key: 'typeZn',
      width: '50px',
      render(value) {
        return value || '-';
      },
    },
    {
      title: '交易金额(元)',
      dataIndex: 'amount',
      key: 'amount',
      width: '50px',
      align: 'right',
      render(v) {
        const value = v > 0 ? `+${(v / 100).toFixed(2)}` : `${(v / 100).toFixed(2)}`;
        return <span>{value}</span> || '-';
      },
    },
    {
      title: '余额(元)',
      dataIndex: 'wallet_after',
      key: 'wallet_after',
      width: '50px',
      align: 'right',
      render(value) {
        return <span>{Format.price(value)}</span>;
      },
    },
    {
      title: '收款人',
      dataIndex: 'payeeName',
      key: 'payeeName',
      width: '70px',
      render(v) {
        return v || '-';
      },
    },
    {
      title: '到账人',
      dataIndex: 'receiveName',
      key: 'receiveName',
      width: '70px',
      render(v) {
        return v || '-';
      },
    },
    {
      title: '交易单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: '50px',
      render: value => {
        return value || '-';
      },
    },

    {
      title: '交易状态',
      dataIndex: 'status',
      key: 'status',
      width: '50px',
      fixed: 'right',
      render: value => {
        return <Status.Pay code={value} />;
      },
    },
    {
      title: '操作',
      dataIndex: 'id',
      key: 'id',
      width: '50px',
      fixed: 'right',
      align: 'right',
      render: (value, record, i) => {
        return (
          <span
            onClick={() => {
              setWalletId(value);
              setRetType(record.retType);
              setShowDrawer(true);
            }}
            style={{ color: '#477AEF' }}>
            查看
          </span>
        );
      },
    },
  ];

  // 查询条件
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    begin: undefined,
    end: undefined,
    orderNo: '',
  });

  const queryRef = useRef(query);

  // 获取数据
  useEffect(() => {
    const { isServer } = props;
    if (isServer) {
      clearState();
    }
    // 获取持久化数据
    const state = getState().query;
    setQuery(state);
    setData(state);

    const time = setInterval(() => {
      refreshData();
    }, 60 * 3 * 1000);
    return () => {
      clearInterval(time);
    };
  }, []);

  const setData = async ({ pageSize, page, begin, end, orderNo, type }) => {
    setLoading(true);
    const params = {
      limit: pageSize,
      page,
      begin: begin || undefined,
      end: end || undefined,
      orderNo: orderNo || undefined,
      type,
    };
    const { status, result, detail, description } = await capital.saasWalletList({ params });
    if (!status) {
      setCount(result.count);
      setList(result.data);
      setLoading(false);
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
      begin: undefined,
      end: undefined,
      orderNo: '',
      type: undefined,
    };
    setQuery(query);
    setData(query);
    props.seatchLine();
  }, []);

  //  查询
  const search = useCallback(() => {
    setQuery({ ...query, page: 1 });
    setData({ ...query, page: 1 });
    props.seatchLine();
  }, [query]);

  // 翻页
  const onChangePage = useCallback(
    (page, pageSize) => {
      setQuery({ ...query, page, pageSize });
      setData({ ...query, page, pageSize });
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

  // 日期输入
  const onChangeDatePicker = useCallback((value, string) => {
    const begin = value && value[0] && moment(value[0]).format('YYYY-MM-DD HH:mm:ss');
    const end = value && value[1] && moment(value[1]).format('YYYY-MM-DD HH:mm:ss');
    setQuery(() => ({ ...query, begin, end }));
  });

  // 交易单号
  const handleChangeOrderNo = useCallback(e => {
    const orderNo = e.target.value;
    setQuery(() => ({ ...query, orderNo }));
  });

  const handleChangeType = value => {
    const type = value;
    setQuery(() => ({ ...query, type }));
  };

  useEffect(() => {
    queryRef.current = query;
  }, [list]);

  const refreshData = () => {
    const query = queryRef.current;
    setQuery({ ...query });
    setData({ ...query });
  };

  return (
    <>
      <Search onSearch={search} onReset={resetFilter} simple>
        <Search.Item label="交易时间" br>
          <RangePicker
            style={{ width: 376 }}
            showTime={{
              defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
            }}
            value={query.begin && query.end ? [moment(query.begin), moment(query.end)] : null}
            onChange={onChangeDatePicker}
          />
        </Search.Item>
        <Search.Item label="交易单号">
          <Input allowClear placeholder="请输入交易单号" value={query.orderNo} onChange={handleChangeOrderNo} />
        </Search.Item>
        <Search.Item label="交易类型">
          <Select placeholder="请选择交易类型" onChange={handleChangeType} value={query.type} style={{ width: '100%' }}>
            {Object.keys(tradingType).map(item => (
              <Option key={item} value={item}>
                {tradingType[item]}
              </Option>
            ))}
          </Select>
        </Search.Item>
      </Search>
      <Table
        style={{ marginTop: 16 }}
        loading={loading}
        dataSource={list}
        columns={columns}
        scroll={{ x: 'auto' }}
        pagination={{
          onChange: onChangePage,
          pageSize: query.pageSize,
          current: query.page,
          total: count,
        }}
      />
      <DrawerInfo
        title={titleDrawer[retType].title}
        onClose={() => setShowDrawer(false)}
        showDrawer={showDrawer}
        width={titleDrawer[retType].width}>
        {retType === 1 && <TransportTable walletId={walletId} />}
        {retType === 2 && <InvoiceTable walletId={walletId} />}
        {retType === 0 && <EmptyList />}
      </DrawerInfo>
    </>
  );
};

export default Index;
