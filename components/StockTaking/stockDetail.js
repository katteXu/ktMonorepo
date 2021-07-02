import React, { useState, useCallback, useEffect } from 'react';
// import Layout from '@components/Layout';
import { Layout, Content, Search } from '@components';
import { Input, Table, Button, Form, message, Modal } from 'antd';
import { ExclamationCircleOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { clearState, Format } from '@utils/common';
import { useRouter } from 'next/router';
import { inventory } from '@api';
import Link from 'next/link';
import styles from './index.less';

const Index = ({ props, id, handleCloseDrawer }) => {
  const router = useRouter();
  //   const { id } = router.query;
  const columns = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: value => <span>{value || '-'}</span>,
    },
    {
      title: '货品名称',
      dataIndex: 'goodsName',
      key: 'goodsName',
      width: 120,
      render: value => <span>{value || '-'}</span>,
    },
    {
      title: '盘点数量(吨)',
      dataIndex: 'checkNum',
      key: 'checkNum',
      width: 120,
      align: 'right',
      render: value => <span>{Format.weight(value) || '-'}</span>,
    },
    {
      title: '账面库存(吨)',
      dataIndex: 'inventoryNum',
      key: 'inventoryNum',
      width: 120,
      align: 'right',
      render: value => <span>{Format.weight(value) || '-'}</span>,
    },
    {
      title: '盈亏数量(吨)',
      dataIndex: 'formatDiffNum',
      key: 'formatDiffNum',
      width: 120,
      align: 'right',
      render: value => <span>{value || '-'}</span>,
    },
  ];
  // 查询条件
  const [query, setQuery] = useState({
    id: id,
    page: 1,
    pageSize: 10,
  });
  const [rowData, setRowData] = useState({});
  const [loading, setLoading] = useState(false);

  const [dataList, setDataList] = useState({});

  // 删除
  const DeleteStock = async () => {
    const params = {
      cid: id,
    };
    const res = await inventory.inventoryCheckDel({ params });
    if (res.status === 0) {
      message.success('删除成功');
      handleCloseDrawer();
    } else {
      message.error(res.detail || res.description);
    }
  };

  const handleDeleteStock = () => {
    Modal.confirm({
      icon: <ExclamationCircleFilled />,
      title: '删除盘点为高危操作，删除后不可恢复是否仍要删除',
      okText: '仍要删除',
      cancelText: '我再想想1',
      // okType: 'danger',
      onOk: () => {
        DeleteStock();
      },
    });
  };

  // 获取列表
  const getList = async ({ page, pageSize }) => {
    setLoading(true);
    const params = {
      cid: id,
      page: page,
      limit: pageSize,
    };
    const res = await inventory.getInventoryCheckDetail({ params });
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
      getList({ ...query, page, pageSize });
    },
    [dataList]
  );
  // 切页码
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      getList({ ...query, page: 1, pageSize });
    },
    [dataList]
  );

  useEffect(() => {
    getList({ ...query });
  }, [id]);
  return (
    <Content>
      <section className={styles.main} style={{ paddingTop: 0 }}>
        <header style={{ padding: '7px 16px', margin: '0 -16px' }}>
          盘点信息
          {/* {(props.menu.isSuperUser || props.menu.permissions.includes('INVENTORY_CHECK_OPERATE')) && (
           
          )} */}
          <Button
            type="link"
            className={styles.btn}
            style={{ float: 'right', border: 'none', outline: 'none' }}
            onClick={handleDeleteStock}>
            删除盘点
          </Button>
          {/* <Button className={styles.btn} style={{ float: 'right' }} onClick={handleDeleteStock}>
                删除盘点
              </Button> */}
        </header>
        {/* <div className={styles.title}>货品信息</div> */}
        <div className={styles.row1}>
          <div className={styles.col}>
            盘点时间：<span className={styles['col-data']}>{dataList.createdAt}</span>
          </div>
          <div className={styles.col}>
            盘点人：<span className={styles['col-data']}>{dataList.operatorName}</span>
          </div>
          <div className={styles.col}>
            盘盈数量：<span className={styles['col-data']}>{Format.weight(dataList.diffInNum)}</span>
          </div>
        </div>
        <div className={styles.row1} style={{ marginTop: 16 }}>
          <div className={styles.col}>
            仓库名称：<span className={styles['col-data']}>{dataList.wareHouseName || '-'}</span>
          </div>
          <div className={styles.col}>
            盘亏数量：<span className={styles['col-data']}>{Format.weight(dataList.diffOutNum)}</span>
          </div>
          <div className={styles.col}>
            备注：<span className={styles['col-data']}>{dataList.remark || '-'}</span>
          </div>
          {/* <div className={styles.col}></div> */}
        </div>
        <Table
          style={{ marginTop: 16 }}
          dataSource={dataList.data}
          loading={loading}
          columns={columns}
          pagination={{
            onChange: onChangePage,
            showSizeChanger: false,
            pageSize: query.pageSize,
            current: query.page,
            total: dataList.count,
          }}></Table>
      </section>
    </Content>
  );
};

export default Index;
