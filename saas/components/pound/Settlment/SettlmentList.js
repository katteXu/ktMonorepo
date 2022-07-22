import { Input, DatePicker, Select, Table, Button, message } from 'antd';
import { useState, useEffect, useCallback } from 'react';
import { Search, Msg } from '@components';
import router from 'next/router';
import moment from 'moment';
import { keepState, getState, clearState, Format } from '@utils/common';
import { pound, downLoadFile } from '@api';

const SettlmentList = props => {
  const columns = [
    {
      title: '结算姓名',
      dataIndex: 'payName',
      key: 'payName',
      width: '120px',
      render: value => value || '-',
    },
    {
      title: '结算手机号',
      dataIndex: 'payMobilNumber',
      key: 'payMobilNumber',
      width: '120px',
      render: value => value || '-',
    },
    {
      title: '结算银行卡号',
      dataIndex: 'cardNumber',
      key: 'cardNumber',
      width: '120px',
    },
    {
      title: '结算金额(元)',
      dataIndex: 'priceSum',
      key: 'priceSum',
      width: '120px',
      align: 'right',
      render: Format.price,
    },
    {
      title: '运输车数(辆)',
      dataIndex: 'allCount',
      key: 'allCount',
      align: 'right',
      width: '120px',
    },
    {
      title: '结算日期',
      dataIndex: 'payTime',
      key: 'payTime',
      width: '120px',
    },
    {
      title: '打款情况',
      dataIndex: 'status',
      key: 'status',
      width: '120px',
      render: value => (value === 1 ? '已打款' : '未打款'),
    },
    {
      title: '操作',
      dataIndex: 'ctrl',
      key: 'ctrl',
      width: '120px',
      fixed: 'right',
      align: 'right',
      render: (value, record) => {
        const { id, status } = record;
        return (
          <>
            <Button type="link" size="small" onClick={() => handleTagStatus(id, status)}>
              {status === 1 ? '取消标记' : '标记打款'}
            </Button>
            <Button type="link" size="small" onClick={() => router.push(`/poundManagement/settlment/view?id=${id}`)}>
              查看结算单
            </Button>
          </>
        );
      },
    },
  ];

  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    begin: undefined,
    end: undefined,
    payName: '',
    payStatus: 0,
  });

  const [total, setTotal] = useState({
    allCount: 0,
    totalPriceSum: 0,
  });

  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [dataList, setDataList] = useState({});

  useEffect(() => {
    const { isServer } = props;
    if (isServer) {
      clearState();
    }
    // 获取持久化数据
    const state = getState().query;
    setQuery({ ...query, ...state });
    getRemoteData({ ...query, ...state });
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

  // 查询
  const handleSearch = () => {
    setQuery({ ...query, page: 1 });
    getRemoteData({ ...query, page: 1 });
  };
  const handleReset = () => {
    const query = {
      page: 1,
      pageSize: 10,
      begin: undefined,
      end: undefined,
      payName: '',
      payStatus: undefined,
    };
    setQuery(query);
    getRemoteData(query);
  };

  // 导出
  const handleExport = useCallback(async () => {
    if (dataList.data && dataList.data.length > 0) {
      setExportLoading(true);
      const params = {
        ...query,
        dump: 1,
      };
      const res = await pound.getPoundBillPayedList({ params });
      await downLoadFile(res.result, '结算单');

      setExportLoading(false);
    } else {
      message.warning('数据导出失败，原因：没有数据可以导出');
    }
  }, [dataList]);

  // 时间输入
  const handleChangeDate = (value, string) => {
    const begin = value && value[0] && moment(value[0]).format('YYYY-MM-DD HH:mm:ss');
    const end = value && value[1] && moment(value[1]).format('YYYY-MM-DD HH:mm:ss');
    setQuery(() => ({ ...query, begin, end }));
  };

  // 结算姓名
  const handleChangeName = e => {
    const payName = e.target.value;
    setQuery(() => ({ ...query, payName }));
  };

  // 打款情况
  const handleChangeStatus = useCallback(value => {
    const payStatus = value;
    setQuery({ ...query, payStatus });
  });

  const getRemoteData = async ({ page, pageSize, begin, end, payName, payStatus }) => {
    setLoading(true);
    const params = {
      begin,
      end,
      payName,
      payStatus,
      page,
      limit: pageSize,
    };

    const res = await pound.getPoundBillPayedList({ params });
    if (res.status === 0) {
      setDataList(res.result);
      setTotal({ ...res.result });

      // 持久化状态
      keepState({
        query: {
          page,
          pageSize,
          begin,
          end,
          payName,
          payStatus,
        },
      });
    } else {
      message.error(`${res.detail || res.description}`);
    }

    setLoading(false);
  };

  const handleTagStatus = async (id, status) => {
    const params = {
      id,
      accountStatus: status === 1 ? 0 : 1,
    };

    const res = await pound.updateAccountListStatus({ params });

    if (res.status === 0) {
      message.success(status === 1 ? '取消成功' : '打款成功');
      getRemoteData(query);
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };

  return (
    <>
      <Search onSearch={handleSearch} onReset={handleReset} onExport={handleExport} exportLoading={exportLoading}>
        <Search.Item label="结算日期" br>
          <DatePicker.RangePicker
            value={query.begin && query.end ? [moment(query.begin), moment(query.end)] : null}
            format="YYYY-MM-DD HH:mm:ss"
            style={{ width: 376 }}
            showTime={{
              defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
            }}
            onChange={handleChangeDate}></DatePicker.RangePicker>
        </Search.Item>
        <Search.Item label="结算姓名">
          <Input value={query.payName} placeholder="请输入结算姓名" onChange={handleChangeName} allowClear />
        </Search.Item>
        <Search.Item label="打款情况">
          <Select value={query.payStatus} placeholder="请选择打款情况" allowClear onChange={handleChangeStatus}>
            <Select.Option>全部</Select.Option>
            <Select.Option key={1} value={1}>
              已打款
            </Select.Option>
            <Select.Option key={2} value={0}>
              未打款
            </Select.Option>
          </Select>
        </Search.Item>
      </Search>

      <Msg style={{ marginTop: 16 }}>
        合计：
        <span style={{ marginRight: 32, marginLeft: 8 }}>
          运输车数<span className="total-num">{total.allCount}</span>辆
        </span>
        <span style={{ marginRight: 32, marginLeft: 8 }}>
          结算金额<span className="total-num">{Format.price(total.totalPriceSum)}</span>元
        </span>
      </Msg>

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
    </>
  );
};

export default SettlmentList;
