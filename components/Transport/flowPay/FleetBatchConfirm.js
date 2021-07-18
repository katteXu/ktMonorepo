// 车队批量结算
import { useState, useEffect } from 'react';
import { Steps, Button, Tooltip } from 'antd';
import { CloseCircleFilled, InfoCircleFilled, CheckCircleFilled } from '@ant-design/icons';
import { Format } from '@utils/common';
import styles from './styles.less';
import PayPasswordInput from '@components/common/PayPasswordInput';
import { transportStatistics } from '@api';
const FinishType = {
  success: { title: '支付完成', status: '' },
  fail: { title: '支付失败', status: '' },
  loading: { title: '支付中', status: '' },
};

// 第一步
const DetailStep = ({ totalGoodsWeight, totalArrivalGoodsWeight, transportCount, realPrice, totalInfoFee }) => {
  return (
    <div className={styles['detail-step']}>
      <div className={styles['data-row']}>运输车次：{transportCount || 0} 辆</div>
      <div className={styles['data-row']}>
        <div className={styles['inline']}>发货净重：{Format.weight(totalGoodsWeight)} 吨</div>
        <div className={styles['inline']}>收货净重：{Format.weight(totalArrivalGoodsWeight)} 吨</div>
      </div>
      <div className={styles['data-row']}>
        结算运费：¥
        <span style={{ color: '#477AEF', fontSize: 16, padding: '0 4px', fontWeight: 600 }}>
          {Format.price(realPrice + totalInfoFee)}
        </span>
        元
      </div>
    </div>
  );
};

// 第二步
const PayStep = ({ onChange, price }) => {
  return (
    <div className={styles['pay-step']} style={{ height: 163 }}>
      <div className={styles.title}>支付总额</div>
      <div className={styles.price}>
        ￥<span className={styles.number}>{Format.price(price)}</span>元
        <Tooltip
          overlayStyle={{ maxWidth: 'max-content', padding: '0 12px' }}
          title={<div>常见费用问题请联系客服核对并修改</div>}>
          <span className={styles.alert}>费用有误?</span>
        </Tooltip>
      </div>
      <div className={styles.password}>
        <span>支付密码：</span>
        <PayPasswordInput onChange={onChange} />
        <Tooltip
          placement="topRight"
          title={
            '进入方向物流app -> 登录账号 -> 点击”我的”-> 点击”设置” -> 点击”密码管理” ->点击”修改支付密码” -> 设置密码'
          }>
          <span className={styles.forget}>忘记密码？</span>
        </Tooltip>
      </div>
    </div>
  );
};

// 第三步
const ResultStep = ({ title, content, icon }) => {
  return (
    <div className={styles['result-step']}>
      {icon}
      <div className={styles.title}>{title}</div>
      <div className={styles.content}>{content}</div>
    </div>
  );
};

