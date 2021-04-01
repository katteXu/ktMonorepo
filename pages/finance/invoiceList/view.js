/** @format */

import React, { PureComponent } from 'react';
import { Row, Col, Button, Table, message, Modal, Tooltip, Skeleton } from 'antd';
import router from 'next/router';
import Link from 'next/link';
import { Layout, Content, Msg } from '@components';
import { finance } from '@api';
import styles from '../styles.less';
import { getQuery } from '@utils/common';
const formatWeight = value => {
  return ((value || 0) / 1000).toFixed(2);
};

const formatPrice = value => {
  return ((value || 0) / 100).toFixed(2);
};

class View extends PureComponent {
  static async getInitialProps(props) {
    const { isServer } = props;
    return {};
  }
  constructor(props) {
    super(props);
    this.state = {
      routeView: {
        title: '查看详情',
        pageKey: 'invoiceList',
        longKey: 'finance.invoiceList',
        breadNav: [
          '财务中心',
          <Link href="/finance/invoiceList">
            <a>开票列表</a>
          </Link>,
          '查看详情',
        ],
        useBack: true,
        backUrl: '/finance/invoiceList',
        pageTitle: '查看详情',
      },
      columns: [
        {
          title: '序号',
          dataIndex: 'index',
          key: 'index',
          width: 60,
          render: (value, record, index) => {
            return (this.state.page - 1) * 10 + index + 1;
          },
        },
        {
          title: '发货企业',
          dataIndex: 'fromCompany',
          key: 'fromCompany',
          width: 160,
          render: value => {
            return (
              <Tooltip title={value} overlayStyle={{ maxWidth: 'max-content' }}>
                <div className="max-label" style={{ width: 90 }}>
                  {value || '-'}
                </div>
              </Tooltip>
            );
          },
        },
        {
          title: '发货地址',
          dataIndex: 'fromAddress',
          key: 'fromAddress',
          width: 240,
          render: value => {
            return (
              <Tooltip title={value} overlayStyle={{ maxWidth: 'max-content' }}>
                <div className="max-label" style={{ width: 90 }}>
                  {value || '-'}
                </div>
              </Tooltip>
            );
          },
        },
        {
          title: '收货企业',
          dataIndex: 'toCompany',
          key: 'toCompany',
          width: 160,
          render: value => {
            return (
              <Tooltip title={value} overlayStyle={{ maxWidth: 'max-content' }}>
                <div className="max-label" style={{ width: 90 }}>
                  {value || '-'}
                </div>
              </Tooltip>
            );
          },
        },
        {
          title: '收货地址',
          dataIndex: 'toAddress',
          key: 'toAddress',
          width: 240,
          render: value => {
            return (
              <Tooltip title={value} overlayStyle={{ maxWidth: 'max-content' }}>
                <div className="max-label" style={{ width: 90 }}>
                  {value || '-'}
                </div>
              </Tooltip>
            );
          },
        },
        {
          title: '货品名称',
          dataIndex: 'goodsType',
          key: 'goodsType',
          width: 90,
          render: value => {
            return (
              <Tooltip title={value} overlayStyle={{ maxWidth: 'max-content' }}>
                <div className="max-label" style={{ width: 90 }}>
                  {value || '-'}
                </div>
              </Tooltip>
            );
          },
        },

        {
          title: '结算数量(吨)',
          dataIndex: 'invoiceGoodsWeightSum',
          key: 'invoiceGoodsWeightSum',
          width: 120,
          render: formatWeight,
        },
        {
          title: '运费总额(元)',
          dataIndex: 'realPriceSum',
          key: 'realPriceSum',
          width: 120,
          render: formatPrice,
        },
        {
          title: '含税总额(元)',
          dataIndex: 'realInvoicePriceSum',
          key: 'realInvoicePriceSum',
          width: 120,
          render: formatPrice,
        },
        {
          title: '操作',
          dataIndex: 'view',
          key: 'view',
          fixed: 'right',
          width: 80,
          render: (value, record) => {
            return (
              <Button
                type="link"
                size="small"
                onClick={() => router.push(`/finance/invoiceList/viewDetail?ids=${record.ids}`)}>
                详情
              </Button>
            );
          },
        },
      ],
      loading: true,
      page: 1,
      pageSize: 10,
      dataList: {},
      invoiceGoodsWeightSum: 0,
      priceSum: 0,
      invoicePriceSum: 0,
      goodsNameList: [],
      railWayList: [],
      personList: [],
      invoiceCount: 0,
      newRemark: '',
      info: '',
      taxPrice: 0,
    };
  }

  componentDidMount() {
    const { status } = getQuery();
    this.setState({
      status,
    });
    this.setDataList();
  }

