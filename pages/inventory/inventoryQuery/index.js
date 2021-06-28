import React, { useState, useCallback, useEffect } from 'react';
import { Input, Button, Table, message, Tooltip, Select } from 'antd';
import { Layout, Content, Search, Msg } from '@components';
import { Format, keepState, getState } from '@utils/common';
import { inventory } from '@api';
import router from 'next/router';

const Index = props => {
  const routeView = {
    title: '库存查询',
    pageKey: 'inventoryQuery',
    longKey: 'inventory.inventoryQuery',
    breadNav: '库存管理.库存查询',
    pageTitle: '库存查询',
  };
  const columns = [
    {
      title: '货品名称',
      dataIndex: 'goodsName',
      key: 'goodsName',
      width: '200px',
      render: value => {
        return (
          <Tooltip title={value} overlayStyle={{ maxWidth: 'max-content' }}>
            <div className="max-label" style={{ width: 180 }}>
              {value || '-'}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: '存货类别',
      dataIndex: 'rawMaterial',
      key: 'rawMaterial',
      width: 120,
      render: value => <span>{value || '-'}</span>,
    },
    {
      title: '当前库存(吨)',
      dataIndex: 'inventoryValue',
      key: 'inventoryValue',
      width: 120,
      align: 'right',
      render: value => <span>{Format.weight(value) || '-'}</span>,
    },
    {
      title: '累计入库(吨)',
      dataIndex: 'inSum',
      key: 'inSum',
      width: 120,
      align: 'right',
      render: value => <span>{Format.weight(value) || '-'}</span>,
    },
    {
      title: '累计出库(吨)',
      dataIndex: 'outSum',
      key: 'outSum',
      width: 120,
      align: 'right',
      render: value => <span>{Format.weight(value) || '-'}</span>,
    },
  ];

  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState({
    goodsName: undefined,
    isRawMaterial: undefined,
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
  const getInventoryCheckList = async ({ isRawMaterial, goodsName, page, pageSize }) => {
    setLoading(true);
    const params = {
      isRawMaterial,
      goodsName,
      page,
      limit: pageSize,
    };
    const res = await inventory.inventoryTotalSum({ params });
    if (res.status === 0) {
      setDataList(res.result);
      keepState({
        query: {
          isRawMaterial,
          goodsName,
          page,
          pageSize,
        },
      });
    } else {
      message.error(res.detail || res.description);
    }
    setLoading(false);
  };
  const handleSubmit = useCallback(() => {
    setQuery({ ...query, page: 1 });
    getInventoryCheckList({ ...query, page: 1 });
  }, [query]);

  const handleReset = () => {
    const query = {
      isRawMaterial: undefined,
      goodsName: undefined,
      page: 1,
      pageSize: 10,
    };
    setQuery(query);
    getInventoryCheckList(query);
  };

  // 分页
  const onChangePage = useCallback(
    page => {
      setQuery({ ...query, page });
      getInventoryCheckList({ ...query, page });
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

  return (
    <Layout {...routeView}>
      <Content
        style={{
          fontFamily:
            '-apple-system,BlinkMacSystemFont,Helvetica Neue,Helvetica,Roboto,Arial,PingFang SC,Hiragino Sans GB,Microsoft Yahei,SimSun,sans-serif',
        }}>
        <div style={{ padding: '16px', paddingBottom: 0 }}>
          <Button
            type="primary"
            onClick={() => router.push('/inventory/inventoryQuery/create')}
            style={{ marginBottom: 16 }}>
            物料设置
          </Button>
          <Search onSearch={handleSubmit} onReset={handleReset}>
            <Search.Item label="存货类别">
              <Select
                onChange={e => {
                  setQuery({ ...query, isRawMaterial: e });
                }}
                value={query.isRawMaterial}
                allowClear
                placeholder="请输入存货类别">
                <Select.Option value="1">原材料</Select.Option>
                <Select.Option value="0">产成品</Select.Option>
              </Select>
            </Search.Item>
            <Search.Item label="货品名称">
              <Input
                value={query.goodsName}
                placeholder="请输入货品名称"
                allowClear
                onChange={e => {
                  setQuery({ ...query, goodsName: e.target.value });
                }}
              />
            </Search.Item>
          </Search>
        </div>

        <section>
          <Msg style={{ marginTop: 16 }}>
            合计：
            <span style={{ marginLeft: 8 }}>当前库存</span>
            <span className={'total-num'}>{Format.weight(dataList.totalSum)}</span>吨
            <span style={{ marginLeft: 32 }}>累计入库</span>
            <span className={'total-num'}>{Format.weight(dataList.totalInSum)}</span>吨
            <span style={{ marginLeft: 32 }}>累计出库</span>
            <span className={'total-num'}>{Format.weight(dataList.totalOutSum)}</span>吨
          </Msg>
          <Table
            loading={loading}
            dataSource={dataList.data}
            columns={columns}
            pagination={{
              onChange: onChangePage,
              onShowSizeChange: onChangePageSize,
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
