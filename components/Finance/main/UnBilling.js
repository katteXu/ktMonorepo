// 待申请开票
import React, { useState, useCallback, useEffect } from 'react';
import styles from './styles.less';
import { finance } from '@api';
import { Search, Msg, Ellipsis, DrawerInfo } from '@components';
import { Format, keepState, getState, clearState, getQuery } from '@utils/common';
import { Input, Button, Table, message, DatePicker } from 'antd';
import moment from 'moment';
import router from 'next/router';
import Detail from '@components/Finance/main/UnBillingDetail';

const UnBilling = props => {
  const columns = [
    {
      title: '发货企业',
      dataIndex: 'fromCompany',
      key: 'fromCompany',
      width: 120,
      render: value => <Ellipsis value={value} width={120} />,
    },
    {
      title: '发货地址',
      dataIndex: 'fromAddress',
      key: 'fromAddress',
      width: 140,
      render: value => <Ellipsis value={value} width={120} />,
    },
    {
      title: '收货企业',
      dataIndex: 'toCompany',
      key: 'toCompany',
      width: 120,
      render: value => <Ellipsis value={value} width={120} />,
    },
    {
      title: '收货地址',
      dataIndex: 'toAddress',
      key: 'toAddress',
      width: 140,
      render: value => <Ellipsis value={value} width={120} />,
    },
    {
      title: '货品名称',
      dataIndex: 'goodsType',
      key: 'goodsType',
      width: 120,
      render: value => <Ellipsis value={value} width={120} />,
    },
    {
      title: '结算吨数(吨)',
      dataIndex: 'weightSum',
      key: 'weightSum',
      width: 120,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '运费(元)',
      dataIndex: 'priceSum',
      key: 'priceSum',
      width: 100,
      align: 'right',
      render: Format.price,
    },
    {
      title: '补差运费(元)',
      dataIndex: 'taxSum',
      key: 'taxSum',
      width: 100,
      align: 'right',
      render: Format.price,
    },
    {
      title: '操作',
      dataIndex: 'rowkKey',
      key: 'rowkKey',
      width: 100,
      fixed: 'right',
      align: 'right',
      render: (value, record, i) => {
        return (
          <>
            <Button type="link" size="small" onClick={() => handleShowDetail(record)}>
              编辑
            </Button>
            <Button type="link" size="small" onClick={() => handleBack(record.ids)}>
              移回
            </Button>
          </>
        );
      },
    },
  ];
  // 查询条件
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    fromCompany: '',
    toCompany: '',
    goodsType: '',
    begin: undefined,
    end: undefined,
  });

  // 按运单开票组
  const [orderDetail, setOrderDetail] = useState({
    fromCompany: '',
    toCompany: '',
    fromAddress: '',
    toAddress: '',
    fromAddressId: '',
    toAddressId: '',
    goodsType: '',
  });
  const handleShowDetail = data => {
    setOrderDetail(data);
    setShowDetail(true);
  };

  const [showDetail, setShowDetail] = useState(false);

  const [loading, setLoading] = useState(false);

  const [dataList, setDataList] = useState({});

  const [total, setTotal] = useState({
    price: 0,
    weight: 0,
    invoice_price: 0,
    taxAmount: 0,
  });

  // 初始化
  useEffect(() => {
    const { isServer } = props;
    const { batchId } = getQuery();
    if (isServer || batchId) {
      clearState();
    }
    // 获取持久化数据
    const state = getState().query;
    setQuery({ ...query, ...state });
    getRemoteData({ ...query, ...state });
  }, []);

  /**
   * 查询事件
   */
  const handleSearch = useCallback(() => {
    setQuery({ ...query, page: 1 });
    getRemoteData({ ...query, page: 1 });
  }, [query]);

  /**
   * 重置事件
   */
  const handleReset = useCallback(() => {
    const query = {
      page: 1,
      pageSize: 10,
      fromCompany: '',
      toCompany: '',
      goodsType: '',
      begin: undefined,
      end: undefined,
    };
    setQuery(query);
    getRemoteData(query);
  }, []);

  const handleChangeDate = useCallback((value, string) => {
    const begin = value && value[0] && moment(value[0]).format('YYYY-MM-DD HH:mm:ss');
    const end = value && value[1] && moment(value[1]).format('YYYY-MM-DD HH:mm:ss');
    setQuery(() => ({ ...query, begin, end }));
  });

  const handleChangeFromCompany = useCallback(e => {
    const fromCompany = e.target.value;
    setQuery(() => ({ ...query, fromCompany }));
  });

  const handleChangeToCompany = useCallback(e => {
    const toCompany = e.target.value;
    setQuery(() => ({ ...query, toCompany }));
  });

  const handleChangeGoodsType = useCallback(e => {
    const goodsType = e.target.value;
    setQuery(() => ({ ...query, goodsType }));
  });

  // 分页
  const onChangePage = useCallback(
    (page, pageSize) => {
      setQuery({ ...query, page, pageSize });
      getRemoteData({ ...query, page, pageSize });
    },
    [query]
  );

  // 切页码
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      getRemoteData({ ...query, page: 1, pageSize });
    },
    [query]
  );

  /**
   * 查询数据
   * @param {Object} param0
   */
  const getRemoteData = async ({ fromCompany, toCompany, goodsType, begin, end, page, pageSize = 10 }) => {
    setLoading(true);
    const params = {
      fromCompany,
      toCompany,
      goodsType,
      begin: begin || undefined,
      end: end || undefined,
      limit: pageSize,
      approveClose: '1',
      page,
    };

    const res = await finance.getAllInvoiceList({ params });

    if (res.status === 0) {
      setDataList(res.result);
      setTotal({
        weight: res.result.arrivalGoodsWeight,
        price: res.result.price,
        invoice_price: res.result.invoice_price,
        taxAmount: res.result.taxAmount,
      });

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

  // 移回
  const handleBack = async ids => {
    const { finance_pay_type = 'PRICE' } = typeof window === 'undefined' ? {} : sessionStorage;

    const _ids = [...ids.split(',')];

    const params = {
      transportIds: _ids.join(),
      payType: finance_pay_type,
      approveClose: '0',
    };
    const res = await finance.removeAskInvoice({ params });

    if (res.status === 0) {
      message.success(<span>移回成功，您可以索取发票中查看</span>, 5);

      setQuery({ ...query, page: 1 });
      getRemoteData({ ...query, page: 1 });
    } else {
      message.error(`移回失败，原因：${res.detail || res.description}`);
    }
  };

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
            style={{ width: 376 }}
          />
        </Search.Item>
        <Search.Item label="发货企业">
          <Input allowClear placeholder="请输入发货企业" value={query.fromCompany} onChange={handleChangeFromCompany} />
        </Search.Item>
        <Search.Item label="收货企业">
          <Input allowClear placeholder="请输入收货企业" value={query.toCompany} onChange={handleChangeToCompany} />
        </Search.Item>
        <Search.Item label="货品名称">
          <Input allowClear placeholder="请输入货品名称" value={query.goodsType} onChange={handleChangeGoodsType} />
        </Search.Item>
      </Search>

      <Msg style={{ marginTop: 16 }}>
        <span>
          共<span className="total-num">{dataList.count || 0}</span>条
        </span>
        <span style={{ marginLeft: 32 }}>总净重</span>
        <span className="total-num">{Format.weight(total.weight)}</span>吨
        <span style={{ marginLeft: 32 }}>运费总额</span>
        <span className="total-num">{Format.price(total.price)}</span>元<span style={{ marginLeft: 32 }}>补差运费</span>
        <span className="total-num">{Format.price(total.taxAmount)}</span>元
      </Msg>

      <Table
        loading={loading}
        dataSource={dataList.data}
        columns={columns}
        rowKey="ids"
        pagination={{
          onChange: onChangePage,
          showSizeChanger: true,
          pageSize: query.pageSize,
          current: query.page,
          total: dataList.count,
        }}
        rowClassName={(record, index) => {
          if (record.errorCount > 0) {
            return styles.red;
          }
          return '';
        }}
        style={{ minHeight: 400 }}
        scroll={{ x: 'auto' }}
      />

      <DrawerInfo title="编辑" onClose={() => setShowDetail(false)} showDrawer={showDetail} width="1152">
        {showDetail && <Detail orderDetail={orderDetail} onClose={() => setShowDetail(false)} onBack={handleBack} />}
      </DrawerInfo>
    </>
  );
};

export default UnBilling;
