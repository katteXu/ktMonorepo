/** @format */

import React, { PureComponent } from 'react';
import Layout from '@components/Layout';
import { Row, Col, Button, message, Modal, Table } from 'antd';
import Content from '@components/Content';
import router from 'next/router';
import Link from 'next/link';
import CompanyForm from '@components/CustomerDetail/CompanyForm';
import AddressForm from '@components/CustomerDetail/AddressForm';
import { customer } from '@api';
import { QuestionCircleFilled } from '@ant-design/icons';
import { getQuery } from '@utils/common';
class AddressList extends PureComponent {
  static async getInitialProps(props) {
    const { isServer } = props;
    return {};
  }
  constructor(props) {
    super(props);
    this.state = {
      routeView: {
        title: '客户详情',
        pageKey: 'customerManagement',
        longKey: 'customerManagement',
        // breadNav: '客户管理.客户详情',
        breadNav: [
          <Link href="/customerManagement">
            <a>客户管理</a>
          </Link>,
          '客户详情',
        ],
        useBack: true,
      },
      columns: [
        {
          title: '地址名称',
          dataIndex: 'loadAddressName',
          key: 'loadAddressName',
        },
        {
          title: '装卸位置',
          dataIndex: 'upDownPosition',
          key: 'upDownPosition',
          render: (value, record) => {
            const { province, city, district } = record;
            return `${province}${city}${district}`;
          },
        },
        {
          title: '详细地址',
          dataIndex: 'detailAddress',
          key: 'detailAddress',
        },
        {
          title: '联系人',
          dataIndex: 'contactName',
          key: 'contactName',
        },
        {
          title: '联系人电话',
          dataIndex: 'contactMobile',
          key: 'contactMobile',
        },
        {
          title: '其他联系人',
          dataIndex: 'contact2Name',
          key: 'contact2Name',
        },
        {
          title: '其他联系人电话',
          dataIndex: 'contact2Mobile',
          key: 'contact2Mobile',
        },
        {
          title: '操作',
          dataIndex: 'ctrl',
          align: 'right',
          key: 'ctrl',
          render: (value, record) => {
            return (
              <Button.Group>
                <Button type="link" size="small" onClick={() => this.updateRow(record)}>
                  修改
                </Button>
                <Button danger type="link" size="small" onClick={() => this.deleteRow(record)}>
                  删除
                </Button>
              </Button.Group>
            );
          },
        },
      ],
      dataList: {},
      loading: true,
      page: 1,
      companyInfo: {},
      showCompanyForm: false,
      showAddressForm: false,
    };
  }

  componentDidMount() {
    this.setDataList();
  }

