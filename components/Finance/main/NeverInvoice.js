// 暂不开票
import React, { useState, useCallback, useEffect, useRef } from 'react';
import styles from '../styles.less';
import { finance } from '@api';
import { Content, Search, Msg, Ellipsis } from '@components';
import { Format, keepState, getState, clearState, getQuery } from '@utils/common';
import { Input, Button, Table, message, Affix, DatePicker, Checkbox } from 'antd';
import moment from 'moment';

const NeverInvoice = props => {
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
      title: '结算吨数',
      dataIndex: 'weightSum',
      key: 'weightSum',
      width: 120,
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
      align: 'right',
      fixed: 'right',
      render: (value, record, i) => {
        return (
          <Button type="link" size="small" onClick={() => props.changeByOrder(record)}>
            按运单移回
          </Button>
        );
      },
    },
  ];

  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    fromCompany: '',
    toCompany: '',
    goodsType: '',
    begin: undefined,
    end: undefined,
  });

  const [checkedAll, setCheckedAll] = useState(false);
  const [indexList, setIndexList] = useState(false);

  useEffect(() => {
    if (query.pageSize) {
      setIndexList([...new Array(query.pageSize).keys()]);
    }
  }, [query.pageSize]);

  useEffect(() => {
    if (props.reload) {
      // 重置
      handleReset();
    }
  }, [props.reload]);

  const [loading, setLoading] = useState(false);

  const [btnLoading, setBtnLoading] = useState(false);

  const [dataList, setDataList] = useState({});

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // 监听选择变化
  const checkedRef = useRef({ isAll: false, selectedRowKeys: [] });
  useEffect(() => {
    checkedRef.current = {
      isAll: checkedAll,
      selectedRowKeys: selectedRowKeys,
    };
  }, [checkedAll, selectedRowKeys]);

  const [total, setTotal] = useState({
    price: 0,
    weight: 0,
    invoice_price: 0,
  });

  const [checkTotal, setCheckTotal] = useState({
    price: 0,
    weight: 0,
    errorCount: 0,
  });

  // 初始化
  useEffect(() => {
    const { isServer } = props;
    if (isServer || getQuery().batchId) {
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
    page => {
      setQuery({ ...query, page });
      getRemoteData({ ...query, page });
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

  // 选中单一值
  const onSelectRow = (record, selected, selectedRows, nativeEvent) => {
    const key = record.ids;
    const price = record.priceSum;
    const weight = record.weightSum;
    if (selected) {
      setSelectedRowKeys([...selectedRowKeys, key]);
    } else {
      const i = selectedRowKeys.indexOf(key);
      selectedRowKeys.splice(i, 1);
      setSelectedRowKeys([...selectedRowKeys]);
    }

    // 计算总净重 & 运费总额
    let _weight = 0;
    let _price = 0;
    _weight += weight || 0;
    _price += price || 0;
    if (selected) {
      setCheckTotal(total => {
        return {
          price: total.price + _price,
          weight: total.weight + _weight,
        };
      });
    } else {
      setCheckTotal(total => {
        return {
          price: total.price - _price,
          weight: total.weight - _weight,
        };
      });
    }
  };

  // 选中所有
  const onSelectAll = (selected, selectedRows, changeRows) => {
    changeRows.forEach(record => {
      const key = record.ids;
      const price = record.priceSum;
      const weight = record.weightSum;
      const i = selectedRowKeys.indexOf(key);
      if (selected) {
        if (i === -1) selectedRowKeys.push(key);
      } else {
        selectedRowKeys.splice(i, 1);
      }

      // 计算总净重 & 运费总额
      let _weight = 0;
      let _price = 0;
      _weight += weight || 0;
      _price += price || 0;
      if (selected) {
        if (i === -1) {
          setCheckTotal(total => {
            return {
              price: total.price + _price,
              weight: total.weight + _weight,
            };
          });
        }
      } else {
        setCheckTotal(total => {
          return {
            price: total.price - _price,
            weight: total.weight - _weight,
          };
        });
      }
    });

    setSelectedRowKeys([...selectedRowKeys]);
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
  const submitBack = useCallback(async () => {
    const { isAll: checkedAll, selectedRowKeys } = checkedRef.current;
    const { finance_pay_type = 'PRICE' } = typeof window === 'undefined' ? {} : sessionStorage;

    if (selectedRowKeys.length === 0 && !checkedAll) {
      message.warn('请选择要移回的合同');
      return;
    }

    let res = {};
    setBtnLoading(true);
    if (checkedAll) {
      const { begin, end, fromCompany, toCompany, goodsType } = query;
      const params = {
        isAll: 1,
        begin: begin || undefined,
        end: end || undefined,
        fromCompany: fromCompany || undefined,
        toCompany: toCompany || undefined,
        goodsType: goodsType || undefined,
        payType: finance_pay_type,
        approveClose: '0',
      };

      res = await finance.removeAskInvoice({ params });
      setCheckedAll(false);
    } else {
      const ids = [];
      selectedRowKeys.forEach(key => {
        ids.push(...key.split(','));
      });
      const params = {
        transportIds: ids.join(),
        payType: finance_pay_type,
        approveClose: '0',
      };
      res = await finance.removeAskInvoice({ params });
    }

    if (res.status === 0) {
      message.success(<span>移回成功，您可以在待申请开票中查看</span>, 5);

      setQuery({ ...query, page: 1 });
      clearCheckData();
      getRemoteData({ ...query, page: 1 });

      props.refreshTotalData && props.refreshTotalData();
    } else {
      message.error(`添加失败，原因：${res.detail || res.description}`);
    }
    setBtnLoading(false);
  }, [dataList]);

  /**
   * 清空选中数据
   */
  const clearCheckData = () => {
    setSelectedRowKeys([]);
    setCheckTotal({
      price: 0,
      weight: 0,
      errorCount: 0,
    });
  };

  // 判断选中项是否为空
  const isEmpty = selectedRowKeys.length === 0 ? true : false;

  return (
    <div className={styles['stay-invoice']}>
      <Search
        onSearch={() => {
          handleSearch();
          props.refreshTotalData && props.refreshTotalData();
        }}
        onReset={() => {
          handleReset();
          props.refreshTotalData && props.refreshTotalData();
        }}
        simple>
        <Search.Item label="承运时间">
          <DatePicker.RangePicker
            value={query.begin && query.end ? [moment(query.begin), moment(query.end)] : undefined}
            showTime={{
              defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
            }}
            onChange={handleChangeDate}
            style={{ width: '100%' }}
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

      <Content style={{ paddingBottom: 0 }}>
        <header style={{ padding: '12px 0' }}>
          申请列表
          <div style={{ float: 'right' }}>
            <Button type="primary" onClick={submitBack} loading={btnLoading}>
              移回
            </Button>
          </div>
        </header>
        <Affix offsetTop={0}>
          <Msg>
            <span className="select-all" onClick={handleCheckedAll}>
              <Checkbox checked={checkedAll}></Checkbox>
              <span>全选(支持跨分页)</span>
            </span>
            {!isEmpty ? <span style={{ marginRight: 12 }}>已选</span> : <span>共</span>}
            <span>
              <span className="total-num">{isEmpty ? dataList.count || 0 : selectedRowKeys.length}</span>条
            </span>
            <span style={{ marginLeft: 32 }}>总净重</span>
            <span className="total-num">{Format.weight(isEmpty ? total.weight : checkTotal.weight)}</span>吨
            <span style={{ marginLeft: 32 }}>运费总额</span>
            <span className="total-num">{Format.price(isEmpty ? total.price : checkTotal.price)}</span>元
            <span style={{ marginLeft: 32 }}>含税总额</span>
            <span className="total-num">{Format.price(isEmpty ? total.invoice_price : checkTotal.price * 1.09)}</span>元
          </Msg>
        </Affix>
        <Table
          loading={loading}
          dataSource={dataList.data}
          columns={columns}
          rowKey={(record, i) => {
            return checkedAll ? i : record.ids;
          }}
          pagination={{
            onChange: onChangePage,
            onShowSizeChange: onChangePageSize,
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
            selectedRowKeys: checkedAll ? indexList : selectedRowKeys,
            onSelect: onSelectRow,
            onSelectAll: onSelectAll,
            columnWidth: '17px',
            getCheckboxProps: () => {
              return { disabled: checkedAll };
            },
          }}
          style={{ minHeight: 400 }}
          scroll={{ x: 'auto' }}
        />
      </Content>
    </div>
  );
};

export default NeverInvoice;
