import { Table, message } from 'antd';
import { useState, useEffect, useCallback } from 'react';
import { capital } from '@api';
import { Format } from '@utils/common';
import { Msg } from '@components';
const Index = props => {
  const [loading, setLoading] = useState(true);

  const [list, setList] = useState([]);
  // 查询条件
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
  });
  const columns = [
    {
      title: '运单类型',
      dataIndex: 'routeType',
      key: 'routeType',
      width: 120,
    },
    {
      title: '付款方式',
      dataIndex: ['routeInfo', 'payPathZn'],
      key: 'routeInfo.payPathZn',
      width: 120,
      render: value => {
        return value != '' ? value : '-';
      },
    },
    {
      title: '车牌号',
      dataIndex: 'trailerPlateNumber',
      key: 'trailerPlateNumber',
      width: 100,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '司机姓名',
      dataIndex: ['truckerInfo', 'name'],
      key: 'truckerInfo.name',
      width: 100,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '手机号',
      dataIndex: ['truckerInfo', 'mobilePhoneNumber'],
      key: 'truckerInfo.mobilePhoneNumber',
      width: 100,
      render: value => {
        return value || '-';
      },
    },
    {
      title: '发货净重(吨)',
      dataIndex: 'goodsWeight',
      key: 'goodsWeight',
      align: 'right',
      width: 120,
      render: Format.weight,
    },
    {
      title: '收货净重(吨)',
      dataIndex: 'arrivalGoodsWeight',
      key: 'arrivalGoodsWeight',
      width: 120,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '路损(吨)',
      dataIndex: 'loss',
      key: 'loss',
      width: 120,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '运费单价(元)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      align: 'right',
      render: (value, record) => {
        return Format.price(record.unitPrice + record.unitInfoFee);
      },
    },
    {
      title: '结算费用(元)',
      dataIndex: 'realPrice',
      key: 'realPrice',
      width: 120,
      align: 'right',
      render: (value, record) => {
        return Format.price(record.realPrice + record.totalInfoFee);
      },
    },
    {
      title: '承运时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
      align: 'right',
      render: value => {
        return value || '-';
      },
    },
  ];

  useEffect(() => {
    setData({ ...query });
  }, [props.walletId]);

  const setData = useCallback(
    async ({ pageSize, page }) => {
      setLoading(true);
      const params = {
        limit: pageSize,
        page,
        id: props.walletId,
      };
      const { status, result, detail, description } = await capital.walletDetailList({ params });
      if (!status) {
        setList(result);
      } else {
        message.error(detail || description);
      }
      setLoading(false);
    },
    [props.walletId]
  );

  // 翻页
  const onChangePage = useCallback(
    page => {
      setQuery({ ...query, page });
      setData({ ...query, page });
    },
    [list]
  );

  // 切页码
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      setData({ ...query, page: 1, pageSize });
    },
    [list]
  );

  return (
    <>
      <Msg>
        <span>运单数</span>
        <span className={'total-num'}>{!loading ? list.count : '-'}</span>单
      </Msg>
      <Table
        style={{ marginTop: 4 }}
        loading={loading}
        dataSource={list.data}
        columns={columns}
        scroll={{ x: 'auto' }}
        pagination={{
          onChange: onChangePage,
          pageSize: query.pageSize,
          current: query.page,
          total: list.count,
          showSizeChanger: false,
        }}
      />
    </>
  );
};

export default Index;
