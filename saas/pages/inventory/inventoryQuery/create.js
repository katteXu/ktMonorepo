import React, { useState, useCallback, useEffect } from 'react';
import { Input, DatePicker, Button, Table, message, Tooltip, Popconfirm, Modal } from 'antd';
import { Layout, Content, DrawerInfo } from '@components';
import { Format, keepState, getState } from '@utils/common';
import { inventory } from '@api';
import router from 'next/router';
import Link from 'next/link';
import { QuestionCircleFilled } from '@ant-design/icons';
import RecordDetail from './recordDetail';
import MaterialRelationship from '@components/Inventory/inventoryQuery/materialRelationship';

const Index = props => {
  const routeView = {
    title: '物料设置',
    pageKey: 'inventoryQuery',
    longKey: 'inventory.inventoryQuery.create',
    breadNav: [
      '库存管理',
      <Link href="/inventory/inventoryQuery">
        <a>库存查询</a>
      </Link>,
      '物料设置',
    ],
    pageTitle: '物料设置',
    useBack: true,
  };
  const columns = [
    {
      title: '实际货品名称',
      dataIndex: 'mainInventoryName',
      key: 'mainInventoryName',
      width: '200px',
      render: value => {
        return (
          <Tooltip title={value} overlayStyle={{ maxWidth: 'max-content' }}>
            <div className="max-label" style={{ width: 180 }}>
              {value || '-'}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: '货品名称',
      dataIndex: 'inventoryNames',
      key: 'inventoryNames',
      width: 200,
      render: value => <span>{value || '-'}</span>,
    },
    {
      title: '设置时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
    },
    {
      title: '操作',
      dataIndex: 'ctrl',
      key: 'ctrl',
      align: 'right',
      width: 120,
      render: (value, record, index) => (
        <>
          <Button
            size="small"
            type="link"
            key="detail"
            onClick={() => {
              setShowEditModal(true);

              setFormData({
                inventoryIds: record.inventoryIds,
                mainInventoryId: record.mainInventoryId,
              });
            }}>
            编辑
          </Button>
          <Button
            size="small"
            type="link"
            key="detail"
            onClick={() => {
              setShowRefresh(!showRefresh);
              setShowDrawer(true);
              setRecordId(record.mainInventoryId);
            }}>
            变更记录
          </Button>
          <Popconfirm
            title={
              <div>
                <span>是否删除当前关联？</span>
              </div>
            }
            placement="topRight"
            icon={<QuestionCircleFilled />}
            onConfirm={() => deleteData(record.mainInventoryId)}>
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
  });
  const [showDrawer, setShowDrawer] = useState(false);
  const [recordId, setRecordId] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditeModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [showRefresh, setShowRefresh] = useState(false);
  // 初始化
  useEffect(() => {
    const state = getState().query;
    setQuery({ ...query, ...state });
    getInventoryCheckList({ ...query, ...state });
  }, []);

  // 删除行
  const deleteData = async id => {
    const params = {
      mainInventoryId: id,
    };
    const res = await inventory.deleteMatterRelationship({ params });
    if (res.status === 0) {
      message.success('已删除');
      // 删除最后一条
      let page = query.page;
      if (dataList.count % 10 === 1 && dataList.count / 10 > 1) {
        page = page - 1 || 1;
      }

      setQuery({ ...query, page });
      getInventoryCheckList({ ...query, page });
    } else {
      message.error(`删除失败，原因：${res.detail || res.description}`);
    }
  };

  const [dataList, setDataList] = useState({});
  const getInventoryCheckList = async ({ page, pageSize }) => {
    setLoading(true);
    const params = {
      page,
      limit: pageSize,
      isPage: 1,
    };
    const res = await inventory.matterRelationshipList({ params });
    if (res.status === 0) {
      setDataList(res.result);
    } else {
      message.error(res.detail || res.description);
    }
    setLoading(false);
  };

  // 分页
  const onChangePage = useCallback(
    (page, pageSize) => {
      setQuery({ ...query, page, pageSize });
      getInventoryCheckList({ ...query, page, pageSize });
    },
    [dataList]
  );
  // 切页码
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      getInventoryCheckList({ ...query, page: 1, pageSize });
    },
    [dataList]
  );

  return (
    <Layout {...routeView}>
      <Content
        style={{
          fontFamily:
            '-apple-system,BlinkMacSystemFont,Helvetica Neue,Helvetica,Roboto,Arial,PingFang SC,Hiragino Sans GB,Microsoft Yahei,SimSun,sans-serif',
        }}>
        <div style={{ padding: '16px', paddingBottom: 0 }}>
          <Button type="primary" onClick={() => setShowCreateModal(true)} style={{ marginBottom: 16 }}>
            新增物料关系
          </Button>
        </div>

        <section style={{ paddingTop: 0 }}>
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
            scroll={{ x: 'auto' }}
          />
        </section>
      </Content>
      <DrawerInfo title="变更记录" onClose={() => setShowDrawer(false)} showDrawer={showDrawer} width="376">
        <RecordDetail recordId={recordId} refreshData={showRefresh} />
      </DrawerInfo>
      <Modal
        title="新增物料关系"
        destroyOnClose
        footer={null}
        visible={showCreateModal}
        onCancel={() => setShowCreateModal(false)}>
        <MaterialRelationship
          formData={{}}
          type="add"
          close={() => setShowCreateModal(false)}
          submit={() => {
            setShowCreateModal(false);
            getInventoryCheckList({ ...query });
          }}
        />
      </Modal>
      <Modal
        title="编辑物料关系"
        destroyOnClose
        footer={null}
        visible={showEditeModal}
        onCancel={() => setShowEditModal(false)}>
        <MaterialRelationship
          formData={formData}
          type="edit"
          close={() => setShowEditModal(false)}
          submit={() => {
            setShowEditModal(false);
            getInventoryCheckList({ ...query });
          }}
        />
      </Modal>
    </Layout>
  );
};

export default Index;
