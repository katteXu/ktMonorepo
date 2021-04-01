import { Layout } from '@components';

const VRIframe = () => {
  const routeView = {
    title: '全景VR',
    pageKey: 'vriframe',
    longKey: 'productManagement.vriframe',
    breadNav: '智慧工厂.全景VR',
    pageTitle: '全景VR',
  };

  return (
    <Layout {...routeView}>
      <iframe
        src="http://vr.kachexiongdi.com/pano-share.html?shareId=share_c04fa8088"
        title="iframe"
        style={{ width: '100%', border: 0, height: '100%' }}
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        scrolling="auto"></iframe>
    </Layout>
  );
};

export default VRIframe;
