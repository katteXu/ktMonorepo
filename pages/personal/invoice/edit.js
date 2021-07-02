/** @format */

import { useState, useEffect } from 'react';
import { Layout, Content, Image } from '@components';
import { message } from 'antd';
import personalApi from '@api/personalCenter';
import router from 'next/router';
import Link from 'next/link';
import { getQuery } from '@utils/common';
import InvoiceForm from '@components/Personal/invoiceForm';

const Edit = props => {
  const routeView = {
    title: '开票信息编辑',
    pageKey: 'personal',
    longKey: 'personal',
    // breadNav: '个人中心.开票信息.信息编辑',
    breadNav: [
      <Link href="/personal">
        <a>个人中心</a>
      </Link>,
      <Link href="/personal">
        <a>开票信息</a>
      </Link>,
      '信息编辑',
    ],
    useBack: true,
    pageTitle: '编辑开票信息',
  };

  const [formData, setFormData] = useState();

  useEffect(() => {
    const { status } = getQuery();
    if (status !== 'new') {
      getInvoiceInfo();
    }
  }, []);

  // 获取开票信息
  const getInvoiceInfo = async () => {
    const res = await personalApi.getInvoiceInfo({});
    if (res.status === 0) {
      setFormData(res.result);
    }
  };

  // 表单提交
  const handleSubmit = async values => {
    const { status } = getQuery();
    let res;
    const {
      taxpayerNumber,
      bankName,
      cardNumber,
      companyAddress,
      invoicePhone,
      receiveName,
      receivePhone,
      areaPicker,
      receiveAddress,
    } = values;
    const params = {
      taxpayerNumber,
      bankName,
      cardNumber,
      companyAddress,
      invoicePhone,
      receiveName,
      receivePhone,
      receiveAddress: receiveAddress,
      receiveProvince: areaPicker[0],
      receiveCity: areaPicker[1],
      receiveDistrict: areaPicker[2],
    };
    if (status === 'new') {
      res = await personalApi.addInvoiceInfo({ params });
    } else {
      res = await personalApi.updateInvoiceInfo({ params });
    }
    if (res.status == 0) {
      message.success('开票信息修改成功');
      router.back();
    } else {
      message.error(`开票信息修改失败，原因：${res.description || res.detail}`);
    }
  };
  console.log(formData);
  return (
    <Layout {...routeView}>
      <Content>
        <header>编辑开票信息</header>
        <section style={{ position: 'relative' }}>
          <InvoiceForm onSubmit={handleSubmit} data={formData} />
          <div
            style={{
              position: 'absolute',
              top: 15,
              right: 50,
              width: '50%',
              maxWidth: 950,
              textAlign: 'center',
            }}>
            <img src={Image.InvoiceExample} style={{ width: '60%' }} alt="" />
            <div style={{ textAlign: 'center', width: '60%', fontSize: 16, margin: '0 auto' }}>参考图</div>
          </div>
        </section>
      </Content>
    </Layout>
  );
};

export default Edit;
