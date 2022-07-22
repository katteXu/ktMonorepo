import React, { useState, useEffect } from 'react';
import { Layout, Content } from '@components';
import SchemeForm from '@components/ProductManagement/CoalBlendingScheme/form';
import { useRouter } from 'next/router';
import { message } from 'antd';
import { product } from '@api';
import Link from 'next/link';
import { getQuery } from '@utils/common';

const routeView = {
  title: '配煤管理',
  pageKey: 'coalBlendingManagement',
  longKey: 'productManagement.coalBlendingManagement',
  breadNav: [
    '智慧工厂',
    <Link href="/productManagement/coalBlendingManagement">
      <a>配煤管理</a>
    </Link>,
    '录入实际产出',
  ],
  pageTitle: '配煤管理',
  useBack: true,
};
const InputScheme = props => {
  const router = useRouter();
  const { id } = getQuery();
  // 目标货品
  const [targetGood, setTargetGood] = useState({});
  // 原料货品
  const [rawGoods, setRawGoods] = useState([]);

  // 录入实际产出
  const getData = async () => {
    const params = {
      id: id,
    };
    const res = await product.getBlendingSchemeDetail({ params });
    if (res.status === 0) {
      const { goodsName, inventoryId, unitPrice, rawMaterial, id } = res.result;
      const good = {
        goodsName,
        inventoryId,
        unitPrice,
        schemeId: id,
      };
      console.log(good);
      console.log(rawMaterial);
      setTargetGood(good);
      setRawGoods(rawMaterial);
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };

  // 实际产出录入
  const handleSchemeSubmit = async data => {
    const res = await product.insertActualOutPut({ params: { ...data, id: targetGood.schemeId } });
    if (res.status === 0) {
      message.success('录入成功');
      router.push('/productManagement/coalBlendingManagement');
    } else {
      message.error(res.detail || res.description);
    }
  };

  useEffect(() => {
    getData();
  }, []);
  return (
    <Layout {...routeView}>
      <Content>
        <section>
          <SchemeForm onSubmit={handleSchemeSubmit} targetGood={targetGood} rawGoods={rawGoods}></SchemeForm>
        </section>
      </Content>
    </Layout>
  );
};

export default InputScheme;
