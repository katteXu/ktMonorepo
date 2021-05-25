// 待申请开票 按运单
import React, { useState, useCallback, useEffect } from 'react';
import { Msg, ChildTitle } from '@components';
import { Button, Table, message } from 'antd';
import Title from '@components/Finance/Title';
import styles from './styles.less';
import { finance } from '@api';
import { Format } from '@utils/common';

const UnBillingDetail = props => {
  const { orderDetail } = props;
  const columns = [
    {
      title: '车牌号',
      dataIndex: 'trailerPlateNumber',
      key: 'trailerPlateNumber',
      width: 160,
    },
    {
      title: '司机姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
    },
    {
      title: '结算净重(吨)',
      dataIndex: 'invoiceGoodsWeight',
      key: 'invoiceGoodsWeight',
      align: 'right',
      width: 160,
      render: Format.weight,
    },
    {
      title: '运费单价(元)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right',
      width: 160,
      render: Format.price,
    },
    {
      title: '运费(元)',
      dataIndex: 'realPrice',
      key: 'realPrice',
      align: 'right',
      width: 160,
      render: Format.price,
    },
    {
      title: '承运时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      align: 'left',
    },
    {
      title: '操作',
      dataIndex: 'id',
      key: 'rowkKey',
      width: 100,
      fixed: 'right',
      align: 'right',
      render: (value, record, i) => {
        return (
          <Button type="link" size="small" onClick={() => handleBack(value)}>
            移回
          </Button>
        );
      },
    },
  ];

  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    begin: null,
    end: null,
    unitPrice: '',
  });
  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState({});

  useEffect(() => {
    // 获取数据
    getRemoteData({});
  }, []);

  // 分页
  const onChangePage = useCallback(
    page => {
      setQuery({ ...query, page });
      getRemoteData({ ...query, page });
    },
    [query]
  );

  // 切页码
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      getRemoteData({ ...query, page: 1, pageSize });
    },
    [query]
  );

  const handleBack = async ids => {
    await props.onBack(`${ids}`);
    getRemoteData(query);
  };

  /**
   * 查询数据
   * @param {Object} param0
   */
  const getRemoteData = async ({ page = 1, pageSize = 10, begin, end, unitPrice }) => {
    setLoading(true);
    const { fromCompany, toCompany, fromAddressId, toAddressId, goodsType } = orderDetail;
    const params = {
      limit: pageSize,
      page,
      fromCompany: fromCompany || undefined,
      toCompany: toCompany || undefined,
      fromAddressId: fromAddressId || undefined,
      toAddressId: toAddressId || undefined,
      goodsType: goodsType || undefined,
      begin: begin || undefined,
      end: end || undefined,
      unitPrice: unitPrice ? unitPrice * 100 : undefined,
      approveClose: 1,
    };

    const res = await finance.getApplyInvoiceList({ params });

    if (res.status === 0) {
      setDataList(res.result);
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };

  return (
    <div className={styles.detail}>
      <div className={styles.content}>
        <div className={styles['company-info']}>
          <div className={styles['child-title']}>
            <ChildTitle>运单信息</ChildTitle>
          </div>
          <div className={styles.row}>
            <div className={styles.item}>
              <span className={styles.label}>发货企业：</span>
              {orderDetail.fromCompany !== 'undefined' ? orderDetail.fromCompany : '-'}
            </div>
            <div className={styles.item}>
              <span className={styles.label}>发货地址：</span>
              {orderDetail.fromAddress !== 'undefined' ? orderDetail.fromAddress : '-'}
            </div>
            <div className={styles.item}>
              <span className={styles.label}>货品名称：</span>
              {orderDetail.goodsType !== 'undefined' ? orderDetail.goodsType : '-'}
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.item}>
              <span className={styles.label}>收货企业：</span>
              {orderDetail.toCompany !== 'undefined' ? orderDetail.toCompany : '-'}
            </div>
            <div className={styles.item}>
              <span className={styles.label}>收货地址：</span>
              {orderDetail.toAddress !== 'undefined' ? orderDetail.toAddress : '-'}
            </div>
            <div className={styles.item}></div>
          </div>
        </div>
        <section>
          <div style={{ lineHeight: '32px' }}>
            <div style={{ padding: '16px 0', height: 64 }}>
              <Title />
            </div>
          </div>
          <Msg>
            <span>
              运单数<span className="total-num">{dataList.count || 0}</span>单
            </span>
            <span style={{ marginLeft: 32 }}>
              总净重
              <span className="total-num">{Format.weight(dataList.arrivalGoodsWeight || 0)}</span>吨
            </span>
            <span style={{ marginLeft: 32 }}>
              运费总额
              <span className="total-num">{Format.price(dataList.price || 0)}</span>元
            </span>
            <span style={{ marginLeft: 32 }}>
              含税总额
              <span className="total-num">{Format.price(dataList.invoice_price || 0)}</span>元
            </span>
          </Msg>

          <Table
            loading={loading}
            dataSource={dataList.data}
            columns={columns}
            rowClassName={(record, index) => {
              if (record.invoiceGoodsWeight / 1000 > 40) {
                return styles.red;
              }

              if (record.invoiceGoodsWeight / 1000 < 10) {
                return styles.green;
              }

              if (record.realPrice / 100 < 50) {
                return styles.yellow;
              }
            }}
            pagination={{
              onChange: onChangePage,
              onShowSizeChange: onChangePageSize,
              showSizeChanger: true,
              defaultPageSize: 10,
              pageSize: query.pageSize,
              current: query.page,
              total: dataList.count,
            }}
            style={{ minHeight: 400 }}
          />
        </section>
      </div>
    </div>
  );
};

export default UnBillingDetail;
