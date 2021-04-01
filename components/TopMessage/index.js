import { Badge } from 'antd';
import styles from './styles.less';
import { useEffect, useState } from 'react';
import { finance } from '@api';
import Link from 'next/link';
import router from 'next/router';

import { RightOutlined } from '@ant-design/icons';
const TopMessage = () => {
  const [message, setMessage] = useState();
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  // const [url, setUrl] = useState();
  // useEffect(() => {
  //   showMessage();
  // }, [props.common.refreshTopMessage]);

  // 提示开票驳回
  const showMessage = async () => {
    const params = {
      status: 'REJECT_APPROVE',
      limit: 4,
    };
    const res = await finance.getInvoiceList({ params });
    if (res.status === 0) {
      if (res.result.data.length > 0) {
        setList(res.result.data);
        setMessage(true);
        setTotal(res.result.count);
      } else {
        setMessage(false);
      }
    }
  };

  const view = () => {
    // 设置选中驳回tab
    let query = sessionStorage.getItem('query') || '{}';
    query = JSON.parse(query);
    query.status = 'REJECT_APPROVE';
    sessionStorage.setItem('query', JSON.stringify(query));
    router.push('/finance/main?tab=REJECT_APPROVE');
  };
  return (
    <>
      {/* {message && (
        <Alert
          banner
          closable
          className={styles.message}
          message={
            <span>
              您的开票申请已被驳回，请及时查看以免影响到开票流程
              <Link href={url}>
                <a style={{ marginLeft: 5 }} onClick={view}>
                  查看
                </a>
              </Link>
            </span>
          }
        />
      )} */}
      {message && (
        <div className={styles['main-remind']}>
          <div className={styles.title}>
            <div className={styles.txt}>
              <Badge count={total} offset={[10, 0]} style={{}}>
                重要提醒
              </Badge>
            </div>

            <a href="javascript:;" style={{ color: '#4A90E2' }} onClick={view}>
              查看所有
              <RightOutlined
                style={{
                  width: 8,
                  height: 12,
                  marginLeft: 2,
                  color: '#848485',
                }}
              />
            </a>
          </div>
          <div className={styles.list}>
            {list.map(item => {
              const { id, batchId, payType } = item;
              const mode = 'edit';
              const url = `/finance/invoiceList/record?id=${id}&&mode=${mode}&&batchId=${batchId}&&payType=${payType}&&status=REJECT_APPROVE`;
              return (
                <div className={styles.item}>
                  <div className={styles.content}>您有开票申请已被驳回，请及时查看以免影响开票流程</div>
                  <div className={styles.bottom}>
                    <div className={styles.date}>{item.createdAt}</div>
                    <Link href={url}>
                      <a className={styles['view-btn']}>查看</a>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default TopMessage;
