// 待申请开票 按运单
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Msg, DrawerInfo, ChildTitle } from '@components';
import { Button, Table, message, Modal, Input, Form, Checkbox } from 'antd';
import Title from '@components/Finance/Title';
import styles from './styles.less';
import { finance, getCommon } from '@api';
import { Format, getQuery } from '@utils/common';
import Detail from '@components/Transport/detail';
import router from 'next/router';
import { WhiteList } from '@store';
const errorCompute = record => {
  if (record.arrivalGoodsWeight / 1000 > 40) {
    return 1;
  }

  if (record.arrivalGoodsWeight / 1000 < 10) {
    return 1;
  }

  if (record.realPrice / 100 < 50) {
    return 1;
  }

  return 0;
};

const BillingDetail = props => {
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
          <>
            <Button type="link" size="small" onClick={() => handleShowDetail(value)}>
              详情
            </Button>
            <Button type="link" size="small" onClick={() => handleUnBilling(value)}>
              暂不开票
            </Button>
          </>
        );
      },
    },
  ];
  const { whiteList } = WhiteList.useContainer();
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    begin: null,
    end: null,
    unitPrice: '',
  });

  const [indexList, setIndexList] = useState(false);
  const [checkedAll, setCheckedAll] = useState(false);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [dataList, setDataList] = useState({});
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // 详情展示
  const [showDetail, setShowDetail] = useState(false);
  const [transportId, setTransportId] = useState();
  // 监听选择变化
  const checkedRef = useRef({ isAll: false, selectedRowKeys: [] });
  useEffect(() => {
    checkedRef.current = {
      isAll: checkedAll,
      selectedRowKeys: selectedRowKeys,
    };
  }, [checkedAll, selectedRowKeys]);

  const [total, setTotal] = useState({
    weight: 0,
    price: 0,
    errorCount: 0,
  });

  // 生成索引数组
  useEffect(() => {
    if (query.pageSize) {
      setIndexList([...new Array(query.pageSize).keys()]);
    }
  }, [query.pageSize]);

  useEffect(() => {
    const { checkedData } = orderDetail;
    // 获取数据
    getRemoteData({});
    if (checkedData) {
      // 回写选中项
      setSelectedRowKeys(checkedData.ids.split(',').map(item => item * 1));
    }
  }, []);

  // 选中单一值
  const onSelectRow = (record, selected, selectedRows, nativeEvent) => {
    // 行的主键
    const key = record.id;
    if (selected) {
      setSelectedRowKeys([...selectedRowKeys, key]);
    } else {
      const i = selectedRowKeys.indexOf(key);
      selectedRowKeys.splice(i, 1);
      setSelectedRowKeys([...selectedRowKeys]);
    }
  };

  // 选中所有
  const onSelectAll = (selected, selectedRows, changeRows) => {
    let { price, weight, errorCount } = total;
    let _totalPrice = 0;
    let _totalWeight = 0;
    let _errorCount = 0;
    changeRows.forEach(record => {
      const key = record.id;
      const i = selectedRowKeys.indexOf(key);
      if (selected) {
        if (i === -1) {
          selectedRowKeys.push(key);
          _totalPrice += record.realPrice;
          _totalWeight += record.arrivalGoodsWeight;
          _errorCount += errorCompute(record);
        }
      } else {
        selectedRowKeys.splice(i, 1);
        _totalPrice += record.realPrice;
        _totalWeight += record.arrivalGoodsWeight;
        _errorCount += errorCompute(record);
      }
    });
    setSelectedRowKeys([...selectedRowKeys]);
    setTotal({
      price: selected ? price + _totalPrice : price - _totalPrice,
      weight: selected ? weight + _totalWeight : weight - _totalWeight,
      errorCount: selected ? errorCount + _errorCount : errorCount - _errorCount,
    });
  };

  /**
   * 选中行计算
   */
  const rowCompute = (selectRow, selected) => {
    onSelectRow(selectRow, selected);
    let { price, weight, errorCount } = total;
    const { realPrice, arrivalGoodsWeight } = selectRow;
    const hasError = errorCompute(selectRow);
    if (selected) {
      price += realPrice;
      weight += arrivalGoodsWeight;
      errorCount += hasError;
    } else {
      price -= realPrice;
      weight -= arrivalGoodsWeight;
      errorCount -= hasError;
    }
    setTotal({
      ...total,
      price,
      weight,
      errorCount,
    });
  };

  // 总计算
  const allRowComput = (selected, selectedRows, changeRows) => {
    onSelectAll(selected, selectedRows, changeRows);
  };

  // 提交报错
  const onFinishFailed = errorInfo => {
    console.error('Failed:', errorInfo);
  };

  // 分页
  const onChangePage = useCallback(
    (page, pageSize) => {
      setQuery({ ...query, page, pageSize });
      getRemoteData({ ...query, page, pageSize });
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

  // 全选按钮
  const handleCheckedAll = () => {
    if (dataList.count) {
      setCheckedAll(!checkedAll);
      clearCheckData();
    } else {
      message.warn('当前列表没有数据');
      setCheckedAll(false);
    }
  };

  const handleUnBilling = async ids => {
    await props.onUnBilling(`${ids}`);
    let { page } = query;
    if (page > 1 && dataList.data.length === 1) {
      page -= 1;
    }
    setQuery({ ...query, page });
    getRemoteData({ ...query, page });
  };

  /**
   * 清空选中数据
   */
  const clearCheckData = () => {
    setSelectedRowKeys([]);
    setTotal({
      weight: 0,
      price: 0,
      errorCount: 0,
    });
  };
  /**
   * 查询数据
   * @param {Object} param0
   */
  const getRemoteData = async ({ page = 1, pageSize = 10, begin, end, unitPrice }) => {
    setLoading(true);
    const { invoiceId } = getQuery();
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
      invoiceId,
    };

    const res = await finance.getApplyInvoiceList({ params });

    if (res.status === 0) {
      setDataList(res.result);
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };

  // 智能选择提交
  const onFinish = useCallback(
    async values => {
      const { fromCompany, fromAddressId, fromAddress, toCompany, toAddressId, toAddress, goodsType } = orderDetail;
      setShow(false);
      const params = {
        fromCompany,
        toCompany,
        fromAddressId,
        fromAddress,
        toAddressId,
        toAddress,
        goodsType,
        weight: values.totalWeight * 1000,
        begin: query.begin || undefined,
        end: query.end || undefined,
        unitPrice: query.unitPrice ? query.unitPrice * 100 : undefined,
      };

      if (values.totalWeight * 1 === 0) {
        setSelectedRowKeys([]);
        setTotal({
          weight: 0,
          price: 0,
          errorCount: 0,
        });
        return;
      }

      setCheckLoading(true);

      const res = await finance.filterByWeight({ params });

      if (res.status === 0) {
        if (res.result.ids.length === 0) {
          message.warning('没有符合条件的运单');
          return;
        }
        setSelectedRowKeys(res.result.ids);
        setTotal({
          weight: res.result.weightSum,
          price: res.result.priceSum,
          errorCount: res.result.errorCount,
        });
        message.success('运单选择成功');
      } else {
        message.error(`${res.detail || res.description}`);
      }

      setCheckLoading(false);
    },
    [dataList]
  );

  // 展示详情
  const handleShowDetail = id => {
    setShowDetail(true);
    setTransportId(id);
  };

  // 提交选择
  const handleSubmitCheck = () => {
    let params;
    if (selectedRowKeys.length > 0) {
      params = {
        ids: selectedRowKeys.join(','),
        price: total.price,
        weight: total.weight,
      };
    } else if (checkedAll) {
      params = {
        ids: orderDetail.ids,
        price: dataList.price,
        weight: dataList.arrivalGoodsWeight,
      };
    } else {
      message.warn('请选择要开票的运单');
      return;
    }
    props.onSubmit && props.onSubmit({ [orderDetail.ids]: params });
  };

  // 判断选中项是否为空
  const isEmpty = selectedRowKeys.length === 0 ? true : false;
  console.log(whiteList.heShun);
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
            <div style={{ padding: '16px 0' }}>
              <Button onClick={() => setShow(true)}>智能选择</Button>
              <Title />
            </div>
          </div>
          <Msg>
            <span className="select-all" onClick={handleCheckedAll}>
              <Checkbox checked={checkedAll}></Checkbox>
              <span>全选(支持跨分页)</span>
            </span>
            {(!isEmpty || checkedAll) && <span style={{ marginRight: 12 }}>已选</span>}
            <span>
              运单数
              <span className="total-num">{isEmpty || checkedAll ? dataList.count || 0 : selectedRowKeys.length}</span>
              单
            </span>
            <span style={{ marginLeft: 32 }}>
              总净重
              <span className="total-num">
                {Format.weight(isEmpty || checkedAll ? dataList.arrivalGoodsWeight || 0 : total.weight)}
              </span>
              吨
            </span>
            <span style={{ marginLeft: 32 }}>
              运费总额
              <span className="total-num">
                {Format.price(isEmpty || checkedAll ? dataList.price || 0 : total.price)}
              </span>
              元
            </span>
            <span style={{ marginLeft: 32 }}>
              含税总额
              <span className="total-num">
                {Format.price(
                  isEmpty || checkedAll
                    ? dataList.invoice_price || 0
                    : whiteList.heShun
                    ? total.price * 1.09
                    : parseInt(total.price + (total.price * dataList.taxPoint) / (1 - dataList.taxPoint))
                )}
              </span>
              元
            </span>
          </Msg>

          <Table
            loading={loading}
            dataSource={dataList.data}
            columns={columns}
            rowKey={(record, i) => {
              return checkedAll ? i : record.id;
            }}
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
            rowSelection={{
              selectedRowKeys: checkedAll ? indexList : selectedRowKeys,
              onSelect: rowCompute,
              onSelectAll: allRowComput,
              getCheckboxProps: () => {
                return { disabled: checkedAll };
              },
            }}
            pagination={{
              onChange: onChangePage,
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
      <div className={styles['btn-bottom']}>
        <Button onClick={props.onClose}>取消</Button>
        <Button type="primary" style={{ marginLeft: 8 }} onClick={handleSubmitCheck}>
          确定
        </Button>
      </div>

      <Modal
        maskClosable={false}
        destroyOnClose
        title="运单智能选择"
        visible={show}
        footer={null}
        onCancel={() => setShow(false)}>
        <Form name="basic" onFinish={onFinish} onFinishFailed={onFinishFailed} autoComplete="off">
          <Form.Item
            label="预开票净重"
            name="totalWeight"
            validateFirst={true}
            rules={[
              { required: false, message: '内容不可为空' },
              {
                pattern: /^\d+(\.?\d{1,2})?$/,
                message: '总净重只能是数字，最多两位小数',
              },
            ]}>
            <Input addonAfter="吨" style={{ width: 264 }} />
          </Form.Item>
          <div style={{ marginBottom: 24, color: '#333333' }}>
            <span>注：</span>筛选计算出的预开票净重可能为近似值.
          </div>
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setShow(false)}>取消</Button>
            <Button style={{ marginLeft: 12 }} type="primary" htmlType="submit" loadig={checkLoading}>
              确定
            </Button>
          </div>
        </Form>
      </Modal>

      <DrawerInfo title="运单详情" onClose={() => setShowDetail(false)} showDrawer={showDetail} width="664">
        {showDetail && <Detail id={transportId} />}
      </DrawerInfo>
    </div>
  );
};

export default BillingDetail;
