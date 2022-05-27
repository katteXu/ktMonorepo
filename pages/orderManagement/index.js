import React, { useState, useEffect, useCallback } from 'react';
import { Input, Button, Select, Table, message } from 'antd';
import { Content, Search, Layout, Ellipsis } from '@components';
import { contract, order } from '@api';
import router from 'next/router';
import { Format, keepState, getState, clearState } from '@utils/common';

const { Option } = Select;

// 合同状态
const OrderStatus = {
  1: { name: '待审核', color: '#FFB741' },
  2: { name: '审批通过', color: '#66BD7E' },
  3: { name: '审批驳回', color: '#F22930' },
};

// 状态颜色样式
const status_icon_styles = {
  display: 'inline-block',
  width: 6,
  height: 6,
  borderRadius: 3,
  margin: '0 4px 2px 0',
};

const Index = props => {
  const routeView = {
    title: '订单列表',
    pageKey: 'orderManagement',
    longKey: 'orderManagement',
    breadNav: '订单管理.订单列表',
    pageTitle: '订单列表',
  };
  const columns = [
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      width: 200,
      render: value => value || '-',
    },
    {
      title: '合同编号',
      dataIndex: 'contract',
      key: 'contractNo',
      width: 200,
      render: value => value?.contractNo || '-',
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      width: 150,
      render: value => {
        return (
          <span>
            <i
              style={{
                ...status_icon_styles,
                background: OrderStatus[value].color,
              }}
            />
            {OrderStatus[value].name}
          </span>
        );
      },
    },
    {
      title: '买受人/收货单位',
      dataIndex: 'contract',
      key: 'fromCompany',
      width: 200,
      render: value => <Ellipsis value={value?.toCompany} width={150} />,
    },
    {
      title: '卖方/发货单位',
      dataIndex: 'contract',
      key: 'toCompany',
      width: 200,
      render: value => <Ellipsis value={value?.fromCompany} width={150} />,
    },
    {
      title: '货品名称',
      dataIndex: 'contract',
      key: 'goodsName',
      width: 200,
      render: value => <Ellipsis value={value?.goodsName} width={150} />,
    },
    {
      title: '订单量',
      dataIndex: 'totalAmount',
      width: 150,
      align: 'right',
      render: (value, record) => `${Format.weight(value)}${record.unitName || ''}`,
    },
    {
      title: '承运企业',
      dataIndex: 'carrierCompany',
      width: 200,
      render: value => <Ellipsis value={value} width={150} />,
    },
    {
      title: '订单剩余量',
      dataIndex: 'remainAmount',
      width: 150,
      align: 'right',
      render: (value, record) => `${Format.weight(value)}${record.unitName || ''}`,
    },
    {
      title: '剩余单号量',
      dataIndex: 'remainNumber',
      width: 150,
      render: value => value || '-',
    },
    {
      title: '已使用单号量',
      dataIndex: 'usedNumber',
      width: 150,
      render: value => value || '-',
    },
    {
      title: '已作废单号量',
      dataIndex: 'invalidNumber',
      width: 150,
      render: value => value || '-',
    },
    {
      title: '已收回单号量',
      dataIndex: 'backNumber',
      width: 150,
      render: value => value || '-',
    },
    {
      title: '操作',
      dataIndex: 'id',
      key: 'id',
      width: '120px',
      fixed: 'right',
      align: 'right',
      render: (value, record) => (
        <>
          <Button type="link" size="small" onClick={() => router.push(`/orderManagement/details?id=${value}`)}>
            详情
          </Button>
          <Button
            type="link"
            size="small"
            disabled={record.status !== 3}
            onClick={() => router.push(`/orderManagement/recommit?id=${value}`)}>
            重新提交
          </Button>
        </>
      ),
    },
  ];

  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState([]);

  // 查询条件
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    contractNo: undefined,
    orderNo: undefined,
    companyName: undefined,
    goodsName: undefined,
    status: undefined,
  });
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

  // 翻页
  const onChangePage = useCallback(
    (page, pageSize) => {
      setQuery({ ...query, page, pageSize });
      getDataList({ ...query, page, pageSize });
    },
    [dataList]
  );

  //  查询
  const handleSearch = useCallback(() => {
    setQuery({ ...query, page: 1 });
    getDataList({ ...query, page: 1 });
  }, [query]);

  // 重置
  const resetFilter = useCallback(() => {
    const query = {
      page: 1,
      pageSize: 10,
      contractNo: undefined,
      orderNo: undefined,
      companyName: undefined,
      goodsName: undefined,
      status: undefined,
    };
    setQuery(query);
    getDataList(query);
  }, []);

  const getDataList = async ({ page, pageSize, contractNo, orderNo, companyName, goodsName, status }) => {
    setLoading(true);
    const params = {
      limit: pageSize || 10,
      page: page || 1,
      contractNo: contractNo || undefined,
      orderNo: orderNo || undefined,
      companyName: companyName || undefined,
      goodsName: goodsName || undefined,
      status: status || undefined,
    };

    const res = await order.order_list(params);

    if (res.status === 0) {
      setDataList(res.result);
      setLoading(false);
    } else {
      message.error(`${res.detail || res.description}`);
    }

    keepState({
      query: {
        page,
        pageSize,
        contractNo,
        orderNo,
        companyName,
        goodsName,
        status,
      },
    });
  };

  return (
    <Layout {...routeView}>
      <Content>
        <section>
          <Button type="primary" style={{ marginBottom: 16 }} onClick={() => router.push('/orderManagement/create')}>
            新增订单
          </Button>
          <Search onSearch={handleSearch} onReset={resetFilter}>
            <Search.Item label="合同编号">
              <Input
                value={query.contractNo}
                placeholder="请输入合同编号"
                allowClear
                onChange={e => setQuery(() => ({ ...query, contractNo: e.target.value }))}
              />
            </Search.Item>
            <Search.Item label="订单编号">
              <Input
                value={query.orderNo}
                placeholder="请输入订单编号"
                allowClear
                onChange={e => setQuery(() => ({ ...query, orderNo: e.target.value }))}
              />
            </Search.Item>
            <Search.Item label="企业名称">
              <Input
                value={query.companyName}
                placeholder="请输入企业名称"
                allowClear
                onChange={e => setQuery(() => ({ ...query, companyName: e.target.value }))}
              />
            </Search.Item>
            <Search.Item label="货品名称">
              <Input
                value={query.goodsName}
                placeholder="请输入货品名称"
                allowClear
                onChange={e => setQuery(() => ({ ...query, goodsName: e.target.value }))}
              />
            </Search.Item>
            <Search.Item label="订单状态">
              <Select
                value={query.status}
                allowClear
                style={{ width: '100%' }}
                placeholder="请选择订单状态"
                onChange={e => setQuery(() => ({ ...query, status: e }))}>
                <Option value={0}>全部</Option>
                <Option value={1}>待审核</Option>
                <Option value={2}>审批通过</Option>
                <Option value={3}>审批驳回</Option>
              </Select>
            </Search.Item>
          </Search>
        </section>

        <section style={{ paddingTop: 0 }}>
          <Table
            loading={loading}
            size="middle"
            dataSource={dataList.data}
            columns={columns}
            rowKey="id"
            scroll={{ x: '1800px' }}
            pagination={{
              onChange: onChangePage,
              pageSize: query.pageSize,
              current: query.page,
              total: dataList.count,
              showSizeChanger: true,
              showTotal: total => <span>共 {total} 条</span>,
            }}
          />
        </section>
      </Content>
    </Layout>
  );
};
export default Index;
