import React, { useState, useEffect } from 'react';
import { Layout, Content } from '@components';
import Scheme from '@components/ProductManagement/Choose/scheme';
import Link from 'next/link';
import { product } from '@api';
import { getQuery } from '@utils/common';
const routeView = {
  title: '方案详情',
  pageKey: 'coalBlendingManagement',
  longKey: 'productManagement.coalBlendingManagement',
  breadNav: [
    '智慧工厂',
    <Link href="/productManagement/coalBlendingManagement">
      <a>配煤管理</a>
    </Link>,
    '方案详情',
  ],
  pageTitle: '方案详情',
  useBack: true,
};

// 方案详情
const Detail = () => {
  const [dataInfo, setDataInfo] = useState();

  useEffect(() => {
    getSchemeDetail();
  }, []);
  // 获取方案详情
  const getSchemeDetail = async () => {
    const params = {
      id: getQuery().id,
    };
    const res = await product.getSchemeDetail({ params });
    if (res.status === 0) {
      setDataInfo(res.result);
    }
  };
  return (
    <Layout {...routeView}>
      <Content>
        <header>输出方案</header>
        <section>
          <Scheme dataInfo={dataInfo} />
        </section>
      </Content>
    </Layout>
  );
};
export default Detail;
