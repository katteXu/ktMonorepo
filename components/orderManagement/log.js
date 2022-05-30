import { useState, useEffect } from 'react';
import styles from './styles.less';
import { message, Spin, Table } from 'antd';
import { order } from '@api';
import { Ellipsis } from '@components';
import { getQuery } from '@utils/common';

const Index = props => {
  const [dataInfo, setDataInfo] = useState({});
  const [annexUrl, setAnnexUrl] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDetail();
  }, []);

  const columns = [
    {
      title: '时间',
      dataIndex: 'date',
      width: 200,
      render: value => value || '-',
    },
    {
      title: '账号',
      dataIndex: 'phoneNum',
      width: 200,
      render: value => value || '-',
    },
    {
      title: '姓名',
      dataIndex: 'operatorName',
      width: 200,
      render: value => value || '-',
    },
    {
      title: '动作',
      dataIndex: 'operatorAction',
      width: 200,
      render: value => value || '-',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 200,
      render: value => <Ellipsis value={value} width={150} />,
    },
  ];

  const getDetail = async () => {
    setLoading(true);
    const { id } = getQuery();

    const res = await order.examineLog({ orderId: id });

    if (res.status === 0) {
      setDataInfo(res.result);
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };

  return (
    <Spin spinning={loading}>
      <div className={styles.topContent}>
        <Table
          loading={loading}
          size="middle"
          dataSource={dataInfo.data}
          columns={columns}
          rowKey="id"
          scroll={{ x: '1200px' }}
          pagination={false}
        />
      </div>
    </Spin>
  );
};
export default Index;
