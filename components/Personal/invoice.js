/** @format */
import { useState, useEffect } from 'react';
import { Content } from '@components';
import { Button, Modal } from 'antd';
import styles from './personal.less';
import personalApi from '@api/personalCenter';
import router from 'next/router';
import { QuestionCircleFilled } from '@ant-design/icons';
import { User } from '@store';
const Invoice = props => {
  const {
    userInfo: { is_boss },
  } = User.useContainer();
  const [userInfo, setUserInfo] = useState({});
  const [bossId, setBossId] = useState('');

  useEffect(() => {
    getInvoiceInfo();
    // const { bossId } = localStorage;
    // setBossId(bossId);
  }, []);

  const getInvoiceInfo = async () => {
    const res = await personalApi.getInvoiceInfo({});
    if (res.status == 0) {
      setUserInfo(res.result);
    } else if (res.status == 8) {
      Modal.confirm({
        title: '您还没有设置开票信息，请前往设置',
        icon: <QuestionCircleFilled />,
        onOk: () => {
          router.replace({
            pathname: '/personal/invoice/edit',
            query: { status: 'new' },
          });
        },
        onCancel: () => {},
      });
    }
  };
  return (
    <Content style={{ minHeight: 557 }}>
      <section className={styles.invoice}>
        <div className="info-row" style={{ height: 40 }}>
          <span className="info-label" style={{ textAlign: 'left' }}>
            税号：
          </span>
          <span className="info-data">{userInfo.taxpayerNumber}</span>
        </div>
        <div className="info-row" style={{ height: 40 }}>
          <span className="info-label" style={{ textAlign: 'left' }}>
            开户行：
          </span>
          <span className="info-data">{userInfo.bankName}</span>
        </div>
        <div className="info-row" style={{ height: 40 }}>
          <span className="info-label" style={{ textAlign: 'left' }}>
            开户账号：
          </span>
          <span className="info-data">{userInfo.cardNumber}</span>
        </div>
        <div className="info-row" style={{ height: 40 }}>
          <span className="info-label" style={{ textAlign: 'left' }}>
            地址：
          </span>
          <span className="info-data">{userInfo.companyAddress}</span>
        </div>
        <div className="info-row" style={{ height: 40 }}>
          <span className="info-label" style={{ textAlign: 'left' }}>
            联系电话：
          </span>
          <span className="info-data">{userInfo.invoicePhone}</span>
        </div>
        <div className="info-row" style={{ height: 40 }}>
          <span className="info-label" style={{ textAlign: 'left' }}>
            收票人：
          </span>
          <span className="info-data">{userInfo.receiveName}</span>
        </div>
        <div className="info-row" style={{ height: 40 }}>
          <span className="info-label" style={{ textAlign: 'left' }}>
            收票人电话：
          </span>
          <span className="info-data">{userInfo.receivePhone}</span>
        </div>
        <div className="info-row" style={{ height: 40 }}>
          <span className="info-label" style={{ textAlign: 'left' }}>
            收票人地址：
          </span>
          <span className="info-data">
            {userInfo.receiveProvince
              ? `${userInfo.receiveProvince}${userInfo.receiveCity}${userInfo.receiveDistrict}${userInfo.receiveAddress}`
              : ''}
          </span>
        </div>
        <div className="info-row" style={{ height: 40 }}>
          <span className="info-label" style={{ textAlign: 'left' }}></span>
          <span className="info-data">
            {is_boss && (
              <Button
                style={{ float: 'left' }}
                onClick={() => {
                  router.push('/personal/invoice/edit');
                }}>
                修改
              </Button>
            )}
          </span>
        </div>
      </section>
    </Content>
  );
};

export default Invoice;
