// 对账单

import React, { PureComponent } from 'react';
import { Button, message, Modal } from 'antd';
import { QuestionCircleFilled } from '@ant-design/icons';
import styles from './styles.less';
import Record from '@components/Finance/Record';
import InvoiceType from '@components/Finance/InvoiceType';
import router from 'next/router';
import { finance, downLoadFile } from '@api';
import personalApi from '@api/personalCenter';
import { Format, getQuery } from '@utils/common';
import Steps from '@components/Finance/main/Steps';
import { LoadingBtn } from '@components';

class PageDemo extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      btnLoading: false,
      mode: 'edit',
      invoiceTypeShow: false,
      invoiceTotal: {
        priceSum: 0,
        taxPriceSum: 0,
        weightSum: 0,
      },
    };
  }

  componentDidMount() {
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

    const { batchId } = getQuery();
    const { userId } = localStorage;
    const params = {
      batchId,
      ownerId: userId,
      payType,
    };

    // 提交申请列表
    const res = await finance.applyRejectInvoice({ params });
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
    const { batchId } = getQuery();

    const params = {
      batchId,
    };
    const res = await finance.getWaitaAskInvoiceList({ params });
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
    const { btnLoading, mode, payType, invoiceTypeShow, invoiceTotal } = this.state;
    return (
      <>
        <Steps style={{ marginBottom: 16 }} current={1} />
        <LoadingBtn
          style={{
            marginBottom: 16,
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
        {invoiceTypeShow && <InvoiceType onChange={this.changePayType} payType={payType} />}
        <Record
          id={getQuery().id}
          batchId={getQuery().batchId}
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

        <div className={styles['bottom']}>
          <Button onClick={() => this.props.onChangeStep()}>上一步</Button>
          <Button type="primary" onClick={this.submit} loading={this.state.btnLoading} style={{ marginLeft: 8 }}>
            申请开票
          </Button>
          <Button
            danger
            type="ghost"
            style={{ marginLeft: 8, marginRight: 12 }}
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
        </div>
      </>
    );
  }
}

export default PageDemo;
