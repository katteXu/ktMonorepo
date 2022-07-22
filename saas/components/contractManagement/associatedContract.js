/** @format */
// 按专线结算列表
import React, { useState, useEffect, useCallback } from 'react';
import { Table, message, Input } from 'antd';
import { Ellipsis, Search } from '@components';
import { Format } from '@utils/common';
import { contract } from '@api';
const Index = ({ onSubmit }) => {
  const columns = [
    {
      title: '合同名称',
      dataIndex: 'title',
      key: 'title',
      width: 150,
      render: value => <Ellipsis value={value} width={120} />,
    },
    {
      title: '签订对象',
      dataIndex: 'partner_name',
      key: 'partner_name',
      width: 150,
      render: value => <Ellipsis value={value} width={120} />,
    },
    {
      title: '负责人',
      dataIndex: 'principal',
      key: 'principal',
      width: 100,
    },
    {
      title: '货物总量(吨)',
      dataIndex: 'totalWeight',
      key: 'totalWeight',
      width: 120,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '合同金额(元)',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 130,
      align: 'right',
      render: Format.price,
    },
  ];

  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
  });

  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState({});
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  // 初始化
  useEffect(() => {
    getRemoteData({ ...query });
  }, []);

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

  /**
   * 查询数据
   * @param {Object} param0
   */
  const getRemoteData = async ({ title, principal }) => {
    setLoading(true);

    const params = {
      page: 1,
      limit: 200,
      title,
      principal,
    };
    const res = await contract.contract_choice({ params });

    if (res.status === 0) {
      setDataList(res.result);
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };

  // 合同名称
  const handleChangecontractName = useCallback(e => {
    const title = e.target.value;
    setQuery(() => ({ ...query, title }));
  });

  // 姓名
  const handleChangeName = useCallback(e => {
    const principal = e.target.value;
    setQuery(() => ({ ...query, principal }));
  });
  //  查询
  const handleSearch = useCallback(() => {
    setQuery({ ...query, page: 1 });

    getRemoteData({ ...query, page: 1 });
    setSelectedRowKeys([]);
  }, [query]);

  // 重置
  const handleReset = useCallback(() => {
    const query = {
      title: '',
      principal: '',
    };
    setQuery(query);
    getRemoteData(query);
    setSelectedRowKeys([]);
  }, []);

  // 选中单一值
  const onSelectRow = (record, selected, selectedRows, nativeEvent) => {
    const key = record.id;
    if (selected) {
      setSelectedRowKeys([...selectedRowKeys, key]);
    } else {
      const i = selectedRowKeys.indexOf(key);
      selectedRowKeys.splice(i, 1);
      setSelectedRowKeys([...selectedRowKeys]);
    }
  };

  // 选中所有
  const onSelectAll = (selected, selectedRows, changeRows) => {
    changeRows.forEach(record => {
      const i = selectedRowKeys.indexOf(record.id);
      if (selected) {
        if (i === -1) selectedRowKeys.push(record.id);
      } else {
        selectedRowKeys.splice(i, 1);
      }
    });
    setSelectedRowKeys([...selectedRowKeys]);
  };

  useEffect(() => {
    onSubmit(selectedRowKeys);
  }, [selectedRowKeys]);
  return (
    <div
      style={{
        background: '#F7F7F7',
        padding: 24,
        width: 800,
        margin: '-20px 0 24px 113px',
      }}>
      <Search onSearch={handleSearch} onReset={handleReset} simple color="#f7f7f7">
        <Search.Item label="合同名称">
          <Input placeholder="请输入合同名称" allowClear value={query.title} onChange={handleChangecontractName} />
        </Search.Item>
        <Search.Item label="负责人">
          <Input placeholder="请输入负责人" allowClear value={query.principal} onChange={handleChangeName} />
        </Search.Item>
      </Search>
      <Table
        loading={loading}
        dataSource={dataList.data}
        columns={columns}
        rowKey={(record, i) => record.id}
        pagination={false}
        size="small"
        rowSelection={{
          selectedRowKeys: selectedRowKeys,
          onSelect: onSelectRow,
          onSelectAll: onSelectAll,
        }}
        scroll={{ y: 300 }}
      />
    </div>
  );
};

export default Index;
