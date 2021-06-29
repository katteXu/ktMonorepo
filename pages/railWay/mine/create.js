import React, { useState } from 'react';
import router from 'next/router';
import Layout from '@components/Layout';
import { Row, Col, Button, Modal, message } from 'antd';
import Content from '@components/Content';
import railWay from '@api/railWay';
import Link from 'next/link';
import RailWayForm from '@components/RailDetail/railWayForm';
import { clearState } from '@utils/common';

const CreateRailWay = props => {
  const routeView = {
    title: '创建专线',
    pageKey: 'mine',
    longKey: 'railWay.mine',
    breadNav: [
      '专线管理',
      <Link href="/railWay/mine">
        <a>开票专线</a>
      </Link>,
      '创建专线',
    ],
    pageTitle: '创建专线',
    useBack: true,
  };

  const [saveData, setSaveData] = useState('');
  const [confirmData, setConfirmData] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);

  // 表单提交
  const submit = async data => {
    // setShowConfirm(true);
    // setConfirmData(viewData);
    // setSaveData(data);
    const res = await railWay.createRoute(data);
    if (res.status === 0) {
      message.success('创建专线成功');
      clearState();
      router.push('/railWay/mine');
    } else {
      message.error(`创建失败，原因：${res.detail || res.description}`);
    }
  };

  // // save
  // const saveRailWayData = async () => {
  //   const res = await railWay.createRoute(saveData);
  //   if (res.status === 0) {
  //     message.success('创建专线成功');
  //     clearState();
  //     router.push('/railWay/mine');
  //   } else {
  //     message.error(`创建失败，原因：${res.detail || res.description}`);
  //   }
  // };

  // 地图加载完毕

  // 画路线图
  const drawTruck = () => {
    // const { mapIntance } = this.state;
    // setTruckDriving(mapIntance, path);
  };

  const clearMap = () => {
    // const { mapIntance } = this.state;
    // clear(mapIntance);
  };

  return (
    <Layout {...routeView}>
      <Content>
        <section style={{ paddingTop: 24 }}>
          <RailWayForm serverTime={props.serverTime} onSubmit={submit} renderMap={drawTruck} clearMap={clearMap} />
        </section>
      </Content>

      <Modal
        visible={showConfirm}
        style={{ top: 20, width: 600 }}
        onCancel={() => setShowConfirm(false)}
        title="确认发布"
        footer={null}>
        {Object.keys(confirmData).map(key => (
          <Row key={key} style={{ marginBottom: 15 }}>
            <Col span={6} style={{ textAlign: 'right' }}>
              {confirmData[key].label}
            </Col>
            <Col span={18} style={{ color: '#477AEF' }}>
              {confirmData[key].value}
            </Col>
          </Row>
        ))}
        <Button block size="large" type="primary" onClick={() => saveRailWayData()}>
          确认无误，发布专线
        </Button>
      </Modal>
    </Layout>
  );
};

export default CreateRailWay;
