// 待申请开票
import React, { useState, useCallback, useEffect } from 'react';
import styles from './styles.less';
import { finance, getCommon } from '@api';
import { Search, Msg, Ellipsis, DrawerInfo } from '@components';
import { Format, keepState, getState, clearState, getQuery } from '@utils/common';
import { Input, Button, Table, message, Affix, DatePicker, Checkbox } from 'antd';
import moment from 'moment';
import router from 'next/router';
import Steps from '@components/Finance/main/Steps';
import Detail from '@components/Finance/main/BillingDetail';
import { WhiteList } from '@store';
const Billing = props => {
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
      title: '操作',
      dataIndex: 'rowkKey',
      key: 'rowkKey',
      width: 100,
      fixed: 'right',
      align: 'right',
      render: (value, record, i) => {
        // 获取总体缓存数据中的当前数据信息
        const _checkedData = checkedData[record.ids];
        return (
          <>
            <Button type="link" size="small" onClick={() => handleShowDetail({ ...record, checkedData: _checkedData })}>
              编辑
            </Button>
            <Button type="link" size="small" onClick={() => handleUnBilling(record.ids)}>
              暂不开票
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

  // 选择数据
  /**
   * 数据结构：
   * {
   *   "1xx1,2xx2":{ids:"1xx1",price:122.34},
   *   "1xx2,2xx2":{ids:"1xx2",price:1234.2}
   * }
   */
  const [checkedData, setCheckedData] = useState({});

  const { whiteList } = WhiteList.useContainer();
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

  // 对账单统计
  const [invoiceTotal, setInvoiceTotal] = useState({
    priceSum: 0,
    taxPriceSum: 0,
    weightSum: 0,
  });

  const [checkedAll, setCheckedAll] = useState(false);
  const [indexList, setIndexList] = useState(false);

  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    if (query.pageSize) {
      setIndexList([...new Array(query.pageSize).keys()]);
    }
  }, [query.pageSize]);
  const [loading, setLoading] = useState(false);

  const [btnLoading, setBtnLoading] = useState(false);
  const [btnNeverLoading, setBtnNeverLoading] = useState(false);

  const [dataList, setDataList] = useState({});

  const [total, setTotal] = useState({
    price: 0,
    weight: 0,
    invoice_price: 0,
  });

  // 已选总统计数据
  const [checkTotal, setCheckTotal] = useState({
    price: 0,
    weight: 0,
    count: 0,
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
    clearCheckData();
    setCheckedAll(false);
    getRemoteData({ ...query, page: 1 });

    props.refreshTotalData && props.refreshTotalData();
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
    clearCheckData();
    setCheckedAll(false);
    getRemoteData(query);

    props.refreshTotalData && props.refreshTotalData();
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

  // 选中单一值
  const onSelectRow = (record, selected, selectedRows, nativeEvent) => {
    const key = record.ids;
    const price = record.priceSum;
    const weight = record.weightSum;
    if (selected) {
      setCheckedData({ ...checkedData, [key]: { price, weight, ids: key } });
    } else {
      delete checkedData[key];
      setCheckedData({ ...checkedData });
    }
  };

  // 选中所有
  const onSelectAll = (selected, selectedRows, changeRows) => {
    changeRows.forEach(record => {
      const key = record.ids;
      const price = record.priceSum;
      const weight = record.weightSum;
      if (selected) {
        checkedData[key] = { price, weight, ids: key };
      } else {
        delete checkedData[key];
      }
    });

    setCheckedData({ ...checkedData });
  };

  // 全选按钮
  const handleCheckedAll = () => {
    if (dataList.count) {
      setCheckedAll(!checkedAll);
      clearCheckData();
    } else {
      message.warn('当前列表没有数据');
      setCheckedAll(false);
    }
  };

  useEffect(() => {
    const data = Object.entries(checkedData);
    let price = 0;
    let weight = 0;
    if (data.length > 0) {
      data.forEach(item => {
        price += item[1].price;
        weight += item[1].weight;
      });
    }
    setCheckTotal({
      count: data.length,
      price,
      weight,
    });
  }, [checkedData]);
  // 部分从表数据选择
  const handleCheck = params => {
    setShowDetail(false);
    // 缓存部分选择数据
    setCheckedData({ ...checkedData, ...params });
  };

  /**
   * 查询数据
   * @param {Object} param0
   */
  const getRemoteData = async ({ fromCompany, toCompany, goodsType, begin, end, page, pageSize }) => {
    setLoading(true);
    const params = {
      fromCompany,
      toCompany,
      goodsType,
      begin: begin || undefined,
      end: end || undefined,
      limit: pageSize,
      page,
    };

    const res = await finance.getAllInvoiceList({ params });

    if (res.status === 0) {
      setDataList(res.result);
      setTotal({
        weight: res.result.arrivalGoodsWeight,
        price: res.result.price,
        invoice_price: res.result.invoice_price,
      });
      setInvoiceTotal({
        ...res.result.askInvoiceData,
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

  /**
   * 添加提交
   *
   */
  const submit = async () => {
    const { batchId } = getQuery();

    let res = {};
    setBtnLoading(true);
    if (checkedAll) {
      // 全选跨分页
      const { begin, end, fromCompany, toCompany, goodsType } = getCallbackQuery();
      const params = {
        isAll: 1,
        begin: begin || undefined,
        end: end || undefined,
        fromCompany: fromCompany || undefined,
        toCompany: toCompany || undefined,
        goodsType: goodsType || undefined,
      };

      res = batchId ? await submitByReject({ ...params, batchId }) : await submitByCurrent(params);
      setCheckedAll(false);
    } else {
      // 部分选择
      const _ids = [];
      Object.values(checkedData).forEach(({ ids }) => _ids.push(...ids.split(',')));
      const params = {
        transportIds: _ids.join(),
      };
      res = batchId ? await submitByReject({ ...params, batchId }) : await submitByCurrent(params);
    }

    if (res.status === 0) {
      // 添加成功跳转页面
      // batchId ? router.back() : router.push('/finance/applyInvoice/record?mode=edit');
    } else {
      message.error(`添加失败，原因：${res.detail || res.description}`);
    }
    setBtnLoading(false);
  };

  // 获取参数
  const getCallbackQuery = useCallback(() => {
    return query;
  }, [dataList]);

  // 本次开票
  const submitByCurrent = params => {
    const { finance_pay_type = 'PRICE' } = typeof window === 'undefined' ? {} : sessionStorage;
    const res = finance.saveAskInvoice({ params: { ...params, payType: finance_pay_type } });
    return res;
  };

  // 驳回提交
  const submitByReject = params => {
    const { finance_pay_type = 'PRICE' } = typeof window === 'undefined' ? {} : sessionStorage;
    const res = finance.addRejectInvoice({ params: { ...params, payType: finance_pay_type } });
    return res;
  };

  // 暂不开票提交
  const handleUnBilling = async ids => {
    const { finance_pay_type = 'PRICE' } = typeof window === 'undefined' ? {} : sessionStorage;

    const _ids = [...ids.split(',')];
    const params = {
      transportIds: _ids.join(),
      payType: finance_pay_type,
      approveClose: '1',
    };

    const res = await finance.removeAskInvoice({ params });

    if (res.status === 0) {
      message.success(<span>已添加到暂不开票页</span>, 5);

      // 删除选择项
      delete checkedData[ids];
      setQuery({ ...query, page: 1 });
      getRemoteData({ ...query, page: 1 });
    } else {
      message.error(`添加失败，原因：${res.detail || res.description}`);
    }
  };

  /**
   * 清空选中数据
   */
  const clearCheckData = () => {
    setCheckedData({});
    setCheckTotal({
      price: 0,
      weight: 0,
      count: 0,
    });
  };

  // 下一步
  const handleNext = async () => {
    // 添加对账单
    if (Object.keys(checkedData).length > 0 || checkedAll) {
      await submit();
    }
    props.onChangeStep();
  };

  // 判断选中项是否为空
  const isChecked = Object.keys(checkedData).length !== 0 || checkedAll;
  return (
    <>
      <Steps style={{ marginBottom: 16 }} current={0} />
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
        <span className="select-all" onClick={handleCheckedAll}>
          <Checkbox checked={checkedAll}></Checkbox>
          <span>全选(支持跨分页)</span>
        </span>
        {isChecked ? (
          <>
            {/* 已选 （全选|部分选） */}
            <span>
              已选<span className="total-num">{checkedAll ? dataList.count || 0 : checkTotal.count}</span>条
            </span>
            <span style={{ marginLeft: 32 }}>总净重</span>
            <span className="total-num">{Format.weight(checkedAll ? total.weight : checkTotal.weight)}</span>吨
            <span style={{ marginLeft: 32 }}>运费总额</span>
            <span className="total-num">{Format.price(checkedAll ? total.price : checkTotal.price)}</span>元
            <span style={{ marginLeft: 32 }}>含税总额</span>
            <span className="total-num">
              {Format.price(
                checkedAll
                  ? total.invoice_price
                  : whiteList.heShun
                  ? checkTotal.price * 1.1
                  : parseInt(checkTotal.price + (checkTotal.price * dataList.taxPoint) / (1 - dataList.taxPoint))
              )}
            </span>
            元
          </>
        ) : (
          <>
            <span>
              共<span className="total-num">{dataList.count || 0}</span>条
            </span>
            <span style={{ marginLeft: 32 }}>总净重</span>
            <span className="total-num">{Format.weight(total.weight)}</span>吨
            <span style={{ marginLeft: 32 }}>运费总额</span>
            <span className="total-num">{Format.price(total.price)}</span>元
            <span style={{ marginLeft: 32 }}>含税总额</span>
            <span className="total-num">{Format.price(total.invoice_price)}</span>元
          </>
        )}
      </Msg>

      <Table
        loading={loading}
        dataSource={dataList.data}
        columns={columns}
        rowKey={(record, i) => {
          return checkedAll ? i : record.ids;
        }}
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
        rowSelection={{
          columnWidth: '17px',
          selectedRowKeys: checkedAll ? indexList : Object.keys(checkedData),
          onSelect: onSelectRow,
          onSelectAll: onSelectAll,
          getCheckboxProps: () => {
            return { disabled: checkedAll };
          },
        }}
        style={{ minHeight: 400 }}
        scroll={{ x: 'auto' }}
      />
      <div className={styles.bottom}>
        <Button type="primary" onClick={handleNext} style={{ marginRight: 12 }} loading={btnLoading}>
          下一步
        </Button>
      </div>

      <DrawerInfo title="编辑" onClose={() => setShowDetail(false)} showDrawer={showDetail} width="1152">
        {showDetail && (
          <Detail
            orderDetail={orderDetail}
            onClose={() => setShowDetail(false)}
            onSubmit={handleCheck}
            onUnBilling={handleUnBilling}
          />
        )}
      </DrawerInfo>
    </>
  );
};

export default Billing;
