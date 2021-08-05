import React, { useState, useCallback, useEffect, useRef } from 'react';
// import Layout from '@components/Layout';
import { Input, DatePicker, Button, Table, message, Modal, Popconfirm } from 'antd';
import {
  Ellipsis,
  Layout,
  Content,
  Search,
  DatePickerTime,
  LoadingBtn,
  DrawerInfo,
  WareHouseSelect,
} from '@components';
import { clearState, Format, keepState, getState } from '@utils/common';
import { downLoadFile, inventory } from '@api';
import router from 'next/router';
import moment from 'moment';
import s from './stockTaking.less';
import Link from 'next/link';
import WarehouseFrom from '@components/RailDetail/warehouseFrom';
import { QuestionCircleFilled } from '@ant-design/icons';
import { Permission } from '@store';
const ManageInventory = props => {
  const routeView = {
    title: '管理仓库',
    pageKey: 'manageInventory',
    longKey: 'inventory.manageInventory',
    breadNav: [
      '库存管理/库存盘点',
      <Link href="/inventory/stockTaking?add=1">
        <a>新增盘点</a>
      </Link>,
      '管理仓库',
    ],
    pageTitle: '管理仓库',
    useBack: true,
  };
  const { permissions, isSuperUser } = Permission.useContainer();
  const [loading, setLoading] = useState(false);

  const [dataList, setDataList] = useState({});

  const [showNewStorage, setShowNewStorage] = useState(false);

  const [isWarehouse, setIsWarehouse] = useState(false);
  const wareHouseRef = useRef(null);
  const [currentInventory, setInventory] = useState(undefined);
  const columns = [
    {
      title: '仓库名称',
      dataIndex: 'name',
      width: '50%',
      editable: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: '40%',
      editable: false,
    },
    {
      title: '操作',
      width: '10%',
      dataIndex: 'operation',
      align: 'right',
      render: (_, record) => {
        return record.id ? (
          <div>
            <Button type="link" onClick={() => handleEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title={
                <div>
                  <span>是否删除当前仓库？</span>
                </div>
              }
              placement="topRight"
              icon={<QuestionCircleFilled />}
              onConfirm={() => handleDelete(record.id)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          </div>
        ) : (
          <div>--</div>
        );
      },
    },
  ];
  const [query, setQuery] = useState({
    wareHouseName: undefined,
    page: 1,
    pageSize: 10,
  });
  const getDataInfo = async ({ wareHouseName, page, pageSize }) => {
    setLoading(true);
    const params = {
      wareHouseName,
      isPage: 1,
      page,
      limit: pageSize,
    };
    const res = await inventory.wareHouseList({ params });

    if (res.status === 0) {
      const state = getState().query;
      let page = state.page;
      if (res.result.count % 10 === 0) {
        page = page - 1 || 1;
      }
      keepState({
        query: {
          wareHouseName,
          page,
          pageSize,
        },
      });
      setDataList(res.result);
      // res.result.length && unshiftArr(res.result);
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };

  const onChangePage = useCallback(
    page => {
      setQuery({ ...query, page });
      getDataInfo({ ...query, page });
    },
    [dataList]
  );
  // 切页码
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      getDataInfo({ ...query, page: 1, pageSize });
    },
    [dataList]
  );

  //  查询
  const handleSearch = useCallback(() => {
    setQuery({ ...query, page: 1 });
    getDataInfo({ ...query, page: 1 });
  }, [query]);

  // 重置
  const handleReset = () => {
    const query = {
      wareHouseName: undefined,
      page: 1,
      pageSize: 10,
    };
    setQuery(query);
    getDataInfo(query);
  };

  const refresh = () => {
    setIsWarehouse(false);
    setInventory(undefined);
    getDataInfo({ ...query, page: 1 });
  };

  // 仓库
  const handleChangeWarehouse = useCallback(e => {
    setQuery({ ...query, wareHouseName: e.target.value });
  });

  const handleEdit = data => {
    setInventory(data);
    setIsWarehouse(true);
  };
  const handleDelete = async data => {
    const params = {
      wareHouseId: data,
    };
    const res = await inventory.deleteWareHouse({ params });

    if (res.status === 0) {
      getDataInfo({ ...query, page: 1 });
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };

  const unshiftArr = data => {
    const arrItem = [
      {
        name: '暂无分库',
        createdAt: '--',
        id: '',
      },
    ];
    const resultVal = arrItem.concat(data);
    setDataList(resultVal);
  };

  useEffect(() => {
    getDataInfo({ ...query });
  }, []);
  return (
    <Layout {...routeView}>
      <Content
        style={{
          fontFamily:
            '-apple-system,BlinkMacSystemFont,Helvetica Neue,Helvetica,Roboto,Arial,PingFang SC,Hiragino Sans GB,Microsoft Yahei,SimSun,sans-serif',
        }}>
        <div style={{ padding: '16px', paddingBottom: 0 }}>
          {(isSuperUser || permissions.includes('INVENTORY_CHECK_OPERATE')) && (
            <Button type="primary" onClick={() => setIsWarehouse(true)} style={{ marginBottom: 16 }}>
              新增仓库
            </Button>
          )}
          <Search onSearch={handleSearch} onReset={handleReset}>
            <Search.Item label="仓库名称">
              <Input
                allowClear
                value={query.wareHouseName}
                placeholder="请输入仓库名称"
                onChange={handleChangeWarehouse}
              />
            </Search.Item>
          </Search>
          {/* 新增仓库 */}
          <Modal
            title={currentInventory ? '编辑仓库' : '新增仓库'}
            onCancel={() => {
              setIsWarehouse(false);
              setInventory(undefined);
            }}
            visible={isWarehouse}
            destroyOnClose
            footer={null}>
            <WarehouseFrom
              onSubmit={refresh}
              currentData={currentInventory}
              close={() => {
                setIsWarehouse(false);
                setInventory(undefined);
              }}
            />
          </Modal>
        </div>
        <section>
          <Table
            loading={loading}
            dataSource={dataList.data}
            // dataSource={[1, 2, 3, 4, 5]}
            columns={columns}
            pagination={{
              onChange: onChangePage,
              onShowSizeChange: onChangePageSize,
              showSizeChanger: true,
              pageSize: query.pageSize,
              current: query.page,
              total: dataList.count,
            }}
            scroll={{ x: 'auto' }}
          />
        </section>
      </Content>
    </Layout>
  );
};

export default ManageInventory;
