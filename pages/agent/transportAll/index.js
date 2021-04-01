import { PureComponent } from 'react';
import router from 'next/router';
import { LoadingOutlined } from '@ant-design/icons';
import { Row, Col, DatePicker, Button, Table, Modal, Tag, message } from 'antd';
import moment from 'moment';
import SelectCompany from '@components/Agent/selectCompany';
import { Layout, Content, Search } from '@components';
import agent from '@api/agent';

const formatPrice = value => {
  return ((value || 0) / 100).toFixed(2) + '元';
};

const formatWeight = (value, record) => {
  return ((value || 0) / 1000).toFixed(2);
};
class TransportAll extends PureComponent {
  state = {
    routeView: {
      title: '运费汇总',
      pageKey: 'agent/transportAll',
      longKey: 'agent/transportAll',
      breadNav: '运费汇总',
      pageTitle: '运费汇总',
    },
    columns: [
      {
        title: '账号',
        dataIndex: 'username',
        key: 'username',
      },
      {
        title: '企业名称',
        dataIndex: 'companyName',
        key: 'companyName',
      },
      {
        title: '发货净重(吨)',
        dataIndex: 'goodsWeight',
        key: 'goodsWeight',
        render: formatWeight,
      },
      {
        title: '收货净重(吨)',
        dataIndex: 'arrivalGoodsWeight',
        key: 'arrivalGoodsWeight',
        render: formatWeight,
      },
      {
        title: '待结车次',
        dataIndex: 'waitPayNum',
        key: 'waitPayNum',
      },
      {
        title: '待支付运费(元)',
        dataIndex: 'waitPayPrice',
        key: 'waitPayPrice',
        render: text => (text / 100).toFixed(2),
      },
      {
        title: '已结车次',
        dataIndex: 'payNum',
        key: 'payNum',
      },
      {
        title: '已支付运费(元)',
        dataIndex: 'payPrice',
        key: 'payPrice',
        render: text => (text / 100).toFixed(2),
      },

      {
        title: '操作',
        dataIndex: 'userId',
        key: 'userId',
        fixed: 'right',
        render: (value, record) => (
          <Button
            size="small"
            type="link"
            onClick={() => {
              const { begin, end } = this.state;
              let timeQuery = '';
              if (begin && end) {
                timeQuery += `begin=${begin}&end=${end}`;
              }
              router.push(
                `/agent/transportAll/companyDetail?userId=${value}&companyName=${record.companyName}&username=${record.username}&${timeQuery}`
              );
            }}>
            详情
          </Button>
        ),
      },
    ],
    loading: false,
    page: 1,
    dataList: {},
    companyList: [],
    begin: moment().format('YYYY-MM-DD 00:00:00'),
    end: moment().format('YYYY-MM-DD 23:59:59'),
  };
  componentDidMount() {
    this.setDataList();
  }

  // 设置数据
  setDataList = async () => {
    this.setState({
      loading: true,
    });

    const { begin, end, page, companyList } = this.state;
    const params = {
      begin: begin || undefined,
      end: end || undefined,
      limit: 10,
      userIds: companyList.length > 0 ? companyList.map(item => item.userId).join(' ') : undefined,
      page,
    };
    const res = await agent.getUserListTwo({ params });
    if (res.status === 0) {
      this.setState({
        dataList: res.result,
      });
    } else {
      message.error(`获取数据失败，原因：${res.detail ? res.detail : res.description}`);
      this.setState({
        dataList: {},
      });
    }
    this.setState({
      loading: false,
    });
  };

  // 查询
  query = () => {
    const { companyList } = this.state;
    // if (companyList.length === 0) {
    //   message.warn('请选择一家企业');
    //   return;
    // }
    this.setState(
      {
        page: 1,
      },
      this.setDataList
    );
  };

  // 翻页
  onChangePage = page => {
    this.setState(
      {
        page,
      },
      this.setDataList
    );
  };

  // 选择企业完成
  handleSelectCompany = companyList => {
    this.setState({
      companyList,
      showModal: false,
    });
  };

  removeTag = value => {
    const { companyList } = this.state;
    this.setState({
      companyList: companyList.filter(item => item.id !== value),
    });
  };
  render() {
    const { routeView, columns, loading, dataList, page, exportLoading, companyList } = this.state;
    const { totalWaitPayPrice, totalPayPrice, totalGoodsWeight, totalArrivalGoodsWeight } = dataList;
    return (
      <Layout {...routeView}>
        <Search onSearch={this.query}>
          <Search.Item label="时间" br>
            <DatePicker.RangePicker
              style={{ width: 376 }}
              showTime={{
                defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
              }}
              defaultValue={[moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]}
              onChange={(date, [begin, end]) => this.setState({ begin, end })}
            />
          </Search.Item>
        </Search>

        <Row style={{ marginTop: 12 }} type="flex" align="middle">
          <Col style={{ width: 120 }}>
            <Button type="primary" onClick={() => this.setState({ showModal: true })}>
              选择企业
            </Button>
          </Col>
          <Col>
            {this.state.companyList.map(
              (item, index) =>
                index < 8 && (
                  <Tag
                    color="#108ee9"
                    onClose={() => this.removeTag(item.id)}
                    closable
                    style={{ fontSize: 14, padding: '0 10px' }}
                    key={item.id}>
                    {item.companyName}
                  </Tag>
                )
            )}
            <span>
              {this.state.companyList.length
                ? `${this.state.companyList.length > 8 ? '等,' : ''}共${this.state.companyList.length}家`
                : ''}
            </span>
          </Col>
        </Row>
        <Content style={{ marginTop: 12 }}>
          <header style={{ minWidth: 1000 }}>
            待支付运费总额:
            <span className="total-number">
              {!loading ? ((totalWaitPayPrice || 0) / 100).toFixed(2) : <LoadingOutlined style={{ fontSize: 20 }} />}
            </span>
            <span style={{ marginRight: 32 }}>元</span>
            已支付运费总额:
            <span className="total-number">
              {!loading ? ((totalPayPrice || 0) / 100).toFixed(2) : <LoadingOutlined style={{ fontSize: 20 }} />}
            </span>
            <span style={{ marginRight: 32 }}>元</span>
            发货总量:
            <span className="total-number">
              {!loading ? ((totalGoodsWeight || 0) / 1000).toFixed(2) : <LoadingOutlined style={{ fontSize: 20 }} />}
            </span>
            <span style={{ marginRight: 32 }}>吨</span>
            收货总量:
            <span className="total-number">
              {!loading ? (
                ((totalArrivalGoodsWeight || 0) / 1000).toFixed(2)
              ) : (
                <LoadingOutlined style={{ fontSize: 20 }} />
              )}
            </span>
            <span style={{ marginRight: 32 }}>吨</span>
          </header>
          <section>
            <Table
              loading={loading}
              dataSource={dataList.data}
              columns={columns}
              rowKey={(record, index) => index}
              scroll={{ x: 'auto' }}
              pagination={{
                onChange: page => this.onChangePage(page),
                pageSize: 10,
                current: page,
                total: dataList.count,
                showSizeChanger: false,
              }}
            />
          </section>
        </Content>
        <Modal
          destroyOnClose
          visible={this.state.showModal}
          footer={null}
          onCancel={() => this.setState({ showModal: false })}
          title="选择企业">
          <SelectCompany
            selectValue={companyList}
            onChange={this.handleSelectCompany}
            onClose={() => this.setState({ showModal: false })}
          />
        </Modal>
      </Layout>
    );
  }
}

export default TransportAll;
