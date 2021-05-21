import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import { ChildTitle } from '@components';
import { Format } from '@utils/common';

const Index = props => {
  const columns = [
    {
      title: '记录编号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 200,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '洗选量(吨)',
      dataIndex: 'coalIn',
      key: 'coalIn',
      width: 130,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '产出量(吨)',
      dataIndex: 'coalOut',
      key: 'coalOut',
      width: 130,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '时间',
      dataIndex: 'coalWashTime',
      key: 'coalWashTime',
      width: 200,
    },
  ];

  const [dataList, setDataList] = useState([]);
  useEffect(() => {
    setDataList([props.allDataInfo]);
  }, [props.allDataInfo]);

  return (
    <>
      <ChildTitle style={{ margin: '24px 0 16px', fontWeight: 'bold' }}>关联洗煤记录</ChildTitle>
      <Table dataSource={dataList} columns={columns} pagination={false} />
    </>
  );
};

export default Index;
