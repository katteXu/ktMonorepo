import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Content, Search, Ellipsis } from '@components';
import { Input, Button, Table, Modal, Popconfirm, message, Select } from 'antd';
import { keepState, getState, clearState, Format } from '@utils/common';
import { QuestionCircleFilled } from '@ant-design/icons';
import GoodsForm from '@components/GoodsManagement/GoodsForm';
import GoodsDetail from '@components/GoodsManagement/GoodsDetail';
import { stock, getGoodsType } from '@api';
import deleteBtn from './deleteBtn.less';
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
      render: value => <Ellipsis value={value} width={130} />,
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
      title: '水分(% Mad)',
      dataIndex: 'goodsComponent',
      key: 'mad',
      align: 'right',
      width: 80,
      render: value => {
        const { waterContentMin = 0, waterContentMax = 0 } = value;
        return Format.range(waterContentMin, waterContentMax);
      },
    },
    {
      title: '灰分(% Ad)',
      dataIndex: 'goodsComponent',
      key: 'ad',
      align: 'right',
      width: 80,
      render: value => {
        const { ashContentMin = 0, ashContentMax = 0 } = value;
        return Format.range(ashContentMin, ashContentMax);
      },
    },
    {
      title: '挥发(% Vdaf)',
      dataIndex: 'goodsComponent',
      key: 'vdaf',
      align: 'right',
      width: 80,
      render: value => {
        const { volatilizationMin = 0, volatilizationMax = 0 } = value;
        return Format.range(volatilizationMin, volatilizationMax);
      },
    },
    {
      title: '焦渣特征(1-8 CRC)',
      dataIndex: 'goodsComponent',
      key: 'crc',
      align: 'right',
      width: 80,
      render: value => {
        const { cinder = 0 } = value;
        return (cinder / 100).toFixed(0);
      },
    },
    {
      title: '全硫(% Std)',
      dataIndex: 'goodsComponent',
      key: 'std',
      align: 'right',
      width: 80,
      render: value => {
        const { sulfurMin = 0, sulfurMax = 0 } = value;
        return Format.range(sulfurMin, sulfurMax);
      },
    },
    {
      title: '固定碳(% FCd)',
      dataIndex: 'goodsComponent',
      key: 'fcd',
      align: 'right',
      width: 80,
      render: value => {
        const { carbonMin = 0, carbonMax = 0 } = value;
        return Format.range(carbonMin, carbonMax);
      },
    },
    {
      title: '回收(% r)',
      dataIndex: 'goodsComponent',
      key: 'r',
      align: 'right',
      width: 80,
      render: value => {
        const { recoveryMin = 0, recoveryMax = 0 } = value;
        return Format.range(recoveryMin, recoveryMax);
      },
    },
    {
      title: '全水分(% Mt)',
      dataIndex: 'goodsComponent',
      key: 'mt',
      align: 'right',
      width: 80,
      render: value => {
        const { totalWaterContentMin = 0, totalWaterContentMax = 0 } = value;
        return Format.range(totalWaterContentMin, totalWaterContentMax);
      },
    },
    {
      title: '粘结指数(GRI)',
      dataIndex: 'goodsComponent',
      key: 'gri',
      align: 'right',
      width: 80,
      render: value => {
        const { bondMin = 0, bondMax = 0 } = value;
        return Format.range(bondMin, bondMax);
      },
    },
    {
      title: '胶质层(Y)',
      dataIndex: 'goodsComponent',
      key: 'y',
      align: 'right',
      width: 80,
      render: value => {
        const { colloidMin = 0, colloidMax = 0 } = value;
        return Format.range(colloidMin, colloidMax);
      },
    },
    {
      title: '含矸石(%)',
      dataIndex: 'goodsComponent',
      key: 'gangue',
      align: 'right',
      width: 80,
      render: value => {
        const { stoneMin = 0, stoneMax = 0 } = value;
        return Format.range(stoneMin, stoneMax);
      },
    },
    {
      title: '含中煤(%)',
      dataIndex: 'goodsComponent',
      key: 'middle',
      align: 'right',
      width: 80,
      render: value => {
        const { midCoalMin = 0, midCoalMax = 0 } = value;
        return Format.range(midCoalMin, midCoalMax);
      },
    },
    {
      title: '含精煤(%)',
      dataIndex: 'goodsComponent',
      key: 'coal',
      align: 'right',
      width: 80,
      render: value => {
        const { cleanCoalMin = 0, cleanCoalMax = 0 } = value;
        return Format.range(cleanCoalMin, cleanCoalMax);
      },
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
              // handleShowDetail(record);
              router.push(`/goodsManagement/detail?id=${record.id}`);
            }}>
            详细信息
          </Button>
          <Button size="small" type="link" key="update" onClick={() => handleUpdate(record)}>
            编辑
          </Button>
          <Popconfirm
            title="是否删除该货品？"
            placement="topRight"
            icon={<QuestionCircleFilled />}
            onConfirm={() => handleRemove(record.id)}>
            <Button type="link" size="small" className={deleteBtn.delete}>
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
  // 弹窗
  const [showNew, setShowNew] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState({});
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [updateForm, setUpdateForm] = useState({});
  const [rowData, setRowData] = useState({});
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
      // 关闭弹窗
      setShowNew(false);
      setShowUpdate(false);
      handleSearch();
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };

  // 编辑复制
  const handleUpdate = record => {
    // 设置数据
    const { goodsComponent, goodsType, goodsName } = record;
    // 格式化表单数据
    const _form = {
      id: record.id,
      goodsType,
      goodsName,
      unitPrice: goodsComponent.unitPrice ? goodsComponent.unitPrice / 100 : '',
      materials: goodsComponent.rawMaterial,
      standard_mad: {
        min: goodsComponent.waterContentMin ? (goodsComponent.waterContentMin / 100).toFixed(2) : 0,
        max: goodsComponent.waterContentMax ? (goodsComponent.waterContentMax / 100).toFixed(2) : 0,
      },
      standard_ad: {
        min: goodsComponent.ashContentMin ? (goodsComponent.ashContentMin / 100).toFixed(2) : 0,
        max: goodsComponent.ashContentMax ? (goodsComponent.ashContentMax / 100).toFixed(2) : 0,
      },
      standard_vdaf: {
        min: goodsComponent.volatilizationMin ? (goodsComponent.volatilizationMin / 100).toFixed(2) : 0,
        max: goodsComponent.volatilizationMax ? (goodsComponent.volatilizationMax / 100).toFixed(2) : 0,
      },
      standard_crc: goodsComponent.cinder ? (goodsComponent.cinder / 100).toFixed(0) : 0,
      standard_std: {
        min: goodsComponent.sulfurMin ? (goodsComponent.sulfurMin / 100).toFixed(2) : 0,
        max: goodsComponent.sulfurMax ? (goodsComponent.sulfurMax / 100).toFixed(2) : 0,
      },
      standard_fcd: {
        min: goodsComponent.carbonMin ? (goodsComponent.carbonMin / 100).toFixed(2) : 0,
        max: goodsComponent.carbonMax ? (goodsComponent.carbonMax / 100).toFixed(2) : 0,
      },
      standard_r: {
        min: goodsComponent.recoveryMin ? (goodsComponent.recoveryMin / 100).toFixed(2) : 0,
        max: goodsComponent.recoveryMax ? (goodsComponent.recoveryMax / 100).toFixed(2) : 0,
      },
      standard_mt: {
        min: goodsComponent.totalWaterContentMin ? (goodsComponent.totalWaterContentMin / 100).toFixed(2) : 0,
        max: goodsComponent.totalWaterContentMax ? (goodsComponent.totalWaterContentMax / 100).toFixed(2) : 0,
      },
      standard_gri: {
        min: goodsComponent.bondMin ? (goodsComponent.bondMin / 100).toFixed(2) : 0,
        max: goodsComponent.bondMax ? (goodsComponent.bondMax / 100).toFixed(2) : 0,
      },
      standard_y: {
        min: goodsComponent.colloidMin ? (goodsComponent.colloidMin / 100).toFixed(2) : 0,
        max: goodsComponent.colloidMax ? (goodsComponent.colloidMax / 100).toFixed(2) : 0,
      },
      standard_gangue: {
        min: goodsComponent.stoneMin ? (goodsComponent.stoneMin / 100).toFixed(2) : 0,
        max: goodsComponent.stoneMax ? (goodsComponent.stoneMax / 100).toFixed(2) : 0,
      },
      standard_middle: {
        min: goodsComponent.midCoalMin ? (goodsComponent.midCoalMin / 100).toFixed(2) : 0,
        max: goodsComponent.midCoalMax ? (goodsComponent.midCoalMax / 100).toFixed(2) : 0,
      },
      standard_coal: {
        min: goodsComponent.cleanCoalMin ? (goodsComponent.cleanCoalMin / 100).toFixed(2) : 0,
        max: goodsComponent.cleanCoalMax ? (goodsComponent.cleanCoalMax / 100).toFixed(2) : 0,
      },
    };
    setUpdateForm(_form);
    setShowUpdate(true);
  };

  // 设置详情
  const handleShowDetail = record => {
    const { goodsType, goodsName, id, goodsComponent } = record;
    const {
      waterContentMin,
      waterContentMax,
      ashContentMin,
      ashContentMax,
      volatilizationMin,
      volatilizationMax,
      cinder,
      sulfurMin,
      sulfurMax,
      carbonMin,
      carbonMax,
      recoveryMin,
      recoveryMax,
      totalWaterContentMin,
      totalWaterContentMax,
      bondMin,
      bondMax,
      colloidMin,
      colloidMax,
      stoneMin,
      stoneMax,
      midCoalMin,
      midCoalMax,
      cleanCoalMin,
      cleanCoalMax,
      rawMaterial,
      unitPrice,
    } = goodsComponent;

    const data = {
      id,
      goodsType: GoodsType[goodsType] || '-',
      goodsName: goodsName,
      unitPrice: unitPrice ? (unitPrice / 100).toFixed(2) : '-',
      materials: rawMaterial === 1 ? '是' : '否',
      standard_mad: Format.range(waterContentMin, waterContentMax),
      standard_ad: Format.range(ashContentMin, ashContentMax),
      standard_vdaf: Format.range(volatilizationMin, volatilizationMax),
      standard_crc: cinder ? (cinder / 100).toFixed(0) : '-',
      standard_std: Format.range(sulfurMin, sulfurMax),
      standard_fcd: Format.range(carbonMin, carbonMax),
      standard_r: Format.range(recoveryMin, recoveryMax),
      standard_mt: Format.range(totalWaterContentMin, totalWaterContentMax),
      standard_gri: Format.range(bondMin, bondMax),
      standard_y: Format.range(colloidMin, colloidMax),
      standard_gangue: Format.range(stoneMin, stoneMax),
      standard_middle: Format.range(midCoalMin, midCoalMax),
      standard_coal: Format.range(cleanCoalMin, cleanCoalMax),
    };

    setRowData(data);
    setShowDetail(true);
  };
  return (
    <Layout {...routeView}>
      <Content>
        <section>
          <Button type="primary" style={{ marginBottom: 16 }} onClick={() => setShowNew(true)}>
            新增货品
          </Button>
          <Search onSearch={handleSearch} onReset={handleReset}>
            <Search.Item label="货品名称">
              <Input allowClear value={query.goodsName} placeholder="请输入货品名称" onChange={handleChangeGoodsName} />
              {/* <AutoInputSelect
            mode="goodsType"
            allowClear
            placeholder="请输入货品名称"
            onChange={onChangeGoodsType}
            newGoodsType={newGoodsType}
            style={{ width: 200 }}
          /> */}
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
          <Button style={{ margin: '16px 0' }} onClick={handleBatchRemove}>
            批量删除
          </Button>
          <Table
            loading={loading}
            dataSource={dataList.data}
            columns={columns}
            pagination={{
              onChange: onChangePage,
              onShowSizeChange: onChangePageSize,
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

      {/* 新增弹窗 */}
      <Modal
        width={860}
        visible={showNew}
        title="新增货品"
        footer={null}
        destroyOnClose
        onCancel={() => setShowNew(false)}>
        <GoodsForm onClose={() => setShowNew(false)} onSubmit={submit} />
      </Modal>

      {/* 编辑弹窗 */}
      <Modal
        width={860}
        visible={showUpdate}
        title="编辑货品"
        footer={null}
        destroyOnClose
        onCancel={() => setShowUpdate(false)}>
        <GoodsForm onClose={() => setShowUpdate(false)} formData={updateForm} onSubmit={submit} />
      </Modal>

      {/* 质检信息 */}
      {/* <DrawerInfo title="货品质检信息" onClose={() => setShowDetail(false)} showDrawer={showDetail} width="664">
        <GoodsDetail rowData={rowData} />
      </DrawerInfo> */}
      <Modal
        width={860}
        visible={showDetail}
        title="货品质检信息"
        footer={null}
        destroyOnClose
        onCancel={() => setShowDetail(false)}>
        {/* <GoodsForm onClose={() => setShowUpdate(false)} formData={updateForm} onSubmit={submit} /> */}
        <GoodsDetail rowData={rowData} />
      </Modal>
    </Layout>
  );
};

export default GoodsManagement;
