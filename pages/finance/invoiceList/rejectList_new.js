import { useEffect, useCallback, useState } from 'react';
import { Layout, Content, Search, Msg, Ellipsis } from '@components';
import { Input, Button, Table, message } from 'antd';
import { Format, generateHash, keepState, clearState, getSessionItem, setSessionItem } from '@utils/common';
import { finance } from '@api';
import router from 'next/router';
// 生成rowKey
const rowKey = e => {
  const str = `${e.fromCompany}${e.toCompany}${e.fromAddressId}${e.toAddressId}${e.goodsType}`;
  return generateHash(str);
};

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
      title: '可开票运费(元)',
      dataIndex: 'priceSum',
      key: 'priceSum',
      width: 100,
      align: 'right',
      render: Format.price,
    },
    {
      title: '预计开票运费',
      dataIndex: 'rowkKey',
      key: 'rowkKey',
      width: 100,
      align: 'right',
      render: (value, record, i) => {
        const key = rowKey(record);
        const obj = getSessionItem('finance_check_table');
        const result = obj[key] || {};
        return (
          <>
            <span>{result.total ? Format.price(result.total.price) : '-'} 元</span>
            <Button style={{ marginLeft: 12 }} type="link" size="small" onClick={() => toCheckPage(key, record)}>
              修改
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
  });

  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState({});

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  // 初始化
  useEffect(() => {
    const { isServer } = props;
    if (isServer) {
      clearState();
    }
    // 获取持久化数据
    // const state = getState().query;
    // setQuery(state);
    getRemoteData({});
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
      pageSize: 10,
      fromCompany: '',
      toCompany: '',
      goodsType: '',
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

  // 选择行
  const onSelectRow = (keys, rows) => {
    setSelectedRowKeys(keys);
  };
  /**
   * 查询数据
   * @param {Object} param0
   */
  const getRemoteData = async ({ fromCompany, toCompany, goodsType, page, pageSize }) => {
    setLoading(true);
    const params = {
      fromCompany,
      toCompany,
      goodsType,
      limit: pageSize,
      page,
    };

    const res = await finance.getAllInvoiceList({ params });

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
        },
      });
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };

  // 选择开票运单
  const toCheckPage = (key, record) => {
    const { fromCompany, fromAddressId, fromAddress, toCompany, toAddressId, toAddress, goodsType } = record;
    let obj = getSessionItem('finance_check_table');

    // 如果没有数据则创建并存储
    if (!obj[key]) {
      obj[key] = { selectedRowKeys: [], total: {} };
      setSessionItem('finance_check_table', obj);
    }

    const queryStr = `fromCompany=${fromCompany}&toCompany=${toCompany}&fromAddress=${fromAddress}&toAddress=${toAddress}&fromAddressId=${fromAddressId}&toAddressId=${toAddressId}&goodsType=${goodsType}`;

    router.push(`/finance/applyInvoice/forCheckDetail?key=${key}&${queryStr}`);
  };

  // 生成对账单 && 跳转对账单页
  const toTableList = async () => {
    router.push('/finance/applyInvoice/record?mode=edit');
  };

  const submit = async () => {
    const obj = getSessionItem('finance_check_table');
    const ids = [];
    if (selectedRowKeys.length === 0) {
      message.warn('没有可提交的数据');
      return;
    }
    selectedRowKeys.forEach(key => {
      if (obj[key]) ids.push(...obj[key].selectedRowKeys);
      delete obj[key];
    });

    if (ids.length === 0) {
      message.warn('没有可提交的数据');
      return;
    }
    const params = {
      transportIds: ids.join(),
    };
    const res = await finance.saveAskInvoice({ params });
    if (res.status === 0) {
      message.success('提交成功');
      // 清空暂存选择
      setSessionItem('finance_check_table', obj);
      setQuery({ ...query, page: 1 });
      setSelectedRowKeys([]);
      getRemoteData({ ...query, page: 1 });
    } else {
      message.error(`提交失败,原因：${res.detail}`);
    }
  };

  // 判断选中项是否为空
  const isEmpty = selectedRowKeys.length === 0 ? true : false;
  return (
    <Layout {...routerView}>
      <Search onSearch={handleSearch} onReset={handleReset}>
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
          开票合同列表
          <div style={{ float: 'right' }}>
            <Button type="primary" onClick={submit}>
              提交
            </Button>
            <Button ghost type="primary" style={{ marginLeft: 12 }} onClick={toTableList}>
              查看对账单
            </Button>
          </div>
        </header>
        <section>
          <Msg>
            {!isEmpty && <span style={{ marginRight: 12 }}>已选</span>}
            <span>
              对账单
              <span className="total-num">{isEmpty ? dataList.count || 0 : selectedRowKeys.length}</span>个
            </span>
          </Msg>
          <Table
            loading={loading}
            dataSource={dataList.data}
            columns={columns}
            rowKey={rowKey}
            pagination={{
              onChange: onChangePage,
              onShowSizeChange: onChangePageSize,
              showSizeChanger: true,
              pageSize: query.pageSize,
              current: query.page,
              total: dataList.count,
            }}
            rowSelection={{
              selectedRowKeys: selectedRowKeys,
              // onSelect: rowCompute,
              // onSelectAll: allRowComput,
              onChange: onSelectRow,
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
