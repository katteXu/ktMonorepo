import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import { Ellipsis, ChildTitle } from '@components';
import { Format } from '@utils/common';

const Index = props => {
  const columns = [
    {
      title: '盘点时间',
      dataIndex: 'checkTime',
      key: 'checkTime',
      width: 200,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '盘盈数量(吨)',
      dataIndex: 'diffNum',
      key: 'diffNum',
      width: 130,
      align: 'right',
      render: value => <span>{value > 0 ? Format.weight(value) : '-'}</span>,
    },
    {
      title: '盘亏数量(吨)',
      dataIndex: 'diffNum',
      key: 'diffNum',
      width: 130,
      align: 'right',
      render: value => <span>{value < 0 ? Format.weight(value) : '-'}</span>,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
      render: value => <Ellipsis value={value} width={120} />,
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
      <ChildTitle style={{ margin: '24px 0 16px', fontWeight: 'bold' }}>关联盘点单</ChildTitle>
      <Table dataSource={dataList} columns={columns} pagination={false} />
    </>
  );
};

export default Index;
