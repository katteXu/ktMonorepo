/** @format */

import React, { PureComponent } from 'react';
import Layout from '@components/Layout';
import Content from '@components/Content';
import styles from './styles.less';
import { message } from 'antd';
import personalApi from '@api/personalCenter';
import router from 'next/router';
import Link from 'next/link';
import PwdForm from '@components/Personal/pwdForm';

const PwdEdit = props => {
  const routeView = {
    title: '修改密码',
    pageKey: 'personal',
    longKey: 'personal',
    // breadNav: '个人中心.修改密码',
    breadNav: [
      <Link href="/personalNew">
        <a>个人中心</a>
      </Link>,
      '修改密码',
    ],
    useBack: true,
    pageTitle: '修改密码',
  };

  // 提交
  const handleSubmit = async values => {
    const params = values;
    const res = await personalApi.resetPasswordBySms({ params });
    if (res.status === 0) {
      message.success('密码修改成功');
      router.push('/personalNew');
    } else {
      message.error(`密码修改失败，${res.detail ? res.detail : res.description}`);
    }
  };
  return (
    <Layout {...routeView}>
      <Content>
        <header>修改密码</header>
        <section className={styles.part} style={{ paddingLeft: 48, paddingBottom: 48 }}>
          <PwdForm onSubmit={handleSubmit} />
        </section>
      </Content>
    </Layout>
  );
};

export default PwdEdit;
