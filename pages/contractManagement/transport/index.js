/** @format */

import React, { PureComponent } from 'react';
import Layout from '@components/Layout';
import { Row, Col, Table } from 'antd';
import Content from '@components/Content';
import Link from 'next/link';
import { contract } from '@api';
import { keepState, getState, clearState } from '@utils/common';
class Transport extends PureComponent {
  static async getInitialProps(props) {
    const { isServer } = props;
    return { isServer };
  }
  constructor(props) {
    super(props);
    this.state = {
      routeView: {
        title: '货运合同',
        pageKey: 'transport',
        longKey: 'contractManagement.transport',
        breadNav: '合同管理.货运合同',
      },
      columns: [
        {
          title: '序号',
          dataIndex: '序号',
          key: '序号',
          width: 100,
          render: (value, record, index) => {
            const i = (this.state.page - 1) * 10 + index + 1;
            return i;
          },
        },
        {
          title: '名称',
          dataIndex: 'name',
          key: 'name',
          width: 200,
        },
        {
          title: '创建时间',
          dataIndex: 'createdAt',
          key: 'createdAt',
          width: 200,
        },
        {
          title: '操作',
          dataIndex: 'id',
          key: 'id',
          width: 100,
          render: (value, record, index) => (
            <Link href={`/contractManagement/transport/detail?id=${value}`}>
              <a>查看</a>
            </Link>
          ),
        },
      ],
      loading: true,
      dataList: {},
      page: 1,
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

  // 设置列表
  setDataList = async () => {
    this.setState({
      loading: true,
    });
    const { page } = this.state;
    const params = {
      limit: 10,
      page,
    };
    const res = await contract.getContractLit({ params });

    this.setState(
      {
        loading: false,
        dataList: res.result,
      },
      () => {
        // 持久化状态
        keepState({
          query: {
            page: this.state.page,
          },
        });
      }
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

  render() {
    const { routeView, loading, dataList, columns, page } = this.state;
    return (
      <Layout {...routeView}>
        <Row>
          <Col>
            <Content>
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
      </Layout>
    );
  }
}

export default Transport;
