import { useState, useEffect } from 'react';
import { Layout, Content } from '@components';
import Table1 from './tables/table1';
import Table2 from './tables/table2';
import { poundSystem } from '@api';
import { getQuery } from '@utils/common';
const VirtualDetail = props => {
  const routeView = {
    title: '磅单详情',
    pageKey: 'virtualRecord',
    longKey: 'virtualRecord',
    breadNav: '磅单详情.',
    pageTitle: '磅单详情',
    useBack: true,
  };
  const [poundDetail, setPoundDetail] = useState({});

  const getPoundDetail = async () => {
    const params = {
      id: getQuery().id,
    };
    const res = await poundSystem.getOutStationDetail({ params });
    if (res.status === 0) {
      setPoundDetail(res.result);
    }
  };
  useEffect(() => {
    getPoundDetail();
  }, []);

  return (
    <Layout {...routeView}>
      <Content style={{ position: 'relative' }}>
        {!poundDetail.receiveOrSend ? (
          <Table1 poundDetail={poundDetail}></Table1>
        ) : (
          <Table2 poundDetail={poundDetail}></Table2>
        )}
      </Content>
    </Layout>
  );
};

export default VirtualDetail;
