import React, { useState, useEffect } from 'react';
import Router from 'next/router';
import styles from './main.less';
import '@styles/main.less';
import Head from 'next/head';
import SiderMenu from './SiderMenu';
import BreadNav from './BreadNav';
import TopBar from './TopBar';
import DragButton from './DragButton';
import { Layout, Table, Pagination, Modal, DatePicker } from 'antd';

const { Content, Sider } = Layout;
import { DrawerInfo, Icon } from '@components';

const Index = props => {
  const { children, title = '首页', pageKey = 'home', ...rest } = props;
  const [customerModal, setCustomerModal] = useState(false);
  useEffect(() => {
    Table.defaultProps = {
      ...Table.defaultProps,
      size: 'middle',
      bordered: false,
      rowKey: 'id',
      loading: false,
    };
    Pagination.defaultProps = {
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '50', '100'],
      showTotal: (total, range) => <span>总共 {total} 条</span>,
    };
    Modal.defaultProps = {
      ...Modal.defaultProps,
      maskClosable: false,
      width: 480,
      centered: true,
    };
    DatePicker.RangePicker.defaultProps = {
      ...DatePicker.RangePicker.defaultProps,
      placeholder: ['开始时间', '结束时间'],
    };
  }, []);
  return (
    <Layout>
      <Head>
        <title>{title}</title>
        <link rel="shortcut icon" type="image/x-icon" href={Icon.LinkIcon} />
      </Head>
      <Sider
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          zIndex: 99,
          left: 0,
        }}>
        <div
          style={{
            textAlign: 'center',
            marginBottom: 16,
          }}>
          <img
            src={Icon.Logo}
            style={{
              backgroundColor: '#1C2A3F',
              width: '150px',
              cursor: 'pointer',
            }}
            onClick={() => Router.push(indexUrl || '/home')}
          />
        </div>
        <SiderMenu {...rest} pageKey={pageKey}></SiderMenu>
      </Sider>
      <Layout
        style={{
          marginLeft: 200,
          minHeight: '100vh',
          minWidth: 1000,
          background: '#F0F2F5',
        }}>
        <TopBar />
        {rest.breadNav && (
          <BreadNav
            breadNav={rest.breadNav}
            useBack={rest.useBack}
            backUrl={rest.backUrl}
            rightArea={rest.rightArea}
            pageTitle={rest.pageTitle}
            activeKey={rest.activeKey}
            changeTab={rest.changeTab}></BreadNav>
        )}
        <Content style={{ padding: '16px', overflow: 'initial' }}>{children || '暂无内容'}</Content>
        <DragButton onClick={() => setCustomerModal(true)} />
      </Layout>
      <DrawerInfo onClose={() => setCustomerModal(false)} showDrawer={customerModal} width={304}>
        <div>
          <div className={styles.customerTop}>
            <img src={Icon.People} className={styles.people} />
            <div>方向云致力带给您最优质的体验，</div>
            <div className={styles.topText}>如有任何问题请致电客服</div>
            <div className={styles.phone}>400-690-8700</div>
            <div className={styles.customerBottom}>
              <div>感谢您一直以来对方向物流的支持 </div>
              <div>卡车司机（北京）科技有限公司</div>
            </div>
          </div>
        </div>
      </DrawerInfo>
    </Layout>
  );
};

export default Index;
