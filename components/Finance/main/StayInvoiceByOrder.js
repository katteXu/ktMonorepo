// 待申请开票 按运单
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Msg, Search, DrawerInfo } from '@components';
import Progress from '../Progress';
import { Row, Col, Button, Table, message, Modal, Input, Form, DatePicker, Checkbox, Affix } from 'antd';
import Title from '@components/Finance/Title';
import styles from '../styles.less';
import { finance } from '@api';
import { Format, getQuery } from '@utils/common';
import Detail from '@components/Transport/detail';
import router from 'next/router';
import moment from 'moment';

const layout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};

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

const StayInvoiceByOrder = props => {
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
          <Button type="link" size="small" onClick={() => handleShowDetail(value)}>
            详情
          </Button>
        );
      },
    },
  ];

  const [orderDetail, setOrderDetail] = useState(props.orderDetail);
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    begin: null,
    end: null,
    unitPrice: '',
  });

  // 对账单统计
  const [invoiceTotal, setInvoiceTotal] = useState({
    priceSum: 0,
    taxPriceSum: 0,
    weightSum: 0,
  });

  const [disabled, setDisabled] = useState(false);
  const [indexList, setIndexList] = useState(false);
  const [checkedAll, setCheckedAll] = useState(false);
  const [show, setShow] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [btnNeverLoading, setBtnNeverLoading] = useState(false);
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
    // 获取数据
    getRemoteData({});
  }, []);
  /**
   * 返回
   */
  const handleBack = () => {
    props.back && props.back();
  };

  // 日期输入
  const handleChangeDate = useCallback((value, string) => {
    const begin = value && value[0] && moment(value[0]).format('YYYY-MM-DD HH:mm:ss');
    const end = value && value[1] && moment(value[1]).format('YYYY-MM-DD HH:mm:ss');
    setQuery(() => ({ ...query, begin, end }));
  });

  // 运费单间
  const handleChangeUnitPrice = useCallback(e => {
    const unitPrice = e.target.value;
    setQuery(() => ({ ...query, unitPrice }));
  });

  //  查询
  const handleSearch = useCallback(() => {
    setQuery({ ...query, page: 1 });
    setSelectedRowKeys([]);
    clearCheckData();
    setCheckedAll(false);
    getRemoteData({ ...query, page: 1 });

    props.refreshTotalData && props.refreshTotalData();
  }, [query]);

  // 重置
  const handleReset = useCallback(() => {
    const query = {
      page: 1,
      pageSize: 10,
      begin: null,
      end: null,
      unitPrice: '',
    };
    setQuery(query);
    clearCheckData();
    setCheckedAll(false);
    getRemoteData(query);

    props.refreshTotalData && props.refreshTotalData();
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

  /**
   * 添加至对账单
   */
  const submit = useCallback(async () => {
    const { isAll: checkedAll, selectedRowKeys } = checkedRef.current;
    const { batchId } = getQuery();

    if (selectedRowKeys.length === 0 && !checkedAll) {
      message.warn('请选择要提交的运单');
      return;
    }

    let res = {};
    setBtnLoading(true);

    if (checkedAll) {
      const { fromCompany, toCompany, fromAddressId, toAddressId, goodsType } = orderDetail;
      const { unitPrice, begin, end } = query;
      const params = {
        isAll: 1,
        fromCompany,
        toCompany,
        fromAddressId,
        toAddressId,
        goodsType,
        unitPrice: unitPrice ? unitPrice * 100 : undefined,
        begin: begin || undefined,
        end: end || undefined,
      };

      res = batchId ? await submitByReject({ ...params, batchId }) : await submitByCurrent(params);
      setCheckedAll(false);
    } else {
      const params = {
        transportIds: selectedRowKeys.join(),
      };
      res = batchId ? await submitByReject({ ...params, batchId }) : await submitByCurrent(params);
    }

    if (res.status === 0) {
      message.success(<span>添加成功，您可以查看对账单或继续添加</span>, 5);

      setQuery({ ...query, page: 1 });
      clearCheckData();
      getRemoteData({ ...query, page: 1 });

      props.refreshTotalData && props.refreshTotalData();
    } else {
      message.error(`添加失败，原因：${res.detail || res.description}`);
    }
    setBtnLoading(false);
  }, [dataList]);

  // 本次开票
  const submitByCurrent = params => {
    const { finance_pay_type = 'PRICE' } = typeof window === 'undefined' ? {} : sessionStorage;
    const res = finance.saveAskInvoice({
      params: { ...params, payType: finance_pay_type },
    });
    return res;
  };

  // 驳回提交
  const submitByReject = params => {
    const { finance_pay_type = 'PRICE' } = typeof window === 'undefined' ? {} : sessionStorage;
    const res = finance.addRejectInvoice({
      params: { ...params, payType: finance_pay_type },
    });
    return res;
  };

  // 暂不开票
  const submitNever = useCallback(async () => {
    const { isAll: checkedAll, selectedRowKeys } = checkedRef.current;
    const { finance_pay_type = 'PRICE' } = typeof window === 'undefined' ? {} : sessionStorage;

    if (selectedRowKeys.length === 0 && !checkedAll) {
      message.warn('请选择暂不开票的运单');
      return;
    }

    let res = {};
    setBtnNeverLoading(true);

    if (checkedAll) {
      const { fromCompany, toCompany, fromAddressId, toAddressId, goodsType } = orderDetail;
      const { unitPrice, begin, end } = query;
      const params = {
        isAll: 1,
        fromCompany,
        toCompany,
        fromAddressId,
        toAddressId,
        goodsType,
        unitPrice: unitPrice ? unitPrice * 100 : undefined,
        begin: begin || undefined,
        end: end || undefined,
        payType: finance_pay_type,
        approveClose: '1',
      };

      res = await finance.removeAskInvoice({ params });
      setCheckedAll(false);
    } else {
      const params = {
        transportIds: selectedRowKeys.join(),
        payType: finance_pay_type,
        approveClose: '1',
      };
      res = await finance.removeAskInvoice({ params });
    }

    if (res.status === 0) {
      message.success(<span>所选运单已添到暂不开票页</span>, 5);

      setQuery({ ...query, page: 1 });
      clearCheckData();
      getRemoteData({ ...query, page: 1 });

      props.refreshTotalData && props.refreshTotalData();
    } else {
      message.error(`添加失败，原因：${res.detail || res.description}`);
    }
    setBtnNeverLoading(false);
  }, [dataList]);

  // 提交报错
  const onFinishFailed = errorInfo => {
    console.error('Failed:', errorInfo);
  };

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

  // 跳转对账单页
  const toTableList = () => {
    let clickCount = 0;
    function _to() {
      if (clickCount === 0) {
        if (getQuery().batchId) {
          router.back();
        } else {
          router.push('/finance/applyInvoice/record?mode=edit');
        }
      }
      clickCount++;
    }
    return _to;
  };

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

    setInvoiceTotal({
      ...res.result.askInvoiceData,
    });
    if (res.status === 0) {
      setDataList(res.result);
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };

  // 提交
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

  // 判断选中项是否为空
  const isEmpty = selectedRowKeys.length === 0 ? true : false;

  return (
    <div className={styles['stay-invoice-byorder']}>
      <Progress />
      <header className={styles.header}>
        运单信息
        <Button onClick={handleBack} style={{ float: 'right' }}>
          返回
        </Button>
      </header>
      <Row>
        <Col span={8} style={{ color: '#4A4A5A' }}>
          <span style={{ color: '#6A6A6A' }}>发货企业：</span>
          {orderDetail.fromCompany !== 'undefined' ? orderDetail.fromCompany : '-'}
        </Col>
        <Col span={8} style={{ color: '#4A4A5A' }}>
          <span style={{ color: '#6A6A6A' }}>发货地址：</span>
          {orderDetail.fromAddress !== 'undefined' ? orderDetail.fromAddress : '-'}
        </Col>
        <Col span={8} style={{ color: '#4A4A5A' }}>
          <span style={{ color: '#6A6A6A' }}>货品名称：</span>
          {orderDetail.goodsType !== 'undefined' ? orderDetail.goodsType : '-'}
        </Col>
      </Row>
      <Row style={{ marginTop: 16 }}>
        <Col span={8} style={{ color: '#4A4A5A' }}>
          <span style={{ color: '#6A6A6A' }}>收货企业：</span>
          {orderDetail.toCompany !== 'undefined' ? orderDetail.toCompany : '-'}
        </Col>
        <Col span={8} style={{ color: '#4A4A5A' }}>
          <span style={{ color: '#6A6A6A' }}>收货地址：</span>
          {orderDetail.toAddress !== 'undefined' ? orderDetail.toAddress : '-'}
        </Col>
        <Col span={8} style={{ color: '#4A4A5A' }}></Col>
      </Row>
      <section className={styles.table}>
        <Search onSearch={handleSearch} onReset={handleReset} simple>
          <Search.Item label="承运时间" style={{ textAlign: 'left' }} br>
            <DatePicker.RangePicker
              disabled={disabled}
              style={{ width: 376 }}
              value={query.begin && query.end ? [moment(query.begin), moment(query.end)] : []}
              format="YYYY-MM-DD HH:mm:ss"
              showTime={{
                defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
              }}
              onChange={handleChangeDate}
            />
          </Search.Item>
          <Search.Item label="运费单价">
            <Input allowClear value={query.unitPrice} placeholder="请输入运费单价" onChange={handleChangeUnitPrice} />
          </Search.Item>
        </Search>
        <div style={{ lineHeight: '32px', marginTop: 16 }}>
          <span className={styles['table-title']}>运单列表</span>
          <div style={{ float: 'right' }}>
            <Title />
            <Button type="primary" onClick={submit} loading={btnLoading}>
              添加至对账单
            </Button>
            {typeof window !== 'undefined' && !getQuery().batchId && (
              <Button type="primary" ghost onClick={submitNever} loading={btnNeverLoading} style={{ marginLeft: 8 }}>
                暂不开票
              </Button>
            )}
            <Button style={{ marginLeft: 8 }} onClick={() => setShow(true)}>
              智能选择
            </Button>
          </div>
        </div>
        <Msg style={{ marginTop: 10 }}>
          <span className="select-all" onClick={handleCheckedAll}>
            <Checkbox checked={checkedAll}></Checkbox>
            <span>全选(支持跨分页)</span>
          </span>
          {!isEmpty && <span style={{ marginRight: 12 }}>已选</span>}
          <span>
            运单数
            <span className="total-num">{isEmpty ? dataList.count || 0 : selectedRowKeys.length}</span>单
          </span>
          <span style={{ marginLeft: 32 }}>
            总净重
            <span className="total-num">
              {Format.weight(isEmpty ? dataList.arrivalGoodsWeight || 0 : total.weight)}
            </span>
            吨
          </span>
          <span style={{ marginLeft: 32 }}>
            运费总额
            <span className="total-num">{Format.price(isEmpty ? dataList.price || 0 : total.price)}</span>元
          </span>
          <span style={{ marginLeft: 32 }}>
            含税总额
            <span className="total-num">
              {Format.price(isEmpty ? dataList.invoice_price || 0 : total.price * 1.09)}
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
      <Affix offsetBottom={0}>
        <div className={styles.bottom}>
          {/* 驳回数据显示批次号 */}
          {typeof window !== 'undefined' && getQuery().batchId && (
            <div className={styles.item}>当前批次号：{getQuery().batchId}</div>
          )}
          <div className={styles.item}>
            含税总金额：
            <span className={styles['total-num']}>{Format.price(invoiceTotal.taxPriceSum)}</span> 元
          </div>
          <div className={styles.item}>
            不含税总金额：
            <span className={styles['total-num']}>{Format.price(invoiceTotal.priceSum)}</span> 元
          </div>
          <div className={styles.item}>
            总净重：
            <span className={styles['total-num']}>{Format.weight(invoiceTotal.weightSum)}</span> 吨
          </div>
          <Button type="primary" onClick={toTableList()}>
            查看对账单
          </Button>
        </div>
      </Affix>
      <Modal
        maskClosable={false}
        destroyOnClose
        title="运单智能选择"
        visible={show}
        footer={null}
        onCancel={() => setShow(false)}>
        <Form {...layout} name="basic" onFinish={onFinish} onFinishFailed={onFinishFailed} autoComplete="off">
          <Form.Item
            label={
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    marginRight: 4,
                    visibility: 'hidden',
                  }}>
                  *
                </span>
                预开票净重
              </div>
            }
            // label="预开票净重"
            name="totalWeight"
            validateFirst={true}
            rules={[
              { required: false, message: '内容不可为空' },
              {
                pattern: /^\d+(\.?\d{1,2})?$/,
                message: '总净重只能是数字，最多两位小数',
              },
            ]}>
            <Input suffix="吨" />
          </Form.Item>
          <div style={{ marginLeft: 15 }}>
            <span style={{ color: '#E44040' }}>注：</span>
            筛选计算出的预开票净重可能为近似值.
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

export default StayInvoiceByOrder;
