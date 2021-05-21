import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import { ChildTitle, Ellipsis } from '@components';
import { Format } from '@utils/common';

const Index = props => {
  const columns = [
    {
      title: '发货企业',
      dataIndex: 'fromCompany',
      key: 'fromCompany',
      width: 150,
      render: value => <Ellipsis value={value} width={120} />,
    },
    {
      title: '收货企业',
      dataIndex: 'toCompany',
      key: 'toCompany',
      width: 150,
      render: value => <Ellipsis value={value} width={120} />,
    },
    {
      title: '磅单类型',
      dataIndex: 'poundType',
      key: 'poundType',
      width: 100,
      render: value => {
        return value ? '收货磅单' : '发货磅单';
      },
    },
    {
      title: '车牌号',
      dataIndex: 'trailerPlateNumber',
      key: 'trailerPlateNumber',
      width: 150,
    },
    {
      title: '毛重(吨)',
      dataIndex: 'totalWeight',
      key: 'totalWeight',
      width: 130,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '皮重(吨)',
      dataIndex: 'carWeight',
      key: 'carWeight',
      width: 130,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '净重(吨)',
      dataIndex: 'goodsWeight',
      key: 'goodsWeight',
      width: 130,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '司机电话',
      dataIndex: 'mobilePhoneNumber',
      key: 'mobilePhoneNumber',
      width: 150,
      render: value => value || '-',
    },
    {
      title: '出站时间',
      dataIndex: 'outTime',
      key: 'outTime',
      width: 200,
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
      <ChildTitle style={{ margin: '24px 0 16px', fontWeight: 'bold' }}>关联磅单</ChildTitle>
      <Table dataSource={dataList} columns={columns} pagination={false} scroll={{ x: 'aotu' }} />
    </>
  );
};

export default Index;
