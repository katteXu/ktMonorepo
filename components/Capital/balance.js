import styles from './styles.less';
import { Button } from 'antd';
import router from 'next/router';
import { Image } from '@components';
const Balance = ({ children, wallet, exclusiveRechargeAccount, prepaid, prepaidFreight }) => {
  return (
    <div className={styles.wallet} style={{ backgroundImage: `url(${Image.BgCard})`, backgroundPosition: '-2px 0' }}>
      <div style={{ fontSize: 16, fontWeight: 'bold' }}>{children}</div>
      <div className={styles.money}>
        <span className={styles.icon}>￥</span>
        <span className={styles.number}>{wallet ? (wallet / 100).toFixed(2) : 0}</span>
        <span className={styles.unitName}>元</span>
      </div>
      <div style={{ marginTop: 20 }}>
        {prepaid ? (
          <Button type="primary" onClick={() => prepaidFreight()}>
            预付运费
          </Button>
        ) : (
          <div>
            <Button type="primary" ghost onClick={() => exclusiveRechargeAccount()}>
              专属充值账号
            </Button>
            <Button className={styles.btn} type="primary" ghost onClick={() => router.push('/finance/fund/cashOut')}>
              提现
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Balance;
