import { useState, useEffect, useCallback } from 'react';
import { railWay } from '@api';
import { message, Button, Tag, Input, Table } from 'antd';
import { ChildTitle, Search } from '@components';
import styles from './styles.less';

const SpecifyForm = props => {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    name: undefined,
    phone: undefined,
  });
  const [dataList, setDataList] = useState();

  // 选择
  const [selectedTruckers, setSelectedTruckers] = useState([]);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'truckerId',
      width: '70px',
      ellipsis: true,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '姓名',
      dataIndex: 'name',
      width: '100px',
      ellipsis: true,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '手机号',
      dataIndex: 'companyContactMobile',
      width: '120px',
      ellipsis: true,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '车牌号',
      dataIndex: 'truckPlate',
      width: '120px',
      ellipsis: true,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '车长',
      dataIndex: 'truckLength',
      width: '80px',
      ellipsis: true,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '车型',
      dataIndex: 'truckType',
      width: '120px',
      ellipsis: true,
      render: value => {
        return value || '-';
      },
    },
  ];

  useEffect(() => {
    // 获取司机列表
    getData(query);
  }, []);

  // 获取详情
  const getData = async ({ page, pageSize, name, phone }) => {
    setLoading(true);
    const params = {
      page,
      limit: pageSize,
      name,
      phone,
    };
    const res = await railWay.getTruckerList({ params });

    if (res.status === 0) {
      setDataList(res.result);
    } else {
      message.error(res.detail || res.description);
    }

    setLoading(false);
  };

  // 搜索
  const handleSearch = () => {
    getData(query);
  };

  // 重置
  const handleReset = () => {
    setQuery({ page: 1 });
    setSelectedTruckers([]);
    getData({ page: 1 });
  };

  // // 刷新
  // const reload = () => {
  //   getData(query);
  // };

  // // 换页
  // const onChangePage = useCallback(
  //   (page, pageSize) => {
  //     setQuery({ ...query, page, pageSize });
  //     getData({ ...query, page, pageSize });
  //   },
  //   [dataList]
  // );

  // 选中
  const onSelectRow = (record, selected) => {
    const key = record.truckerId;
    if (selected) {
      setSelectedTruckers([...selectedTruckers, record]);
    } else {
      const i = selectedTruckers.findIndex(item => item.truckerId === key);
      selectedTruckers.splice(i, 1);
      setSelectedTruckers([...selectedTruckers]);
    }
  };

  // 全选
  const onSelectAll = (selected, selectedRows, changeRows) => {
    changeRows.forEach(record => {
      const key = record.truckerId;
      const i = selectedTruckers.findIndex(item => item.truckerId === key);
      if (selected) {
        if (i === -1) {
          selectedTruckers.push(record);
        }
      } else {
        selectedTruckers.splice(i, 1);
      }
    });

    setSelectedTruckers([...selectedTruckers]);
  };

  const handleCloseTag = record => {
    const key = record.truckerId;
    const i = selectedTruckers.findIndex(item => item.truckerId === key);
    selectedTruckers.splice(i, 1);
    setSelectedTruckers([...selectedTruckers]);
  };

  const handleSubmit = () => {
    if (selectedTruckers.length) {
      props.onSubmit && props.onSubmit({ truckerIds: selectedTruckers.map(item => item.truckerId).join(',') });
    } else {
      message.warn('请选择司机进行发布');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 40 }}>
      <div>
        <ChildTitle
          className="hei14"
          style={{
            color: '#333333',
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '8px',
          }}>
          <div>已选司机</div>
        </ChildTitle>
        <div className={styles['truncker-name']}>
          <div style={{ paddingTop: 8 }}>司机姓名：</div>
          <div className={styles.truckerList}>
            {selectedTruckers.map(tag => (
              <Tag key={tag.truckerId} closable onClose={() => handleCloseTag(tag)}>
                {tag.name}
              </Tag>
            ))}
          </div>
        </div>

        <ChildTitle
          className="hei14"
          style={{
            color: '#333333',
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '8px',
          }}>
          <div>查找司机</div>
        </ChildTitle>

        <div className={styles['truncker-searcher']}>
          <Search onSearch={handleSearch} onReset={handleReset}>
            <Search.Item label="司机姓名">
              <Input
                allowClear
                placeholder="请输入司机姓名"
                value={query.name}
                onChange={e => setQuery(() => ({ ...query, name: e.target.value }))}
              />
            </Search.Item>
            <Search.Item label="手机号">
              <Input
                allowClear
                placeholder="请输入手机号"
                value={query.phone}
                onChange={e => setQuery(() => ({ ...query, phone: e.target.value }))}
              />
            </Search.Item>
          </Search>
        </div>

        <Table
          columns={columns}
          dataSource={dataList}
          loading={loading}
          size="middle"
          rowKey="truckerId"
          scroll={{ x: '100%' }}
          style={{ marginTop: 16 }}
          pagination={false}
          rowSelection={{
            selectedRowKeys: selectedTruckers.map(item => item.truckerId),
            onSelect: onSelectRow,
            onSelectAll: onSelectAll,
            columnWidth: '37px',
          }}
        />
      </div>

      <div className={styles['bottom-btn']}>
        <div style={{ textAlign: 'right' }}>
          <Button onClick={() => props.onClose()}>取消</Button>
          <Button type="primary" style={{ marginLeft: 12 }} onClick={handleSubmit}>
            确定
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SpecifyForm;