const FleetBatchConfirm = ({ payInfo, payId, onFinish, rides }) => {
  // 当前步骤
  const [step, setStep] = useState(0);
  // 最终步骤文案
  const [finish, setFinish] = useState('success');

  // 支付密码 & 错误信息 & 支付等待 & 支付结果
  const [password, setPassword] = useState({});
  const [errMsg, setErrMsg] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [result, setResult] = useState();

  // 结果信息
  const [resultInfo, setResultInfo] = useState({});

  // 支付结果监听
  useEffect(() => {
    if (!result) return;
    if (result.status === 0) {
      // 支付成功
      setResultInfo({
        status: 'success',
        title: '支付成功',
        icon: <CheckCircleFilled style={{ color: '#66BD7E', fontSize: 47 }} />,
        content: (
          <>
            <div>￥</div>
            <div style={{ color: '#477AEF', fontSize: 20, margin: '0 4px' }}>{Format.price(payInfo.realPrice)}</div>
            <div>元</div>
          </>
        ),
      });
      // 支付完成去下一步
      toNext();
    } else if (result.status === 1) {
      // 未知错误请联系客服
      setResultInfo({
        status: 'fail',
        title: '支付失败',
        icon: <CloseCircleFilled style={{ color: '#e44040', fontSize: 47 }} />,
        detail: (
          <div>
            请联系客服 <span style={{ color: '#477AEF' }}>400-690-8700</span>
          </div>
        ),
      });
      // 支付完成去下一步
      toNext();
    } else if (result.status === 16) {
      // 密码输入错误展示
      setErrMsg(result.detail);
    } else if (result.status === 18) {
      // 支付中
      setResultInfo({
        status: 'loading',
        title: '支付中',
        icon: <InfoCircleFilled style={{ color: '#FFB741', fontSize: 47 }} />,
        content: <div style={{ textAlign: 'center' }}>{result.detail || result.description}</div>,
      });
      // 支付完成去下一步
      toNext();
    } else {
      // 其他支付错误
      setResultInfo({
        status: 'fail',
        title: '支付失败',
        icon: <CloseCircleFilled style={{ color: '#e44040', fontSize: 47 }} />,
        content: <div style={{ textAlign: 'center' }}>{result.detail || result.description}</div>,
      });
      // 支付完成去下一步
      toNext();
    }
  }, [result]);

  // 监听结果信息
  useEffect(() => {
    const { status } = resultInfo;
    if (!status) return;
    setFinish(status);
  }, [resultInfo]);

  // 上一步
  const toNext = () => {
    const current = (step + 1) % 3;
    setStep(current);
  };

  // 下一步
  const toPrev = () => {
    const current = (step - 1) % 3;
    setStep(current);
  };

  // 立即支付
  const pay = async () => {
    if (Object.keys(password).length === 6) {
      // 请求前设置状态
      setPayLoading(true);
      setErrMsg('');
      const res = await submit({ password });
      setResult(res);
      setPayLoading(false);
    } else {
      setErrMsg('请输入完整密码');
      return;
    }
  };

  // 支付提交
  const submit = ({ password }) => {
    const params = {
      tides: payId.join(' '),
      oldPrice: payInfo.realPrice + payInfo.totalInfoFee,
      payPass: {
        passOne: password[0].value,
        passTwo: password[1].value,
        passThree: password[2].value,
        passFour: password[3].value,
        passFive: password[4].value,
        passSix: password[5].value,
      },
      rides: rides,
      payTime: payInfo.nowTime,
    };

    const res = transportStatistics.goPayTransport({ params });
    return res;
  };

  return (
    <div className={styles['flow-pay']}>
      <Steps size="small" current={step} style={{ marginBottom: 32 }}>
        <Steps.Step title="运单确认" />
        <Steps.Step title="运单支付" />
        <Steps.Step title={FinishType[finish].title} />
      </Steps>
      {/* 详细信息 */}
      {step === 0 && (
        <div className={styles['step-block']} style={{ height: 147 }}>
          <DetailStep {...payInfo} />
          <div className={styles.bottom}>
            <Button type="primary" onClick={toNext}>
              下一步
            </Button>
          </div>
        </div>
      )}
      {/* 支付密码 */}
      {step === 1 && (
        <div className={styles['step-block']} style={{ height: 163 }}>
          <PayStep onChange={setPassword} price={payInfo.realPrice + payInfo.totalInfoFee} />
          <div className={styles['error-message']}>{errMsg}</div>
          <div className={styles.bottom}>
            <Button onClick={toPrev} disabled={payLoading}>
              上一步
            </Button>
            <Button className={styles['pay-btn']} type="primary" onClick={pay} loading={payLoading}>
              立即支付
            </Button>
          </div>
        </div>
      )}
      {/* 支付结果 */}
      {step === 2 && (
        <div className={styles['step-block']}>
          <ResultStep {...resultInfo} />
          <div className={styles.bottom}>
            <Button onClick={onFinish} type="primary">
              确定
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetBatchConfirm;
