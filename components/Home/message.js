import styles from './styles.less';
import { useEffect, useState } from 'react';
import { finance } from '@api';
import Link from 'next/link';
import router from 'next/router';
import moment from 'moment';
import { Button } from 'antd';
import { RightOutlined } from '@ant-design/icons';
const TopMessage = () => {
  const [message, setMessage] = useState();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  // const [url, setUrl] = useState();
  useEffect(() => {
    showMessage();
  }, []);

  // 提示开票驳回
  const showMessage = async () => {
    const params = {
      status: 'REJECT_APPROVE',
      limit: 4,
    };

    setLoading(true);
    const res = await finance.getInvoiceList({ params });

    if (res.status === 0) {
      if (res.result.data.length > 0) {
        const data = res.result.data.filter((item, index) => index < 2);
        setList(data);
        setTotal(res.result.count);
      } else {
        setMessage(false);
      }
    }

    setLoading(false);
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
    <div className={styles['main-message']}>
      <div className={styles.header}>
        <div className={styles.txt}>
          重要提醒
          <span className={styles.dot}>{total}</span>
        </div>

        <Button type="link" size="small" onClick={view} disabled={list.length === 0}>
          查看所有
          <RightOutlined
            style={{
              width: 8,
              height: 12,
              marginLeft: 2,
              color: list.length === 0 ? '#00000040' : '#477aef',
            }}
          />
        </Button>
      </div>

      <div className={styles.list}>
        {loading ? (
          <div className={styles.loading}>加载中...</div>
        ) : (
          <>
            {list.length > 0 ? (
              list.map((item, key) => {
                const { id, batchId, payType } = item;
                const mode = 'edit';
                const url = `/finance/invoiceList/record?id=${id}&&mode=${mode}&&batchId=${batchId}&&payType=${payType}&&status=REJECT_APPROVE`;
                return (
                  <div className={styles.item} key={key}>
                    <div className={styles.content}>您有开票申请已被驳回，请及时查看以免影响开票流程</div>
                    <div className={styles.bottom}>
                      <div className={styles.date}>{moment(item.createdAt).format('YYYY.MM.DD')}</div>
                      <Link href={url}>
                        <a className={styles['view-btn']}>查看</a>
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.empty}>暂无提醒</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TopMessage;
