/** @format */

import React, { PureComponent } from 'react';
import { Row, Col, Button, Table, message, Modal, Tooltip } from 'antd';
import router from 'next/router';
import Link from 'next/link';
import Layout from '@components/Layout';
import Content from '@components/Content';
import { finance } from '@api';
import styles from '../styles.less';
import Record from '@components/Finance/Record';
const formatWeight = value => {
  return ((value || 0) / 1000).toFixed(2);
};

const formatPrice = value => {
  return ((value || 0) / 100).toFixed(2);
};

const totalNumberStyle = {
  display: 'inline-block',
  minWidth: 85,
};

class ApplyForm extends PureComponent {
  static async getInitialProps(props) {
    const { isServer } = props;
    return {};
  }
  constructor(props) {
    super(props);
    this.state = {
      routeView: {
        title: '汇总上报',
        pageKey: 'applyInvoice',
        longKey: 'finance.applyInvoice',
        breadNav: [
          '财务中心',
          <Link href="/finance/applyInvoice">
            <a>申请开票</a>
          </Link>,
          '汇总上报',
        ],
        useBack: true,
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
          title: '发货地址',
          dataIndex: 'fromAddress',
          key: 'fromAddress',
          width: 200,
        },
        {
          title: '收货地址',
          dataIndex: 'toAddress',
          key: 'toAddress',
          width: 200,
        },
        {
          title: '结算数量(吨)',
          dataIndex: 'invoiceGoodsWeightSum',
          key: 'invoiceGoodsWeightSum',
          width: 120,
          render: formatWeight,
        },
        // {
        //   title: '运费单价(元/吨)',
        //   dataIndex: 'unitPrice',
        //   key: 'unitPrice',
        //   width: 120,
        //   render: formatPrice,
        // },
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
          width: 80,
          render: (value, record) => {
            return (
              <a
                onClick={() =>
                  router.push(`/finance/applyInvoice/detail?ids=${record.ids}`, '/finance/applyInvoice/detail')
                }>
                运单明细
              </a>
            );
            // return (
            //   <a
            //     onClick={() =>
            //       router.push({
            //         pathname: `/finance/applyInvoice/detail`,
            //         query: {
            //           ids: record.ids,
            //         },
            //         as: '/finance/applyInvoice/detail',
            //       })
            //     }>
            //     运单明细
            //   </a>
            // );
            // return (
            //   <Link href="/finance/applyInvoice/detail" query={{ ids: record.ids }}>
            //     <a>运单明细</a>
            //   </Link>
            // );
          },
        },
      ],
      loading: true,
      page: 1,
      dataList: {},
      invoiceGoodsWeightSum: 0,
      priceSum: 0,
      invoicePriceSum: 0,
      invoiceCount: 0,
      goodsNameList: [],
      railWayList: [],
      personList: [],
    };
  }

  componentDidMount() {
    this.setDataList();
  }

  setDataList = async () => {
    const { page } = this.state;
    this.setState({
      loading: true,
      goodsNameList: [],
      railWayList: [],
      personList: [],
    });
    const params = {
      page,
      limit: 1000,
    };
    const res = await finance.getWaitaAskInvoiceList({ params });
    if (res.status === 0) {
      const { invoiceGoodsWeightSum, priceSum, invoicePriceSum, remark, rejectReason, invoiceCount } = res.result;
      const { goodsNameList, railWayList, personList } = this.state;

      if (res.result.data) {
        // 循环添加下拉信息
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
        remark,
        rejectReason,
        goodsNameList,
        railWayList,
        tmp_trailerPlateNumber: res.result.tmp_trailerPlateNumber,
        tmp_truck_type: res.result.tmp_truck_type,
        invoiceCount,
      });
    } else {
      message.error(`${res.detail || res.description}`);
    }

    this.setState({
      loading: false,
    });
  };
  onPageChange = page => {
    this.setState(
      {
        page,
      }
      // this.setDataList
    );
  };

  submit = async () => {
    const { remark, dataList, invoiceGoodsWeightSum, priceSum, invoicePriceSum, info } = this.state;
    // 列表数据不存在
    if (!dataList.data || dataList.data.length === 0) {
      message.error('当前没有申请开票数据');
      return;
    }
    let transportIds = dataList.data.map(item => item.ids).join();

    //匹配汉字
    const charMatch = remark.match(/[\u4e00-\u9fa5]/g);
    //汉字个数
    const charNum = charMatch ? charMatch.length : 0;
    if (charNum > 115) {
      message.error('票面备注信息不得超过115个汉字');
      return;
    }

    this.setState({
      btnLoading: true,
    });

    const params = {
      remark: `${info || ''}${remark}`,
      transportIds,
      arrivalGoodsWeightSum: invoiceGoodsWeightSum,
      priceSum,
      invoicePriceSum,
    };

    const res = await finance.saveWaitAskInvoice({ params });
    if (res.status === 0) {
      message.success('提交成功');
      router.push('/finance/invoiceList');
    } else {
      message.error(`提交失败，原因：${res.detail ? res.detail : res.description}`);
    }
    this.setState({
      btnLoading: false,
    });
  };

  //  获取异常数据
  // getUnusualData = async ids => {
  //   const params = {
  //     ids,
  //   };
  //   const res = await finance.invoiceTransportList({ params });
  //   if (res.status === 0) {
  //     // 收货净重(arrivalGoodsWeight) 大于 40 或 小于 10 或 运费(realTotalPrice) 小于 50
  //     return (
  //       res.result.data.filter(({ arrivalGoodsWeight, realTotalPrice }) => {
  //         return arrivalGoodsWeight / 1000 > 40 || arrivalGoodsWeight / 1000 < 10 || realTotalPrice / 100 < 50;
  //       }).length > 0
  //     );
  //   } else {
  //     return false;
  //   }
  // };

  showRecord = async () => {
    const { dataList } = this.state;
    if (dataList.data.length === 0) {
      message.error('当前没有申请开票数据');
      return;
    }

    this.setState({ showConfirm: true });
  };

  // 生成对账单
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
      invoiceGoodsWeightSum,
      priceSum,
      invoicePriceSum,
      invoiceInfo,
      btnLoading,
      goodsNameList,
      railWayList,
      personList,
      tmp_trailerPlateNumber,
      tmp_truck_type,
      invoiceCount,
    } = this.state;

    return (
      <Layout {...routeView}>
        <Row style={{ marginTop: 12 }}>
          <Col>
            <Content>
              <header style={{ textAlign: 'right' }}>
                <Button onClick={() => router.push('/finance/applyInvoice')}>继续添加</Button>
                {/* <Button
                  type="primary"
                  loading={btnLoading}
                  onClick={() => this.buildRecord()}
                  style={{ marginLeft: 10 }}>
                  生成对账单
                </Button> */}
              </header>
              <section>
                <Table
                  rowKey="ids"
                  bordered
                  size="middle"
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
                    current: page,
                    onChange: this.onPageChange,
                  }}
                />
                <Row>
                  <Col>
                    <Row>
                      <Col>
                        <div style={{ textAlign: 'right' }}>
                          <span>合计收货净重：</span>
                          <span className={'total-number'} style={totalNumberStyle}>
                            {(invoiceGoodsWeightSum / 1000).toFixed(2)}
                          </span>
                          吨<span style={{ marginLeft: 30 }}>合计运费总额：</span>
                          <span className={'total-number'} style={totalNumberStyle}>
                            {(priceSum / 100).toFixed(2)}
                          </span>
                          元
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <div style={{ textAlign: 'right' }}>
                          <span>合计运输车次：</span>
                          <span className={'total-number'} style={totalNumberStyle}>
                            {invoiceCount}
                          </span>
                          辆<span style={{ marginLeft: 30 }}>合计含税总额：</span>
                          <span className={'total-number'} style={totalNumberStyle}>
                            {(invoicePriceSum / 100).toFixed(2)}
                          </span>
                          元
                        </div>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </section>
            </Content>
          </Col>
        </Row>
        {/* <Row style={{ marginTop: 7 }}>
          <Col>
            <Content>
              <header>票面备注信息</header>
              <section>
                <Remark
                  invoiceGoodsWeightSum={invoiceGoodsWeightSum}
                  tmp_trailerPlateNumber={tmp_trailerPlateNumber}
                  goodsNameList={goodsNameList}
                  railWayList={railWayList}
                  personList={personList}
                  tmp_truck_type={tmp_truck_type}
                  onChange={value => this.setState({ info: value })}
                />
                <Input.TextArea
                  style={{ marginTop: 10 }}
                  value={this.state.remark}
                  rows={3}
                  autosize={{ minRows: 3 }}
                  placeholder="其他备注信息"
                  onChange={e => this.setState({ remark: e.target.value })}
                />
              </section>
            </Content>
          </Col>
        </Row> */}
        <Row style={{ marginTop: 7 }}>
          <Col>
            <Content>
              <header>
                开票信息
                {/* <Button size="middle" onClick={() => router.push('/personal/invoice/edit')} style={{ float: 'right' }}>
                  编辑
                </Button> */}
                <a style={{ fontWeight: 400, float: 'right' }} onClick={() => router.push('/personal/invoice/edit')}>
                  编辑
                </a>
              </header>
              <section>
                {invoiceInfo ? (
                  <>
                    <Row>
                      <Col span={3}>企业名称：</Col>
                      <Col>{invoiceInfo.companyName || '-'}</Col>
                    </Row>
                    <Row style={{ marginTop: 10 }}>
                      <Col span={3}>纳税人识别号：</Col>
                      <Col>{invoiceInfo.taxpayerNumber || '-'}</Col>
                    </Row>
                    <Row style={{ marginTop: 10 }}>
                      <Col span={3}>账号：</Col>
                      <Col>{invoiceInfo.cardNumber || '-'}</Col>
                    </Row>
                    <Row style={{ marginTop: 10 }}>
                      <Col span={3}>开户行：</Col>
                      <Col>{invoiceInfo.bankName || '-'}</Col>
                    </Row>
                    <Row style={{ marginTop: 10 }}>
                      <Col span={3}>电话：</Col>
                      <Col>{invoiceInfo.invoicePhone || '-'}</Col>
                    </Row>
                    <Row style={{ marginTop: 10 }}>
                      <Col span={3}>地址：</Col>
                      <Col>{invoiceInfo.companyAddress || '-'}</Col>
                    </Row>
                  </>
                ) : (
                  <div>暂无开票信息</div>
                )}
              </section>
            </Content>
          </Col>
        </Row>
        <Row style={{ marginTop: 7 }}>
          <Col>
            <Button
              type="primary"
              // onClick={this.submit}
              loading={btnLoading}
              onClick={() => this.buildRecord()}
              // onClick={() => this.showRecord()}
            >
              提交
            </Button>

            {/* <Button onClick={() => this.showRecord()}>提交(旧)</Button> */}
          </Col>
        </Row>

        {/* 对账单弹窗 */}
        <Modal
          style={{ top: 0 }}
          width={800}
          height={500}
          title="对账单"
          visible={this.state.showConfirm}
          footer={null}
          onCancel={() => this.setState({ showConfirm: false })}>
          <Record></Record>
          <div style={{ marginTop: 25 }}>
            <Button type="primary" onClick={this.submit} loading={btnLoading}>
              提交
            </Button>
          </div>
        </Modal>
      </Layout>
    );
  }
}

export default ApplyForm;
