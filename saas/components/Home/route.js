import { useState, useEffect } from 'react';
import { Table, Tooltip } from 'antd';
import styles from './styles.less';

const columns = [
  {
    title: '发货企业',
    dataIndex: ['fromAddressCompany', 'companyName'],
    key: 'fromAddressCompany.companyName',

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
    title: '收货企业',
    dataIndex: ['toAddressCompany', 'companyName'],
    key: 'toAddressCompany.companyName',

    render: value => {
      return (
        <Tooltip title={value} overlayStyle={{ maxWidth: 'max-content' }}>
          <div className="max-label" style={{ width: 120 }}>
            {value || '-'}
          </div>
        </Tooltip>
      );
    },
  },
  {
    title: '货品名称',
    dataIndex: 'goodsType',
    key: 'goodsType',

    render: value => {
      return (
        <Tooltip title={value} overlayStyle={{ maxWidth: 'max-content' }}>
          <div className="max-label" style={{ width: 70 }}>
            {value || '-'}
          </div>
        </Tooltip>
      );
    },
  },
  {
    title: '收货净重',
    align: 'right',
    render: (text, record, index) => {
      return <span>{(record.finishAmount / 1000).toFixed(2) + record.unitName} </span>;
    },
  },
];

const Route = ({ dataList, loading }) => {
  const [load, setLoad] = useState(true);
  useEffect(() => {
    setLoad(loading);
  }, [loading]);
  return (
    <Table
      style={{ height: 235 }}
      loading={load}
      className={styles.table}
      pagination={false}
      dataSource={dataList}
      columns={columns}
      scroll={{ x: 'auto' }}
      rowKey="id"></Table>
  );
};

export default Route;
