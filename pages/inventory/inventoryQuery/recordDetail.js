import React, { useState, useCallback, useEffect } from 'react';
// import Layout from '@components/Layout';
import { Input, DatePicker, Button, Table, message, Tooltip, Select } from 'antd';
import { Layout, Content } from '@components';
import { clearState, Format, keepState, getState } from '@utils/common';
import { inventory } from '@api';
import router from 'next/router';
import Link from 'next/link';
const Index = ({ recordId, refreshData }) => {
  const columns = [
    {
      title: '设置时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '200px',
    },
    {
      title: '货品名称',
      dataIndex: 'inventoryNames',
      key: 'inventoryNames',
      width: 250,
      // render: value => <span>{value || '-'}</span>,
    },
  ];

  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
  });
  // 初始化
  useEffect(() => {
    getInventoryCheckList({ ...query });
  }, [recordId, refreshData]);

  const [dataList, setDataList] = useState({});
  const getInventoryCheckList = async ({ page, pageSize }) => {
    setLoading(true);
    const params = {
      page,
      limit: pageSize,
      mainInventoryId: recordId,
    };
    const res = await inventory.matterRelationshipLogList({ params });
    if (res.status === 0) {
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

  return (
    <Table
      loading={loading}
      dataSource={dataList.data}
      columns={columns}
      pagination={{
        onChange: onChangePage,
        showSizeChanger: false,
        pageSize: query.pageSize,
        current: query.page,
        total: dataList.count,
      }}
      scroll={{ x: 'auto' }}
    />
  );
};

export default Index;
