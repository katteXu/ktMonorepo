import { useState, useCallback, useEffect } from 'react';
import { Table, Button, message, Popconfirm } from 'antd';
import { QuestionCircleFilled } from '@ant-design/icons';
import { Msg, Ellipsis, Steps } from '@components';
import { Empty } from '@components/pound/Settlment';
import router from 'next/router';
import styles from './styles.less';
import { keepState, getState, clearState, Format } from '@utils/common';
import { pound } from '@api';

const ToSettlment = props => {
  const columns = [
    {
      title: '出站时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '120px',
    },
    {
      title: '发货企业',
      dataIndex: 'fromCompany',
      key: 'fromCompany',
      width: '120px',
      render: value => <Ellipsis value={value} width={130} />,
    },
    {
      title: '货品名称',
      dataIndex: 'goodsType',
      key: 'goodsType',
      width: '120px',
    },
    {
      title: '车牌号',
      dataIndex: 'trailerPlateNumber',
      key: 'trailerPlateNumber',
      width: '120px',
    },
    {
      title: '毛重(吨)',
      dataIndex: 'totalWeight',
      key: 'totalWeight',
      width: '120px',
      align: 'right',
      render: Format.weight,
    },
    {
      title: '皮重(吨)',
      dataIndex: 'carWeight',
      key: 'carWeight',
      width: '120px',
      align: 'right',
      render: Format.weight,
    },
    {
      title: '收货净重(吨)',
      dataIndex: 'toGoodsWeight',
      key: 'toGoodsWeight',
      width: '120px',
      align: 'right',
      render: Format.weight,
    },
    {
      title: '发货净重(吨)',
      dataIndex: 'fromGoodsWeight',
      key: 'fromGoodsWeight',
      width: '120px',
      align: 'right',
      render: Format.weight,
    },
    {
      title: '货物单价',
      dataIndex: 'goodsUnitPrice',
      key: 'goodsUnitPrice',
      width: '120px',
      align: 'right',
      render: Format.price,
    },
    {
      title: '路损(吨)',
      dataIndex: 'loss',
      key: 'loss',
      width: '120px',
      align: 'right',
      render: Format.weight,
    },
    {
      title: '路耗(元)',
      dataIndex: 'lossPrice',
      key: 'lossPrice',
      width: '120px',
      align: 'right',
      render: Format.price,
    },
    {
      title: '运费单价(元/吨)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: '120px',
      align: 'right',
      render: Format.price,
    },
    {
      title: '结算运费(元)',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: '120px',
      align: 'right',
      render: Format.price,
    },
    {
      title: '操作',
      dataIndex: 'ctrl',
      key: 'ctrl',
      width: '120px',
      fixed: 'right',
      align: 'right',
      render: (value, record) => {
        return (
          <Popconfirm
            title="是否删除该数据？"
            placement="topRight"
            icon={<QuestionCircleFilled />}
            onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" className="delete" danger>
              删除
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  const [dataList, setDataList] = useState({});
  const [total, setTotal] = useState({
    sum_count: 0,
    sum_fromGoodsWeight: 0,
    sum_toGoodsWeight: 0,
    all_count_truck: 0,
    all_sum_count: 0,
    all_sum_fromGoodsWeight: 0,
    all_sum_toGoodsWeight: 0,
  });

  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
  });

  const [loading, setLoading] = useState(false);

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

  // 下一步
  const handleNext = () => {
    router.push('/poundManagement/settlment/order');
  };

  // 去添加
  const handleToAdd = () => {
    router.push('/poundManagement/settlment/toAdd');
  };

  const getRemoteData = async ({ page, pageSize }) => {
    setLoading(true);
    const params = {
      type: 1,
      manPayStatus: 2,
      page,
      limit: pageSize,
    };

    const res = await pound.getPoundBillList({ params });
    if (res.status === 0) {
      setDataList(res.result);
      setTotal({ ...res.result });

      // 持久化状态
      keepState({
        query: {
          page,
          pageSize,
        },
      });
    } else {
      message.error(`${res.detail || res.description}`);
    }

    setLoading(false);
  };

  const handleDelete = async id => {
    const params = {
      pIds: `${id}`,
      manPayStatus: 1,
    };

    const res = await pound.updateStatus({ params });
    if (res.status === 0) {
      message.success('删除成功');
      let { page } = query;
      if (page > 1 && dataList.data.length === 1) {
        page -= 1;
      }
      setQuery({ ...query, page });
      getRemoteData({ ...query, page });
      props.onReload && props.onReload();
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };

  const hasData = dataList.data && dataList.data.length !== 0;

  return (
    <>
      <Steps
        data={[
          {
            title: '添加待结算磅单',
            key: true,
          },
          {
            title: '查看结算单',
            key: false,
          },
        ]}
      />
      {hasData ? (
        <>
          <div className={styles.ctrl}>
            <Button onClick={handleToAdd} type="primary">
              添加
            </Button>
          </div>
          <Msg style={{ marginTop: 16 }}>
            合计：
            <span style={{ marginRight: 32, marginLeft: 8 }}>
              运输车数<span className="total-num">{total.sum_count}</span>辆
            </span>
            <span style={{ marginRight: 32, marginLeft: 8 }}>
              发货净重<span className="total-num">{Format.weight(total.sum_fromGoodsWeight)}</span>吨
            </span>
            <span style={{ marginRight: 32, marginLeft: 8 }}>
              收货净重<span className="total-num">{Format.weight(total.sum_toGoodsWeight)}</span>吨
            </span>
          </Msg>
          <Table
            loading={loading}
            dataSource={dataList.data}
            columns={columns}
            pagination={{
              onChange: onChangePage,
              pageSize: query.pageSize,
              current: query.page,
              total: dataList.count,
            }}
            scroll={{ x: 'auto' }}
          />
        </>
      ) : (
        <Empty onClick={handleToAdd} />
      )}
      <div className={styles['ctrl-bottom']}>
        {total.all_sum_count !== 0 ? (
          <>
            <Button type="primary" onClick={handleNext}>
              下一步
            </Button>
            <div className={styles['total-statistics']}>
              <span>本次结算：</span>
              <div className={styles.item}>
                车牌数
                <span className={styles.num}>{total.all_count_truck}</span>个
              </div>
              <div className={styles.item}>
                车数
                <span className={styles.num}>{total.all_sum_count}</span>辆
              </div>
              <div className={styles.item}>
                发货净重
                <span className={styles.num}>{Format.weight(total.all_sum_fromGoodsWeight)}</span>吨
              </div>
              <div className={styles.item}>
                收货净重
                <span className={styles.num}>{Format.weight(total.all_sum_toGoodsWeight)}</span>吨
              </div>
            </div>
          </>
        ) : (
          <>
            <>
              <Button type="primary" onClick={handleNext} disabled>
                下一步
              </Button>
              <div className={styles['empty-txt']}>暂无结算数据</div>
            </>
          </>
        )}
      </div>
    </>
  );
};

export default ToSettlment;
