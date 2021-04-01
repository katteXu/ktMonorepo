import React from 'react';
import styles from './styles.less';
import { Ellipsis } from '@components';
import { Table, Progress } from 'antd';
const Index = ({ dataList }) => {
  const columns = [
    {
      title: '',
      dataIndex: 'sign',
      key: 'sign',
      width: 100,
      render: value => <Ellipsis value={value} width={90} />,
    },
    {
      title: '合同名称',
      dataIndex: 'title',
      key: 'title',
      width: 100,
      render: value => <Ellipsis value={value} width={90} />,
    },
    {
      title: '货品名称',
      dataIndex: 'goodsName',
      key: 'goodsName',
      width: 70,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '货物总量(吨)',
      dataIndex: 'goodsWeight',
      key: 'goodsWeight',
      // align: 'right',
      width: 70,
      // render: Format.weight,
    },
    {
      title: '完成度',
      dataIndex: 'complete',
      key: 'complete',
      width: 100,
      align: 'right',
      render: value => {
        return <Progress percent={value} showInfo={false} />;
      },
    },
  ];
  return (
    <div className={styles.tableStyle}>
      <Table
        rowKey={(record, index) => index}
        dataSource={dataList}
        columns={columns}
        pagination={false}
        scroll={{ x: 'auto' }}
      />
    </div>
  );
};

export default Index;
