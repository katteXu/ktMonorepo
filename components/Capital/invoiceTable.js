import { Table } from 'antd';
import { useState, useEffect, useCallback } from 'react';
import { capital } from '@api';
import { Format } from '@utils/common';
const Index = props => {
  const [loading, setLoading] = useState(true);

  const [list, setList] = useState([]);

  const columns = [
    {
      title: '批次号',
      dataIndex: 'batchId',
      key: 'batchId',
      width: 120,
    },
    {
      title: '结算净重(吨)',
      dataIndex: 'weightSum',
      key: 'weightSum',
      align: 'right',
      width: 120,
      render: Format.weight,
    },
    {
      title: '运费金额(元)',
      dataIndex: 'priceSum',
      key: 'priceSum',
      width: 120,
      align: 'right',
      render: Format.price,
    },
    {
      title: '含税金额(元)',
      dataIndex: 'invoicePriceSum',
      key: 'invoicePriceSum',
      width: 120,
      align: 'right',
      render: Format.price,
    },
    {
      title: '税费金额(元)',
      dataIndex: 'priceDiff',
      key: 'priceDiff',
      width: 120,
      align: 'right',
      render: Format.price,
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
      align: 'right',
      render: value => {
        return value || '-';
      },
    },
  ];

  useEffect(() => {
    setData();
  }, [props.walletId]);

  const setData = useCallback(async () => {
    setLoading(true);
    const params = {
      id: props.walletId,
    };
    const { status, result, detail, description } = await capital.walletDetailList({ params });
    if (!status) {
      setList([result.data]);
    } else {
      //   message.error(detail || description);
    }
    setLoading(false);
  }, [props.walletId]);

  return (
    <>
      <Table
        style={{ marginTop: 4 }}
        loading={loading}
        dataSource={list}
        columns={columns}
        scroll={{ x: 'auto' }}
        pagination={false}
      />
    </>
  );
};

export default Index;
