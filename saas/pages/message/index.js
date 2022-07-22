/** @format */

import { useState, useEffect, useCallback } from 'react';
import { Layout } from '@components';
import { getMessage, setMsgReaded } from '@api';
import { List, Button } from 'antd';
import Content from '@components/Content';
import styles from './styles.less';
import moment from 'moment';
import { getState, clearState } from '@utils/common';
import { Message as Msg } from '@store';

const Message = props => {
  const routeView = {
    title: '消息列表',
    pageKey: 'message',
    longKey: 'message',
    breadNav: '消息列表',
    pageTitle: '消息列表',
  };

  // 查询条件
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
  });

  const [list, setList] = useState([]);
  const [count, setCount] = useState('');

  const { reloadMessages } = Msg.useContainer();

  useEffect(() => {
    const { isServer } = props;
    if (isServer) {
      clearState();
    }
    // 获取持久化数据
    const state = getState().query;
    getMessageList(state);
  }, []);

  const getMessageList = ({ page, pageSize }) => {
    const params = {
      limit: pageSize,
      page,
    };
    getMessage({ params }).then(res => {
      if (res.status === 0) {
        setList(res.result.data);
        setCount(res.result.count);
      }
    });
  };

  // 翻页
  const onChangePage = useCallback(
    (page, pageSize) => {
      setQuery({ ...query, page, pageSize });
      getMessageList({ ...query, page, pageSize });
    },
    [list]
  );

  // 切换最大页数
  const onChangePageSize = useCallback(
    (current, pageSize) => {
      setQuery({ ...query, page: 1, pageSize });
      getMessageList({ ...query, page: 1, pageSize });
    },
    [list]
  );

  // 全部设为已读
  const setAllReaded = () => {
    setMsgReaded().then(res => {
      getMessageList(query);
      reloadMessages();
    });
  };

  return (
    <Layout {...routeView}>
      <Content>
        <header>
          全部消息
          <Button style={{ float: 'right' }} type="link" onClick={setAllReaded}>
            全部已读
          </Button>
        </header>
        <section className={styles.main}>
          <List
            loading={false}
            itemLayout="vertical"
            title="消息列表"
            dataSource={list}
            pagination={{
              onChange: onChangePage,
              pageSize: query.pageSize,
              current: query.page,
              total: count,
            }}
            renderItem={item => (
              <List.Item style={{ padding: '0 20px' }}>
                <div style={{ padding: '0 20px', position: 'relative' }}>
                  <div style={{ fontSize: 14, color: '#848485' }}>{item.text}</div>
                  <div
                    style={{
                      fontSize: 14,
                      marginTop: 30,
                      color: 'rgba(0,0,0,0.25)',
                    }}>
                    {moment(item.createdAt).format('YYYY.MM.DD HH:mm')}
                  </div>

                  <i
                    className={styles['message-status']}
                    style={{
                      backgroundColor: item.isReaded ? '#D8D8D8' : '#E44040',
                    }}
                  />
                </div>
              </List.Item>
            )}
          />
        </section>
      </Content>
    </Layout>
  );
};

Message.getInitialProps = async props => {
  const { isServer } = props;
  return { isServer };
};

export default Message;
