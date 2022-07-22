import React, { useState, useCallback, useEffect } from 'react';
// import Layout from '@components/Layout';
import { Input, DatePicker, Button, Table, message, Tooltip, Select } from 'antd';
import { Layout, Content } from '@components';
import { clearState, Format, keepState, getState } from '@utils/common';
import { downLoadFile, inventory } from '@api';
import router from 'next/router';
import Link from 'next/link';
const Index = props => {
  const routeView = {
    title: '库存报表',
    pageKey: 'inventoryQuery',
    longKey: 'inventory.inventoryQuery.detail',
    breadNav: [
      '库存管理',
      <Link href="/inventory/inventoryQuery">
        <a>库存查询</a>
      </Link>,
      '库存报表',
    ],
    pageTitle: '库存报表',
  };
  const columns = [
    {
      title: '盘点开始时间',
      dataIndex: 'goodsName',
      key: 'goodsName',
      width: '200px',
    },
    {
      title: '盘点结束时间',
      dataIndex: 'operatorName',
      key: 'operatorName',
      width: 200,
      render: value => <span>{value || '-'}</span>,
    },
    {
      title: '期初库存(吨)',
      dataIndex: 'diffInNum',
      key: 'diffInNum',
      width: 120,
      align: 'right',
      render: value => <span>{Format.weight(value) || '-'}</span>,
    },
    {
      title: '累计入库(吨)',
      dataIndex: 'diffOutNum',
      key: 'diffOutNum',
      width: 120,
      align: 'right',
      render: value => <span>{Format.weight(value) || '-'}</span>,
    },
    {
      title: '累计出库(吨)',
      dataIndex: 'diffOutNum',
      key: 'diffOutNum',
      width: 120,
      align: 'right',
      render: value => <span>{Format.weight(value) || '-'}</span>,
    },
    {
      title: '期末库存(吨)',
      dataIndex: 'diffInNum',
      key: 'diffInNum',
      width: 120,
      align: 'right',
      render: value => <span>{Format.weight(value) || '-'}</span>,
    },
  ];

  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
  });
  // 初始化
  useEffect(() => {
    const state = getState().query;
    setQuery({ ...query, ...state });
    getInventoryCheckList({ ...query, ...state });
  }, []);

  const [dataList, setDataList] = useState({});
  const getInventoryCheckList = async ({ page, pageSize }) => {
    setLoading(true);
    const params = {
      page,
      limit: pageSize,
    };
    const res = await inventory.getInventoryCheckList({ params });
    if (res.status === 0) {
      const state = getState().query;
      let page = state.page;
      if (res.result.count % 10 === 0) {
        page = page - 1 || 1;
      }
      setDataList(res.result);
    } else {
      message.error(res.detail || res.description);
    }
    setLoading(false);
  };

  // 分页
  const onChangePage = useCallback(
    (page, pageSize) => {
      setQuery({ ...query, page, pageSize });
      getInventoryCheckList({ ...query, page, pageSize });
    },
    [dataList]
  );
  // 切页码
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      getInventoryCheckList({ ...query, page: 1, pageSize });
    },
    [dataList]
  );
  console.log(query);
  return (
    <Layout {...routeView}>
      <Content
        style={{
          fontFamily:
            '-apple-system,BlinkMacSystemFont,Helvetica Neue,Helvetica,Roboto,Arial,PingFang SC,Hiragino Sans GB,Microsoft Yahei,SimSun,sans-serif',
        }}>
        <section>
          <Table
            loading={loading}
            dataSource={dataList.data}
            columns={columns}
            pagination={{
              onChange: onChangePage,
              showSizeChanger: true,
              pageSize: query.pageSize,
              current: query.page,
              total: dataList.count,
            }}
            scroll={{ x: 'auto' }}
          />
        </section>
      </Content>
    </Layout>
  );
};

export default Index;
