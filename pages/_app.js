import 'antd/dist/antd.css';
import '@styles/main.less';
import { User, Menu, Permission, Message, WhiteList } from '@store';
import { ConfigProvider, Table, Pagination, Modal, DatePicker, message } from 'antd';
import zh_cn from 'antd/lib/locale/zh_CN';
import NProgress from 'nprogress';
import { useEffect } from 'react';
import router from 'next/router';

NProgress.configure({
  showSpinner: false,
});
router.events.on('routeChangeStart', url => {
  NProgress.start();
});
router.events.on('routeChangeComplete', url => {
  NProgress.done(true);
});
router.events.on('routeChangeError', () => NProgress.done(true));

function MyApp({ Component, pageProps }) {
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

    message.config({
      duration: 2,
      maxCount: 1,
    });
  });

  return (
    // 白名单
    <WhiteList.Provider>
      {/* 用户数据 */}
      <User.Provider>
        {/* 菜单数据 */}
        <Menu.Provider>
          {/* 消息数据 */}
          <Message.Provider>
            {/* 权限数据 */}
            <Permission.Provider>
              {/* antd配置 */}
              <ConfigProvider locale={zh_cn}>
                <Component {...pageProps} />
              </ConfigProvider>
            </Permission.Provider>
          </Message.Provider>
        </Menu.Provider>
      </User.Provider>
    </WhiteList.Provider>
  );
}

export default MyApp;
