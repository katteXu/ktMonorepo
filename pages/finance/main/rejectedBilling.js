import { useState } from 'react';
import { Layout, Content } from '@components';
import BillingComponent from '@components/Finance/rejected/Billing';
import RecordComponent from '@components/Finance/rejected/BillingRecord';
const RejectedBilling = props => {
  const routeView = {
    title: '开票信息',
    pageKey: 'main',
    longKey: 'finance.main',
    breadNav: '财务中心.开票信息.驳回补充',
    pageTitle: '驳回补充',
    useBack: true,
  };

  const [step, setStep] = useState(0);

  const handleChangeStep = () => {
    setStep((step + 1) % 2);
  };

  return (
    <Layout {...routeView}>
      <Content style={{ marginBottom: 56 }}>
        <section>
          {step === 0 && <BillingComponent isServer={props.isServer} onChangeStep={handleChangeStep} />}
          {step === 1 && <RecordComponent onChangeStep={handleChangeStep} />}
        </section>
      </Content>
    </Layout>
  );
};

RejectedBilling.getInitialProps = props => {
  const { isServer } = props;
  return { isServer };
};

export default RejectedBilling;
