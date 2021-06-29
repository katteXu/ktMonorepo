import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Content, Search, Msg } from '@components';
import { Button, Tabs, DatePicker, Input, Table, Tooltip, Modal, message } from 'antd';
import { InfoCircleFilled } from '@ant-design/icons';
import router from 'next/router';
import { finance } from '@api';
import { Format, getQuery } from '@utils/common';
import PayPasswordInput from '@components/common/PayPasswordInput';
import styles from '../styles.less';
import moment from 'moment';

const { TabPane } = Tabs;
const routeView = {
  title: '开票信息',
  pageKey: 'main',
  longKey: 'finance.main',
  breadNav: '财务中心.开票信息',
  pageTitle: '开票信息',
};

const InvoiceList = () => {
  const [totalData, setTotalData] = useState({});

  const columns = [
    {
      title: '批次号',
      dataIndex: 'batchId',
      key: 'batchId',
      width: 90,
    },
    {
      title: '结算净重(吨)',
      dataIndex: 'weightSum',
      key: 'weightSum',
      width: 90,
      align: 'right',
      render: Format.weight,
    },
    {
      title: '运费金额(元)',
      dataIndex: 'priceSum',
      key: 'priceSum',
      align: 'right',
      width: 120,
      render: Format.price,
    },
    {
      title: '含税金额(元)',
      dataIndex: 'invoicePriceSum',
      key: 'invoicePriceSum',
      align: 'right',
      width: 120,
      render: Format.price,
    },
    {
      title: '税费金额(元)',
      dataIndex: 'difference',
      key: 'difference',
      align: 'right',
      width: 90,
      render: Format.price,
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
    },
    {
      title: '操作',
      dataIndex: 'batchId',
      key: 'ctrl',
      fixed: 'right',
      align: 'right',
      width: 120,
      render: (value, record) => {
        const { difference, id, status } = record;
        return (
          <>
            <Button
              size="small"
              type="link"
              onClick={() => {
                toView(record);
              }}>
              查看对账单
            </Button>
            {status === 'UN_PAY' && (
              <Button
                size="small"
                type="link"
                onClick={() => {
                  setPayInfo({ showPass: true, payId: id, payMoney: difference });
                }}>
                支付
              </Button>
            )}
          </>
        );
      },
    },
  ];

  const [hasInvoice, setHasInvoice] = useState(false);

  const [payInfo, setPayInfo] = useState({});

  const [total, setTotal] = useState({
    weight: 0,
    price: 0,
    invoicePrice: 0,
    difference: 0,
  });

  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState({});

  const [query, setQuery] = useState({
    status: 'All',
    page: 1,
    pageSize: 10,
    batchId: '',
    begin: undefined,
    end: undefined,
  });
  useEffect(() => {
    const { tab } = getQuery();
    if (tab) {
      setQuery({ ...query, status: tab });
      getRemoteData({ ...query, status: tab });
      router.replace('/finance/main');
    } else {
      getRemoteData(query);
    }
    getInvoiceInfo();
    getTotalData();
  }, []);

  const [invoiceInfo, setInvoiceInfo] = useState({
    companyName: '-',
    companyAddress: '-',
    invoicePhone: '-',
    taxpayerNumber: '-',
    cardNumber: '-',
    bankName: '-',
  });

  const [tabCount, setTabCount] = useState({
    UN_APPROVE: 0,
    REJECT_APPROVE: 0,
    UN_PAY: 0,
    UN_INVOICE: 0,
    INVOICED: 0,
    ALL: 0,
  });

  const handleSearch = () => {
    setQuery({ ...query, page: 1 });
    getRemoteData({ ...query, page: 1 });
    getTotalData();
  };

  const handleReset = () => {
    const _query = {
      page: 1,
      pageSize: 10,
      batchId: '',
      begin: undefined,
      end: undefined,
      status: query.status,
    };
    setQuery(_query);
    getRemoteData(_query);
    getTotalData();
  };

  const handleChangeBatchId = useCallback(e => {
    const batchId = e.target.value;
    setQuery(() => ({ ...query, batchId }));
  });

  const handleChangeDate = useCallback((value, string) => {
    const begin = value && value[0] && moment(value[0]).format('YYYY-MM-DD HH:mm:ss');
    const end = value && value[1] && moment(value[1]).format('YYYY-MM-DD HH:mm:ss');
    setQuery(() => ({ ...query, begin, end }));
  });

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

  // 获取总体数据
  const getTotalData = async () => {
    const res = await finance.getTotalInvoiceData();
    if (res.status === 0) {
      const { waitApproveInvoicePrice, waitPayInvoicePrice } = res.result;
      setTotalData({
        waitApproveInvoicePrice,
        waitPayInvoicePrice,
      });
    }
  };

  // 获取开票信息
  const getInvoiceInfo = async () => {
    const res = await finance.getWaitaAskInvoiceList();
    if (res.status === 0) {
      const { companyData } = res.result;
      setHasInvoice(true);
      setInvoiceInfo(companyData);
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };

  const handleChangeTabs = status => {
    setQuery({ ...query, status });
    getRemoteData({ ...query, status });
  };

  // 查看
  const toView = record => {
    const { id, status, batchId, payType } = record;
    const mode = status === 'REJECT_APPROVE' ? 'edit' : 'view';

    const params = {
      id,
      payType,
    };

    router.push(
      `/finance/invoiceList/record?id=${id}&mode=${mode}&batchId=${batchId}&payType=${payType}&status=${status}`
    );
  };

  // 支付
  const pay = async () => {
    const { payId, password } = payInfo;
    if (password && password.length > 0) {
      setPayInfo({ ...payInfo, payLoading: true });
      const params = {
        id: payId,
        payPass: {
          passOne: password[0].value,
          passTwo: password[1].value,
          passThree: password[2].value,
          passFour: password[3].value,
          passFive: password[4].value,
          passSix: password[5].value,
        },
      };
      const res = await finance.payInvoice({ params });
      if (res.status === 0) {
        message.success('支付成功');
        setPayInfo({ ...payInfo, showPass: false, payLoading: false });
        handleReset();
        getTotalData();
      } else {
        setPayInfo({ ...payInfo, payError: res.detail ? res.detail : res.description, payLoading: false });
      }
    } else {
      message.error('请输入完整密码');
    }
  };

  const getRemoteData = async ({ status, batchId, begin, end, page, pageSize = 10 }) => {
    setLoading(true);
    const params = {
      batchId,
      begin: begin || undefined,
      end: end || undefined,
      limit: pageSize,
      status: status === 'All' ? undefined : status,
      page,
    };

    const res = await finance.getInvoiceList({ params });

    if (res.status === 0) {
      const { INVOICED, REJECT_APPROVE, UN_APPROVE, UN_INVOICE, UN_PAY } = res.result;
      setDataList(res.result);
      setTotal({
        price: res.result.totalPrice,
        invoicePrice: res.result.totalInvoicePrice,
        weight: res.result.totalWeight,
        difference: res.result.totalDifference,
      });
      setTabCount({
        INVOICED,
        REJECT_APPROVE,
        UN_APPROVE,
        UN_INVOICE,
        UN_PAY,
        ALL: INVOICED * 1 + REJECT_APPROVE * 1 + UN_APPROVE * 1 + UN_INVOICE * 1 + UN_PAY * 1,
      });
    } else {
      message.error(`${res.detail || res.description}`);
    }
    setLoading(false);
  };

  const handleToBilling = () => {
    if (hasInvoice) {
      router.push('/finance/main/billing?mode=edit');
    } else {
      message.error('请先维护发票信息');
    }
  };

  const handleEditInvoice = () => {
    if (hasInvoice) {
      router.push('/personal/invoice/edit');
    } else {
      router.push('/personal/invoice/edit?status=new');
    }
  };

  return (
    <Layout {...routeView}>
      {/* 头部信息 */}
      <div className={styles.header}>
        <div className={styles.left}>
          <div className={styles.item}>
            <div className={styles.title}>
              <span className={styles.txt}>待申请开票金额</span>
            </div>
            <div className={styles.price}>￥{Format.price(totalData.waitApproveInvoicePrice)}</div>
            <Button type="primary" onClick={handleToBilling}>
              查看明细并索取发票
            </Button>
          </div>
          <div className={styles.item}>
            <div className={styles.title}>
              <span className={styles.txt}>待支付税费</span>
            </div>
            <div className={styles.price}>￥{Format.price(totalData.waitPayInvoicePrice)}</div>
            <Button onClick={() => handleChangeTabs('UN_PAY')}>查看明细</Button>
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.title}>
            <span className={styles.txt}>发票信息</span>
            <Button type="link" size="small" style={{ marginLeft: 12 }} onClick={handleEditInvoice}>
              编辑
            </Button>
          </div>
          <div className={styles.row}>
            <div>企业名称：{invoiceInfo.companyName}</div>
            <div>企业地址：{invoiceInfo.companyAddress}</div>
          </div>
          <div className={styles.row}>
            <div>纳税人识别号：{invoiceInfo.taxpayerNumber}</div>
            <div>企业电话：{invoiceInfo.invoicePhone}</div>
          </div>
          <div className={styles.row}>
            <div>账号：{invoiceInfo.cardNumber}</div>
            <div>开户行：{invoiceInfo.bankName}</div>
          </div>
        </div>
      </div>

      <Content style={{ marginTop: 16 }}>
        <section>
          <Search onSearch={handleSearch} onReset={handleReset} simple>
            <Search.Item label="提交时间" br>
              <DatePicker.RangePicker
                value={query.begin && query.end ? [moment(query.begin), moment(query.end)] : null}
                allowClear
                style={{ width: '100%' }}
                showTime={{
                  defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                }}
                format="YYYY-MM-DD HH:mm:ss"
                onChange={handleChangeDate}
              />
            </Search.Item>
            <Search.Item label="批次号">
              <Input value={query.batchId} allowClear onChange={handleChangeBatchId} placeholder="请输入批次号" />
            </Search.Item>
          </Search>

          <Tabs onChange={handleChangeTabs} type="card" activeKey={query.status} style={{ marginTop: 16 }}>
            <TabPane tab={`全部(${tabCount.ALL || 0})`} key="All"></TabPane>
            <TabPane tab={`待审核(${tabCount.UN_APPROVE})`} key="UN_APPROVE"></TabPane>
            <TabPane tab={`待支付(${tabCount.UN_PAY})`} key="UN_PAY"></TabPane>
            <TabPane tab={`待开票(${tabCount.UN_INVOICE})`} key="UN_INVOICE"></TabPane>
            <TabPane tab={`已完成(${tabCount.INVOICED})`} key="INVOICED"></TabPane>
            <TabPane tab={`被驳回(${tabCount.REJECT_APPROVE})`} key="REJECT_APPROVE"></TabPane>
          </Tabs>

          <Msg>
            合计：
            <span style={{ marginLeft: 8 }}>总净重</span>
            <span className={'total-num'}>{Format.weight(total.weight)}</span>吨
            <span style={{ marginLeft: 32 }}>运费总额</span>
            <span className={'total-num'}>{Format.price(total.price)}</span>元
            <span style={{ marginLeft: 32 }}>含税总额</span>
            <span className={'total-num'}>{Format.price(total.invoicePrice)}</span>元
            <span style={{ marginLeft: 32 }}>税费总额</span>
            <span className={'total-num'}>{Format.price(total.difference)}</span>元
          </Msg>
          <Table
            columns={columns}
            loading={loading}
            dataSource={dataList.data}
            rowKey="batchId"
            scroll={{ x: 'auto' }}
            pagination={{
              onChange: onChangePage,
              pageSize: query.pageSize,
              current: query.page,
              total: dataList.count,
            }}
          />
        </section>
      </Content>
      <Modal
        width={400}
        destroyOnClose
        maskClosable={false}
        visible={payInfo.showPass}
        footer={null}
        onCancel={() => setPayInfo({ ...payInfo, showPass: false })}
        title="请输入支付密码">
        <div className={styles['password-block']}>
          <div className={styles['confirm-msg']}>
            <InfoCircleFilled style={{ fontSize: 18, verticalAlign: 'sub', marginRight: 6, color: '#faad14' }} />
            您的支付总额为<span className={styles.number}>{(payInfo.payMoney / 100).toFixed(2)}</span>元
          </div>
          <div
            className={styles['pass-ipt']}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{}}>支付密码:</span>
            <PayPasswordInput onChange={value => setPayInfo({ ...payInfo, password: value })} />
            <Tooltip
              placement="topRight"
              title={
                '进入方向物流app -> 登录账号 -> 点击”我的”-> 点击”设置” -> 点击”密码管理” ->点击”修改支付密码” -> 设置密码'
              }>
              <span style={{ color: '#477AEF' }}>忘记密码？</span>
            </Tooltip>
          </div>
          <div className={styles['error-msg']}>{payInfo.payError}</div>
          <div className={styles.btn}>
            <Button type="primary" onClick={pay} loading={payInfo.payLoading}>
              完成
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default InvoiceList;
