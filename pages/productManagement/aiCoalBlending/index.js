import React, { useState, useEffect } from 'react';
import { Layout, Content, Image } from '@components';
import { Button } from 'antd';
import CoalBlendingSteps from '@components/ProductManagement/coalBlendingSteps';
import ChooseList from '@components/ProductManagement/Choose/list';
import ChooseForm from '@components/ProductManagement/Choose/form';
import ChooseScheme from '@components/ProductManagement/Choose/scheme';
import router from 'next/router';
import { getGoodsType } from '@api';
import style from './styles.less';

const routeView = {
  title: '智能配煤',
  pageKey: 'aiCoalBlending',
  longKey: 'productManagement.aiCoalBlending',
  breadNav: '智慧工厂.智能配煤',
  pageTitle: '智能配煤',
};

const AICoalBlending = props => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
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

      {step === 1 && <ChooseList onCoalBlending={handleCoalBlending} isServer={props.isServer} GoodsType={GoodsType} />}

      {!loading && (step === 2 || step === 3) && (
        <ChooseForm
          handleToStep={handleToStep}
          dataSource={sourceCoal}
          changeLoading={setLoading}
          handleDataInfo={data => {
            setDataInfo(data), console.log(data);
            setLoading(false);
            sessionStorage.setItem('plan', 1);
            router.push('/productManagement/coalBlendingManagement');
          }}
        />
      )}
      {
        loading ? (
          <div className={style.loadingBox}>
            <img src={Image.LoadingScheme} className={style.loadingImg} />
          </div>
        ) : null
        // step === 4 && (
        //   <Content style={{ marginTop: 16 }}>
        //     <header>输出方案</header>
        //     <section>
        //       <ChooseScheme dataInfo={dataInfo} />
        //       <Button style={{ marginTop: 8 }} type="primary" onClick={handleSubmit}>
        //         完成
        //       </Button>
        //     </section>
        //   </Content>
        // )
      }
    </Layout>
  );
};

export default AICoalBlending;
