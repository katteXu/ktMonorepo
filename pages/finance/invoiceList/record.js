/** @format */

import React, { PureComponent } from 'react';
import { Button, message, Modal, Affix } from 'antd';
import { QuestionCircleFilled } from '@ant-design/icons';
import Layout from '@components/Layout';
import Link from 'next/link';
import Content from '@components/Content';
import styles from '../styles.less';
import Record from '@components/Finance/Record';
import InvoiceType from '@components/Finance/InvoiceType';
import { finance, downLoadFile } from '@api';
import router from 'next/router';
import { Format, getQuery } from '@utils/common';
class Index extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      routeView: {
        title: '查看对账单',
        pageKey: 'main',
        longKey: 'finance.main',
        breadNav: [
          '财务中心',
          <Link href={`/finance/main?tab=${getQuery().status}`}>
            <a>开票信息</a>
          </Link>,
          '查看对账单',
        ],
        pageTitle: '查看对账单',
        useBack: true,
        backUrl: `/finance/main?tab=${getQuery().status}`,
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
      rejectReason,
      payType,
      invoiceTypeShow,
      invoiceTotal,
    } = this.state;
    return (
      <Layout {...routeView}>
        <Content>
          {rejectReason && (
            <div className={styles['reject-reason']}>
              <div className={styles.title}>驳回原因：</div>
              <div className={styles.content}>{rejectReason}</div>
            </div>
          )}
          <section className={styles.record} style={{ marginBottom: 60 }}>
            <Button style={{ marginBottom: 16 }} loading={btnLoading} onClick={() => this.downLoad()}>
              导出
            </Button>
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
          <div className={styles['bottom']} style={{ margin: 0 }}>
            {mode === 'edit' && (
              <>
                <Button style={{ marginRight: 8 }} type="primary" onClick={this.submit} loading={this.state.btnLoading}>
                  申请开票
                </Button>
                <Button
                  style={{ marginLeft: 0 }}
                  onClick={() =>
                    router.push(
                      `/finance/main/rejectedBilling?batchId=${getQuery().batchId}&id=${getQuery().id}&payType=${
                        this.state.payType
                      }&mode=edit`
                    )
                  }>
                  去补充
                </Button>
                <Button
                  danger
                  type="ghost"
                  style={{ marginLeft: 8, marginRight: 20 }}
                  onClick={() =>
                    Modal.confirm({
                      width: 480,
                      icon: <QuestionCircleFilled style={{ color: '#FFB741' }} />,
                      title: '确定取消本次开票吗？',
                      content: (
                        <div style={{ color: '#666', marginBottom: 26 }}>
                          取消后，您可以在申请开票页面重新选择数据进行开票
                        </div>
                      ),
                      onOk: this.cancelInvoice,
                    })
                  }>
                  取消开票
                </Button>
              </>
            )}
            <div className={styles.item}>
              当前批次号：
              <div className={styles['price-block']}>{getQuery().batchId || '-'}</div>
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
          </div>
        </Content>
      </Layout>
    );
  }
}

export default Index;
