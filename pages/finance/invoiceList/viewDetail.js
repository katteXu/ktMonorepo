/** @format */

import React, { PureComponent } from 'react';
import { DatePicker, Table, Button, Modal, message } from 'antd';
import { QuestionCircleFilled } from '@ant-design/icons';
import moment from 'moment';
import router from 'next/router';
import Link from 'next/link';
import { finance } from '@api';
import { Layout, Content, Search } from '@components';
import styles from '../styles.less';
import Title from '@components/Finance/Title';
import { getQuery } from '@utils/common';
const formatWeight = value => {
  return ((value || 0) / 1000).toFixed(2);
};

const formatPrice = value => {
  return ((value || 0) / 100).toFixed(2);
};

class OrderDetail extends PureComponent {
  static async getInitialProps(props) {
    const { isServer } = props;
    return {};
  }
  constructor(props) {
    super(props);
    this.state = {
      routeView: {
        title: '查看运单明细', // 浏览器标签 title
        pageKey: 'main',
        longKey: 'finance.main',
        // breadNav: '财务中心.开票列表.运单明细',
        breadNav: [
          '财务中心',
          <Link href="/finance/main">
            <a>开票列表</a>
          </Link>,
          '运单明细',
        ],
        pageTitle: '运单明细',
        useBack: true,
      },
      page: 1,
      pageSize: 10,
      selectedRowKeys: [],
      loading: true,
      columns: [
        {
          title: '车牌号',
          dataIndex: 'trailerPlateNumber',
          key: 'trailerPlateNumber',
          width: 100,
        },
        {
          title: '司机姓名',
          dataIndex: 'trucker',
          key: 'trucker',
          width: 100,
        },
        {
          title: '运费单价(元/吨)',
          dataIndex: 'unitPrice',
          key: 'unitPrice',
          width: 150,
          align: 'right',
          render: formatPrice,
        },
        {
          title: '运费(元)',
          dataIndex: 'realPrice',
          key: 'realPrice',
          width: 150,
          align: 'right',
          render: formatPrice,
        },
        {
          title: '补差运费(元)',
          dataIndex: 'taxCharge',
          key: 'taxCharge',
          width: 150,
          align: 'right',
          render: formatPrice,
        },
        {
          title: '发货净重(吨)',
          dataIndex: 'goodsWeight',
          key: 'goodsWeight',
          width: 160,
          align: 'right',
          render: formatWeight,
        },
        {
          title: '收货净重(吨)',
          dataIndex: 'arrivalGoodsWeight',
          key: 'arrivalGoodsWeight',
          width: 160,
          align: 'right',
          render: formatWeight,
        },
        {
          title: '承运时间',
          dataIndex: 'createdAt',
          key: 'createdAt',
          width: 180,
          align: 'right',
        },
      ],
      dataList: {},
      ids: [],
      btnLoading: false,
      selectedRowKeys: [],
    };
  }
  componentDidMount() {
    this.setDataList();
  }

  setDataList = async () => {
    this.setState({
      loading: true,
    });
    const { page, begin, end, routeId, orderNo, pageSize } = this.state;
    const { ids } = getQuery();
    const params = {
      page,
      limit: pageSize,
      ids,
      begin: begin || undefined,
      end: end || undefined,
      routeId: routeId || undefined,
      orderNo: orderNo || undefined,
    };
    const res = await finance.invoiceTransportList({ params });
    if (res.status === 0) {
      this.setState({
        dataList: res.result,
      });
    }

    this.setState({
      loading: false,
    });
  };

  // 查询
  query = () => {
    this.setState(
      {
        page: 1,
        selectedRowKeys: [],
      },
      this.setDataList
    );
  };

  onChangePage = page => {
    this.setState(
      {
        page,
      },
      this.setDataList
    );
  };

  resetFilter = () => {
    this.setState(
      {
        begin: undefined,
        end: undefined,
        page: 1,
      },
      this.query
    );
  };

