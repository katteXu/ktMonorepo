import router from 'next/router';
import Layout from '@components/Layout';
import { message } from 'antd';
import Content from '@components/Content';
import railWay from '@api/railWay';
import Link from 'next/link';
import RailWayForm from '@components/RailDetail/poundRailWayForm';
import { clearState } from '@utils/common';

const CreateRailWay = () => {
  const routeView = {
    title: '创建专线',
    pageKey: 'pound',
    longKey: 'railWay.pound',
    breadNav: [
      '专线管理',
      <Link href="/railWay/pound">
        <a>过磅专线</a>
      </Link>,
      '创建专线',
    ],
    pageTitle: '创建专线',
    useBack: true,
  };

  // 表单提交
  const submit = async data => {
    const res = await railWay.createRoute(data);
    if (res.status === 0) {
      message.success('专线创建成功');
      clearState();
      router.push('/railWay/pound');
    } else {
      message.error(`专线创建失败，原因：${res.detail || res.description}`);
    }
  };
  return (
    <Layout {...routeView}>
      <Content>
        <section style={{ paddingTop: 24 }}>
          <RailWayForm onSubmit={submit} />
        </section>
      </Content>
    </Layout>
  );
};

export default CreateRailWay;
