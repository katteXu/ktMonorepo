import { useState } from 'react';
import { Layout, Content } from '@components';
import BillingComponent from '@components/Finance/main/Billing';
import UnBillingComponent from '@components/Finance/main/UnBilling';
import RecordComponent from '@components/Finance/main/BillingRecord';
import { WhiteList } from '@store';
const Billing = props => {
  const { whiteList } = WhiteList.useContainer();

  const routeView = {
    title: '开票信息',
    pageKey: 'main',
    longKey: 'finance.main',
    breadNav: '财务中心.开票信息.索取发票',
    pageTitle: '索取发票',
    useBack: true,
  };

  const [status, setStatus] = useState('billing');
  const [step, setStep] = useState(0);
  const changeTab = tab => {
    setStatus(tab);
  };

  const handleChangeStep = () => {
    setStep((step + 1) % 2);
  };

  return (
    <Layout {...routeView}>
      <Content style={{ marginBottom: 56 }}>
        <header className="tab-header">
          <div className={`tab-item ${status === 'billing' ? 'active' : ''}`} onClick={() => changeTab('billing')}>
            待申请开票
          </div>
          {(!whiteList.heShun || step === 0) && (
            <div
              className={`tab-item ${status === 'un_billing' ? 'active' : ''}`}
              onClick={() => changeTab('un_billing')}>
              暂不开票
            </div>
          )}
        </header>
        <section>
          {/* 索取发票 */}
          {status === 'billing' && (
            <div>
              {step === 0 && <BillingComponent isServer={props.isServer} onChangeStep={handleChangeStep} />}
              {step === 1 && <RecordComponent onChangeStep={handleChangeStep} />}
            </div>
          )}
          {/* 暂不开票 */}
          {status === 'un_billing' && (
            <div>
              <UnBillingComponent isServer={props.isServer} />
            </div>
          )}
        </section>
      </Content>
    </Layout>
  );
};

export default Billing;
