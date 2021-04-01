/** @format */

import React, { PureComponent } from 'react';
import { Button, Row, Col, message, Skeleton, Modal, Affix } from 'antd';
import { QuestionCircleFilled } from '@ant-design/icons';
import Layout from '@components/Layout';
import Link from 'next/link';
import Content from '@components/Content';
import styles from '../styles.less';
import Record from '@components/Finance/Record';
import InvoiceType from '@components/Finance/InvoiceType';
import { finance, downLoadFile } from '@api';
import router, { withRouter } from 'next/router';
import { Format, getQuery } from '@utils/common';
class PageDemo extends PureComponent {
  static async getInitialProps(props) {
    const { isServer } = props;
    return {};
  }
  constructor(props) {
    super(props);
    this.state = {
      routeView: {
        title: '查看对账单',
        pageKey: 'main',
        longKey: 'finance.main',
        breadNav: [
          '财务中心',
          <Link href={`/finance/main?tab=${getQuery.status}`}>
            <a>开票信息</a>
          </Link>,
          '查看对账单',
        ],
        pageTitle: '查看对账单',
        useBack: true,
        backUrl: `/finance/main?tab=${getQuery.status}`,
      },
      btnLoading: false,
      loading: true,
      payType: null,
      invoiceTypeShow: false,
      invoiceTotal: {
        priceSum: 0,
        taxPriceSum: 0,
        weightSum: 0,
      },
    };
  }

  // 获取开票信息
  getInvoiceInfo = async () => {
    const { batchId } = getQuery();

    const params = {
      batchId,
    };
    const res = await finance.getWaitaAskInvoiceList({ params });
    if (res.status === 0) {
      const { rejectReason, companyData } = res.result;

      this.setState({
        invoiceInfo: companyData,
        rejectReason,
      });
    } else {
      message.error(`提交失败，原因：${res.detail ? res.detail : res.description}`);
    }

    this.setState({
      loading: false,
    });
  };

  componentDidMount() {
    const { id, mode, payType } = getQuery();

    this.setState({
      id,
      mode,
      payType,
    });

    this.getInvoiceInfo();
  }

  downLoad = async () => {
    const { id } = this.state;
    this.setState({
      btnLoading: true,
    });

    const res = await this.buildRecord(id);
    if (res.status === 0) {
      await downLoadFile(res.result, '对账单');
    } else {
      message.error(`${res.detail}`);
    }
    this.setState({
      btnLoading: false,
    });
  };

  // 下载对账单
  buildRecord = async id => {
    const params = {
      dump: 1,
      id,
    };
    return finance.buildRecord({ params });
  };

  // 备注信息变化
  onChange = formData => {
    this.setState({
      formData,
    });
  };

  // 提交数据
  submit = async () => {
    const recordData = this.refs['recordRef'].getData();
    const detailNum = recordData.data.length;
    if (detailNum === 0) {
      message.error('没有可对账单明细，请添加');
      return;
    }
    this.setState({
      btnLoading: true,
    });
    // 保存备注信息
    const { formData, payType } = this.state;
    if (Object.keys(formData).length !== 0) {
      // message.warn('检测到对账单备注信息有所更新，系统会自动保存');
      const params = {
        data: formData,
      };
      const res = await finance.saveRemark({ params });
      if (res.status === 0) {
      } else {
        message.error(`${res.detail || res.description}`);
      }
    }

    const { batchId } = getQuery();
    const { userId } = localStorage;
    const params = {
      batchId,
      ownerId: userId,
      payType,
    };

    const res = await finance.applyRejectInvoice({ params });
    if (res.status === 0) {
      message.success('开票申请提交开票成功');
      router.push('/finance/main?tab=UN_APPROVE');
    } else {
      message.error(`开票申请提交失败，原因：${res.detail || res.description}`);
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
      router.push('/finance/main');
    } else {
      message.error(`${res.detail ? res.detail : res.description}`);
    }
  };

