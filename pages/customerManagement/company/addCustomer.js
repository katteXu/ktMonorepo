import Layout from '@components/Layout';
import Link from 'next/link';
import { Content, ChildTitle } from '@components';
import AddCustomerFrom from '@components/CustomerDetail/company/addCustomerFrom';

const addCustomer = () => {
  const routeView = {
    title: '我的客户',
    pageKey: 'company',
    longKey: 'customerManagement.company',
    breadNav: [
      '我的客户',
      <Link href="/customerManagement/company">
        <a>客户管理</a>
      </Link>,
      '创建客户',
    ],
    pageTitle: '创建客户',
    useBack: true,
  };
  return (
    <Layout {...routeView}>
      <Content>
        <section>
          <ChildTitle style={{ margin: '8px 0 16px' }}>
            <div
              style={{
                fontSize: 16,
                color: '#333333',
                fontWeight: 700,
                position: 'relative',
                top: 1,
              }}>
              基本信息
            </div>
          </ChildTitle>
          <div style={{ width: 580 }}>
            <AddCustomerFrom />
          </div>
        </section>
      </Content>
    </Layout>
  );
};

export default addCustomer;