  // 数据加载
  setDataList = async () => {
    const { companyName } = getQuery();
    const { page } = this.state;
    this.setState({
      loading: true,
      limit: 10,
    });
    const params = {
      page,
      addressCompanyName: companyName,
    };

    const res = await customer.getCustomerAddressList({ params });
    if (res.status === 0) {
      this.setState({
        companyName: res.result.customer.companyName,
        companyContactName: res.result.customer.companyContactName,
        companyContactMobile: res.result.customer.companyContactMobile,
        companySimpleName: res.result.customer.companySimpleName,
        addressId: res.result.customer.id,
        dataList: res.result,
      });
    }
    this.setState({
      loading: false,
    });
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

  // 删除行
  deleteRow = async ({ id, detailAddress, province, city, district }) => {
    const content = (
      <div>
        确认删除“
        <span
          style={{
            fontWeight: 'bold',
            color: '#FD5F7D',
          }}>
          {`${province}${city}${district}${detailAddress}`}
        </span>
        ”？
      </div>
    );

    Modal.confirm({
      title: '地址删除',
      content,
      icon: <QuestionCircleFilled />,
      onOk: async () => {
        const params = {
          loadAddressId: id,
        };
        const res = await customer.deleteLoadAddr({ params });
        if (res.status === 0) {
          message.success('删除成功');
          this.setState(
            {
              page: 1,
            },
            this.setDataList
          );
        } else {
          message.error(`删除失败，原因：${res.detail ? res.detail : res.description}`);
        }
      },
    });
  };

  // 修改行
  updateRow = addressInfo => {
    this.setState({
      showAddressForm: true,
      addressInfo,
    });
  };

  // 保存企业信息
  saveCompany = async data => {
    const { addressId } = this.state;
    const params = {
      addressId,
      ...data,
    };

    const res = await customer.modifyCustomerAddress({ params });
    if (res.status === 0) {
      message.success('保存成功');
      // 关闭弹窗 修改条件
      this.setState(
        {
          showCompanyForm: false,
          ...data,
        },
        () => {
          router.replace(`${window.location.pathname}?companyName=${data.companyName}`);
        }
      );
    } else {
      message.error(` ${res.detail ? res.detail : res.description}`);
    }
  };

  // 修改保存地址信息
  saveAddress = async data => {
    const { addressInfo } = this.state;
    const params = {
      loadAddressId: addressInfo.id,
      ...data,
    };

    const res = await customer.modifyCustomerLoadAddress({ params });
    if (res.status === 0) {
      message.success('保存成功', 1.5, () => {
        this.setState(
          {
            showAddressForm: false,
          },
          this.setDataList
        );
      });
    } else {
      message.error(res.detail || res.description);
    }
  };

  // 创建保存地址信息
  saveCreateAddress = async data => {
    const { addressId } = this.state;
    const params = {
      addressId,
      ...data,
    };

    const res = await customer.createCustomerLoadAddr({ params });
    if (res.status === 0) {
      message.success('保存成功', 1.5, () => {
        this.setState(
          {
            showCreateAddressForm: false,
          },
          this.setDataList
        );
      });
    } else {
      message.error(res.detail || res.description);
    }
  };

  render() {
    const {
      routeView,
      columns,
      dataList,
      loading,
      showCompanyForm,
      showAddressForm,
      companyName,
      companySimpleName,
      companyContactName,
      companyContactMobile,
      showCreateAddressForm,
      addressInfo, // 修改用
    } = this.state;
    return (
      <Layout {...routeView}>
        {/* <Row>
          <Col style={{ float: 'right' }}>
            <Button type="primary" onClick={() => router.back()}>
              返回
            </Button>
          </Col>
        </Row> */}
        <Row gutter={20} style={{ fontSize: 16 }}>
          <Col span={7} style={{ color: '#848485 ' }}>
            企业名称：
            <span style={{ color: '#666' }}>{companyName || '-'}</span>
          </Col>
          <Col span={6} style={{ color: '#848485 ' }}>
            企业联系人：
            <span style={{ color: '#666' }}>{companyContactName || '-'}</span>
          </Col>
        </Row>
        <Row gutter={20} style={{ fontSize: 16, marginTop: 15 }}>
          <Col span={7} style={{ color: '#848485 ' }}>
            企业简称：
            <span style={{ color: '#666' }}>{companySimpleName || '-'}</span>
          </Col>
          <Col span={6} style={{ color: '#848485 ' }}>
            企业联系电话：
            <span style={{ color: '#666' }}>{companyContactMobile || '-'}</span>
          </Col>
        </Row>
        <Row style={{ marginTop: 12 }}>
          <Col>
            <Content>
              <header>
                装卸地址
                <div style={{ float: 'right' }}>
                  <Button type="primary" onClick={() => this.setState({ showCompanyForm: true })}>
                    修改企业信息
                  </Button>
                  <Button
                    type="primary"
                    style={{ marginLeft: 10 }}
                    onClick={() => this.setState({ showCreateAddressForm: true })}>
                    新增
                  </Button>
                </div>
              </header>
              <section>
                <Table
                  loading={loading}
                  bordered
                  size="middle"
                  dataSource={dataList.data}
                  columns={columns}
                  rowKey="id"
                  pagination={{
                    onChange: page => this.onChangePage(page),
                    pageSize: 10,
                    total: dataList.count,
                  }}
                />
              </section>
            </Content>
          </Col>
        </Row>
        {/* 企业信息修改 */}
        <Modal
          visible={showCompanyForm}
          destroyOnClose
          title="企业信息修改"
          onCancel={() => this.setState({ showCompanyForm: false })}
          footer={null}>
          <CompanyForm
            onSubmit={this.saveCompany}
            formData={{
              companyName,
              companySimpleName,
              companyContactName,
              companyContactMobile,
            }}
            onClose={() => this.setState({ showCompanyForm: false })}
          />
        </Modal>
        {/* 修改地址信息 */}
        <Modal
          visible={showAddressForm}
          destroyOnClose
          title="修改装货地址"
          onCancel={() => this.setState({ showAddressForm: false })}
          footer={null}>
          <AddressForm
            onSubmit={this.saveAddress}
            formData={addressInfo}
            onClose={() => this.setState({ showAddressForm: false })}
          />
        </Modal>
        {/* 新增地址信息 */}
        <Modal
          visible={showCreateAddressForm}
          destroyOnClose
          title="新增地址编辑"
          onCancel={() => this.setState({ showCreateAddressForm: false })}
          footer={null}>
          <AddressForm
            onSubmit={this.saveCreateAddress}
            onClose={() => this.setState({ showCreateAddressForm: false })}
          />
        </Modal>
      </Layout>
    );
  }
}

export default AddressList;