  handleChangeType = payType => {
    this.setState({
      payType,
    });
  };

  onDelete = list => {
    this.setState({
      detailNum: list.length,
    });
  };

  // 数据加载完成
  handleLoaded = invoiceTotal => {
    this.setState({
      invoiceTotal,
    });
  };

  render() {
    const {
      routeView,
      btnLoading,
      id,
      loading,
      mode,
      invoiceInfo,
      rejectReason,
      payType,
      invoiceTypeShow,
      invoiceTotal,
    } = this.state;
    return (
      <Layout {...routeView}>
        {rejectReason && (
          <Content style={{ marginBottom: 24 }}>
            <header>驳回原因</header>
            <section>{rejectReason}</section>
          </Content>
        )}
        <Content>
          <header>
            开票信息
            {mode === 'edit' && (
              <Button style={{ float: 'right' }} onClick={() => router.push('/personal/invoice/edit')}>
                编辑
              </Button>
            )}
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
            对账单明细
            <Button style={{ marginLeft: 12, float: 'right' }} loading={btnLoading} onClick={() => this.downLoad()}>
              导出
            </Button>
          </header>
          <section className={styles.record}>
            {invoiceTypeShow && (
              <InvoiceType editEnable={mode === 'edit'} onChange={this.handleChangeType} payType={payType} />
            )}
            {!loading && (
              <Record
                ref="recordRef"
                id={id}
                mode={mode}
                batchId={getQuery().batchId}
                onChange={this.onChange}
                detailUrl="/finance/invoiceList/viewDetail"
                payType={payType}
                handleShowPayType={show => {
                  this.setState({
                    invoiceTypeShow: show,
                  });
                }}
                onLoaded={this.handleLoaded}
              />
            )}
          </section>
          <Affix offsetBottom={0}>
            <div className={styles['bottom']} style={{ margin: 0 }}>
              <div className={styles.item}>
                当前批次号：
                <div className={styles['price-block']}>{typeof window !== 'undefined' ? getQuery().batchId : '-'}</div>
              </div>
              <div className={styles.item}>
                含税总金额：
                <div className={styles['price-block']}>
                  <span className={styles['total-num']}>{Format.price(invoiceTotal.taxPriceSum)}</span> 元
                </div>
              </div>
              <div className={styles.item}>
                不含税总金额：
                <div className={styles['price-block']}>
                  <span className={styles['total-num']}>{Format.price(invoiceTotal.priceSum)}</span> 元
                </div>
              </div>
              <div className={styles.item}>
                总净重：
                <div className={styles['price-block']}>
                  <span className={styles['total-num']}>{Format.weight(invoiceTotal.weightSum)}</span> 吨
                </div>
              </div>
              {mode === 'edit' && (
                <>
                  <Button
                    danger
                    type="ghost"
                    style={{ marginLeft: 12 }}
                    onClick={() =>
                      Modal.confirm({
                        icon: <QuestionCircleFilled style={{ color: '#FFB741' }} />,
                        title: '确认要取消本次开票操作吗？',
                        content: (
                          <span style={{ color: '#666' }}>
                            <span style={{ color: '#E44040' }}>注：</span>
                            取消后，您可以在申请开票页面重新选择数据进行开票
                          </span>
                        ),
                        onOk: this.cancelInvoice,
                      })
                    }>
                    取消开票
                  </Button>
                  <Button
                    style={{ marginLeft: 12 }}
                    onClick={() =>
                      router.push(`/finance/main/rejected?batchId=${getQuery().batchId}&invoiceId=${getQuery().id}`)
                    }>
                    去补充
                  </Button>
                  <Button
                    style={{ marginLeft: 12 }}
                    type="primary"
                    onClick={this.submit}
                    loading={this.state.btnLoading}>
                    申请开票
                  </Button>
                </>
              )}
            </div>
          </Affix>
        </Content>
      </Layout>
    );
  }
}

export default withRouter(PageDemo);
