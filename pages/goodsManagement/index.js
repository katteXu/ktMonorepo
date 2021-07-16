import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Content, Search, Ellipsis } from '@components';
import { Input, Button, Table, Modal, Popconfirm, message, Select } from 'antd';
import { keepState, getState, clearState, Format } from '@utils/common';
import { QuestionCircleFilled } from '@ant-design/icons';
import { stock, getGoodsType } from '@api';
import router from 'next/router';

const routeView = {
  title: '货品管理',
  pageKey: 'goodsManagement',
  longKey: 'goodsManagement',
  breadNav: '货品管理.货品列表',
  pageTitle: '货品列表',
};

const GoodsManagement = props => {
  // 列数据
  const columns = [
    {
      title: '货品名称',
      dataIndex: 'goodsName',
      key: 'goodsName',
      width: 120,
      render: value => <Ellipsis value={value} width={130} />,
    },
    {
      title: '供应商',
      dataIndex: 'supplyCompany',
      key: 'supplyCompany',
      width: 200,
      render: value => value || '-',
    },
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
      title: '存货类别',
      dataIndex: 'supplyCompany',
      key: 'supplyCompany',
      width: 200,
      render: value => value || '-',
    },
    {
      title: '库存(吨)',
      dataIndex: 'inventoryValue',
      key: 'inventoryValue',
      width: 80,
      align: 'right',
      render: value => <Ellipsis value={Format.weight(value)} />,
    },

    {
      title: '操作',
      dataIndex: 'ctrl',
      key: 'ctrl',
      width: 80,
      align: 'right',
      fixed: 'right',
      render: (value, record, index) => (
        <>
          <Button
            size="small"
            type="link"
            key="detail"
            onClick={() => {
              router.push(`/goodsManagement/detail?id=${record.id}`);
            }}>
            详情
          </Button>
          <Button
            size="small"
            type="link"
            key="update"
            onClick={() => router.push(`/goodsManagement/edit?id=${record.id}`)}>
            编辑
          </Button>
          <Popconfirm
            title="是否删除该货品？"
            placement="topRight"
            icon={<QuestionCircleFilled />}
            onConfirm={() => handleRemove(record.id)}>
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  // 查询条件
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    goodsName: '',
    goodsType: undefined,
  });

  const [GoodsType, setGoodsType] = useState({});

  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState({});
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // 初始化
  useEffect(() => {
    const { isServer } = props;

    // 初始化货物类型
    initGoodsType();

    if (isServer) {
      clearState();
    }
    // 获取持久化数据
    const state = getState().query;
    setQuery({ ...query, ...state });
    getRemoteData({ ...query, ...state });
  }, []);

  // 初始化货物类型
  const initGoodsType = async () => {
    const res = await getGoodsType();
    if (res.status === 0) {
      const _goods = {};
      res.result.forEach(v => {
        _goods[v.key] = v.name;
      });
      setGoodsType(_goods);
    }
  };

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

  // 分页
  const onChangePage = useCallback(
    (page, pageSize) => {
      setQuery({ ...query, page, pageSize });
      getRemoteData({ ...query, page, pageSize });
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
    const key = record.id;
    if (selected) {
      setSelectedRowKeys([...selectedRowKeys, key]);
    } else {
      const i = selectedRowKeys.indexOf(key);
      selectedRowKeys.splice(i, 1);
      setSelectedRowKeys([...selectedRowKeys]);
    }
  };

  // 全选
  const onSelectAll = (selected, selectedRows, changeRows) => {
    changeRows.forEach(record => {
      const key = record.id;
      const i = selectedRowKeys.indexOf(key);
      if (selected) {
        if (i === -1) selectedRowKeys.push(key);
      } else {
        selectedRowKeys.splice(i, 1);
      }
    });

    setSelectedRowKeys([...selectedRowKeys]);
  };
  // 查询
  const handleSearch = useCallback(() => {
    setQuery({ ...query, page: 1 });
    setSelectedRowKeys([]);
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
    getRemoteData(query);
  });

  // 批量删除
  const handleBatchRemove = () => {
    if (selectedRowKeys.length === 0) {
      message.error('请选择要删除的信息');
      return false;
    }
    Modal.confirm({
      title: '是否批量删除？',
      icon: <QuestionCircleFilled />,
      okType: 'danger',
      onOk: async () => {
        let params = {
          inventoryIds: selectedRowKeys.join(','),
        };
        const res = await stock.deleteGoods({ params });
        if (res.status === 0) {
          message.success('批量删除成功');
          setSelectedRowKeys([]);
          handleSearch();
        } else {
          message.error(`批量删除失败，原因：${res.detail || res.description}`);
        }
      },
    });
  };

  // 确认删除 TODO:删除返回
  const handleRemove = async id => {
    const params = {
      inventoryIds: id,
    };
    const res = await stock.deleteGoods({ params });
    if (res.status === 0) {
      message.success('删除成功');
      handleSearch();
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };

  /**
   * 查询数据
   * @param {Object} param0
   */
  const getRemoteData = async ({ page, pageSize, goodsType, goodsName }) => {
    setLoading(true);

    const params = {
      page,
      limit: pageSize,
      goodsType,
      goodsName,
    };

    const res = await stock.getInventoryList({ params });

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
  const submit = async data => {
    const id = data.id;

    const params = {
      goodsType: data.goodsType,
      goodsName: data.goodsName,
      rawMaterial: data.materials,
      unitPrice: (data.unitPrice * 100).toFixed(0) * 1,
      waterContentMin: data.standard_mad.min ? (data.standard_mad.min * 100).toFixed(0) * 1 : 0,
      waterContentMax: data.standard_mad.max ? (data.standard_mad.max * 100).toFixed(0) * 1 : 0,
      ashContentMin: data.standard_ad.min ? (data.standard_ad.min * 100).toFixed(0) * 1 : 0,
      ashContentMax: data.standard_ad.max ? (data.standard_ad.max * 100).toFixed(0) * 1 : 0,
      volatilizationMin: data.standard_vdaf.min ? (data.standard_vdaf.min * 100).toFixed(0) * 1 : 0,
      volatilizationMax: data.standard_vdaf.max ? (data.standard_vdaf.max * 100).toFixed(0) * 1 : 0,
      cinder: data.standard_crc ? (data.standard_crc * 100).toFixed(0) * 1 : 0,
      sulfurMin: data.standard_std.min ? (data.standard_std.min * 100).toFixed(0) * 1 : 0,
      sulfurMax: data.standard_std.max ? (data.standard_std.max * 100).toFixed(0) * 1 : 0,
      carbonMin: data.standard_fcd.min ? (data.standard_fcd.min * 100).toFixed(0) * 1 : 0,
      carbonMax: data.standard_fcd.max ? (data.standard_fcd.max * 100).toFixed(0) * 1 : 0,
      recoveryMin: data.standard_r.min ? (data.standard_r.min * 100).toFixed(0) * 1 : 0,
      recoveryMax: data.standard_r.max ? (data.standard_r.max * 100).toFixed(0) * 1 : 0,
      totalWaterContentMin: data.standard_mt.min ? (data.standard_mt.min * 100).toFixed(0) * 1 : 0,
      totalWaterContentMax: data.standard_mt.max ? (data.standard_mt.max * 100).toFixed(0) * 1 : 0,
      bondMin: data.standard_gri.min ? (data.standard_gri.min * 100).toFixed(0) * 1 : 0,
      bondMax: data.standard_gri.max ? (data.standard_gri.max * 100).toFixed(0) * 1 : 0,
      colloidMin: data.standard_y.min ? (data.standard_y.min * 100).toFixed(0) * 1 : 0,
      colloidMax: data.standard_y.max ? (data.standard_y.max * 100).toFixed(0) * 1 : 0,
      stoneMin: data.standard_gangue.min ? (data.standard_gangue.min * 100).toFixed(0) * 1 : 0,
      stoneMax: data.standard_gangue.max ? (data.standard_gangue.max * 100).toFixed(0) * 1 : 0,
      midCoalMin: data.standard_middle.min ? (data.standard_middle.min * 100).toFixed(0) * 1 : 0,
      midCoalMax: data.standard_middle.max ? (data.standard_middle.max * 100).toFixed(0) * 1 : 0,
      cleanCoalMin: data.standard_coal.min ? (data.standard_coal.min * 100).toFixed(0) * 1 : 0,
      cleanCoalMax: data.standard_coal.max ? (data.standard_coal.max * 100).toFixed(0) * 1 : 0,
    };

    // 如果存在id
    if (id) {
      params.id = id;
    }

    const res = id ? await stock.modifyGoods({ params }) : await stock.addGoods({ params });
    if (res.status === 0) {
      message.success('提交成功');
      handleSearch();
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };

  return (
    <Layout {...routeView}>
      <Content>
        <section>
          <Button type="primary" style={{ marginBottom: 16 }} onClick={() => router.push(`/goodsManagement/create`)}>
            新增货品
          </Button>
          <Search onSearch={handleSearch} onReset={handleReset}>
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
            <Search.Item label="存货类别">
              <Select
                onChange={e => {
                  setQuery({ ...query, isRawMaterial: e });
                }}
                value={query.isRawMaterial}
                allowClear
                placeholder="请输入存货类别">
                <Select.Option value="1">原材料</Select.Option>
                <Select.Option value="0">产成品</Select.Option>
              </Select>
            </Search.Item>
          </Search>
          <Button style={{ margin: '16px 0' }} onClick={handleBatchRemove}>
            批量删除
          </Button>
          <Table
            loading={loading}
            dataSource={dataList.data}
            columns={columns}
            pagination={{
              onChange: onChangePage,
              showSizeChanger: true,
              pageSize: query.pageSize,
              current: query.page,
              total: dataList.count,
            }}
            rowSelection={{
              selectedRowKeys,
              onSelect: onSelectRow,
              onSelectAll: onSelectAll,
              columnWidth: '17px',
            }}
            scroll={{ x: 'auto' }}
          />
        </section>
      </Content>
    </Layout>
  );
};

export default GoodsManagement;
