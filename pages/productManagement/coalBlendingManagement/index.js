import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Content, Search, DrawerInfo } from '@components';
import { Input, Table, Button, message, Select, Modal, Popconfirm } from 'antd';
import { keepState, getState, clearState, Format } from '@utils/common';
import SchemeForm from '@components/ProductManagement/CoalBlendingScheme/form';
import CurrForm from '@components/ProductManagement/CoalBlendingScheme/currForm';
import { QuestionCircleFilled } from '@ant-design/icons';
import router from 'next/router';
import { product } from '@api';
import styles from './styles.less';
const routeView = {
  title: '配煤管理',
  pageKey: 'coalBlendingManagement',
  longKey: 'productManagement.coalBlendingManagement',
  breadNav: '智慧工厂.配煤管理',
  pageTitle: '配煤管理',
};

// 多行渲染
const multipleRender = data => {
  let value = '-';
  let style = {};
  if (data.length === 1) {
    value = <div>{data[0]}</div>;
  } else {
    value = data.map(item => <div className={styles.row}>{item}</div>);
    style = { padding: 0 };
  }
  const render = {
    children: value,
    props: { style },
  };
  return render;
};

const CoalBlendingManagement = props => {
  const columns = [
    {
      title: '目标货品名称',
      dataIndex: 'goodsName',
      key: 'goodsName',
      width: 90,
    },
    {
      title: '原料煤',
      dataIndex: 'rawMaterial',
      key: 'raw',
      width: 90,
      render: value => {
        return multipleRender(value.map(item => item.goodsName));
      },
    },
    {
      title: '占比(%)',
      dataIndex: 'rawMaterial',
      key: 'percent',
      align: 'right',
      width: 90,
      render: value => {
        return multipleRender(value.map(item => item.proportion / 100));
      },
    },
    {
      title: '原料最小占比(%)',
      dataIndex: 'rawMaterial',
      key: 'min',
      align: 'right',
      width: 90,
      render: value => {
        return multipleRender(value.map(item => item.proportionMin / 100));
      },
    },
    {
      title: '原料最大占比(%)',
      dataIndex: 'rawMaterial',
      key: 'max',
      align: 'right',
      width: 90,
      render: value => {
        return multipleRender(value.map(item => item.proportionMax / 100));
      },
    },
    {
      title: '配比方案',
      dataIndex: 'isAI',
      key: 'isAI',
      width: 90,
      render: value => (value ? 'AI推荐' : '录入'),
    },
    {
      title: '成本(元/吨)',
      dataIndex: 'unitPrice',
      key: 'daunitPriceta1',
      align: 'right',
      width: 90,
      render: (value, record) => {
        const _value = record.isAI ? record.predictUnitPrice : record.unitPrice;
        return _value ? Format.price(_value) : '-';
      },
    },
    {
      title: '操作',
      key: 'ctrl',
      fixed: 'right',
      align: 'right',
      width: 60,
      render: (value, record, index) => {
        const { isAI } = record;
        return (
          <>
            {isAI && (
              <>
                <Button size="small" type="link" onClick={() => handleShowInput(record)}>
                  录入实际产出
                </Button>
                <Button size="small" type="link" onClick={() => handleToDetail(record.id)}>
                  详情
                </Button>
              </>
            )}

            <Popconfirm
              title="是否删除该方案？"
              placement="topRight"
              icon={<QuestionCircleFilled />}
              onConfirm={() => handleRemove(record.id)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          </>
        );
      },
    },
  ];

  // 查询条件
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    isAI: undefined,
    targetGoodsName: '',
    rawGoodsName: '',
  });

  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState({});
  const [showScheme, setShowScheme] = useState(false);
  const [showCurr, setShowCurr] = useState(false);

  // 目标货品
  const [targetGood, setTargetGood] = useState({});
  // 原料货品
  const [rawGoods, setRawGoods] = useState([]);
  useEffect(() => {
    const { isServer } = props;
    if (isServer) {
      clearState();
    }
    // 获取持久化数据
    const state = getState().query;
    setQuery({ ...query, ...state });
    getRemoteData({ ...query, ...state });
  }, []);

  // 配比方案
  const handleChangeIsAI = useCallback(value => {
    const isAI = value;
    setQuery({ ...query, isAI });
  });

  // 目标货品名称
  const handleChangeTargetGoodsName = e => {
    const targetGoodsName = e.target.value;
    setQuery({ ...query, targetGoodsName });
  };

  // 目标货品名称
  const handleChangeRawGoodsName = e => {
    const rawGoodsName = e.target.value;
    setQuery({ ...query, rawGoodsName });
  };

  // 跳转详情
  const handleToDetail = id => {
    router.push(`/productManagement/coalBlendingManagement/detail?id=${id}`);
  };

  // 查询
  const handleSearch = useCallback(() => {
    setQuery({ ...query, page: 1 });
    getRemoteData({ ...query, page: 1 });
  }, [query]);

  // 重置
  const handleReset = useCallback(() => {
    const query = {
      page: 1,
      pageSize: 10,
      targetGoodsName: '',
      rawGoodsName: '',
    };
    setQuery(query);
    getRemoteData(query);
  });

  // 方案录入
  const handleInsert = () => {
    setShowCurr(true);
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

  // 方案录入
  const handleSubmit = async data => {
    const res = await product.addCoalBlendingScheme({ params: data });
    if (res.status === 0) {
      message.success('录入成功');
      setShowCurr(false);
      handleSearch();
    } else {
      message.error(res.detail || res.description);
    }
  };

  // 实际产出录入
  const handleSchemeSubmit = async data => {
    const res = await product.insertActualOutPut({ params: { ...data, id: targetGood.schemeId } });
    if (res.status === 0) {
      message.success('录入成功');
      setShowScheme(false);
      handleSearch();
    } else {
      message.error(res.detail || res.description);
    }
  };

  // 录入实际产出
  const handleShowInput = record => {
    const { id } = record;
    router.push(`/productManagement/coalBlendingManagement/inputScheme?id=${id}`);
  };

  // 删除
  const handleRemove = async id => {
    const params = { id };
    const res = await product.removeCoalBlendingScheme({ params });
    if (res.status === 0) {
      message.success('删除成功');
      handleSearch();
    } else {
      message.error(res.detail || res.description);
    }
  };
  /**
   * 查询数据
   * @param {Object} param0
   */
  const getRemoteData = async ({ page, pageSize = 10, targetGoodsName, rawGoodsName, isAI }) => {
    setLoading(true);

    const ai = isAI === '1' ? true : isAI === '0' ? false : undefined;
    const params = {
      limit: pageSize,
      page,
      targetGoodsName,
      rawGoodsName,
      isAI: ai,
    };

    const res = await product.getCoalBlendingList({ params });

    if (res.status === 0) {
      setDataList(res.result);

      // 持久化状态
      keepState({
        query: {
          page,
          pageSize,
          targetGoodsName,
          rawGoodsName,
          isAI,
        },
      });
    } else {
      message.error(`${res.detail || res.description}`);
    }

    setLoading(false);
  };
  return (
    <Layout {...routeView}>
      <Content>
        <section style={{ paddingBottom: 48 }}>
          <Search onSearch={handleSearch} onReset={handleReset}>
            <Search.Item label="目标货品名称">
              <Input
                allowClear
                value={query.targetGoodsName}
                placeholder="请输入目标货品名称"
                onChange={handleChangeTargetGoodsName}
              />
            </Search.Item>
            <Search.Item label="原料煤名称">
              <Input
                allowClear
                value={query.rawGoodsName}
                placeholder="请输入原料煤名称"
                onChange={handleChangeRawGoodsName}
              />
            </Search.Item>
            <Search.Item label="配比方案">
              <Select
                value={query.isAI || undefined}
                allowClear
                placeholder="请选择配比方案"
                style={{ width: '100%' }}
                onChange={handleChangeIsAI}>
                <Select.Option value="1">AI推荐</Select.Option>
                <Select.Option value="0">录入</Select.Option>
              </Select>
            </Search.Item>
          </Search>
          <Button type="primary" style={{ margin: '16px 0' }} onClick={handleInsert}>
            方案录入
          </Button>
          <Table
            bordered
            columns={columns}
            loading={loading}
            dataSource={dataList.data}
            scroll={{ x: 'auto' }}
            pagination={{
              onChange: onChangePage,
              onShowSizeChange: onChangePageSize,
              showSizeChanger: true,
              pageSize: query.pageSize,
              current: query.page,
              total: dataList.count,
            }}
          />
        </section>
      </Content>

      {/* 方案录入 */}
      <DrawerInfo title="现有配比方案录入" onClose={() => setShowCurr(false)} showDrawer={showCurr} width="760">
        {showCurr && <CurrForm onClose={() => setShowCurr(false)} onSubmit={handleSubmit} />}
      </DrawerInfo>

      {/* 录入实际产出 */}
      <Modal
        width={860}
        destroyOnClose
        maskClosable={false}
        visible={showScheme}
        footer={null}
        onCancel={() => {
          setShowScheme(false);
        }}
        title="录入实际产出">
        <SchemeForm
          onClose={() => setShowScheme(false)}
          onSubmit={handleSchemeSubmit}
          targetGood={targetGood}
          rawGoods={rawGoods}
        />
      </Modal>
    </Layout>
  );
};

export default CoalBlendingManagement;
