/** @format */

import { useState, useEffect, useCallback } from 'react';
import router from 'next/router';
import Layout from '@components/Layout';
import { message } from 'antd';
import Content from '@components/Content';
import railWay from '@api/railWay';
import Link from 'next/link';
import RailWayForm from '@components/RailDetail/poundRailWayForm';
import Map, { setTruckDriving, clear } from '@components/Map';
import { clearState } from '@utils/common';
const CreateRailWay = props => {
  const routeView = {
    title: '创建专线',
    pageKey: 'pound',
    longKey: 'railWay.pound',
    breadNav: [
      '专线管理',
      <Link href="/railWay/pound">
        <a>过磅专线</a>
      </Link>,
      '创建专线',
    ],
    pageTitle: '创建专线',
    useBack: true,
  };

  // 表单提交
  const submit = async (data, viewData) => {
    // this.setState({
    //   showConfirm: true,
    //   confirmData: viewData,
    //   saveData: data,
    // });
    const res = await railWay.createRoute(data);
    if (res.status === 0) {
      message.success('专线创建成功');
      clearState();
      router.push('/railWay/pound');
    } else {
      message.error(`专线创建失败，原因：${res.detail || res.description}`);
    }
  };

  // save
  const saveRailWayData = async () => {
    const { saveData } = this.state;
    const res = await railWay.createRoute(saveData);
    if (res.status === 0) {
      message.success('专线创建成功');
      clearState();
      router.push('/railWay/pound');
    } else {
      message.error(`专线创建失败，原因：${res.detail || res.description}`);
    }
  };

  // 地图加载完毕
  const mapReady = map => {
    this.setState({
      mapIntance: map,
    });
  };

  // 画路线图
  const drawTruck = path => {
    const { mapIntance } = this.state;
    setTruckDriving(mapIntance, path);
  };

  const clearMap = () => {
    const { mapIntance } = this.state;
    clear(mapIntance);
  };

  return (
    <Layout {...routeView}>
      <Content>
        <section style={{ paddingTop: 24 }}>
          <RailWayForm onSubmit={submit} />
        </section>
      </Content>
      {/**renderMap={this.drawTruck} clearMap={this.clearMap} */}
      {/* <Modal
        visible={showConfirm}
        style={{ top: 20 }}
        onCancel={() => this.setState({ showConfirm: false })}
        title="发布专线"
        footer={null}>
        {Object.keys(confirmData).map(key => (
          <Row key={key} style={{ marginBottom: 15 }}>
            <Col span={5} style={{ textAlign: 'right' }}>
              {confirmData[key].label}
            </Col>
            <Col span={18} style={{ color: '#3D86EF' }}>
              {confirmData[key].value}
            </Col>
          </Row>
        ))}
        <Button block size="large" type="primary" onClick={() => saveRailWayData()}>
          确认无误，发布专线
        </Button>
        </Modal> */}
    </Layout>
  );
};

export default CreateRailWay;
