/** @format */

import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, message } from 'antd';
import { Content, Layout, ChildTitle } from '@components';
import styles from '../styles.less';
import Link from 'next/link';
import { Format, keepState, getState, getQuery } from '@utils/common';
import { inventory } from '@api';
import router from 'next/router';
import AssociatedPound from '@components/Inventory/inventoryWater/associatedPound';
import AssociatedInventory from '@components/Inventory/inventoryWater/associatedInventory';
import AssociatedWashing from '@components/Inventory/inventoryWater/associatedWashing';
import AssociatedBlending from '@components/Inventory/inventoryWater/associatedBlending';
import { Permission } from '@store';
const Index = props => {
  const routeView = {
    title: '库存管理',
    pageKey: 'inventoryWater',
    longKey: 'inventory.inventoryWater',
    breadNav: [
      '库存管理',
      <Link href="/inventory/inventoryWater">
        <a>库存流水</a>
      </Link>,
      '入库详情',
    ],
    useBack: true,
  };
  const { permissions, isSuperUser } = Permission.useContainer();
  const columns = [
    {
      title: '采样编号',
      dataIndex: 'trailerPlateNumber',
      key: 'trailerPlateNumber',
      width: 200,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '质检类型',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '时间',
      dataIndex: 'goodsWeight',
      key: 'goodsWeight',
      width: 200,
      render: Format.weight,
    },
    {
      title: '操作',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      fixed: 'right',
      align: 'right',
      render: value => {
        return (
          <Button type="link" size="small">
            详情
          </Button>
        );
      },
    },
  ];

  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState({
    data: [],
    count: 0,
  });
  const [dataInfo, setDataInfo] = useState({});

  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
  });

  const [allDataInfo, setAllDataInfo] = useState({});

  useEffect(() => {
    getDetail();
  }, []);

  const getDetail = async () => {
    const { id } = getQuery();
    const params = {
      ilid: id,
    };
    const res = await inventory.inventoryLogDetail({ params });

    if (res.status === 0) {
      setDataInfo(res.result);
      setAllDataInfo(res.result.eachData);
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };

  // 翻页
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

  const delectData = async () => {
    const { id } = getQuery();
    const params = {
      ilid: id,
    };

    const res = await inventory.inventoryLogDel({ params });
    if (res.status === 0) {
      message.success('删除入库单成功');
      // 获取持久化数据
      const state = getState().query;

      let page = state.page;
      if (state.count % 10 === 1 && state.count / 10 > 1) {
        page = page - 1 || 1;
      }
      keepState({
        query: {
          ...state,
          page,
        },
      });
      router.back();
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };

  return (
    <Layout {...routeView}>
      <Content
        style={{
          fontFamily:
            '-apple-system,BlinkMacSystemFont,Helvetica Neue,Helvetica,Roboto,Arial,PingFang SC,Hiragino Sans GB,Microsoft Yahei,SimSun,sans-serif',
        }}>
        <header style={{ borderRadius: 0 }}>
          入库信息
          {(isSuperUser || permissions.includes('INVENTORY_OPERATE')) &&
            (dataInfo.dataType === 0 || dataInfo.dataType === 2) && (
              <span
                style={{
                  float: 'right',
                  color: '#3d86ef',
                  fontSize: 14,
                  fontWeight: 400,
                  cursor: 'pointer',
                }}
                onClick={delectData}>
                删除入库单
              </span>
            )}
        </header>
        <section className={styles['pay-fleetDetail-info']}>
          <div className={styles.rowDetail}>
            <div className={styles.item}>
              <span className={styles.label}>入库类型：</span>
              {dataInfo.dataTypeZn}
            </div>

            <div className={styles.item}>
              <span className={styles.label}>货品名称：</span>
              {dataInfo.goodsName}
            </div>
            <div className={styles.item}>
              <span className={styles.label}>入库数量：</span>
              {Format.weight(dataInfo.changeValue)}
            </div>
          </div>
          <div className={styles.rowDetail}>
            <div className={styles.item}>
              <span className={styles.label}>仓库：</span>
              {dataInfo.wareHouse || '-'}
            </div>
            <div className={styles.item}>
              <span className={styles.label}>货物单价：</span>
              {dataInfo.unitPrice ? Format.price(dataInfo.unitPrice) || '-' : '-'}
            </div>

            <div className={styles.item}>
              <span className={styles.label}>入库时间：</span>
              {dataInfo.changeTime || '-'}
            </div>
          </div>
          <div className={styles.rowDetail}>
            <div className={styles.item}>
              <span className={styles.label}>供应商：</span>
              {dataInfo.supplyCompany || '-'}
            </div>
            <div className={styles.item} style={{ display: 'flex' }}>
              <span className={styles.label} style={{ minWidth: 45 }}>
                备注：
              </span>
              <div style={{ wordBreak: 'break-all' }}>{dataInfo.remark || '-'}</div>
            </div>
          </div>

          <ChildTitle className="hei14" style={{ margin: '16px 0', fontWeight: 'bold' }}>
            已关联质检单
          </ChildTitle>
          <Table loading={loading} dataSource={[]} columns={columns} pagination={null} />
          {/* 磅单 */}
          {dataInfo.dataType === 3 && <AssociatedPound allDataInfo={allDataInfo} />}
          {/* 盘点单 */}
          {dataInfo.dataType === 4 && <AssociatedInventory allDataInfo={allDataInfo} />}
          {/* 洗煤记录 */}
          {(dataInfo.dataType === 5 || dataInfo.dataType === 6) && <AssociatedWashing allDataInfo={allDataInfo} />}
          {/* 配煤记录 */}
          {dataInfo.dataType === 1 && <AssociatedBlending allDataInfo={allDataInfo} />}
        </section>
      </Content>
    </Layout>
  );
};

export default Index;
