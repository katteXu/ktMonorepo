import React, { useState, useCallback, useEffect } from 'react';
import { Input, Table, message, Tooltip, DatePicker } from 'antd';
import { Search, Msg } from '@components';
import { Format, keepState, getState } from '@utils/common';
import { inventory } from '@api';
import moment from 'moment';
const Index = props => {
  const columns = [
    {
      title: '货品名称',
      dataIndex: 'goodsName',
      key: 'goodsName',
      width: '150px',
      render: value => {
        return (
          <Tooltip title={value} overlayStyle={{ maxWidth: 'max-content' }}>
            <div className="max-label" style={{ width: 130 }}>
              {value || '-'}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: '供应商',
      dataIndex: 'addressCompany',
      key: 'addressCompany',
      width: 200,
      render: value => value || '-',
    },
    {
      title: '期初库存(吨)',
      dataIndex: 'startInventoryValue',
      key: 'startInventoryValue',
      width: 150,
      align: 'right',
      render: value => <span>{Format.weight(value) || '-'}</span>,
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
      dataIndex: 'inventoryInSum',
      key: 'inventoryInSum',
      width: 120,
      align: 'right',
      render: value => <span>{Format.weight(value) || '-'}</span>,
    },
    {
      title: '累计出库(吨)',
      dataIndex: 'inventoryOutSum',
      key: 'inventoryOutSum',
      width: 120,
      align: 'right',
      render: value => <span>{Format.weight(value) || '-'}</span>,
    },
    {
      title: '期末库存(吨)',
      dataIndex: 'endInventoryValue',
      key: 'endInventoryValue',
      width: 150,
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
    begin: undefined,
    end: undefined,
  });
  // 初始化
  useEffect(() => {
    const state = getState().query;
    setQuery({ ...query, ...state });
    getInventoryCheckList({ ...query, ...state });
  }, []);

  const [dataList, setDataList] = useState({});
  const getInventoryCheckList = async ({ goodsName, page, pageSize, begin, end }) => {
    setLoading(true);
    const params = {
      isRawMaterial: 1,
      goodsName,
      page,
      limit: pageSize,
      begin,
      end,
    };
    const res = await inventory.inventoryTotalSum({ params });
    if (res.status === 0) {
      setDataList(res.result);
      keepState({
        query: {
          goodsName,
          page,
          pageSize,
          begin,
          end,
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
      begin: undefined,
      end: undefined,
    };
    setQuery(query);
    getInventoryCheckList(query);
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
  const handleChangeDate = useCallback((value, string) => {
    const begin = value && value[0] && moment(value[0]).format('YYYY-MM-DD HH:mm:ss');
    const end = value && value[1] && moment(value[1]).format('YYYY-MM-DD HH:mm:ss');
    setQuery(() => ({ ...query, begin, end }));
  });

  return (
    <>
      <Search onSearch={handleSubmit} onReset={handleReset}>
        <Search.Item label="时间" br>
          <DatePicker.RangePicker
            value={query.begin && query.end ? [moment(query.begin), moment(query.end)] : undefined}
            showTime={{
              defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
            }}
            onChange={handleChangeDate}
            style={{ width: 376 }}
          />
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

      <Msg style={{ marginTop: 16 }}>
        合计：
        <span style={{ marginLeft: 8 }}>期初库存</span>
        <span className={'total-num'}>{Format.weight(dataList.startTotalSum)}</span>吨
        <span style={{ marginLeft: 32 }}>累计入库</span>
        <span className={'total-num'}>{Format.weight(dataList.totalInSum)}</span>吨
        <span style={{ marginLeft: 32 }}>累计出库</span>
        <span className={'total-num'}>{Format.weight(dataList.totalOutSum)}</span>吨
        <span style={{ marginLeft: 32 }}>期末库存</span>
        <span className={'total-num'}>{Format.weight(dataList.endTotalSum)}</span>吨
      </Msg>
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
    </>
  );
};

export default Index;