  setDataList = async () => {
    const { page, pageSize } = this.state;
    const { batchId } = getQuery();
    this.setState({
      loading: true,
    });
    const params = {
      page,
      limit: pageSize,
      batchId,
    };
    const res = await finance.getWaitaAskInvoiceList({ params });
    if (res.status === 0) {
      const {
        invoiceGoodsWeightSum,
        priceSum,
        invoicePriceSum,
        remark,
        rejectReason,
        invoiceCount,
        ret_id,
      } = res.result;
      const { goodsNameList, railWayList, personList } = this.state;
      if (res.result.data) {
        for (let i = 0; i < res.result.data.length; i++) {
          const item = res.result.data[i];
          goodsNameList.push(item.goodsType);
          railWayList.push(`${item.fromAddress} -> ${item.toAddress}`);
          personList.push(`${item.fromCompany}`);
        }
      }

      this.setState({
        dataList: res.result,
        invoiceGoodsWeightSum,
        priceSum,
        invoicePriceSum,
        invoiceInfo: res.result.companyData,
        tmp_trailerPlateNumber: res.result.tmp_trailerPlateNumber,
        tmp_truck_type: res.result.tmp_truck_type,
        remark,
        rejectReason,
        goodsNameList,
        rejectReason,
        invoiceCount,
        id: ret_id,
        taxPrice: res.result.taxPrice,
      });
    } else {
      message.error(`提交失败，原因：${res.detail ? res.detail : res.description}`);
    }

    this.setState({
      loading: false,
    });
  };
  onPageChange = page => {
    this.setState(
      {
        page,
      },
      this.setDataList
    );
  };

  onPageSizeChange = (current, pageSize) => {
    this.setState(
      {
        pageSize,
      },
      this.setDataList
    );
  };

  // 提交开票
  applyInvoice = async () => {
    const { userId } = localStorage;
    const { batchId } = getQuery();
    const { newRemark, info, dataList } = this.state;

    if (dataList.data.length === 0) {
      message.error('当前没有申请开票数据');
      return;
    }

    this.setState({
      btnLoading: true,
    });
    const params = {
      ownerId: userId,
      batchId,
      remark: newRemark || info ? info + newRemark : undefined,
    };

    const res = await finance.applyRejectInvoice({ params });
    if (res.status === 0) {
      message.success('提交开票成功');
      router.push('/finance/invoiceList');
    } else {
      message.error(`${res.detail ? res.detail : res.description}`);
    }

    this.setState({
      btnLoading: false,
    });
  };

  // 取消开票
  cancelInvoice = async () => {
    const { userId } = localStorage;
    const { batchId } = getQuery();
    const params = {
      ownerId: userId,
      batchId,
    };

    const res = await finance.cancelRejectInvoice({ params });
    if (res.status === 0) {
      message.success('取消开票成功');
      router.push('/finance/invoiceList');
    } else {
      message.error(`${res.detail ? res.detail : res.description}`);
    }
  };

  // 生成对账单
  buildRecord = async () => {
    // id ：用于对账单查询
    const { dataList, id, status } = this.state;
    const mode = status === 'REJECT_APPROVE' ? 'edit' : 'view';
    if (dataList.data.length === 0) {
      message.error('当前没有申请开票数据');
      return;
    }
    this.setState({
      btnLoading: true,
    });

    const params = {
      id,
    };

    try {
      const res = await finance.generateRecord({ params });
      if (res.status === 0) {
        router.push(`/finance/invoiceList/record?id=${id}&&mode=${mode}&&batchId=${getQuery().batchId}`);
      } else {
        message.error(`${res.description} ${res.detail || ''}`);
      }
    } catch {
      router.push(`/finance/invoiceList/record?id=${id}&&mode=${mode}`);
    }
    // router.push(`/finance/invoiceList/record?id=${id}&&mode=${mode}`);
    this.setState({
      btnLoading: false,
    });
  };

