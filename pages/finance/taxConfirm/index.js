import React, { useState, useEffect, useCallback } from 'react';
import { QuestionCircleFilled } from '@ant-design/icons';
import { Layout, Content } from '@components';
import { Button, Table, Modal, message } from 'antd';
import { Format } from '@utils/common';
import { finance } from '@api';
const Index = () => {
  const routeView = {
    title: '返税确认',
    pageKey: 'taxConfirm',
    longKey: 'finance.taxConfirm',
    breadNav: '财务中心.返税确认',
    pageTitle: '返税确认',
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'batchId',
      key: 'batchId',
      width: 90,
      render: (value, record, index) => {
        const i = (dataList.page - 1) * 10 + index + 1;
        return i;
      },
    },
    {
      title: '奖补期间',
      dataIndex: 'timeTag',
      key: 'timeTag',
      width: 90,
    },
    {
      title: '奖补总额(元)',
      dataIndex: 'priceSum',
      key: 'priceSum',
      align: 'right',
      width: 120,
      render: Format.price,
    },
    {
      title: '奖补比例',
      dataIndex: 'percentage',
      key: 'percentage',
      align: 'right',
      width: 120,
      render: value => {
        return `${(value / 100).toFixed(2)}%`;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'right',
      width: 90,
      render: value => {
        return value === 1 ? '待确认' : '已确认';
      },
    },
    {
      title: '操作',
      key: 'ctrl',
      fixed: 'right',
      align: 'right',
      width: 40,
      render: (value, record) => {
        return record.status === 1 ? (
          <Button
            size="small"
            type="link"
            onClick={() => {
              handleSubmit(record);
            }}>
            确认
          </Button>
        ) : (
          '-'
        );
      },
    },
  ];

  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState({});
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
  });
  useEffect(() => {
    getRemoteData(query);
  }, []);

  const handleSubmit = record => {
    Modal.confirm({
      icon: <QuestionCircleFilled />,
      title: '确认收到',
      content: '是否已确认收到？',
      onOk: async () => {
        const params = {
          checkId: record.id,
        };
        const res = await finance.returnTaxConfirm({ params });
        if (res.status === 0) {
          getRemoteData(query);
        } else {
          message.error(res.detail || res.description);
        }
      },
    });
  };

  // 分页
  const onChangePage = useCallback(
    (page, pageSize) => {
      setQuery({ ...query, page, pageSize });
      getRemoteData({ ...query, page, pageSize });
    },
    [query]
  );

  const getRemoteData = async ({ page, pageSize = 10 }) => {
    setLoading(true);
    const params = {
      limit: pageSize,
      page,
    };

    const res = await finance.getReturnTaxList({ params });

    if (res.status === 0) {
      setDataList(res.result);
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };
  return (
    <Layout {...routeView}>
      <Content>
        <section>
          <Table
            columns={columns}
            loading={loading}
            dataSource={dataList.data}
            pagination={{
              onChange: onChangePage,
              pageSize: query.pageSize,
              current: query.page,
              total: dataList.count,
            }}
          />
        </section>
      </Content>
    </Layout>
  );
};

export default Index;
