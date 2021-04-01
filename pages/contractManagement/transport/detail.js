/** @format */

import React, { PureComponent } from 'react';
import { Row, Col, Skeleton, message } from 'antd';
import Layout from '@components/Layout';
import router from 'next/router';
import Link from 'next/link';
import { contract } from '@api';
import Content from '@components/Content';
import { getQuery } from '@utils/common';

class Detail extends PureComponent {
  static async getInitialProps(props) {
    const { isServer } = props;
    return {};
  }
  constructor(props) {
    super(props);
    this.state = {
      routeView: {
        title: '合同详情',
        pageKey: 'transport',
        longKey: 'contractManagement.transport',
        // breadNav: '合同管理.货运合同.合同详情',
        breadNav: [
          '合同管理',
          <Link href="/contractManagement/transport">
            <a>货运合同</a>
          </Link>,
          '合同详情',
        ],
        useBack: true,
      },
      content: '',
    };
  }

  componentDidMount() {
    this.setContract();
  }

  // 合同数据加载
  setContract = async () => {
    const { id } = getQuery();
    const params = {
      id,
    };
    const res = await contract.getContractDetail({ params });
    if (res.status === 0) {
      this.setState({
        content: res.result.webText,
      });
    }
  };

  downContract = async () => {
    this.setState({
      loading: true,
    });
    const { id } = getQuery();
    const params = {
      id,
    };

    const res = await contract.downContract({ params });
    if (res.status === 0) {
      window.open(res.result, '_self');
    } else {
      message.error(res.detail ? res.detail : res.description);
    }

    this.setState({
      loading: false,
    });
  };

  render() {
    const { routeView, content } = this.state;
    return (
      <Layout {...routeView}>
        {/* <Row>
          <Col style={{ float: 'right' }}>
            <Button style={{ marginLeft: 20 }} type="primary" onClick={() => router.back()}>
              返回
            </Button>
          </Col>
        </Row> */}
        <Row style={{ marginTop: 12 }}>
          <Col span={15}>
            <Content>
              <section>
                <Skeleton active loading={!content} paragraph={{ rows: 20 }}>
                  <div dangerouslySetInnerHTML={{ __html: content || '' }}></div>
                </Skeleton>
              </section>
            </Content>
          </Col>
        </Row>
      </Layout>
    );
  }
}

export default Detail;
