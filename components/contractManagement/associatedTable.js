/** @format */
// 按专线结算列表
import React, { useState, useEffect, useCallback } from 'react';
import { Table, message } from 'antd';
import { Ellipsis } from '@components';
import { Format } from '@utils/common';
import { contract } from '@api';
import { getQuery } from '@utils/common';
// 合同状态
const contractStatus = {
  1: { name: '未开始', color: '' },
  2: { name: '执行中', color: '#FFB741' },
  3: { name: '已完成', color: '#477AEF' },
  4: { name: '已超时', color: '#E44040' },
};

const Index = props => {
  const columns = [
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
    },
    {
      title: '合同名称',
      dataIndex: 'title',
      key: 'title',
      width: 180,
      render: value => <Ellipsis value={value} width={150} />,
    },
    {
      title: '签订对象',
      dataIndex: 'partner_name',
      key: 'partner_name',
      width: 150,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '合同状态',
      dataIndex: 'status',
      key: 'status',
      width: 180,
      render: value => {
        return contractStatus[value].name;
      },
    },
    {
      title: '负责人',
      dataIndex: 'principal',
      key: 'principal',
      width: 180,
      render: value => <Ellipsis value={value} width={150} />,
    },
    {
      title: '货物总量(吨)',
      dataIndex: 'totalWeight',
      key: 'totalWeight',
      width: 180,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '合同金额(元)',
      dataIndex: 'totalValue',
      key: 'totalValue',
      align: 'right',
      width: 120,
      render: Format.price,
    },
  ];

  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
  });

  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState({});

  // 初始化
  useEffect(() => {
    getRemoteData({ ...query });
  }, []);

  // 分页
  const onChangePage = useCallback(
    (page, pageSize) => {
      setQuery({ ...query, page, pageSize });
      getRemoteData({ ...query, page, pageSize });
    },
    [dataList]
  );

  // 切页码
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      getRemoteData({ ...query, page: 1, pageSize });
    },
    [dataList]
  );

  /**
   * 查询数据
   * @param {Object} param0
   */
  const getRemoteData = async ({ page, pageSize }) => {
    setLoading(true);
    const { id } = getQuery();
    const params = {
      // title,
      // principal,
      page,
      limit: pageSize,
      contract_id: id,
    };

    const res = await contract.relation_contract({ params });

    if (res.status === 0) {
      setDataList(res.result);
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };

  return (
    <>
      <Table
        loading={loading}
        dataSource={dataList.data}
        columns={columns}
        scroll={{ x: 'auto' }}
        rowKey="routeId"
        pagination={{
          onChange: onChangePage,
          pageSize: query.pageSize,
          current: query.page,
          total: dataList.count,
        }}
        // pagination={false}
      />
    </>
  );
};

export default Index;
