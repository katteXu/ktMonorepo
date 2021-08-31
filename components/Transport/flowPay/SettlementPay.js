// 车队批量结算
import { useState, useEffect } from 'react';
import { Steps, Button, Tooltip, message, Modal } from 'antd';
import { CloseCircleFilled, InfoCircleFilled, CheckCircleFilled } from '@ant-design/icons';
import { Format } from '@utils/common';
import styles from './styles.less';
import PayPasswordInput from '@components/common/PayPasswordInput';
import { transportStatistics, getUserInfo } from '@api';
const FinishType = {
  success: { title: '支付完成', status: '' },
  fail: { title: '支付失败', status: '' },
  loading: { title: '支付中', status: '' },
};

// 第一步
const DetailStep = ({ arrivalGoodsWeight, goodsWeight, price, realPrice, unitName, payPath, totalInfoFee }) => {
  return (
    <div>
      <div className={styles.totalPay}>
        <div style={{ display: 'flex' }}>
          <div className={styles.settlementtruckNum}>
            发货净重: <span>{Format.weight(goodsWeight)}</span> {unitName || '吨'}
          </div>
          <div className={styles.SettlementtruckNum}>
            收货净重: <span>{Format.weight(arrivalGoodsWeight)}</span> {unitName || '吨'}
          </div>
        </div>
      </div>
      {payPath === 1 && (
        <div className={styles.payFooter}>
          <div className={styles.orderTotalNum}>
            信息费: ￥<span style={{ fontWeight: 600 }}>{Format.price(totalInfoFee)}</span> 元
          </div>
        </div>
      )}

      <div className={styles.payFooter}>
        <div className={styles.orderTotalNum}>
          结算费用: ￥
          <span style={{ fontWeight: 600 }}>{realPrice ? (realPrice * 1).toFixed(2) : Format.price(price)}</span> 元
        </div>
      </div>
      {payPath === 1 && (
        <div className={styles.payFooter}>
          <div className={styles.orderTotalNum}>
            合计: ￥
            <span style={{ fontWeight: 600 }}>
              {realPrice ? Format.addPrice(realPrice * 100 + totalInfoFee) : Format.addPrice(price + totalInfoFee)}
            </span>{' '}
            元
          </div>
        </div>
      )}
    </div>
  );
};

