import Layout from '@components/Layout';
import Link from 'next/link';
import { Content } from '@components';
import AddContractFrom from '@components/contractManagement/contractFrom';

import styles from './customer.less';

const AddContract = props => {
  const routeView = {
    title: '新增合同',
    pageKey: 'contractManagement',
    longKey: 'contractManagement',
    breadNav: [
      '合同管理',
      <Link href="/contractManagement">
        <a>合同列表</a>
      </Link>,
      '新增合同',
    ],
    pageTitle: '新增合同',
    useBack: true,
  };
  return (
    <Layout {...routeView}>
      <Content>
        <section style={{ paddingTop: 24 }}>
          <div className={styles.root}>
            <AddContractFrom />
          </div>
        </section>
      </Content>
    </Layout>
  );
};

export default AddContract;
