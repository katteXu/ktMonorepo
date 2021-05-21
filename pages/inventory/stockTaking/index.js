import React, { useState, useCallback, useEffect } from 'react';
import { Input, DatePicker, Button, Table, message } from 'antd';
import { Ellipsis, Layout, Content, Search } from '@components';
import { Format, keepState, getState } from '@utils/common';
import { inventory } from '@api';
import router from 'next/router';
import moment from 'moment';
import { Permission } from '@store';

const StockTaking = props => {
  const routeView = {
    title: '库存盘点',
    pageKey: 'stockTaking',
    longKey: 'inventory.stockTaking',
    breadNav: '库存管理.库存盘点',
    pageTitle: '库存盘点',
  };
  const { permissions, isSuperUser } = Permission.useContainer();
  const columns = [
    {
      title: '盘点时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: value => <span>{value || '-'}</span>,
    },
    {
      title: '盘点人',
      dataIndex: 'operatorName',
      key: 'operatorName',
      width: 120,
      render: value => <span>{value || '-'}</span>,
    },
    {
      title: '盘盈数量(吨)',
      dataIndex: 'diffInNum',
      key: 'diffInNum',
      width: 120,
      align: 'right',
      render: value => <span>{Format.weight(value) || '-'}</span>,
    },
    {
      title: '盘亏数量(吨)',
      dataIndex: 'diffOutNum',
      key: 'diffOutNum',
      width: 120,
      align: 'right',
      render: value => <span>{Format.weight(value) || '-'}</span>,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 120,
      ellipsis: true,
      render: value => <Ellipsis value={value} width={120}></Ellipsis>,
    },
    {
      title: '操作',
      dataIndex: 'ctrl',
      key: 'ctrl',
      align: 'right',
      width: 120,
      render: (value, record, index) => (
        <Button
          size="small"
          type="link"
          key="detail"
          onClick={() => {
            router.push(`/inventory/stockTaking/detail?id=${record.id}`);
          }}>
          详情
        </Button>
      ),
    },
  ];
  const [exportLoading, setExportLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState({
    begin: undefined,
    end: undefined,
    remark: undefined,
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
  const getInventoryCheckList = async ({ begin, end, remark, page, pageSize }) => {
    setLoading(true);
    const params = {
      begin,
      end,
      remark,
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
      keepState({
        query: {
          begin,
          end,
          remark,
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
      begin: undefined,
      end: undefined,
      remark: undefined,
      page: 1,
      pageSize: 10,
    };
    setQuery(query);
    getInventoryCheckList(query);
  };
  const handleChangeDate = value => {
    const begin = value && value[0] && moment(value[0]).format('YYYY-MM-DD HH:mm:ss');
    const end = value && value[1] && moment(value[1]).format('YYYY-MM-DD HH:mm:ss');
    setQuery({ ...query, begin: begin, end: end });
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
        <section>
          {(isSuperUser || permissions.includes('INVENTORY_CHECK_OPERATE')) && (
            <Button
              type="primary"
              onClick={() => router.push('/inventory/stockTaking/create')}
              style={{ marginBottom: 16 }}>
              新增盘点
            </Button>
          )}
          <Search onSearch={handleSubmit} onReset={handleReset}>
            <Search.Item label="盘点时间" br>
              <DatePicker.RangePicker
                onChange={handleChangeDate}
                value={query.begin && query.end ? [moment(query.begin), moment(query.end)] : null}
                showTime={{
                  defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                }}
                style={{ width: 376 }}
              />
            </Search.Item>
            <Search.Item label="盘点备注">
              <Input
                value={query.remark}
                placeholder="请输入"
                allowClear
                onChange={e => {
                  setQuery({ ...query, remark: e.target.value });
                }}
              />
            </Search.Item>
          </Search>

          <Table
            style={{ marginTop: 16 }}
            loading={loading}
            dataSource={dataList.data}
            // dataSource={[1, 2, 3, 4, 5]}
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

export default StockTaking;
