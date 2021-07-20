import React from 'react';
import { Layout, Content } from '@components';
import { message } from 'antd';
import { stock } from '@api';
import router from 'next/router';
import GoodsForm from '@components/GoodsManagement/GoodsForm';
import Link from 'next/link';

const routeView = {
  title: '货品管理',
  pageKey: 'goodsManagement',
  longKey: 'goodsManagement',
  breadNav: [
    '货品管理',
    <Link href="/goodsManagement">
      <a>货品列表</a>
    </Link>,
    '新增货品',
  ],
  pageTitle: '新增货品',
  useBack: true,
};

const GoodsManagement = props => {
  const submit = async data => {
    console.log(data);
    const id = data.id;

    const params = {
      goodsType: data.goodsType,
      goodsName: data.goodsName,
      addressCompanyId: data.addressCompanyId,
      rawMaterial: data.rawMaterial,
      unitPrice: (data.unitPrice * 100).toFixed(0) * 1,
      waterContentMin: data.standard_mad.min ? (data.standard_mad.min * 100).toFixed(0) * 1 : 0,
      waterContentMax: data.standard_mad.max ? (data.standard_mad.max * 100).toFixed(0) * 1 : 0,
      ashContentMin: data.standard_ad.min ? (data.standard_ad.min * 100).toFixed(0) * 1 : 0,
      ashContentMax: data.standard_ad.max ? (data.standard_ad.max * 100).toFixed(0) * 1 : 0,
      volatilizationMin: data.standard_vdaf.min ? (data.standard_vdaf.min * 100).toFixed(0) * 1 : 0,
      volatilizationMax: data.standard_vdaf.max ? (data.standard_vdaf.max * 100).toFixed(0) * 1 : 0,
      cinder: data.standard_crc ? (data.standard_crc * 100).toFixed(0) * 1 : 0,
      sulfurMin: data.standard_std.min ? (data.standard_std.min * 100).toFixed(0) * 1 : 0,
      sulfurMax: data.standard_std.max ? (data.standard_std.max * 100).toFixed(0) * 1 : 0,
      carbonMin: data.standard_fcd.min ? (data.standard_fcd.min * 100).toFixed(0) * 1 : 0,
      carbonMax: data.standard_fcd.max ? (data.standard_fcd.max * 100).toFixed(0) * 1 : 0,
      recoveryMin: data.standard_r.min ? (data.standard_r.min * 100).toFixed(0) * 1 : 0,
      recoveryMax: data.standard_r.max ? (data.standard_r.max * 100).toFixed(0) * 1 : 0,
      totalWaterContentMin: data.standard_mt.min ? (data.standard_mt.min * 100).toFixed(0) * 1 : 0,
      totalWaterContentMax: data.standard_mt.max ? (data.standard_mt.max * 100).toFixed(0) * 1 : 0,
      bondMin: data.standard_gri.min ? (data.standard_gri.min * 100).toFixed(0) * 1 : 0,
      bondMax: data.standard_gri.max ? (data.standard_gri.max * 100).toFixed(0) * 1 : 0,
      colloidMin: data.standard_y.min ? (data.standard_y.min * 100).toFixed(0) * 1 : 0,
      colloidMax: data.standard_y.max ? (data.standard_y.max * 100).toFixed(0) * 1 : 0,
      stoneMin: data.standard_gangue.min ? (data.standard_gangue.min * 100).toFixed(0) * 1 : 0,
      stoneMax: data.standard_gangue.max ? (data.standard_gangue.max * 100).toFixed(0) * 1 : 0,
      midCoalMin: data.standard_middle.min ? (data.standard_middle.min * 100).toFixed(0) * 1 : 0,
      midCoalMax: data.standard_middle.max ? (data.standard_middle.max * 100).toFixed(0) * 1 : 0,
      cleanCoalMin: data.standard_coal.min ? (data.standard_coal.min * 100).toFixed(0) * 1 : 0,
      cleanCoalMax: data.standard_coal.max ? (data.standard_coal.max * 100).toFixed(0) * 1 : 0,
    };

    // 如果存在id
    if (id) {
      params.id = id;
    }

    const res = id ? await stock.modifyGoods({ params }) : await stock.addGoods({ params });
    if (res.status === 0) {
      message.success('提交成功');
      router.push('/goodsManagement');
      // 关闭弹窗
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };
  return (
    <Layout {...routeView}>
      <Content>
        <section style={{ paddingTop: 24, paddingBottom: 48 }}>
          <GoodsForm onSubmit={submit} />
        </section>
      </Content>
    </Layout>
  );
};

export default GoodsManagement;
