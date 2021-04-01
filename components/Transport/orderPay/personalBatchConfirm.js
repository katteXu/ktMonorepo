// 个人运单批量结算
import { Button, message, Modal } from 'antd';
import { useEffect, useState } from 'react';
import { transportStatistics } from '@api';
import PasswordForm from '@components/Transport/orderPay/passwordForm';
const ModalRowStyle = {
  lineHeight: '30px',
};

const formatWeight = value => {
  return ((value || 0) / 1000).toFixed(2);
};

const formatPrice = value => {
  return ((value || 0) / 100).toFixed(2);
};
/**
 * onClose 关闭
 * payId 支付id 字符串 空格隔开
 * afterPay 支付结束
 */
const BatchConfirm = ({ onClose, payId, afterPay, onError, onPayError }) => {
  const [info, setInfo] = useState({});
  // 密码弹窗
  const [showPasswordModal, setPasswordModal] = useState();
  // 支付结果
  const [result, setResult] = useState();
  useEffect(() => {
    if (payId && payId.length > 0) {
      getPayInfo();
    } else {
      console.error('没有要结算的运单id');
    }
  }, [payId]);
  // 获取支付确认信息
  const getPayInfo = async () => {
    const params = {
      // tides: payId.join(' '),
      tides: payId.map(item => item.split(':')[0]).join(' '),
    };
    const res = await transportStatistics.getCalculateWaitPayTransport({ params });
    if (res.status === 0) {
      setInfo(res.result);
    } else {
      message.error(
        <span>
          {res.detail ? res.detail : res.description} <a onClick={() => onError && onError()}>刷新</a>
        </span>,
        5
      );
      onClose && onClose();
    }
  };

  const showPassword = () => {
    onClose && onClose();
    setPasswordModal(true);
  };

  // 个人单支付提交
  const paySubmit = async password => {
    const tidData = {};
    payId.forEach(item => {
      const obj = item.split(':');
      tidData[obj[0]] = obj[1] * 1;
    });
    const params = {
      // tides: payId.join(' '),
      tidData,
      // oldPrice: info.totalPrice,
      payPass: {
        passOne: password[0].value,
        passTwo: password[1].value,
        passThree: password[2].value,
        passFour: password[3].value,
        passFive: password[4].value,
        passSix: password[5].value,
      },
    };
    const res = await transportStatistics.payPersonalTransport({ params });
    if (res.status === 0) {
      setResult({ title: '支付成功', status: res.status });
    } else {
      setResult({ title: '支付失败', description: res.description, detail: res.detail, status: res.status });
    }
  };
  return (
    <>
      <div style={ModalRowStyle}>
        发货净重：<span>{formatWeight(info.totalGoodsWeight)} 吨</span>
      </div>
      <div style={ModalRowStyle}>
        收货净重：<span>{formatWeight(info.totalArrivalGoodsWeight)} 吨</span>
      </div>
      <div style={ModalRowStyle}>
        运输车次：<span>{info.transportCount} 辆</span>
      </div>
      <div style={ModalRowStyle}>
        预计运费：<span>{formatPrice(info.totalPrice)} 元</span>
      </div>
      <div style={{ textAlign: 'right' }}>
        <Button onClick={onClose}>取消</Button>
        <Button type="primary" style={{ marginLeft: 12 }} onClick={showPassword}>
          确定
        </Button>
      </div>
      <Modal
        width={400}
        destroyOnClose
        maskClosable={false}
        footer={null}
        visible={showPasswordModal}
        onCancel={() => {
          setPasswordModal(false);
          setResult(undefined);
        }}>
        <PasswordForm
          result={result}
          afterPay={afterPay}
          onSubmit={paySubmit}
          onClose={() => {
            setPasswordModal(false);
            setResult(undefined);
          }}
          onPayError={onPayError}
          price={formatPrice(info.totalPrice)}></PasswordForm>
      </Modal>
    </>
  );
};

export default BatchConfirm;
