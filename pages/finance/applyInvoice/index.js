import { useEffect, useCallback, useState } from 'react';
import { Layout, Content, Search, Msg, Ellipsis } from '@components';
import { Input, Button, Table, message, Affix, DatePicker } from 'antd';
import { Format, keepState, getState, clearState } from '@utils/common';
import { finance } from '@api';
import personalApi from '@api/personalCenter';
import styles from '../styles.less';
import router from 'next/router';
import moment from 'moment';
import { getQuery } from '@utils/common';
const Index = props => {
  const routerView = {
    title: '申请开票',
    pageKey: 'applyInvoice',
    longKey: 'finance.applyInvoice',
    breadNav: ['财务中心', '申请开票'],
    pageTitle: '申请开票',
  };

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
      align: 'right',
      width: 100,
      render: (value, record, i) => {
        return (
          <Button type="link" size="small" onClick={() => toCheckPage(record)}>
            按运单开票
          </Button>
        );
      },
    },
  ];

  // 查询条件
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 100,
    fromCompany: '',
    toCompany: '',
    goodsType: '',
    begin: undefined,
    end: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  const [dataList, setDataList] = useState({});

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

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

  const [invoiceId, setInvoiceId] = useState();
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

    // 获取开票信息
    getInvoiceId();
  }, []);

  // 发货企业变更
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

  // 日期输入
  const handleChangeDate = useCallback((value, string) => {
    const begin = value && value[0] && moment(value[0]).format('YYYY-MM-DD HH:mm:ss');
    const end = value && value[1] && moment(value[1]).format('YYYY-MM-DD HH:mm:ss');
    setQuery(() => ({ ...query, begin, end }));
  });

  //  查询
  const handleSearch = useCallback(() => {
    setQuery({ ...query, page: 1 });
    setSelectedRowKeys([]);
    getRemoteData({ ...query, page: 1 });
  }, [query]);

  // 重置
  const handleReset = useCallback(() => {
    const query = {
      page: 1,
      pageSize: 100,
      fromCompany: '',
      toCompany: '',
      goodsType: '',
      begin: undefined,
      end: undefined,
    };
    setQuery(query);
    getRemoteData(query);
  }, []);

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
  /**
   * 查询数据
   * @param {Object} param0
   */
  const getRemoteData = async ({ fromCompany, toCompany, goodsType, begin, end, page, pageSize = 100 }) => {
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

  // 选择开票运单
  const toCheckPage = record => {
    const { fromCompany, fromAddressId, fromAddress, toCompany, toAddressId, toAddress, goodsType } = record;

    const queryStr = `fromCompany=${fromCompany || '-'}&toCompany=${toCompany || '-'}&fromAddress=${
      fromAddress || '-'
    }&toAddress=${toAddress || '-'}&fromAddressId=${fromAddressId || '-'}&toAddressId=${toAddressId || '-'}&goodsType=${
      goodsType || '-'
    }`;
    const { batchId } = getQuery();
    const { begin, end } = query;
    const dateStr = `&begin=${begin || ''}&end=${end || ''}`;

    router.push(`/finance/applyInvoice/forCheckDetail?${queryStr}${batchId ? `&batchId=${batchId}` : ''}${dateStr}`);
  };

  // 生成对账单 && 跳转对账单页
  const toTableList = () => {
    let clickCount = 0;
    function _to() {
      if (clickCount === 0) {
        if (getQuery().batchId) {
          router.back();
        } else {
          router.push('/finance/applyInvoice/record?mode=edit');
        }
      }
      clickCount++;
    }
    return _to;
  };
  // 获取开票信息
  const getInvoiceId = async () => {
    const res = await personalApi.getInvoiceInfo();
    if (res.status === 0) {
      setInvoiceId(res.result.id);
    }
  };

  // 提交
  const submit = async () => {
    const { batchId } = getQuery();
    const ids = [];
    if (selectedRowKeys.length === 0) {
      message.warn('请选择要提交的合同');
      return;
    }
    selectedRowKeys.forEach(key => {
      ids.push(...key.split(','));
    });

    let res = {};
    setBtnLoading(true);
    // 分开提交
    // 有batchId则为驳回数据
    // 没有则为未提交数据
    if (batchId) {
      const params = {
        transportIds: ids.join(),
        batchId,
      };
      res = await submitByReject(params);
    } else {
      const params = {
        transportIds: ids.join(),
      };
      res = await submitByCurrent(params);
    }

    if (res.status === 0) {
      message.success(
        <span>
          添加成功，请查看对账单并提交审核
          <Button type="link" size="small" onClick={toTableList()}>
            查看
          </Button>
        </span>,
        5
      );

      setQuery({ ...query, page: 1 });
      setSelectedRowKeys([]);
      setCheckTotal({
        weight: 0,
        price: 0,
        errorCount: 0,
      });
      getRemoteData({ ...query, page: 1 });
    } else {
      message.error(`添加失败，原因：${res.detail || res.description}`);
    }
    setBtnLoading(false);
  };

  // 本次开票
  const submitByCurrent = params => {
    const res = finance.saveAskInvoice({ params });
    return res;
  };

  // 驳回提交
  const submitByReject = params => {
    const res = finance.addRejectInvoice({ params });
    return res;
  };

  // 判断选中项是否为空
  const isEmpty = selectedRowKeys.length === 0 ? true : false;

  return (
    <Layout {...routerView}>
      <Search onSearch={handleSearch} onReset={handleReset}>
        <Search.Item label="承运时间">
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
      <Content style={{ marginTop: 24 }}>
        <header>
          申请列表
          <div style={{ float: 'right' }}>
            <Button type="primary" onClick={submit} loading={btnLoading}>
              添加至对账单
            </Button>
            <Button ghost type="primary" style={{ marginLeft: 12 }} onClick={toTableList()}>
              查看对账单
            </Button>
          </div>
        </header>
        <section>
          <Affix offsetTop={0}>
            <Msg>
              {!isEmpty && <span style={{ marginRight: 12 }}>已选</span>}
              <span>
                <span className="total-num">{isEmpty ? dataList.count || 0 : selectedRowKeys.length}</span>条
              </span>
              <span style={{ marginLeft: 32 }}>总净重</span>
              <span className="total-num">{Format.weight(isEmpty ? total.weight : checkTotal.weight)}</span>吨
              <span style={{ marginLeft: 32 }}>运费总额</span>
              <span className="total-num">{Format.price(isEmpty ? total.price : checkTotal.price)}</span>元
              <span style={{ marginLeft: 32 }}>含税总额</span>
              <span className="total-num">{Format.price(isEmpty ? total.invoice_price : checkTotal.price * 1.09)}</span>
              元
            </Msg>
          </Affix>
          <Table
            loading={loading}
            dataSource={dataList.data}
            columns={columns}
            rowKey="ids"
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
              selectedRowKeys: selectedRowKeys,
              onSelect: onSelectRow,
              onSelectAll: onSelectAll,
            }}
            scroll={{ x: 'auto' }}
          />
        </section>
      </Content>
    </Layout>
  );
};

Index.getInitialProps = props => {
  const { isServer } = props;
  return { isServer };
};

export default Index;
