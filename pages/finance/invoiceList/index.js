/** @format */

import React, { PureComponent } from 'react';
import { InfoCircleTwoTone } from '@ant-design/icons';
import { Input, DatePicker, Button, Table, Modal, message } from 'antd';
import { Layout, Content, Search, Msg } from '@components';
import router from 'next/router';
import moment from 'moment';
import { finance } from '@api';
import PayPasswordInput from '@components/common/PayPasswordInput';
import styles from './capital.less';
import { keepState, getState, clearState } from '@utils/common';

const formatWeight = value => {
  return ((value || 0) / 1000).toFixed(2);
};

const formatPrice = value => {
  return ((value || 0) / 100).toFixed(2);
};
class InvoiceList extends PureComponent {
  static async getInitialProps(props) {
    const { isServer } = props;
    return { isServer };
  }
  constructor(props) {
    super(props);
    this.state = {
      routeView: {
        title: '开票列表',
        pageKey: 'main',
        longKey: 'finance.main',
        breadNav: '财务中心.开票列表',
        pageTitle: '开票列表',
      },
      columns: [
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
          render: formatWeight,
        },
        {
          title: '运费金额(元)',
          dataIndex: 'priceSum',
          key: 'priceSum',
          align: 'right',
          width: 120,
          render: formatPrice,
        },
        {
          title: '含税金额(元)',
          dataIndex: 'invoicePriceSum',
          key: 'invoicePriceSum',
          align: 'right',
          width: 120,
          render: formatPrice,
        },
        {
          title: '税费金额(元)',
          dataIndex: 'difference',
          key: 'difference',
          align: 'right',
          width: 90,
          render: formatPrice,
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
          width: 120,
          render: (value, record) => {
            const { difference, id, status, batchId } = record;
            const mode = status === 'REJECT_APPROVE' ? 'edit' : 'view';
            return (
              <>
                <Button
                  size="small"
                  type="link"
                  onClick={() => {
                    this.buildRecord(record);
                  }}>
                  查看
                </Button>
                {status === 'UN_PAY' && (
                  <Button
                    size="small"
                    type="link"
                    onClick={() =>
                      this.setState({
                        showPass: true,
                        payId: id,
                        payMoney: difference,
                      })
                    }>
                    支付
                  </Button>
                )}
              </>
            );
          },
        },
      ],
      page: 1,
      pageSize: 10,
      dataList: {},
      loading: true,
      status: 'UN_APPROVE',
      tabCount: {
        UN_APPROVE: 0,
        REJECT_APPROVE: 0,
        UN_PAY: 0,
        UN_INVOICE: 0,
        INVOICED: 0,
      },
      totalDifference: 0,
      totalInvoicePrice: 0,
      totalPrice: 0,
      totalWeight: 0,
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
    this.setState({
      loading: true,
    });

    const { batchId, begin, end, status, page, pageSize } = this.state;
    const params = {
      page,
      limit: pageSize,
      batchId: batchId || undefined,
      begin: begin || undefined,
      end: end || undefined,
      status: status || undefined,
    };
    const res = await finance.getInvoiceList({ params });
    if (res.status === 0) {
      this.setState(
        {
          dataList: res.result,
          tabCount: {
            UN_APPROVE: res.result.UN_APPROVE,
            REJECT_APPROVE: res.result.REJECT_APPROVE,
            UN_PAY: res.result.UN_PAY,
            UN_INVOICE: res.result.UN_INVOICE,
            INVOICED: res.result.INVOICED,
          },
          totalDifference: res.result.totalDifference,
          totalInvoicePrice: res.result.totalInvoicePrice,
          totalPrice: res.result.totalPrice,
          totalWeight: res.result.totalWeight,
          loading: false,
        },
        () => {
          // 持久化状态
          keepState({
            query: {
              page: this.state.page,
              pageSize: this.state.pageSize,
              batchId: this.state.batchId,
              status: this.state.status,
              begin: this.state.begin,
              end: this.state.end,
            },
          });
        }
      );
    } else {
      this.setState({
        loading: false,
      });
    }
  };

  onChangePage = page => {
    this.setState(
      {
        page,
      },
      this.setDataList
    );
  };

  onChangePageSize = (current, pageSize) => {
    this.setState(
      {
        page: 1,
        pageSize,
      },
      this.setDataList
    );
  };

  // 查询
  query = () => {
    this.setState(
      {
        page: 1,
      },
      this.setDataList
    );
  };

  // 取消开票
  cancelInvoice = async batchId => {
    router.push(`/finance/invoiceList/rejectList?batchId=${batchId}`);
  };

  resetFilter = () => {
    this.setState(
      {
        batchId: '',
        // status: undefined,
        begin: undefined,
        end: undefined,
        page: 1,
      },
      this.setDataList
    );
  };