  render() {
    const {
      routeView,
      columns,
      loading,
      dataList,
      page,
      pageSize,
      invoiceGoodsWeightSum,
      tmp_trailerPlateNumber,
      tmp_truck_type,
      goodsNameList,
      personList,
      railWayList,
      priceSum,
      invoicePriceSum,
      invoiceInfo,
      remark,
      rejectReason,
      invoiceCount,
      btnLoading,
      id,
      taxPrice,
    } = this.state;

    return (
      <Layout {...routeView}>
        {rejectReason && (
          <Content style={{ marginBottom: 24 }}>
            <header>驳回原因</header>
            <section>{rejectReason}</section>
          </Content>
        )}
        <Content style={{ marginTop: 0 }}>
          <header>开票信息</header>
          <section>
            <Skeleton loading={!invoiceInfo} active title={{ width: '90%' }} paragraph={{ rows: 1, width: '90%' }}>
              {invoiceInfo && (
                <>
                  <Row style={{ color: '#6A6A6A' }}>
                    <Col span={8}>
                      <span style={{ color: '#4A4A5A' }}>企业名称：</span>
                      {invoiceInfo.companyName || '-'}
                    </Col>
                    <Col span={8}>
                      <span style={{ color: '#4A4A5A' }}>企业地址：</span>
                      {invoiceInfo.companyAddress || '-'}
                    </Col>
                    <Col span={8}>
                      <span style={{ color: '#4A4A5A' }}>企业电话：</span>
                      {invoiceInfo.invoicePhone || '-'}
                    </Col>
                  </Row>
                  <Row style={{ marginTop: 16, color: '#6A6A6A' }}>
                    <Col span={8}>
                      <span style={{ color: '#4A4A5A' }}>纳税人识别号：</span>
                      {invoiceInfo.taxpayerNumber || '-'}
                    </Col>
                    <Col span={8}>
                      <span style={{ color: '#4A4A5A' }}>账号：</span>
                      {invoiceInfo.cardNumber || '-'}
                    </Col>
                    <Col span={8}>
                      <span style={{ color: '#4A4A5A' }}>开户行：</span>
                      {invoiceInfo.bankName || '-'}
                    </Col>
                  </Row>
                </>
              )}
            </Skeleton>
          </section>
        </Content>

        <Content style={{ marginTop: 24 }}>
          <header>
            申请列表
            <div style={{ float: 'right' }}>
              {this.state.status === 'REJECT_APPROVE' ? (
                <>
                  <Button type="primary" ghost onClick={() => this.buildRecord()}>
                    查看对账单
                  </Button>
                  <Button
                    type="danger"
                    ghost
                    style={{ marginLeft: 10 }}
                    onClick={() =>
                      Modal.confirm({
                        title: '确认要取消本次开票操作吗？',
                        content: (
                          <span style={{ color: '#E44040' }}>注：取消后，您可以在申请开票页面重新选择数据进行开票</span>
                        ),
                        onOk: this.cancelInvoice,
                      })
                    }>
                    取消开票
                  </Button>
                  <Button
                    style={{ marginLeft: 10 }}
                    onClick={() => router.push(`/finance/invoiceList/rejectList?batchId=${getQuery().batchId}`)}>
                    修改数据
                  </Button>
                </>
              ) : (
                <Button
                  loading={btnLoading}
                  type="primary"
                  onClick={() => this.buildRecord()}
                  style={{ marginLeft: 10 }}>
                  生成对账单
                </Button>
              )}
            </div>
          </header>
          <section>
            <Msg>
              合计：
              <span style={{ marginLeft: 8 }}>运单数</span>
              <span className={'total-num'}>{invoiceCount}</span>单<span style={{ marginLeft: 32 }}>总净重</span>
              <span className={'total-num'}>{(invoiceGoodsWeightSum / 1000).toFixed(2)}</span>吨
              <span style={{ marginLeft: 32 }}>运费总额</span>
              <span className={'total-num'}>{(priceSum / 100).toFixed(2)}</span>元
              <span style={{ marginLeft: 32 }}>含税总额</span>
              <span className={'total-num'}>{(invoicePriceSum / 100).toFixed(2)}</span>元
              <span style={{ marginLeft: 32 }}>税费总额</span>
              <span className={'total-num'}>{(taxPrice / 100).toFixed(2)}</span>元
            </Msg>
            <Table
              rowKey="ids"
              columns={columns}
              dataSource={dataList.data}
              loading={loading}
              rowClassName={(record, index) => {
                if (record.errorCount > 0) {
                  return styles.red;
                }
                return '';
              }}
              pagination={{
                pageSize,
                total: dataList.count,
                current: page,
                onChange: this.onPageChange,
                onShowSizeChange: this.onPageSizeChange,
              }}
              scroll={{ x: 'auto' }}
            />
          </section>
        </Content>

        {/* {this.state.status === 'REJECT_APPROVE' && (
          <Row style={{ marginTop: 12 }}>
            <Col>
              <Button type="primary" onClick={() => this.buildRecord()}>
                提交
              </Button>
              <Button
                style={{ marginLeft: 10 }}
                onClick={() =>
                  Modal.confirm({
                    title: '确认要取消本次开票操作吗？',
                    content: (
                      <span style={{ color: '#E44040' }}>注：取消后，您可以在申请开票页面重新选择数据进行开票</span>
                    ),
                    onOk: this.cancelInvoice,
                  })
                }>
                取消开票
              </Button>
            </Col>
          </Row>
        )} */}
      </Layout>
    );
  }
}

export default View;
