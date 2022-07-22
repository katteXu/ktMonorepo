import { useState, useEffect } from 'react';
import { Layout } from '@components';
import { Select } from 'antd';
import styles from './styles.less';
import { User } from '@store';
const { Option } = Select;
// 企业id对应配置
const config = {
  1990: 'haineng', // 海能企业测试  18567382386
  1765: 'haineng', //海能正式
  3082: 'hongshengjia', // 宏盛佳测试  15530130150
  5731: 'hongshengjia', // 宏盛佳正式
  2432: 'laiyuan', //来源测试 18668105441
  84338: 'laiyuan', //来源正式
};
const VRIframe = props => {
  const { userInfo, loading } = User.useContainer();
  const routeView = {
    title: '全景VR',
    pageKey: 'vriframe',
    longKey: 'productManagement.vriframe',
    breadNav: '智慧工厂.全景VR',
    pageTitle: '全景VR',
  };

  const [company, setCompany] = useState('');
  useEffect(() => {
    setCompany(config[userInfo.bossId]);
  }, [loading]);
  return (
    <Layout {...routeView}>
      {company ? (
        <iframe
          src={`//vr.kachexiongdi.com?company=${company}`}
          title="iframe"
          style={{ width: '100%', border: 0, height: '100%' }}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          scrolling="auto"></iframe>
      ) : (
        <div className={styles.empty}>全景厂区暂无</div>
      )}
    </Layout>
  );
};

export default VRIframe;
