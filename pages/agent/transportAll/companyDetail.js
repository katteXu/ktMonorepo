import { PureComponent } from 'react';
import router from 'next/router';
import { LoadingOutlined } from '@ant-design/icons';
import { DatePicker, Input, Button, Table, Modal, message } from 'antd';
import moment from 'moment';
import SelectCompany from '@components/Agent/selectCompany';
import { Layout, Content, Search } from '@components';
import Link from 'next/link';
import agent from '@api/agent';
import { getQuery } from '@utils/common';

const formatPrice = value => {
  return ((value || 0) / 100).toFixed(2) + '元';
};

const formatWeight = (value, record) => {
  return ((value || 0) / 1000).toFixed(2);
};
class TransportAll extends PureComponent {
  state = {
    routeView: {
      title: '企业详情',
      pageKey: 'agent/transportAll',
      longKey: 'agent/transportAll',
      // breadNav: '运费汇总.企业详情',
      breadNav: [
        <Link href="/agent/transportAll">
          <a>运费汇总</a>
        </Link>,
        '企业详情',
      ],
      useBack: true,
      pageTitle: '企业详情',
    },
    columns: [
      {
        title: '企业名称',
        dataIndex: 'companyName',
        key: 'companyName',
        render: () => {
          const { companyName } = getQuery();
          return companyName;
        },
      },
      {
        title: '货物类型',
        dataIndex: 'goodsType',
        key: 'goodsType',
      },
      {
        title: '发货企业',
        dataIndex: 'fromCompany',
        key: 'fromCompany',
      },
      {
        title: '收货企业',
        dataIndex: 'toCompany',
        key: 'toCompany',
      },
      {
        title: '货主账号',
        dataIndex: 'username',
        key: 'username',
        render: () => {
          const { username } = getQuery();
          return username;
        },
      },
      {
        title: '运费单价',
        dataIndex: 'unitPrice',
        key: 'unitPrice',
        render: formatPrice,
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
        dataIndex: 'routeId',
        key: 'routeId',
        fixed: 'right',
        render: (value, record) => (
          <Button
            size="small"
            type="link"
            onClick={() => {
              const { begin, end } = this.state;
              const { fromCompany, toCompany, goodsType, unitPrice, unitName } = record;
              const railWayInfo = `${fromCompany} - ${toCompany} - ${goodsType} - ${(unitPrice / 100).toFixed(2)}元/${
                unitName || '吨'
              }`;
              let timeQuery = '';
              if (begin && end) {
                timeQuery += `begin=${begin}&end=${end}`;
              }
              router.push(
                `/agent/transportAll/detail?routeId=${value}&&userId=${record.userId}&${timeQuery}&railWayInfo=${railWayInfo}`
              );
            }}>
            详情
          </Button>
        ),
      },
    ],
    loading: true,
    page: 1,
    dataList: {},
    companyList: [],
  };
  componentDidMount() {
    const { begin, end } = getQuery();
    this.setState({ begin, end }, this.setDataList);
  }

  // 设置数据
  setDataList = async () => {
    this.setState({
      loading: true,
    });
    const { userId } = getQuery();
    const { begin, end, page, fromCompany, toCompany, goodsType } = this.state;
    const params = {
      begin: begin || undefined,
      end: end || undefined,
      fromCompany: fromCompany || undefined,
      toCompany: toCompany || undefined,
      goodsType: goodsType || undefined,
      limit: 10,
      userId,
      page,
    };
    const res = await agent.getUserListTwoDetail({ params });
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
  render() {
    const { routeView, columns, loading, dataList, page, exportLoading, begin, end } = this.state;
    const { totalWaitPayPrice, totalPayPrice, totalGoodsWeight, totalArrivalGoodsWeight } = dataList;
    return (
      <Layout {...routeView}>
        <Search onSearch={this.query}>
          <Search.Item label="选择时间" br>
            <DatePicker.RangePicker
              style={{ width: 376 }}
              value={begin && end ? [moment(begin), moment(end)] : []}
              showTime={{
                defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
              }}
              onChange={(date, [begin, end]) => this.setState({ begin, end })}
            />
          </Search.Item>
          <Search.Item label="发货企业">
            <Input placeholder="请输入发货企业" onChange={e => this.setState({ fromCompany: e.target.value })}></Input>
          </Search.Item>
          <Search.Item label="收货企业">
            <Input placeholder="请输入收货企业" onChange={e => this.setState({ toCompany: e.target.value })}></Input>
          </Search.Item>
          <Search.Item label="货物类型">
            <Input placeholder="请输入货物类型" onChange={e => this.setState({ goodsType: e.target.value })}></Input>
          </Search.Item>
        </Search>

        <Content style={{ marginTop: 24 }}>
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
              pagination={{
                onChange: page => this.onChangePage(page),
                showSizeChanger: false,
                pageSize: 10,
                current: page,
                total: dataList.count,
              }}
              scroll={{ x: 'auto' }}
            />
          </section>
        </Content>

        <Modal
          visible={this.state.showModal}
          footer={null}
          onCancel={() => this.setState({ showModal: false })}
          title="选择企业">
          <SelectCompany onChange={this.handleSelectCompany} onClose={() => this.setState({ showModal: false })} />
        </Modal>
      </Layout>
    );
  }
}

export default TransportAll;
