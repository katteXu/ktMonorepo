import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Content, Search } from '@components';
import { Button } from 'antd';
import CoalBlendingSteps from '@components/ProductManagement/coalBlendingSteps';
import ChooseList from '@components/ProductManagement/Choose/list';
import ChooseForm from '@components/ProductManagement/Choose/form';
import ChooseScheme from '@components/ProductManagement/Choose/scheme';
import router from 'next/router';
import { getGoodsType } from '@api';
const routeView = {
  title: '智能配煤',
  pageKey: 'aiCoalBlending',
  longKey: 'productManagement.aiCoalBlending',
  breadNav: '智慧工厂.智能配煤',
  pageTitle: '智能配煤',
};

const AICoalBlending = props => {
  const [step, setStep] = useState(1);

  // 货品列表
  const [GoodsType, setGoodsType] = useState({});

  // 选择原煤
  const [sourceCoal, setSourceCoal] = useState([]);
  const [dataInfo, setDataInfo] = useState({});
  useEffect(() => {
    initGoodsType();
  }, []);

  // 下一步
  const handleNext = () => {
    const _step = step + 1;
    setStep(_step > 4 ? 4 : _step);
  };

  // 上一步
  const handlePrev = () => {
    const _step = step - 1;
    setStep(_step < 0 ? 0 : _step);
  };

  // 到制定步骤位置
  const handleToStep = step => {
    setStep(step);
  };

  // 智能配煤
  const handleCoalBlending = record => {
    setSourceCoal(record);
    handleNext();
  };

  // 完成提交
  const handleSubmit = () => {
    router.push('/productManagement/coalBlendingManagement');
  };

  // 初始化货物类型
  const initGoodsType = async () => {
    const res = await getGoodsType();
    if (res.status === 0) {
      const _goods = {};
      res.result.forEach(v => {
        _goods[v.key] = v.name;
      });
      setGoodsType(_goods);
    }
  };
  return (
    <Layout {...routeView}>
      <Content>
        <header>配煤流程</header>
        <section>
          <CoalBlendingSteps step={step} />
        </section>
      </Content>
      {/* <Content style={{ marginTop: 24 }}>
        <header>配煤列表</header>
        <section> */}
      {step === 1 && <ChooseList onCoalBlending={handleCoalBlending} isServer={props.isServer} GoodsType={GoodsType} />}

      {(step === 2 || step === 3) && (
        <ChooseForm
          handleToStep={handleToStep}
          dataSource={sourceCoal}
          handleDataInfo={data => {
            setDataInfo(data), console.log(data);
          }}
        />
      )}

      {step === 4 && (
        <Content style={{ marginTop: 24 }}>
          <header>输出方案</header>
          <section>
            <ChooseScheme dataInfo={dataInfo} />
            <Button style={{ marginTop: 8 }} type="primary" onClick={handleSubmit}>
              完成
            </Button>
          </section>
        </Content>
      )}
      {/* </section>
      </Content> */}
    </Layout>
  );
};

export default AICoalBlending;
