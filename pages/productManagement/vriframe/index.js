import { useState, useEffect, useCallback } from 'react';
import router from 'next/router';
import moment from 'moment';
import { Layout, Search, Content, Status, Ellipsis } from '@components';
import { Input, Button, Table, message, DatePicker, Select } from 'antd';
import { keepState, getState, clearState, Format } from '@utils/common';
import { railWay, downLoadFile } from '@api';
import LoadingBtn from '@components/LoadingBtn';

const { Option } = Select;
const VRIframe = props => {
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
        src="http://vr.kachexiongdi.com/"
        title="iframe"
        style={{ width: '100%', border: 0, height: '100%' }}
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        scrolling="auto"></iframe>
    </Layout>
  );
};

VRIframe.getInitialProps = async props => {
  const { isServer } = props;
  return { isServer };
};
export default VRIframe;
