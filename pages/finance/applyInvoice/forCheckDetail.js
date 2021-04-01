import { useEffect, useCallback, useState } from 'react';
import { Layout, Content, Msg, Search } from '@components';
import { Row, Col, Button, Table, message, Modal, Input, Form, DatePicker, Affix } from 'antd';
import Title from '@components/Finance/Title';
import Link from 'next/link';
import { finance } from '@api';
import { Format, getQuery } from '@utils/common';
import router from 'next/router';
import styles from '../styles.less';
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

const ForCheckDetail = props => {
  const routerView = {
    title: '按运单开票', // 浏览器标签 title
    pageKey: 'applyInvoice',
    longKey: 'finance.applyInvoice',
    breadNav: [
      '财务中心',
      <Link href="/finance/applyInvoice">
        <a>申请开票</a>
      </Link>,
      '按运单开票',
    ],
    pageTitle: '按运单开票',
    useBack: true,
  };

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
      align: 'right',
    },
  ];

  // 查询条件
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 100,
    begin: null,
    end: null,
    unitPrice: '',
  });

  const [info, setInfo] = useState({
    fromCompany: '',
    fromAddress: '',
    toCompany: '',
    toAddress: '',
    goodsType: '',
  });

  const [loading, setLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [dataList, setDataList] = useState({});
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [total, setTotal] = useState({
    weight: 0,
    price: 0,
    errorCount: 0,
  });

  const [show, setShow] = useState(false);

  const [btnLoading, setBtnLoading] = useState(false);

  const [disabled, setDisabled] = useState(false);
  // 初始化
  useEffect(() => {
    const { fromCompany, toCompany, fromAddress, toAddress, goodsType, begin, end } = getQuery();

    setInfo(() => {
      return {
        ...info,
        fromCompany,
        toCompany,
        fromAddress,
        toAddress,
        goodsType,
      };
    });

    setQuery({ ...query, begin, end });
    setDisabled(begin && end);
    // 获取数据
    getRemoteData({ begin, end });
  }, []);

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
    setTotal({
      price: 0,
      weight: 0,
      errorCount: 0,
    });
    getRemoteData({ ...query, page: 1 });
  }, [query]);

  // 重置
  const handleReset = useCallback(() => {
    const query = {
      page: 1,
      pageSize: 100,
      begin: null,
      end: null,
      unitPrice: '',
    };
    setQuery(query);
    setSelectedRowKeys([]);
    setTotal({
      price: 0,
      weight: 0,
      errorCount: 0,
    });
    getRemoteData(query);
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

  // 选中行计算
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

  const submit = async () => {
    const { batchId } = getQuery();
    let res = {};
    setBtnLoading(true);
    // 分开提交
    // 有batchId则为驳回数据
    // 没有则为未提交数据
    if (batchId) {
      const params = {
        transportIds: selectedRowKeys.join(),
        batchId,
      };
      res = await submitByReject(params);
    } else {
      const params = {
        transportIds: selectedRowKeys.join(),
      };
      res = await submitByCurrent(params);
    }

    if (res.status === 0) {
      message.success(
        <span>
          添加成功，请查看对账单并提交审核
          <Button type="link" size="small" onClick={toTableList()}>
            查看
          </Button>
        </span>,
        5
      );

      setQuery({ ...query, page: 1 });
      setSelectedRowKeys([]);
      setTotal({
        weight: 0,
        price: 0,
      });
      getRemoteData({ ...query, page: 1 });
    } else {
      message.error(`添加失败，原因：${res.detail || res.description}`);
    }
    setBtnLoading(false);
  };

  // 本次开票
  const submitByCurrent = params => {
    const res = finance.saveAskInvoice({ params });
    return res;
  };

  // 驳回提交
  const submitByReject = params => {
    const res = finance.addRejectInvoice({ params });
    return res;
  };

  // 生成对账单 && 跳转对账单页
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

  /**
   * 查询数据
   * @param {Object} param0
   */
  const getRemoteData = async ({ page, pageSize = 100, begin, end, unitPrice }) => {
    setLoading(true);
    const { fromCompany, toCompany, fromAddressId, toAddressId, goodsType } = getQuery();
    const params = {
      limit: pageSize,
      page,
      fromCompany: fromCompany === 'undefined' ? undefined : fromCompany,
      toCompany: toCompany === 'undefined' ? undefined : toCompany,
      fromAddressId: fromAddressId === 'undefined' ? undefined : fromAddressId,
      toAddressId: toAddressId === 'undefined' ? undefined : toAddressId,
      goodsType: goodsType === 'undefined' ? undefined : goodsType,
      begin: begin || undefined,
      end: end || undefined,
      unitPrice: unitPrice ? unitPrice * 100 : undefined,
    };

    const res = await finance.getApplyInvoiceList({ params });

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
      const { fromCompany, fromAddressId, fromAddress, toCompany, toAddressId, toAddress, goodsType } = getQuery();
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

  // 判断选中项是否为空
  const isEmpty = selectedRowKeys.length === 0 ? true : false;

  return (
    <Layout {...routerView}>
      <Content style={{ marginBottom: 24 }}>
        <header>运单信息</header>
        <section>
          <Row>
            <Col span={8} style={{ color: '#6A6A6A' }}>
              <span style={{ color: '#4A4A5A' }}>发货企业：</span>
              {info.fromCompany !== 'undefined' ? info.fromCompany : '-'}
            </Col>
            <Col span={8} style={{ color: '#6A6A6A' }}>
              <span style={{ color: '#4A4A5A' }}>发货地址：</span>
              {info.fromAddress !== 'undefined' ? info.fromAddress : '-'}
            </Col>
            <Col span={8} style={{ color: '#6A6A6A' }}>
              <span style={{ color: '#4A4A5A' }}>货品名称：</span>
              {info.goodsType !== 'undefined' ? info.goodsType : '-'}
            </Col>
          </Row>
          <Row style={{ marginTop: 16 }}>
            <Col span={8} style={{ color: '#6A6A6A' }}>
              <span style={{ color: '#4A4A5A' }}>收货企业：</span>
              {info.toCompany !== 'undefined' ? info.toCompany : '-'}
            </Col>
            <Col span={8} style={{ color: '#6A6A6A' }}>
              <span style={{ color: '#4A4A5A' }}>收货地址：</span>
              {info.toAddress !== 'undefined' ? info.toAddress : '-'}
            </Col>
            <Col span={8} style={{ color: '#6A6A6A' }}></Col>
          </Row>
        </section>
      </Content>

      <Content style={{ marginTop: 24 }}>
        <header>运单列表</header>
        <section>
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
          <div style={{ lineHeight: '32px' }}>
            <span style={{ fontSize: 16 }}>运单列表</span>
            <div style={{ float: 'right' }}>
              <Title />
              <Button type="primary" onClick={submit} loading={btnLoading}>
                添加至对账单
              </Button>
              <Button style={{ marginLeft: 12 }} onClick={() => setShow(true)}>
                智能选择
              </Button>
            </div>
          </div>
          <Affix offsetTop={-24}>
            <Msg style={{ marginTop: 24 }}>
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
          </Affix>
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
            rowSelection={{
              selectedRowKeys: selectedRowKeys,
              onSelect: rowCompute,
              onSelectAll: allRowComput,
            }}
            pagination={{
              onChange: onChangePage,
              onShowSizeChange: onChangePageSize,
              showSizeChanger: true,
              defaultPageSize: 100,
              pageSize: query.pageSize,
              current: query.page,
              total: dataList.count,
            }}
          />
        </section>
      </Content>

      <Modal
        maskClosable={false}
        destroyOnClose
        title="运单智能选择"
        visible={show}
        footer={null}
        onCancel={() => setShow(false)}>
        <Form {...layout} name="basic" onFinish={onFinish} onFinishFailed={onFinishFailed} autoComplete="off">
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
    </Layout>
  );
};

export default ForCheckDetail;
