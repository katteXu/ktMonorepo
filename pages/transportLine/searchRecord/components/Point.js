import { useState, useCallback, useEffect } from 'react';
import { Input, message, Table } from 'antd';
import { getTruckQuerRecordLocationList } from '@api';
import { Search } from '@components';

const Point = props => {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    plateNum: '',
  });

  const columns = [
    {
      title: '车牌号',
      dataIndex: 'trailerPlateNumber',
      key: 'trailerPlateNumber',
      width: 120,
    },
    {
      title: '查询时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
    },
    {
      title: '上报时间',
      dataIndex: 'uploadTime',
      key: 'uploadTime',
      width: 120,
    },
    {
      title: '上报位置',
      dataIndex: 'address',
      key: 'address',
      width: 120,
      align: 'right',
    },
  ];

  const [dataList, setDataList] = useState({});
  // 初始化
  useEffect(() => {
    getDataList(query);
  }, []);

  // 分页
  const onChangePage = useCallback(
    page => {
      setQuery({ ...query, page });
      getDataList({ ...query, page });
    },
    [dataList]
  );

  // 切页码
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      getDataList({ ...query, page: 1, pageSize });
    },
    [dataList]
  );

  // 查询接口
  const getDataList = async query => {
    const params = {
      page: query.page,
      limit: query.pageSize,
      trailerPlateNumber: query.plateNum,
    };
    const res = await getTruckQuerRecordLocationList({ params });
    if (res.status === 0) {
      setDataList(res.result);
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };

  const handleSearch = () => {
    getDataList(query);
  };

  const handleReset = useCallback(() => {
    setQuery(query);
    getDataList({ ...query, plateNum: '' });
  }, []);

  const handleChangePlate = e => {
    const plateNum = e.target.value;
    setQuery({ ...query, plateNum });
  };

  return (
    <>
      <Search onSearch={handleSearch} onReset={handleReset} simple>
        <Search.Item label="车牌号">
          <Input allowClear placeholder="请输入车牌号" value={query.plateNum} onChange={handleChangePlate}></Input>
        </Search.Item>
      </Search>

      <Table
        style={{ marginTop: 24 }}
        columns={columns}
        pagination={{
          onChange: onChangePage,
          onShowSizeChange: onChangePageSize,
          showSizeChanger: true,
          pageSize: query.pageSize,
          current: query.page,
          total: dataList.count,
        }}
        dataSource={dataList.data}
        loading={loading}
        scroll={{ x: 'auto' }}
      />
    </>
  );
};

export default Point;
