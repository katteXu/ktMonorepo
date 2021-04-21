import { PureComponent } from 'react';
import router from 'next/router';
import { LoadingOutlined } from '@ant-design/icons';
import { DatePicker, Button, Table, Modal, Tag, message } from 'antd';
import moment from 'moment';
import SelectCompany from '@components/Agent/selectCompany';
import { Layout, Content, Search, Msg } from '@components';
import agent from '@api/agent';
import s from './styles.less';
const formatWeight = value => {
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
        align: 'right',
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
    const { routeView, columns, loading, dataList, page, companyList } = this.state;
    const { totalWaitPayPrice, totalPayPrice, totalGoodsWeight, totalArrivalGoodsWeight } = dataList;
    return (
      <Layout {...routeView}>
        <div style={{ background: '#fff', padding: 16 }}>
          <Button type="primary" onClick={() => this.setState({ showModal: true })} style={{ marginBottom: 16 }}>
            选择企业
          </Button>
          {this.state.companyList.length > 0 && (
            <div style={{ marginBottom: 16, background: '#f6f7f9ff', padding: '16px 12px' }} className={s.tagStyle}>
              {this.state.companyList.map(
                (item, index) =>
                  index < 8 && (
                    <Tag
                      color="#108ee9"
                      onClose={() => this.removeTag(item.id)}
                      closable
                      style={{
                        fontSize: 14,
                        padding: '0 10px',
                        marginRight: '8px !important',
                        fontSize: 14,
                        padding: '0 10px',
                        border: '1px solid #3d86ef',
                        background: '#f5f9ff',
                        color: '#3d86ef',
                        borderRadius: 2,
                      }}
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
            </div>
          )}

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

          <Content style={{ marginTop: 16 }}>
            <Msg>
              <span>待支付运费总额</span>
              <span className={'total-num'}>
                {!loading ? ((totalWaitPayPrice || 0) / 100).toFixed(2) : <LoadingOutlined style={{ fontSize: 20 }} />}
              </span>
              元<span style={{ marginLeft: 32 }}>已支付运费总额</span>
              <span className={'total-num'}>
                {!loading ? ((totalPayPrice || 0) / 100).toFixed(2) : <LoadingOutlined style={{ fontSize: 20 }} />}
              </span>
              元<span style={{ marginLeft: 32 }}>发货总量</span>
              <span className={'total-num'}>
                {!loading ? ((totalGoodsWeight || 0) / 1000).toFixed(2) : <LoadingOutlined style={{ fontSize: 20 }} />}
              </span>
              吨<span style={{ marginLeft: 32 }}>收货总量</span>
              <span className={'total-num'}>
                {!loading ? (
                  ((totalArrivalGoodsWeight || 0) / 1000).toFixed(2)
                ) : (
                  <LoadingOutlined style={{ fontSize: 20 }} />
                )}
              </span>
              吨
            </Msg>
            <Table
              loading={loading}
              dataSource={dataList.data}
              columns={columns}
              scroll={{ x: 'auto' }}
              pagination={{
                onChange: page => this.onChangePage(page),
                pageSize: 10,
                current: page,
                total: dataList.count,
                showSizeChanger: false,
              }}
            />
          </Content>
        </div>

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
