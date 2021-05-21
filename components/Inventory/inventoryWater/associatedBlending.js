import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import { ChildTitle } from '@components';
import { Format } from '@utils/common';

const Index = props => {
  const columns = [
    {
      title: '记录编号',
      dataIndex: 'trailerPlateNumber',
      key: 'trailerPlateNumber',
      width: 200,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '消耗量(吨)',
      dataIndex: 'goodsWeight',
      key: 'goodsWeight',
      width: 130,
      render: Format.weight,
    },
    {
      title: '产出量(吨)',
      dataIndex: 'goodsWeight',
      key: 'goodsWeight',
      width: 130,
      render: Format.weight,
    },
    {
      title: '配煤时间',
      dataIndex: 'goodsWeight',
      key: 'goodsWeight',
      width: 200,
      render: value => {
        return value || '-';
      },
    },
    // {
    //   title: '操作',
    //   dataIndex: 'id',
    //   key: 'id',
    //   width: 80,
    //   fixed: 'right',
    //   align: 'right',
    //   render: value => {
    //     return (
    //       <Button type="link" size="small">
    //         详情
    //       </Button>
    //     );
    //   },
    // },
  ];

  const [dataList, setDataList] = useState([]);
  useEffect(() => {
    setDataList([props.allDataInfo]);
  }, [props.allDataInfo]);

  return (
    <>
      <ChildTitle style={{ margin: '24px 0 16px', fontWeight: 'bold' }}>关联配煤记录</ChildTitle>
      <Table dataSource={dataList} columns={columns} pagination={false} />
    </>
  );
};

export default Index;
