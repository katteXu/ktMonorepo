import { message, Table, Button } from 'antd';
import { useState, useCallback, useEffect } from 'react';
import { quality } from '@api';
import { Status } from '@components';
const Index = props => {
  const { onSelect } = props;
  const columns = [
    {
      title: '采样编号',
      dataIndex: 'reportId',
      key: 'reportId',
      width: 120,
    },
    {
      title: '货品名称',
      dataIndex: 'goodsName',
      key: 'goodsName',
      width: 120,
    },
    {
      title: '化验类型',
      dataIndex: 'purchaseOrSale',
      key: 'purchaseOrSale',
      width: 120,
      render: value => {
        return <Status.Assay code={value} />;
      },
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
    },
    {
      title: '质检员',
      dataIndex: 'operator',
      key: 'operator',
      width: 120,
    },
    {
      title: '操作',
      dataIndex: 'ctrl',
      key: 'ctrl',
      width: 80,
      align: 'right',
      fixed: 'right',
      render: (value, record, index) => (
        <Button size="small" type="link" onClick={() => handleSelect(record)}>
          选择
        </Button>
      ),
    },
  ];
  const [query, setQuery] = useState({
    pageSize: 10,
    page: 1,
  });

  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState({});

  useEffect(() => {
    getRemoteData(query);
  }, []);

  const handleSelect = record => {
    onSelect && onSelect(record);
  };
  // 分页
  const onChangePage = useCallback(
    page => {
      setQuery({ ...query, page });
      getRemoteData({ ...query, page });
    },
    [dataList]
  );

  // 切页码
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      getRemoteData({ ...query, page: 1, pageSize });
    },
    [dataList]
  );

  const getRemoteData = async ({ page, pageSize }) => {
    setLoading(true);
    const params = {
      limit: pageSize,
      page,
      purchaseOrSale: 4,
      isNew: 1, // 移动端区分新老版本
    };
    const res = await quality.getDataList({ params });

    if (res.status === 0) {
      setDataList(res.result);
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };
  return (
    <div>
      <Table
        columns={columns}
        loading={loading}
        dataSource={dataList.data}
        pagination={{
          onChange: onChangePage,
          onShowSizeChange: onChangePageSize,
          showSizeChanger: true,
          pageSize: query.pageSize,
          current: query.page,
          total: dataList.count,
        }}
      />
    </div>
  );
};

export default Index;