// 第二步
const PayStep = ({ onChange, price, totalInfoFee }) => {
  return (
    <div className={styles['pay-step']}>
      <div className={styles.title}>支付总额</div>
      <div className={styles.price}>
        ￥<span className={styles.number}>{Format.price(totalInfoFee + price)}</span>元
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

const SettlementPay = ({ payInfo, payId, onFinish, onSettlementPay, onConfirmSettlement, onclose, payRemark }) => {
  // 当前步骤
  const [step, setStep] = useState(0);
  // 最终步骤文案
  const [finish, setFinish] = useState('success');

  // 支付密码 & 错误信息 & 支付等待 & 支付结果
  const [password, setPassword] = useState({});
  const [errMsg, setErrMsg] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [result, setResult] = useState();
  const [nowTime, setNowTime] = useState();
  // 结果信息
  const [resultInfo, setResultInfo] = useState({});
  const [totalPrice, setTotalPrice] = useState();
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
            <div style={{ color: '#477AEF', fontSize: 16, margin: '0 4px' }}>{Format.price(payInfo.realPrice)}</div>
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
      const res = await paySubmit({ password });
      setPayLoading(false);
    } else {
      setErrMsg('请输入完整密码');
      return;
    }
  };

  // 支付提交
  const submit = ({ password }) => {
    console.log(payId);
    const params = {
      payTime: payInfo.nowTime,
      oldPrice: payInfo.realPrice,
      tides: payId.replace(/,/g, ' '),
      payPass: {
        passOne: password[0].value,
        passTwo: password[1].value,
        passThree: password[2].value,
        passFour: password[3].value,
        passFive: password[4].value,
        passSix: password[5].value,
      },
    };

    const res = transportStatistics.goPayTransport({ params });
    return res;
  };

  // 获取用户信息
  const getUser = async () => {
    const { userId } = localStorage;
    const res = await getUserInfo({ userId });
    if (res.status === 0) {
      const hasPayPass = res.result.hasPayPass;
      return hasPayPass;
    }
  };

  // 结算提交
  const settlement = async type => {
    let _totalPrice = payInfo.realPrice
      ? Math.round((payInfo.realPrice * 100 + Number.EPSILON) * 100) / 100
      : payInfo.price;

    const params = {
      tid: payId,
      isAgree: true,
      realPrice: _totalPrice,
      goodsWeight: payInfo.goodsWeight,
      arrivalGoodsWeight: payInfo.arrivalGoodsWeight,
      deliverPoundPic: payInfo.deliverPoundPic || '',
      receivePoundPic: payInfo.receivePoundPic || '',
      payRemark: payRemark || '',
    };
    console.log(params);
    // const res = await transportStatistics.checkTransport({ params });
    // if (res.status === 0) {
    //   if (type === 'pay') {
    //     // 未设置支付密码 提示去设置
    //     const hasPayPass = await getUser();
    //     if (!hasPayPass) {
    //       Modal.warn({
    //         title: '未设置支付密码',
    //         content:
    //           '尚未设置支付密码, 请前往方向物流app设置，进入方向物流app -> 登录账号 -> 点击”我的”-> 点击”设置” -> 点击”密码管理” ->点击”修改支付密码” -> 设置密码 ->，设置完成后重新点击”线上支付”',
    //       });
    //       return;
    //     }
    //     // // 设置支付信息
    //     // setShowModal(true);
    //     setTotalPrice(_totalPrice + payInfo.totalInfoFee);
    //     //去下一个状态
    //     setStep(1);
    //     // 获取当前时间
    //     setTimeout(async () => {
    //       const params = {
    //         tides: payId,
    //       };
    //       // 获取结算信息
    //       const res = await transportStatistics.calculateWaitPayInfo({ params });
    //       if (!res.status) {
    //         setNowTime(res.result.nowTime);
    //       }
    //     }, 500);
    //   } else {
    //     message.success('运单结算成功');
    //     onclose();
    //   }
    // } else {
    //   message.error(`${res.detail || res.description}`);
    // }
  };

  // 支付提交
  const paySubmit = async ({ password }) => {
    const params = {
      oldPrice: totalPrice,
      tides: payId,
      payPass: {
        passOne: password[0].value,
        passTwo: password[1].value,
        passThree: password[2].value,
        passFour: password[3].value,
        passFive: password[4].value,
        passSix: password[5].value,
      },
      payTime: nowTime,
    };

    const res = await transportStatistics.goPayTransport({ params });
    setResult(res);
  };

  return (
    <div className={styles['flow-pay']}>
      <Steps size="small" current={step} style={{ marginBottom: 32 }}>
        <Steps.Step title="结算" />
        <Steps.Step title="支付" />
        <Steps.Step title={FinishType[finish].title} />
      </Steps>
      {/* 详细信息 */}
      {step === 0 && (
        <div className={styles['step-block']} style={{ height: payInfo.payPath !== 1 && 110 }}>
          <DetailStep {...payInfo} />
          <div className={styles.bottom}>
            <Button onClick={() => settlement('pay')}>结算并支付</Button>
            <Button type="primary" onClick={settlement} style={{ marginLeft: 8 }}>
              确认结算
            </Button>
          </div>
        </div>
      )}
      {/* 支付密码 */}
      {step === 1 && (
        <div className={styles['step-block']} style={{ height: 163 }}>
          <PayStep
            onChange={setPassword}
            price={payInfo.realPrice ? payInfo.realPrice * 100 : payInfo.price}
            totalInfoFee={payInfo.totalInfoFee}
          />
          <div className={styles['error-message']}>{errMsg}</div>
          <div className={styles.bottom}>
            <Button onClick={onclose} disabled={payLoading}>
              我在想想
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

export default SettlementPay;
