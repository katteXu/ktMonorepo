// 详情结算弹窗
import { CloseCircleTwoTone, CheckCircleFilled, CloseCircleFilled, InfoCircleFilled } from '@ant-design/icons';
import { Button, Tooltip, message } from 'antd';
import PayPasswordInput from '@components/common/PayPasswordInput';
import { useState, useEffect, useRef } from 'react';
import styles from './styles.less';

// 结果组件
const Result = ({ icon, title, content }) => {
  return (
    <div className={styles['result-step']}>
      {icon}
      <div className={styles.title}>{title}</div>
      <div className={styles.content}>{content}</div>
    </div>
  );
};

/**
 * 详细支付
 * onSubmit 提交密码
 * onFinish 支付完成
 * result 提交密码返回结果
 * price 结算金额
 */
const PayDetailConfirm = ({ onSubmit, onFinish, result, price, DetailComponent }) => {
  const [password, setPassword] = useState([]);
  const [errMsg, setErrMsg] = useState();

  // 支付步骤
  const [step, setStep] = useState(0);
  const [resultInfo, setResultInfo] = useState({});
  const [btnLoading, setBtnLoading] = useState(false);
  // 提交密码
  const submit = () => {
    if (password && password.length === 6) {
      setBtnLoading(true);
      onSubmit && onSubmit(password);
    } else {
      message.error('请输入完整密码');
    }
  };
  const passwordRef = useRef();
  const clear = () => {
    passwordRef.current.clear();
  };

  // 监听支付结果
  useEffect(() => {
    setBtnLoading(false);
    if (result) {
      // 支付成功
      if (result.status === 0) {
        setResultInfo({
          status: 'success',
          title: '支付成功',
          icon: <CheckCircleFilled style={{ color: '#66BD7E', fontSize: 47 }} />,
          content: (
            <>
              <div>￥</div>
              <div style={{ color: '#3D86EF', fontSize: 20, margin: '0 4px' }}>{price}</div>
              <div>元</div>
            </>
          ),
        });
        setStep(1);
        return;
      } else if (result.status === 1) {
        setResultInfo({
          status: 'fail',
          title: '支付失败',
          icon: <CloseCircleFilled style={{ color: '#e44040', fontSize: 47 }} />,
          content: (
            <div>
              请联系客服 <span style={{ color: '#3D86EF' }}>400-690-8700</span>
            </div>
          ),
        });
        setStep(1);
      } else if (result.status === 16) {
        // 密码输入错误展示
        setStep(0);
        clear();
        setErrMsg(result.detail);
      } else if (result.status === 18) {
        setResultInfo({
          status: 'loading',
          title: '支付中',
          icon: <InfoCircleFilled style={{ color: '#FFB741', fontSize: 47 }} />,
          content: <div style={{ textAlign: 'center' }}>{result.detail || result.description}</div>,
        });
        setStep(1);
      } else {
        // 其他支付错误
        setResultInfo({
          status: 'fail',
          title: '支付失败',
          icon: <CloseCircleFilled style={{ color: '#e44040', fontSize: 47 }} />,
          content: <div style={{ textAlign: 'center' }}>{result.detail || result.description}</div>,
        });
        setStep(1);
      }
    }
  }, [result]);

  return (
    <div className={styles['flow-pay']}>
      {/* 支付确认 */}
      {step === 0 && (
        <div className={styles['step-block']} style={{ height: 163 }}>
          <div className={styles['pay-step']}>
            {/* 结算title */}
            <div className={styles.title} style={{ marginTop: 8 }}>
              支付总额
            </div>
            {/* 结算金额 */}
            <div className={styles.price}>
              ￥<span className={styles.number}>{price}</span>元
              <Tooltip
                overlayStyle={{ maxWidth: 'max-content', padding: '0 12px' }}
                title={<div>常见费用问题请联系客服核对并修改</div>}>
                <span className={styles.alert}>费用有误?</span>
              </Tooltip>
            </div>
            {/* 其他信息组件 */}
            {/* {DetailComponent && <DetailComponent />} */}
            {/* 输入密码 */}
            <div className={styles.password}>
              <span>支付密码：</span>
              <PayPasswordInput onChange={setPassword} ref={passwordRef} />
              <Tooltip
                placement="topRight"
                title={
                  '进入方向物流app -> 登录账号 -> 点击”我的”-> 点击”设置” -> 点击”密码管理” ->点击”修改支付密码” -> 设置密码'
                }>
                <span className={styles.forget}>忘记密码？</span>
              </Tooltip>
            </div>
            {/* 密码锁定提示 */}
            {errMsg && (
              <div style={{ color: '#E44040', textAlign: 'center', fontSize: 12, marginTop: 5 }}>
                <CloseCircleTwoTone twoToneColor="#E44040" style={{ color: 'red', marginRight: 5 }} />
                {errMsg}
              </div>
            )}
          </div>
          {/* 支付按钮 */}
          <div className={styles.bottom}>
            <Button className={styles['pay-btn']} type="primary" onClick={() => submit()} loading={btnLoading}>
              立即支付
            </Button>
          </div>
        </div>
      )}
      {/* 支付结果 */}
      {step === 1 && (
        <div className={styles['step-block']} style={{ marginTop: 8 }}>
          <Result {...resultInfo} />
          <div className={styles.bottom}>
            <Button onClick={() => onFinish(resultInfo.status)} type="primary">
              确定
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayDetailConfirm;
