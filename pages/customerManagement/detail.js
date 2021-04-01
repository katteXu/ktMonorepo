/** @format */

import React, { PureComponent } from 'react';
import Layout from '@components/Layout';
import { Row, Col, Button, message, Modal } from 'antd';
import Content from '@components/Content';
import CustomerForm from '@components/CustomerDetail/customerForm';
import AddressForm from '@components/CustomerDetail/AddressForm';
import { customer } from '@api';
import router from 'next/router';
import Link from 'next/link';
import { QuestionCircleFilled } from '@ant-design/icons';
class CustomerDetail extends PureComponent {
  static async getInitialProps(props) {
    const { isServer } = props;
    return {};
  }
  constructor(props) {
    super(props);
    this.state = {
      routeView: {
        title: '客户管理',
        pageKey: 'customerManagement',
        longKey: 'customerManagement',
        // breadNav: '客户管理.创建客户',
        breadNav: [
          <Link href="/customerManagement">
            <a>客户管理</a>
          </Link>,
          '新增客户',
        ],
        useBack: true,
      },
      data: {},
      title: '',
      loadData: false,
    };
  }

  componentDidMount() {}

  submit = async params => {
    const res = await customer.createCustomer({ params });
    if (res.status === 0) {
      Modal.confirm({
        title: '确认继续',
        content: '是否添加装卸地址',
        icon: <QuestionCircleFilled />,
        onOk: () => this.setState({ showAddress: true, customerId: res.result.customerId }),
        onCancel: router.back,
      });
    } else {
      Modal.error({
        title: res.description,
        content: res.detail,
      });
    }
  };

  submitAddress = async data => {
    const { customerId } = this.state;
    const params = {
      addressId: customerId,
      ...data,
    };

    const res = await customer.createCustomerLoadAddr({ params });
    if (res.status === 0) {
      message.success('保存成功', 1.5, router.back);
    } else {
      message.error(res.detail || res.description);
    }
  };

  render() {
    const { routeView, data, title, loadData, showAddress, customerId } = this.state;
    return (
      <Layout {...routeView}>
        {/* <Row>
          <Col style={{ float: 'right' }}>
            <Button type="primary" onClick={() => router.back()}>
              返回
            </Button>
          </Col>
        </Row> */}
        <Row style={{ marginTop: 12 }}>
          <Col>
            <Content>
              <header>{title}客户信息</header>
              <section>
                <CustomerForm loadData={loadData} formData={data} onSubmit={this.submit} />
              </section>
            </Content>
          </Col>
        </Row>
        <Modal destroyOnClose title="装货地址添加" footer={null} onCancel={router.back} visible={showAddress}>
          <AddressForm customerId={customerId} onClose={router.back} onSubmit={this.submitAddress} />
        </Modal>
      </Layout>
    );
  }
}

export default CustomerDetail;
