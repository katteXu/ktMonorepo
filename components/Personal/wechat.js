import { useState, useEffect, useCallback } from 'react';
import { Content } from '@components';
import { Table, Button, message, Popconfirm } from 'antd';
import { wxBind } from '@api';
import { QuestionCircleFilled } from '@ant-design/icons';

const WxBind = props => {
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '手机号',
      dataIndex: 'username',
      key: 'username',
      width: 200,
    },
    {
      title: '绑定时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      align: 'right',
      width: 70,
      render: (text, data, index) => {
        return (
          <Popconfirm
            title="是否解除绑定该微信？"
            placement="topRight"
            icon={<QuestionCircleFilled />}
            onConfirm={() => deleteRole(data.id)}>
            <Button size="small" type="link" style={{ color: 'red', padding: 0 }}>
              解除绑定
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState({});

  // 查询条件
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
  });

  useEffect(() => {
    formatDataSource(query);
  }, []);

  const formatDataSource = async ({ page, pageSize }) => {
    setLoading(true);
    let params = {
      page,
      limit: pageSize,
    };
    const res = await wxBind.getTableData({ params });
    if (res.status === 0) {
      setDataList(res.result);
    }
    setLoading(false);
  };

  const deleteRole = async id => {
    let params = {
      wid: id,
    };
    const res = await wxBind.deleteWx({ params });
    if (res.status == 0) {
      message.success('微信解绑成功');
      formatDataSource({ ...query });
    } else {
      message.error(`微信解绑失败，原因：${res.detail || res.description}`);
    }
  };

  // 翻页
  const onChangePage = useCallback(
    page => {
      setQuery({ ...query, page });
      formatDataSource({ ...query, page });
    },
    [dataList]
  );

  // 切换最大页数
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      formatDataSource({ ...query, page: 1, pageSize });
    },
    [dataList]
  );

  return (
    <Content style={{ minHeight: 557 }}>
      <header style={{ border: 0, fontWeight: 400 }}>
        已绑定微信号:
        <span className="total-number" style={{ fontSize: 20, margin: '0 8px' }}>
          {dataList.count}
        </span>
        个
      </header>
      <div style={{ padding: '0 24px' }}>
        <Table
          columns={columns}
          dataSource={dataList.data}
          rowKey="id"
          pagination={{
            onChange: onChangePage,
            pageSize: query.pageSize,
            onShowSizeChange: onChangePageSize,
            current: query.page,
            total: dataList.count,
          }}
        />
      </div>
    </Content>
  );
};

export default WxBind;
