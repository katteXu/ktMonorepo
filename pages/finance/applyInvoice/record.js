/** @format */

import React, { PureComponent } from 'react';
import { Button, Skeleton, Row, Col, message, Affix } from 'antd';
import { MehOutlined } from '@ant-design/icons';
import Layout from '@components/Layout';
import Link from 'next/link';
import Content from '@components/Content';
import styles from '../styles.less';
import Record from '@components/Finance/Record';
import InvoiceType from '@components/Finance/InvoiceType';
import router from 'next/router';
import { finance, downLoadFile } from '@api';
import personalApi from '@api/personalCenter';
import { Format, getQuery } from '@utils/common';
import { LoadingBtn } from '@components';
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
          <Link href="/finance/main">
            <a>开票信息</a>
          </Link>,
          '查看对账单',
        ],
        pageTitle: '查看对账单',
        useBack: true,
      },
      btnLoading: false,
      mode: 'view',
      invoiceTypeShow: false,
      invoiceTotal: {
        priceSum: 0,
        taxPriceSum: 0,
        weightSum: 0,
      },
    };
  }

  componentDidMount() {
    const { mode } = getQuery();
    this.setState({ mode });
    this.getInvoiceInfo();
    this.validateInvoice();
    this.initPayType();
    window.addEventListener('beforeunload', this.saveRemark);
  }

  // 页面卸载
  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.saveRemark);
    this.saveRemark();
  }

  downLoad = async () => {
    this.setState({
      btnLoading: true,
    });
    const params = {
      dump: 1,
    };
    const res = await finance.buildRecord({ params });
    if (res.status === 0) {
      await downLoadFile(res.result, '对账单');
    } else {
      message.error(`${res.detail}`);
    }
    this.setState({
      btnLoading: false,
    });
  };

  // 备注信息变化
  onChange = formData => {
    this.setState({
      formData,
    });
  };

  // 提交数据
  submit = async () => {
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
        this.setState({
          btnLoading: false,
        });
        return;
      }
    }

    this.setState({ formData: {} });

    // 提交申请列表
    const res = await finance.saveWaitAskInvoice({ params: { payType } });
    if (res.status === 0) {
      message.success('开票申请提交成功');
      router.push('/finance/main?tab=UN_APPROVE');
    } else {
      message.error(`开票申请提交失败，原因：${res.detail || res.description}`);
    }
    this.setState({
      btnLoading: false,
    });
  };

  // 保存备注
  saveRemark = () => {
    // 保存备注信息
    const { formData } = this.state;
    if (Object.keys(formData).length !== 0) {
      const params = {
        data: formData,
      };
      finance.saveRemark({ params }).then(() => console.log('保存备注'));
    }
  };

  // 获取开票信息
  getInvoiceInfo = async () => {
    const res = await finance.getWaitaAskInvoiceList();
    if (res.status === 0) {
      const { companyData } = res.result;

      this.setState({
        invoiceInfo: companyData,
        showInvoice: true,
      });
    } else {
      this.setState({
        showInvoice: true,
      });
      message.error(`${res.detail || res.description}`);
    }
  };

  // 获取开票信息
  validateInvoice = async () => {
    const res = await personalApi.getInvoiceInfo();
    if (res.status === 0) {
      this.setState({
        invoiceId: res.result.id,
      });
    } else if (res.status === 8) {
      this.setState({
        invoiceId: false,
      });
    }
  };

  // 开票金额改变
  changePayType = payType => {
    sessionStorage.setItem('finance_pay_type', payType);
    this.setState({ payType });
  };

  initPayType = () => {
    const { finance_pay_type = 'PRICE' } = typeof window === 'undefined' ? {} : sessionStorage;
    this.changePayType(finance_pay_type);
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
      mode,
      invoiceInfo,
      payType,
      showInvoice,
      invoiceTypeShow,
      invoiceTotal,
    } = this.state;
    return (
      <Layout {...routeView}>
        <Content>
          <header>
            开票信息
            {invoiceInfo ? (
              <Button style={{ float: 'right' }} onClick={() => router.push('/personal/invoice/edit')}>
                编辑
              </Button>
            ) : (
              <Button style={{ float: 'right' }} onClick={() => router.push('/personal/invoice/edit?status=new')}>
                新建
              </Button>
            )}
          </header>
          <section>
            <Skeleton loading={!showInvoice} active title={{ width: '90%' }} paragraph={{ rows: 1, width: '90%' }}>
              {showInvoice &&
                (invoiceInfo ? (
                  <>
                    <Row>
                      <Col span={8} style={{ color: '#4A4A5A' }}>
                        <span style={{ color: '#6A6A6A' }}>企业名称：</span>
                        {invoiceInfo.companyName || '-'}
                      </Col>
                      <Col span={8} style={{ color: '#4A4A5A' }}>
                        <span style={{ color: '#6A6A6A' }}>企业地址：</span>
                        {invoiceInfo.companyAddress || '-'}
                      </Col>
                      <Col span={8} style={{ color: '#4A4A5A' }}>
                        <span style={{ color: '#6A6A6A' }}>企业电话：</span>
                        {invoiceInfo.invoicePhone || '-'}
                      </Col>
                    </Row>
                    <Row style={{ marginTop: 16 }}>
                      <Col span={8} style={{ color: '#4A4A5A' }}>
                        <span style={{ color: '#6A6A6A' }}>纳税人识别号：</span>
                        {invoiceInfo.taxpayerNumber || '-'}
                      </Col>
                      <Col span={8} style={{ color: '#4A4A5A' }}>
                        <span style={{ color: '#6A6A6A' }}>账号：</span>
                        {invoiceInfo.cardNumber || '-'}
                      </Col>
                      <Col span={8} style={{ color: '#4A4A5A' }}>
                        <span style={{ color: '#6A6A6A' }}>开户行：</span>
                        {invoiceInfo.bankName || '-'}
                      </Col>
                    </Row>
                  </>
                ) : (
                  <div className={styles['empty-invoice']}>
                    <MehOutlined
                      style={{
                        fontSize: 24,
                        verticalAlign: 'middle',
                        marginRight: 8,
                      }}
                    />
                    暂无开票信息～
                  </div>
                ))}
            </Skeleton>
          </section>
        </Content>
        <Content style={{ marginTop: 24 }}>
          <header>
            对账单明细
            <div style={{ float: 'right' }}>
              {mode === 'edit' && (
                <>
                  {/* <Button type="primary" onClick={this.submit} loading={this.state.btnLoading}>
                    提交审核
                  </Button> */}
                  {/* <Button style={{ marginLeft: 12 }} onClick={() => router.push('/finance/applyInvoice')}>
                    添加
                  </Button> */}
                </>
              )}
              <LoadingBtn
                style={{
                  marginLeft: 12,
                  fontSize: 14,
                  width: '64px',
                  padding: '4px 15px',
                  height: '32px',
                  lineHeight: '22px',
                }}
                loading={btnLoading}
                onClick={() => this.downLoad()}>
                <span>导 出</span>
              </LoadingBtn>
            </div>
          </header>
          <section className={styles.record}>
            {invoiceTypeShow && <InvoiceType onChange={this.changePayType} payType={payType} />}
            <Record
              mode={mode}
              onChange={this.onChange}
              detailUrl="/finance/applyInvoice/detail"
              payType={payType}
              handleShowPayType={show => {
                this.setState({
                  invoiceTypeShow: show,
                });
              }}
              onLoaded={this.handleLoaded}
            />
          </section>
          <Affix offsetBottom={0}>
            <div className={styles['bottom']} style={{ margin: 0 }}>
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
              {mode === 'edit' && (
                <Button type="primary" onClick={this.submit} loading={this.state.btnLoading}>
                  申请开票
                </Button>
              )}
            </div>
          </Affix>
        </Content>
      </Layout>
    );
  }
}

export default PageDemo;
