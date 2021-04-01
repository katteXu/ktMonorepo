import React, { useState, useEffect } from 'react';
import { Layout } from '@components';
import { Modal } from 'antd';
import { Format, getQuery } from '@utils/common';
import GoodsDetail from '@components/GoodsManagement/GoodsDetail';
import AddStockForm from '@components/Inventory/inventoryWater/addStockForm';
import AddStockOutForm from '@components/Inventory/inventoryWater/addStockOutForm';
import { product } from '@api';
import { useRouter } from 'next/router';

const routeView = {
  title: '货品管理',
  pageKey: 'goodsManagement',
  longKey: 'goodsManagement',
  breadNav: ['货品管理', '货品管理详情'],
  pageTitle: '货品管理详情',
  useBack: true,
};

const GoodsManagement = props => {
  const router = useRouter();
  const { id } = getQuery();
  const [showInModal, setShowInModal] = useState(false);
  const [showOutModal, setShowOutModal] = useState(false);
  const [rowData, setRowData] = useState({});
  const [formData, setFormData] = useState({});
  const [getListNow, setGetListNow] = useState(false);

  const getGoods = async () => {
    const params = {
      id: id,
    };
    const res = await product.getGoodsDetail({ params });

    const {
      waterContentMin,
      waterContentMax,
      ashContentMin,
      ashContentMax,
      volatilizationMin,
      volatilizationMax,
      cinder,
      sulfurMin,
      sulfurMax,
      carbonMin,
      carbonMax,
      recoveryMin,
      recoveryMax,
      totalWaterContentMin,
      totalWaterContentMax,
      bondMin,
      bondMax,
      colloidMin,
      colloidMax,
      stoneMin,
      stoneMax,
      midCoalMin,
      midCoalMax,
      cleanCoalMin,
      cleanCoalMax,
      rawMaterial,
      unitPrice,
    } = res.result.goodsComponent;

    const data = {
      id,
      goodsType: res.result.goodsType || '-',
      goodsName: res.result.goodsName,
      inventoryValue: res.result.inventoryValue,
      unitPrice: unitPrice ? (unitPrice / 100).toFixed(2) : '-',
      materials: rawMaterial === 1 ? '是' : '否',
      standard_mad: Format.range(waterContentMin, waterContentMax),
      standard_ad: Format.range(ashContentMin, ashContentMax),
      standard_vdaf: Format.range(volatilizationMin, volatilizationMax),
      standard_crc: cinder ? (cinder / 100).toFixed(0) : '-',
      standard_std: Format.range(sulfurMin, sulfurMax),
      standard_fcd: Format.range(carbonMin, carbonMax),
      standard_r: Format.range(recoveryMin, recoveryMax),
      standard_mt: Format.range(totalWaterContentMin, totalWaterContentMax),
      standard_gri: Format.range(bondMin, bondMax),
      standard_y: Format.range(colloidMin, colloidMax),
      standard_gangue: Format.range(stoneMin, stoneMax),
      standard_middle: Format.range(midCoalMin, midCoalMax),
      standard_coal: Format.range(cleanCoalMin, cleanCoalMax),
    };

    setRowData(data);
    setFormData({ id: id, goodsType: res.result.goodsName });
  };
  useEffect(() => {
    getGoods();
  }, []);
  return (
    <Layout {...routeView}>
      <GoodsDetail
        rowData={rowData}
        setGetListNow={setGetListNow}
        getListNow={getListNow}
        setShowInModal={setShowInModal}
        setShowOutModal={setShowOutModal}
      />
      <Modal
        title="新增入库"
        visible={showInModal}
        destroyOnClose
        footer={null}
        width={640}
        onCancel={() => {
          setShowInModal(false);
        }}>
        <AddStockForm
          formData={formData}
          onSubmit={() => {
            setShowInModal(false);
            setGetListNow(true);
            getGoods();
          }}
          onClose={() => {
            setShowInModal(false);
          }}></AddStockForm>
      </Modal>
      <Modal
        title="新增出库"
        visible={showOutModal}
        destroyOnClose
        footer={null}
        width={640}
        onCancel={() => {
          setShowOutModal(false);
        }}>
        <AddStockOutForm
          formData={formData}
          onSubmit={() => {
            setShowOutModal(false);
            setGetListNow(true);
            getGoods();
          }}
          onClose={() => {
            setShowOutModal(false);
          }}></AddStockOutForm>
      </Modal>
    </Layout>
  );
};

export default GoodsManagement;
