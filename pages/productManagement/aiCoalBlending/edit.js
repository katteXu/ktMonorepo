// 选煤列表
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { keepState, getState, clearState, Format, getQuery } from '@utils/common';
import { Input, Button, Table, Modal, Select, message } from 'antd';
import { Layout, Search, Ellipsis, Content } from '@components';
import { product } from '@api';
import { useRouter } from 'next/router';
import GoodsForm from '@components/ProductManagement/Choose/goods_form';
import Link from 'next/link';
import { getGoodsType } from '@api';
const routeView = {
  title: '编辑原料',
  pageKey: 'editMaterial',
  longKey: 'productManagement.aiCoalBlending.editMaterial',
  breadNav: [
    '智慧工厂',
    <Link href="/productManagement/aiCoalBlending">
      <a>智能配煤</a>
    </Link>,
    '编辑原料',
  ],
  pageTitle: '编辑原料',
  useBack: true,
};

const EditMaterial = props => {
  const [currentFormData, setCurrentFormData] = useState({});
  const router = useRouter();
  const { id } = getQuery();

  // 货品列表
  const [GoodsType, setGoodsType] = useState({});
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

  const handleEdit = async record => {
    const params = {
      inventoryId: id,
    };
    const res = await product.getDataList({ params });
    console.log(res);
    if (res.status === 0) {
      const record = res.result.data[0];
      const _form = {
        inventoryId: record.inventoryId,
        goodsName: record.goodsName,
        companyName: record.companyName,
        goodsType: GoodsType[record.goodsType],
        cooperation: record.cooperation,
        warningValue: record.warningValue ? `${Format.weight(record.warningValue)} 吨` : '-',
        limitValue: record.limitValue ? `${Format.weight(record.limitValue)} 吨/天` : '-',
        unitPrice: Format.price(record.unitPrice) * 1,
        standard_ad: record.ashContent && Format.percent(record.ashContent),
        standard_coal: record.cleanCoal && Format.percent(record.cleanCoal),

        standard_crc: record.cinder && (record.cinder / 100).toFixed(0),

        standard_fcd: record.carbon && Format.percent(record.carbon),
        standard_gangue: record.stone && Format.percent(record.stone),
        standard_gri: record.bond && Format.percent(record.bond),
        standard_mad: record.waterContent && Format.percent(record.waterContent),
        standard_middle: record.midCoal && Format.percent(record.midCoal),
        standard_mt: record.totalWaterContent && Format.percent(record.totalWaterContent),
        standard_r: record.recovery && Format.percent(record.recovery),
        standard_std: record.sulfur && Format.percent(record.sulfur),
        standard_vdaf: record.volatilization && Format.percent(record.volatilization),
        standard_y: record.colloid && Format.percent(record.colloid),
        standard_heat: record.heat && (record.heat / 100).toFixed(0),
      };
      setCurrentFormData(_form);
    }
  };
  // 提交数据
  const handleSubmit = async data => {
    const params = {
      id: data.id,
      inventoryId: data.inventoryId,
      companyName: data.companyName,
      goodsName: data.goodsName, //# 货品名称
      unitPrice: (data.unitPrice * 100).toFixed(0) * 1, //#成本单价
      waterContent: (data.standard_mad * 100).toFixed(0) * 1, //# 水分值
      ashContent: (data.standard_ad * 100).toFixed(0) * 1, //#灰分值
      volatilization: (data.standard_vdaf * 100).toFixed(0) * 1, //# 挥发值
      cinder: (data.standard_crc * 100).toFixed(0) * 1, //#焦渣特征
      sulfur: (data.standard_std * 100).toFixed(0) * 1, //# 全硫值
      carbon: (data.standard_fcd * 100).toFixed(0) * 1, //#固定碳值
      recovery: (data.standard_r * 100).toFixed(0) * 1, //# 回收值
      totalWaterContent: (data.standard_mt * 100).toFixed(0) * 1, //#全水分值
      bond: (data.standard_gri * 100).toFixed(0) * 1, //# 粘结指数值
      colloid: (data.standard_y * 100).toFixed(0) * 1, //#胶质层值
      stone: (data.standard_gangue * 100).toFixed(0) * 1, //#含矸石值
      midCoal: (data.standard_middle * 100).toFixed(0) * 1, //# 含中煤值
      cleanCoal: (data.standard_coal * 100).toFixed(0) * 1, //#含精煤值
      heat: (data.standard_heat * 100).toFixed(0) * 1, //#发热量
    };
    const res = await product.saveRawMaterial({ params });
    if (res.status === 0) {
      message.success('修改原料成功');
      router.push('/productManagement/aiCoalBlending');
    } else {
      message.error(res.detail || res.description);
    }
  };

  useEffect(() => {
    initGoodsType();
  }, []);
  useEffect(() => {
    handleEdit();
  }, [GoodsType]);
  return (
    <Layout {...routeView}>
      <Content>
        <section>
          <GoodsForm onSubmit={handleSubmit} formData={currentFormData} />
        </section>
      </Content>
    </Layout>
  );
};

export default EditMaterial;