  // 支付
  pay = async () => {
    const { payId, password } = this.state;
    if (password && password.length > 0) {
      this.setState({
        payLoading: true,
      });
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
        this.setState({ showPass: false }, this.setDataList);
      } else {
        this.setState({
          payError: res.detail ? res.detail : res.description,
        });
      }
      this.setState({
        payLoading: false,
      });
    } else {
      message.error('请输入支付密码');
    }
  };

  changeTab = status => {
    this.setState(
      {
        status,
        page: 1,
        pageSize: 10,
      },
      this.setDataList
    );
  };

  // 生成对账单
  // 重新生成一遍对账单 驳回的对账单可能修改
  buildRecord = async record => {
    const { id, status, batchId, payType } = record;
    const mode = status === 'REJECT_APPROVE' ? 'edit' : 'view';

    const params = {
      id,
      payType,
    };

    router.push(`/finance/invoiceList/record?id=${id}&&mode=${mode}&&batchId=${batchId}&&payType=${payType}`);

    // try {
    //   // 先生成对账单 根据开票金额类型
    //   const res = await finance.generateRecord({ params });
    //   if (res.status === 0) {
    //     router.push(`/finance/invoiceList/record?id=${id}&&mode=${mode}&&batchId=${batchId}&&payType=${payType}`);
    //   } else {
    //     message.error(`${res.description} ${res.detail || ''}`);
    //   }
    // } catch {
    //   router.push(`/finance/invoiceList/record?id=${id}&&mode=${mode}`);
    // }
  };

  render() {
    const {
      routeView,
      columns,
      dataList,
      page,
      pageSize,
      loading,
      batchId,
      status,
      begin,
      end,
      showPass,
      payMoney,
      payError,
      payLoading,
      tabCount,
      totalDifference,
      totalInvoicePrice,
      totalPrice,
      totalWeight,
    } = this.state;
    return (
      <Layout {...routeView}>
        <Search onSearch={this.query} onReset={this.resetFilter}>
          <Search.Item label="提交时间" br>
            <DatePicker.RangePicker
              value={begin && end ? [moment(begin), moment(end)] : null}
              allowClear
              style={{ width: 376 }}
              showTime={{
                defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
              }}
              format="YYYY-MM-DD HH:mm:ss"
              onChange={(date, string) => this.setState({ begin: string[0], end: string[1] })}
            />
          </Search.Item>
          <Search.Item label="批次号">
            <Input
              value={batchId}
              allowClear
              onChange={e => {
                this.setState({ batchId: e.target.value });
              }}
              placeholder="请输入批次号"
            />
          </Search.Item>
        </Search>
        <Content style={{ marginTop: 24 }}>
          <header className="tab-header">
            <div
              className={`tab-item ${status === 'UN_APPROVE' ? 'active' : ''}`}
              onClick={() => this.changeTab('UN_APPROVE')}>
              待审核({tabCount.UN_APPROVE})
            </div>
            <div className={`tab-item ${status === 'UN_PAY' ? 'active' : ''}`} onClick={() => this.changeTab('UN_PAY')}>
              待支付({tabCount.UN_PAY})
            </div>
            <div
              className={`tab-item ${status === 'UN_INVOICE' ? 'active' : ''}`}
              onClick={() => this.changeTab('UN_INVOICE')}>
              待开票({tabCount.UN_INVOICE})
            </div>
            <div
              className={`tab-item ${status === 'INVOICED' ? 'active' : ''}`}
              onClick={() => this.changeTab('INVOICED')}>
              已完成({tabCount.INVOICED})
            </div>
            <div
              className={`tab-item ${status === 'REJECT_APPROVE' ? 'active' : ''}`}
              onClick={() => this.changeTab('REJECT_APPROVE')}>
              被驳回({tabCount.REJECT_APPROVE})
            </div>
          </header>
          <section>
            <Msg>
              合计：
              <span style={{ marginLeft: 8 }}>总净重</span>
              <span className={'total-num'}>{(totalWeight / 1000).toFixed(2)}</span>吨
              <span style={{ marginLeft: 32 }}>运费总额</span>
              <span className={'total-num'}>{(totalPrice / 100).toFixed(2)}</span>元
              <span style={{ marginLeft: 32 }}>含税总额</span>
              <span className={'total-num'}>{(totalInvoicePrice / 100).toFixed(2)}</span>元
              <span style={{ marginLeft: 32 }}>税费总额</span>
              <span className={'total-num'}>{(totalDifference / 100).toFixed(2)}</span>元
            </Msg>

            <Table
              columns={columns}
              loading={loading}
              dataSource={dataList.data}
              rowKey="batchId"
              scroll={{ x: 'auto' }}
              pagination={{
                onChange: page => this.onChangePage(page),
                onShowSizeChange: this.onChangePageSize,
                pageSize,
                current: page,
                total: dataList.count,
              }}
            />
          </section>
        </Content>

        <Modal
          width={400}
          destroyOnClose
          maskClosable={false}
          visible={showPass}
          footer={null}
          onCancel={() => this.setState({ showPass: false })}
          title="请输入支付密码">
          <div className={styles['password-block']}>
            <div className={styles['confirm-msg']}>
              <InfoCircleTwoTone
                style={{ fontSize: 18, verticalAlign: 'sub', marginRight: 6 }}
                twoToneColor="#faad14"
              />
              您的支付总额为
              <span className={styles.number}>{(payMoney / 100).toFixed(2)}</span>元
            </div>
            <div className={styles['pass-ipt']}>
              <PayPasswordInput onChange={value => this.setState({ password: value })} />
            </div>
            <div className={styles['error-msg']}>{payError}</div>
            <div className={styles.btn}>
              <Button type="primary" onClick={() => this.pay()} loading={payLoading}>
                完成
              </Button>
            </div>
          </div>
        </Modal>
      </Layout>
    );
  }
}

export default InvoiceList;
