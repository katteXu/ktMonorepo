import { PureComponent } from 'react';
import { Row, Col, Button, Table, message, Tooltip, Skeleton } from 'antd';
import router from 'next/router';
import { Layout, Content, Msg } from '@components';
import { finance } from '@api';
import styles from '../styles.less';
import { keepState, getState, clearState } from '@utils/common';

const formatWeight = value => {
  return ((value || 0) / 1000).toFixed(2);
};

const formatPrice = value => {
  return ((value || 0) / 100).toFixed(2);
};

class ApplyInvoice extends PureComponent {
  static async getInitialProps(props) {
    const { isServer } = props;
    return { isServer };
  }
  constructor(props) {
    super(props);
    this.state = {
      routeView: {
        title: '申请开票',
        pageKey: 'applyInvoice',
        longKey: 'finance.applyInvoice',
        breadNav: ['财务中心', '申请开票'],
        pageTitle: '申请开票',
      },
      columns: [
        {
          title: '序号',
          dataIndex: 'index',
          key: 'index',
          width: 60,
          render: (value, record, index) => {
            return (this.state.page - 1) * this.state.pageSize + index + 1;
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
          title: '结算净重(吨)',
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
          // width: 120,
          render: formatPrice,
        },
        {
          title: '操作',
          dataIndex: 'view',
          fixed: 'right',
          key: 'view',
          width: 80,
          render: (value, record) => {
            return (
              <Button
                type="link"
                size="small"
                onClick={() =>
                  router.push(`/finance/applyInvoice/detail?ids=${record.ids}`, '/finance/applyInvoice/detail')
                }>
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
      invoiceCount: 0,
      taxPrice: 0,
    };
  }

  componentDidMount() {
    const { isServer } = this.props;
    if (isServer) {
      // 如果是点击浏览器刷新 即为服务端渲染 则清空保存的状态
      clearState();
    }
    const { query } = getState();
    this.setState(query, this.setDataList);
  }

  setDataList = async () => {
    const { page, pageSize } = this.state;
    this.setState({
      loading: true,
    });
    const params = {
      page,
      limit: pageSize,
    };
    const res = await finance.getWaitaAskInvoiceList({ params });
    if (res.status === 0) {
      const { invoiceGoodsWeightSum, priceSum, invoicePriceSum, invoiceCount, taxPrice } = res.result;

      this.setState(
        {
          dataList: res.result,
          invoiceInfo: res.result.companyData,
          invoiceGoodsWeightSum,
          priceSum,
          invoicePriceSum,
          invoiceCount,
          taxPrice,
        },
        () => {
          // 持久化状态
          keepState({
            query: {
              page: this.state.page,
              pageSize: this.state.pageSize,
            },
          });
        }
      );
    } else {
      message.error(`${res.detail || res.description}`);
    }

    this.setState({
      loading: false,
    });
  };

  // 翻页
  onPageChange = page => {
    this.setState(
      {
        page,
      },
      this.setDataList
    );
  };

  // 切换页码
  onChangePageSize = (current, pageSize) => {
    this.setState(
      {
        page: 1,
        pageSize,
      },
      this.setDataList
    );
  };

  // 生成对账单 && 跳转对账单页
  buildRecord = async () => {
    const { dataList } = this.state;
    if (dataList.data.length === 0) {
      message.error('当前没有申请开票数据');
      return;
    }

    this.setState({
      btnLoading: true,
    });

    try {
      const res = await finance.generateRecord();
      if (res.status === 0) {
        router.push('/finance/applyInvoice/record?mode=edit');
      } else {
        message.error(`${res.description} ${res.detail || ''}`);
      }
    } catch {
      router.push('/finance/applyInvoice/record?mode=edit');
    }

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
      priceSum,
      invoicePriceSum,
      invoiceInfo,
      btnLoading,
      invoiceCount,
      taxPrice,
    } = this.state;

    return (
      <Layout {...routeView}>
        <Content>
          <header>
            开票信息
            <Button style={{ float: 'right' }} onClick={() => router.push('/personal/invoice/edit')}>
              编辑
            </Button>
          </header>
          <section>
            <Skeleton loading={!invoiceInfo} active title={{ width: '90%' }} paragraph={{ rows: 1, width: '90%' }}>
              {invoiceInfo && (
                <>
                  <Row>
                    <Col span={8} style={{ color: '#6A6A6A' }}>
                      <span style={{ color: '#4A4A5A' }}>企业名称：</span>
                      {invoiceInfo.companyName || '-'}
                    </Col>
                    <Col span={8} style={{ color: '#6A6A6A' }}>
                      <span style={{ color: '#4A4A5A' }}>企业地址：</span>
                      {invoiceInfo.companyAddress || '-'}
                    </Col>
                    <Col span={8} style={{ color: '#6A6A6A' }}>
                      <span style={{ color: '#4A4A5A' }}>企业电话：</span>
                      {invoiceInfo.invoicePhone || '-'}
                    </Col>
                  </Row>
                  <Row style={{ marginTop: 16 }}>
                    <Col span={8} style={{ color: '#6A6A6A' }}>
                      <span style={{ color: '#4A4A5A' }}>纳税人识别号：</span>
                      {invoiceInfo.taxpayerNumber || '-'}
                    </Col>
                    <Col span={8} style={{ color: '#6A6A6A' }}>
                      <span style={{ color: '#4A4A5A' }}>账号：</span>
                      {invoiceInfo.cardNumber || '-'}
                    </Col>
                    <Col span={8} style={{ color: '#6A6A6A' }}>
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
              <Button type="primary" loading={btnLoading} onClick={() => this.buildRecord()}>
                生成对账单
              </Button>
              <Button
                type="primary"
                ghost
                style={{ marginLeft: 8 }}
                onClick={() => router.push('/finance/applyInvoice/byOrder')}>
                按运单添加
              </Button>
              <Button
                type="primary"
                ghost
                style={{ marginLeft: 8 }}
                onClick={() => router.push('/finance/applyInvoice/byRoute')}>
                按专线添加
              </Button>
            </div>
          </header>
          <section>
            <Msg>
              合计：
              <span style={{ marginLeft: 8 }}>运单数</span>
              <span className="total-num">{invoiceCount}</span>单<span style={{ marginLeft: 32 }}>总净重</span>
              <span className="total-num">{(invoiceGoodsWeightSum / 1000).toFixed(2)}</span>吨
              <span style={{ marginLeft: 32 }}>运费总额</span>
              <span className="total-num">{(priceSum / 100).toFixed(2)}</span>元
              <span style={{ marginLeft: 32 }}>含税总额</span>
              <span className="total-num">{(invoicePriceSum / 100).toFixed(2)}</span>元
              <span style={{ marginLeft: 32 }}>税费总额</span>
              <span className="total-num">{(taxPrice / 100).toFixed(2)}</span>元
            </Msg>
            <Table
              rowKey="ids"
              columns={columns}
              rowClassName={(record, index) => {
                if (record.errorCount > 0) {
                  return styles.red;
                }
                return '';
              }}
              dataSource={dataList.data}
              loading={loading}
              pagination={{
                total: dataList.count,
                pageSize,
                current: page,
                onChange: this.onPageChange,
                onShowSizeChange: this.onChangePageSize,
              }}
              scroll={{ x: 'auto' }}
            />
          </section>
        </Content>
      </Layout>
    );
  }
}

export default ApplyInvoice;
