/** @format */

import React, { PureComponent } from 'react';
import Layout from '@components/Layout';
import { Row, Col, Button, Table, Modal, message, Input, Result } from 'antd';
import Content from '@components/Content';
import BatchImport from '@components/BatchImport';
import { customer } from '@api';
import router from 'next/router';
import { keepState, getState, clearState } from '@utils/common';
import { QuestionCircleFilled } from '@ant-design/icons';
import deleteBtn from './deleteBtn.less';
class customerManagement extends PureComponent {
  static async getInitialProps(props) {
    const { isServer } = props;
    return { isServer };
  }
  constructor(props) {
    super(props);
    this.state = {
      routeView: {
        title: '客户管理',
        pageKey: 'customerManagement',
        longKey: 'customerManagement',
        breadNav: '客户管理',
      },
      columns: [
        // {
        //   title: '客户类型',
        //   dataIndex: 'type',
        //   key: 'type',
        //   width: 180,
        // },
        {
          title: '企业名称',
          dataIndex: 'companyName',
          key: 'companyName',
          width: 220,
        },
        {
          title: '企业简称',
          dataIndex: 'companySimpleName',
          key: 'companySimpleName',
          width: 100,
        },
        // {
        //   title: '企业地址',
        //   dataIndex: 'detailAddress',
        //   key: 'detailAddress',
        //   width: 280,
        // },
        {
          title: '联系人',
          dataIndex: 'contactName',
          key: 'contactName',
          width: 100,
        },
        {
          title: '联系电话',
          dataIndex: 'contactMobile',
          key: 'contactMobile',
          width: 150,
        },
        {
          title: '操作',
          dataIndex: 'ctrl',
          key: 'ctrl',
          align: 'right',
          width: 200,
          render: (value, record) => {
            return (
              <Button.Group>
                {/* <Button type="link" size="small" onClick={() => this.update(record)}>
                  修改
                </Button> */}
                <Button type="link" size="small" onClick={() => this.toDetail(record)}>
                  详情
                </Button>
                <Button type="link" size="small" className={deleteBtn.delete} onClick={() => this.delData(record)}>
                  删除
                </Button>
              </Button.Group>
            );
          },
        },
      ],
      dataList: {},
      loading: false,
      showModal: false,
      companyName: '',
      uploadResult: false,
      success: 0,
      fail: 0,
      failRow: [],
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
    // this.setDataList();
  }

  // 绑定数据
  setDataList = async () => {
    this.setState({
      loading: true,
    });
    const { page, companyName } = this.state;
    const params = {
      limit: 10,
      page,
      companyName,
    };
    const res = await customer.getDataList({ params });

    this.setState(
      {
        dataList: res.result,
        loading: false,
      },
      () => {
        // 持久化状态
        keepState({
          query: {
            page: this.state.page,
            companyName: this.state.companyName,
          },
        });
      }
    );
  };

  // 删除确认
  delData = ({ companyName, id }) => {
    const content = (
      <div>
        确认删除“
        <span
          style={{
            fontWeight: 'bold',
            color: '#FD5F7D',
          }}>
          {companyName}
        </span>
        ”？
      </div>
    );
    Modal.confirm({
      title: '删除客户',
      content,
      icon: <QuestionCircleFilled />,
      onOk: async () => {
        // 删除
        const params = {
          addressIds: id,
        };
        const res = await customer.deleteCustomerAddress({ params });
        if (res.status === 0) {
          message.success('删除成功');
          this.query();
        } else {
          message.error(`删除失败，原因：${res.detail ? res.detail : res.description}`);
        }
      },
    });
  };

  // 新建客户
  newData() {
    router.push('/customerManagement/detail');
  }

  // 编辑数据
  update({ id }) {
    router.push(`/customerManagement/detail?id=${id}`);
  }

  // 详情
  toDetail({ id, companyName }) {
    router.push(`/customerManagement/addressList?companyName=${companyName}`);
  }

  // 翻页
  onChangePage(value) {
    this.setState(
      {
        page: value,
      },
      this.setDataList
    );
  }

  // 查询
  query = () => {
    this.setState(
      {
        page: 1,
      },
      this.setDataList
    );
  };

  // 下载模板
  downLoadTmp = async () => {
    const res = await customer.downTemplate();
    if (res.status === 0) {
      location.href = res.result;
    } else {
      message.error(res.detail ? res.detail : res.description);
    }
  };

  // 上传文件
  upload = async file => {
    const params = {
      excelUrl: file,
    };
    const res = await customer.importCustomer({ params });
    if (res.status === 0) {
      const { success, fail, failRow } = res.result;

      this.setState(
        {
          success,
          fail,
          failRow,
          showModal: false,
          uploadResult: true,
        },
        () => {
          if (fail === 0) {
            this.query();
          }
        }
      );
    } else {
      Modal.error({
        title: res.description,
        content: res.detail,
      });
    }
  };

  closeResult = () => {
    this.setState(
      {
        uploadResult: false,
      },
      this.query
    );
  };

  // 重置
  resetFilter = () => {
    this.setState(
      {
        companyName: '',
        page: 1,
      },
      this.query
    );
  };

  render() {
    const {
      routeView,
      columns,
      loading,
      dataList,
      showModal,
      uploadResult,
      success,
      fail,
      failRow,
      companyName,
      page,
    } = this.state;
    return (
      <Layout {...routeView}>
        <Row gutter={12} type="flex" align="bottom">
          <Col span={4}>
            <p>企业名称：</p>
            <Input
              value={companyName}
              placeholder="请输入企业名称"
              allowClear
              onChange={e => this.setState({ companyName: e.target.value })}
              onPressEnter={this.query}
            />
          </Col>
          <Col span={4}>
            <Button type="primary" onClick={() => this.query()}>
              查询
            </Button>
            <Button style={{ marginLeft: 10 }} onClick={this.resetFilter}>
              重置
            </Button>
          </Col>
        </Row>
        <Row style={{ marginTop: 12 }}>
          <Col>
            <Content>
              <header>
                <Button type="primary" style={{ marginLeft: 10, float: 'right' }} onClick={() => this.newData()}>
                  新增客户
                </Button>
                {/* <Button type="primary" style={{ float: 'right' }} onClick={() => this.setState({ showModal: true })}>
                  批量导入
                </Button> */}
              </header>
              <section>
                <Table
                  loading={loading}
                  size="middle"
                  bordered
                  dataSource={dataList.data}
                  columns={columns}
                  rowKey="id"
                  pagination={{
                    onChange: page => this.onChangePage(page),
                    pageSize: 10,
                    current: page,
                    total: dataList.count,
                  }}
                />
              </section>
            </Content>
          </Col>
        </Row>

        <Modal
          visible={showModal}
          title="批量导入"
          footer={null}
          destroyOnClose
          onCancel={() => this.setState({ showModal: false })}>
          <BatchImport
            handleDownLoad={this.downLoadTmp}
            handleUpload={this.upload}
            errorMsg={'错误信息'}
            onCancel={() => this.setState({ showModal: false })}
          />
        </Modal>

        <Modal
          visible={uploadResult}
          title="批量导入结果"
          footer={null}
          onCancel={() => this.setState({ uploadResult: false })}>
          <Result
            status={fail === 0 ? 'success' : 'warning'}
            title={
              <div>
                该次导入成功
                <span style={{ color: 'rgb(0, 116, 194)', padding: 10 }}>{success}</span>
                条，失败
                <span style={{ color: '#E44040', padding: 5 }}>{fail}</span>条
              </div>
            }
            subTitle={
              fail > 0 && (
                <>
                  <h4>
                    上传失败的文件行数位于第
                    <span style={{ padding: 5 }}>{failRow.join('、')}</span>行
                  </h4>
                  <div style={{ textAlign: 'left' }}>
                    <h4>上传失败的原因：</h4>
                    <p>1. 是否已经导入相同的文件内容；</p>
                    <p>2. 请确保车牌号共七位；</p>
                    <p>3. 请确保所属车队填写与已添加车队的信息一致；</p>
                    <p>4. 请确保必填信息完成填写；</p>
                  </div>
                </>
              )
            }
            extra={
              <Button size="large" type="primary" onClick={this.closeResult}>
                确定
              </Button>
            }
          />
        </Modal>
      </Layout>
    );
  }
}

export default customerManagement;