  // 选中单一值
  onSelectRow = (record, selected, selectedRows, nativeEvent) => {
    const { selectedRowKeys } = this.state;
    if (selected) {
      this.setState({
        selectedRowKeys: [...selectedRowKeys, record.id],
      });
    } else {
      const i = selectedRowKeys.indexOf(record.id);
      selectedRowKeys.splice(i, 1);
      this.setState({
        selectedRowKeys: [...selectedRowKeys],
      });
    }
  };

  // 选中所有
  onSelectAll = (selected, selectedRows, changeRows) => {
    const { selectedRowKeys } = this.state;
    changeRows.forEach(record => {
      const i = selectedRowKeys.indexOf(record.id);
      if (selected) {
        if (i === -1) selectedRowKeys.push(record.id);
      } else {
        selectedRowKeys.splice(i, 1);
      }
    });

    this.setState({
      selectedRowKeys: [...selectedRowKeys],
    });
  };

  delete = async () => {
    const { selectedRowKeys } = this.state;

    if (selectedRowKeys.length === 0) {
      message.warn('请选择一行数据');
      return;
    }
    Modal.confirm({
      icon: <QuestionCircleFilled style={{ color: '#FFB741' }} />,
      title: '确认删除',
      content: (
        <p>
          确认删除当前<span style={{ color: '#477AEF' }}>{this.state.selectedRowKeys.length}</span>条运单吗？
        </p>
      ),
      onOk: this.remove,
    });
  };

  remove = async () => {
    const { selectedRowKeys } = this.state;
    const { batchId } = getQuery();
    const params = {
      batchId,
      transportIds: selectedRowKeys.join(),
    };
    const res = await finance.deleteRejectInvoice({ params });
    if (res.status === 0) {
      message.success('删除成功');
      router.back();
    } else {
      message.error(`删除失败，原因：${res.detail || res.description}`);
    }
  };

  render() {
    const { routeView, columns, page, loading, dataList, pageSize, begin, end, selectedRowKeys } = this.state;
    return (
      <Layout {...routeView}>
        <Content>
          <section>
            <Search onSearch={this.query} onReset={this.resetFilter}>
              <Search.Item label="承运时间" br>
                <DatePicker.RangePicker
                  allowClear
                  style={{ width: 376 }}
                  value={begin && end ? [moment(begin), moment(end)] : null}
                  showTime={{
                    defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                  }}
                  format="YYYY-MM-DD HH:mm:ss"
                  onChange={(date, string) => this.setState({ begin: string[0], end: string[1] })}
                />
              </Search.Item>
            </Search>

            <div
              style={{
                margin: '16px 0',
                height: 32,
              }}>
              {getQuery().mode === 'edit' && (
                <Button style={{}} onClick={this.delete} ghost disabled={selectedRowKeys.length === 0} type="danger">
                  批量删除
                </Button>
              )}
              <Title style={{ position: 'relative', top: 5 }} />
            </div>
            <Table
              loading={loading}
              columns={columns}
              dataSource={dataList.data}
              rowClassName={(record, index) => {
                if (record.arrivalGoodsWeight / 1000 > 40) {
                  return styles.red;
                }

                if (record.arrivalGoodsWeight / 1000 < 10) {
                  return styles.green;
                }

                if (record.realPrice / 100 < 50) {
                  return styles.yellow;
                }
              }}
              rowSelection={
                getQuery().mode === 'edit'
                  ? {
                      selectedRowKeys: selectedRowKeys,
                      onSelect: this.onSelectRow,
                      onSelectAll: this.onSelectAll,
                      // onChange: this.onSelectRow,
                    }
                  : false
              }
              pagination={{
                onChange: page => this.onChangePage(page),
                pageSize,
                showSizeChanger: true,
                onShowSizeChange: (current, size) => {
                  this.setState({ pageSize: size, page: 1 }, this.setDataList);
                },
                current: page,
                total: dataList.count,
              }}
            />
          </section>
        </Content>
      </Layout>
    );
  }
}

export default OrderDetail;
