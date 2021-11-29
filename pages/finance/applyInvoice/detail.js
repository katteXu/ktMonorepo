/** @format */

import React, { PureComponent } from 'react';
import { Button, DatePicker, Table, message, Modal } from 'antd';
import { QuestionCircleFilled } from '@ant-design/icons';
import moment from 'moment';
import router from 'next/router';
import Link from 'next/link';
import { finance } from '@api';
import { Layout, Content, Search } from '@components';
import styles from '../styles.less';
import Title from '@components/Finance/Title';
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
        title: '运单明细', // 浏览器标签 title
        pageKey: 'main',
        longKey: 'finance.main',
        breadNav: [
          '财务中心',
          <Link href="/finance/main">
            <a>开票信息</a>
          </Link>,
          '运单明细',
        ],
        pageTitle: '运单明细',
        useBack: true,
      },
      page: 1,
      pageSize: 100,
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
          render: formatPrice,
        },
        {
          title: '运费(元)',
          dataIndex: 'realPrice',
          key: 'realPrice',
          width: 150,
          render: formatPrice,
        },
        {
          title: '补差运费(元)',
          dataIndex: 'taxCharge',
          key: 'taxCharge',
          width: 150,
          render: formatPrice,
        },
        {
          title: '发货净重(吨)',
          dataIndex: 'goodsWeight',
          key: 'goodsWeight',
          width: 160,
          render: formatWeight,
        },
        {
          title: '收货净重(吨)',
          dataIndex: 'arrivalGoodsWeight',
          key: 'arrivalGoodsWeight',
          width: 160,
          render: formatWeight,
        },
        // {
        //   title: '货品名称',
        //   dataIndex: 'goodsType',
        //   key: 'goodsType',
        //   width: 70,
        //   render: value => {
        //     return (
        //       <Tooltip title={value} overlayStyle={{ maxWidth: 'max-content' }}>
        //         <div className="max-label" style={{ width: 83 }}>
        //           {value || '-'}
        //         </div>
        //       </Tooltip>
        //     );
        //   },
        // },
        // {
        //   title: '发货地址',
        //   dataIndex: 'fromAddress',
        //   key: 'fromAddress',
        //   width: 150,
        // },
        // {
        //   title: '收货地址',
        //   dataIndex: 'toAddress',
        //   key: 'toAddress',
        //   width: 150,
        // },
        {
          title: '承运时间',
          dataIndex: 'createdAt',
          key: 'createdAt',
          align: 'right',
          width: 180,
        },
      ],
      dataList: {},
      ids: [],
      btnLoading: false,
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
    const { ids } = router.query;
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
      },
      this.setDataList
    );
  };

  onPageChange = page => {
    this.setState(
      {
        page,
      },
      this.setDataList
    );
  };

  handleSelect = (selectedRowKeys, selectedRowData) => {
    this.setState({
      selectedRowKeys,
    });
  };

  rowComput = (selectRow, selected) => {
    let { ids } = this.state;
    if (selected) {
      ids.push(selectRow.id);
    } else {
      ids = ids.filter(item => item !== selectRow.id);
    }

    this.setState({
      ids,
    });
  };

  allRowComput = (selected, selectedRows, changeRows) => {
    let { ids } = this.state;
    let _ids = [];
    changeRows.forEach(item => {
      _ids.push(item.id);
    });
    if (selected) {
      ids.push(..._ids);
    } else {
      ids = ids.filter(item => !_ids.includes(item));
    }

    this.setState({
      ids,
    });
  };

  delete = async () => {
    const { ids } = this.state;
    if (ids.length === 0) {
      message.warn('请选择一行数据');
      return;
    }
    const params = {
      transportIds: ids.join(),
    };
    Modal.confirm({
      icon: <QuestionCircleFilled style={{ color: '#FFB741' }} />,
      title: '确认删除',
      content: (
        <p>
          确认删除当前<span style={{ color: '#477AEF' }}>{this.state.selectedRowKeys.length}</span>条运单吗？
        </p>
      ),
      onOk: async () => {
        const res = await finance.resetInvoiceList({ params });
        if (res.status === 0) {
          message.success('删除成功');
          router.back();
        } else {
          message.error(`删除失败，原因：${res.detail ? res.detail : res.description}`);
        }
      },
    });
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

  render() {
    const {
      routeView,
      columns,
      page,
      loading,
      dataList,
      pageSize,
      selectedRowKeys,
      begin,
      end,
      routeId,
      orderNo,
    } = this.state;
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
              <Button disabled={this.state.ids.length === 0} ghost onClick={this.delete} type="danger">
                批量删除
              </Button>
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
              rowSelection={{
                onChange: this.handleSelect,
                onSelect: this.rowComput,
                onSelectAll: this.allRowComput,
                selectedRowKeys,
              }}
              pagination={{
                onChange: page => this.onPageChange(page),
                pageSize,
                showSizeChanger: true,
                pageSizeOptions: ['100', '200', '500'],
                onShowSizeChange: (current, size) => {
                  this.setState({ pageSize: size, page: 1 }, this.setDataList);
                },
                current: page,
                total: dataList.count,
              }}
              scroll={{ x: 'auto' }}
            />
          </section>
        </Content>
      </Layout>
    );
  }
}

export default OrderDetail;
