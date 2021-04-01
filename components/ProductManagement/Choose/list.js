// 选煤列表
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { keepState, getState, clearState, Format } from '@utils/common';
import { Input, Button, Table, Modal, Select, message } from 'antd';
import { Search, Ellipsis, Content } from '@components';
import { product } from '@api';
import GoodsForm from './goods_form';

const List = ({ onCoalBlending, isServer, GoodsType }) => {
  const columns = [
    {
      title: '货物类型',
      dataIndex: 'goodsType',
      key: 'goodsType',
      width: 120,
      render: value => {
        const v = GoodsType[value];
        return v ? <Ellipsis value={v} width={130} /> : '-';
      },
    },
    {
      title: '货品名称',
      dataIndex: 'goodsName',
      key: 'goodsName',
      width: 120,
    },
    {
      title: '成本单价(元)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right',
      width: 120,
      render: Format.price,
    },
    {
      title: '水分(% Mad)',
      dataIndex: 'waterContent',
      key: 'waterContent',
      align: 'right',
      width: 120,
      render: Format.percent,
    },
    {
      title: '灰分(% Ad)',
      dataIndex: 'ashContent',
      key: 'ashContent',
      align: 'right',
      width: 120,
      render: Format.percent,
    },
    {
      title: '挥发(% Vdaf)',
      dataIndex: 'volatilization',
      key: 'volatilization',
      align: 'right',
      width: 120,
      render: Format.percent,
    },
    {
      title: '全硫(% Std)',
      dataIndex: 'sulfur',
      key: 'sulfur',
      align: 'right',
      width: 120,
      render: Format.percent,
    },
    {
      title: '回收(% r)',
      dataIndex: 'recovery',
      key: 'recovery',
      align: 'right',
      width: 120,
      render: Format.percent,
    },
    {
      title: '粘结指数(GRI)',
      dataIndex: 'bond',
      key: 'bond',
      align: 'right',
      width: 120,
      render: Format.percent,
    },
    {
      title: '胶质层(Y)',
      dataIndex: 'colloid',
      key: 'colloid',
      align: 'right',
      width: 120,
      render: Format.percent,
    },
    {
      title: '操作',
      dataIndex: 'ctrl',
      key: 'ctrl',
      width: 80,
      fixed: 'right',
      align: 'right',
      render: (value, record) => {
        return (
          <Button size="small" type="link" onClick={() => handleEdit(record)}>
            编辑
          </Button>
        );
      },
    },
  ];
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    goodsName: '',
    goodsType: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState({});
  const [currentFormData, setCurrentFormData] = useState({});
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  useEffect(() => {
    if (isServer) {
      clearState();
    }
    // 获取持久化数据
    const state = getState().query;
    setQuery({ ...query, ...state });
    getRemoteData({
      ...query,
      ...state,
    });
  }, []);

  const [showEdit, setShowEdit] = useState(false);

  // 货品名称
  const handleChangeGoodsName = useCallback(
    e => {
      const value = e.target.value;
      setQuery({ ...query, goodsName: value });
    },
    [query]
  );

  // 货物类型
  const handleChangeGoodsType = useCallback(
    value => {
      setQuery({ ...query, goodsType: value });
    },
    [query]
  );

  // 编辑按钮
  const handleEdit = record => {
    const _form = {
      id: record.id,
      inventoryId: record.inventoryId,
      goodsName: record.goodsName,
      companyName: record.companyName,
      goodsType: GoodsType[record.goodsType],
      cooperation: record.cooperation,
      warningValue: record.warningValue ? `${Format.weight(record.warningValue)} 吨` : '-',
      limitValue: record.limitValue ? `${Format.weight(record.limitValue)} 吨/天` : '-',
      unitPrice: Format.price(record.unitPrice),
      standard_ad: record.ashContent && (record.ashContent / 100).toFixed(2),
      standard_coal: record.cleanCoal && (record.cleanCoal / 100).toFixed(2),
      standard_crc: record.cinder && (record.cinder / 100).toFixed(0),
      standard_fcd: record.carbon && (record.carbon / 100).toFixed(2),
      standard_gangue: record.stone && (record.stone / 100).toFixed(2),
      standard_gri: record.bond && (record.bond / 100).toFixed(2),
      standard_mad: record.waterContent && (record.waterContent / 100).toFixed(2),
      standard_middle: record.midCoal && (record.midCoal / 100).toFixed(2),
      standard_mt: record.totalWaterContent && (record.totalWaterContent / 100).toFixed(2),
      standard_r: record.recovery && (record.recovery / 100).toFixed(2),
      standard_std: record.sulfur && (record.sulfur / 100).toFixed(2),
      standard_vdaf: record.volatilization && (record.volatilization / 100).toFixed(2),
      standard_y: record.colloid && (record.colloid / 100).toFixed(2),
    };
    setCurrentFormData(_form);
    setShowEdit(true);
  };
  // 智能配煤
  const handleCoalBlending = () => {
    if (selectedRows.length < 2) {
      message.warn('请选择至少两种原料煤');
      return;
    }

    onCoalBlending && onCoalBlending(selectedRows);
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

  // 选中
  const onSelectRow = (record, selected) => {
    const key = record.inventoryId;
    if (selected) {
      // 设置选中行数据
      setSelectedRowKeys([...selectedRowKeys, key]);
      setSelectedRows([...selectedRows, record]);
    } else {
      // 移除选中行数据
      const i = selectedRowKeys.indexOf(key);
      selectedRowKeys.splice(i, 1);
      selectedRows.splice(i, 1);
      setSelectedRowKeys([...selectedRowKeys]);
      setSelectedRows([...selectedRows]);
    }
  };

  // 全选
  const onSelectAll = (selected, _selectedRows, changeRows) => {
    changeRows.forEach(record => {
      const key = record.inventoryId;
      const i = selectedRowKeys.indexOf(key);
      if (selected) {
        if (i === -1) {
          selectedRowKeys.push(key);
          selectedRows.push(record);
        }
      } else {
        selectedRowKeys.splice(i, 1);
        selectedRows.splice(i, 1);
      }
    });

    setSelectedRowKeys([...selectedRowKeys]);
    setSelectedRows([...selectedRows]);
  };

  // 查询
  const handleSearch = useCallback(() => {
    setQuery({ ...query, page: 1 });
    setSelectedRowKeys([]);
    setSelectedRows([]);
    getRemoteData({ ...query, page: 1 });
  }, [query]);

  // 重置
  const handleReset = useCallback(() => {
    const query = {
      page: 1,
      pageSize: 10,
      goodsName: '',
      goodsType: undefined,
    };
    setQuery(query);
    setSelectedRowKeys([]);
    setSelectedRows([]);
    getRemoteData(query);
  });

  /**
   * 查询数据
   * @param {Object} param0
   */
  const getRemoteData = async ({ page, pageSize, goodsType, goodsName }) => {
    setLoading(true);

    const params = {
      limit: pageSize,
      page,
      goodsType,
      goodsName,
    };

    const res = await product.getDataList({ params });

    if (res.status === 0) {
      setDataList(res.result);

      // 持久化状态
      keepState({
        query: {
          page,
          pageSize,
          goodsType,
          goodsName,
        },
      });
    } else {
      message.error(`${res.detail || res.description}`);
    }

    setLoading(false);
  };

  // 提交数据
  const handleSubmit = async data => {
    const params = {
      id: data.id,
      inventoryId: data.inventoryId,
      companyName: data.companyName,
      goodsName: data.goodsName, //# 货品名称
      unitPrice: (data.unitPrice * 100).toFixed(0) * 1, //#成本单价
      waterContent: (data.standard_mad * 100).toFixed(0) * 1, //# 水分值
      ashContent: (data.standard_ad * 100).toFixed(0) * 1, //#灰分值
      volatilization: (data.standard_vdaf * 100).toFixed(0) * 1, //# 挥发值
      cinder: (data.standard_crc * 100).toFixed(0) * 1, //#焦渣特征
      sulfur: (data.standard_std * 100).toFixed(0) * 1, //# 全硫值
      carbon: (data.standard_fcd * 100).toFixed(0) * 1, //#固定碳值
      recovery: (data.standard_r * 100).toFixed(0) * 1, //# 回收值
      totalWaterContent: (data.standard_mt * 100).toFixed(0) * 1, //#全水分值
      bond: (data.standard_gri * 100).toFixed(0) * 1, //# 粘结指数值
      colloid: (data.standard_y * 100).toFixed(0) * 1, //#胶质层值
      stone: (data.standard_gangue * 100).toFixed(0) * 1, //#含矸石值
      midCoal: (data.standard_middle * 100).toFixed(0) * 1, //# 含中煤值
      cleanCoal: (data.standard_coal * 100).toFixed(0) * 1, //#含精煤值
    };
    const res = await product.saveRawMaterial({ params });
    if (res.status === 0) {
      message.success('修改原料成功');
      setShowEdit(false);
      handleSearch();
    } else {
      message.error(res.detail || res.description);
    }
  };

  // 可选判断
  const canCheck = record => {
    const { unitPrice, waterContent, ashContent, volatilization, sulfur, recovery, bond, colloid } = record;
    const disabled = !(
      unitPrice &&
      (waterContent || ashContent || volatilization || sulfur || recovery || bond || colloid)
    );
    return { disabled };
  };
  return (
    <Content style={{ marginTop: 24 }}>
      <header>
        配煤列表
        <Button style={{ float: 'right' }} type="primary" onClick={handleCoalBlending}>
          智能配煤
        </Button>
      </header>
      <section>
        <Search simple onSearch={handleSearch} onReset={handleReset}>
          <Search.Item label="货品名称">
            <Input allowClear value={query.goodsName} placeholder="请输入货品名称" onChange={handleChangeGoodsName} />
          </Search.Item>
          <Search.Item label="货物类型">
            <Select
              value={query.goodsType || undefined}
              allowClear
              placeholder="请选择货物类型"
              style={{ width: '100%' }}
              onChange={handleChangeGoodsType}>
              {Object.keys(GoodsType).map(v => {
                return (
                  <Select.Option value={v} key={v}>
                    {GoodsType[v]}
                  </Select.Option>
                );
              })}
            </Select>
          </Search.Item>
        </Search>
        <div style={{ marginTop: 16 }}>
          <Table
            columns={columns}
            rowKey="inventoryId"
            rowSelection={{
              selectedRowKeys,
              onSelect: onSelectRow,
              onSelectAll: onSelectAll,
              columnWidth: '17px',
              getCheckboxProps: canCheck,
            }}
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
        </div>
      </section>

      {/* 编辑 */}
      <Modal
        width={860}
        destroyOnClose
        maskClosable={false}
        visible={showEdit}
        footer={null}
        onCancel={() => {
          setShowEdit(false);
        }}
        title="编辑原料">
        <GoodsForm onClose={() => setShowEdit(false)} onSubmit={handleSubmit} formData={currentFormData} />
      </Modal>
    </Content>
  );
};

export default List;
