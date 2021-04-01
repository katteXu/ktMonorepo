// 个人运单批量结算
import { Button, message, Modal } from 'antd';
import { useEffect, useState } from 'react';
import { transportStatistics } from '@api';
import PasswordForm from '@components/TransportManagement/routeList/orderPay/passwordForm';
const ModalRowStyle = {
  lineHeight: '30px',
};

const formatWeight = value => {
  return ((value || 0) / 1000).toFixed(2);
};

const formatPrice = value => {
  return ((value || 0) / 100).toFixed(2);
};
const BatchConfirm = ({
  onClose,
  payId,
  payAll,
  payAllFilter = {},
  afterPay,
  refresh,
  transportFleetId,
  onPayError,
}) => {
  const [info, setInfo] = useState({});
  // 密码弹窗
  const [showPasswordModal, setPasswordModal] = useState();
  // 支付结果
  const [result, setResult] = useState();
  useEffect(() => {
    getPayInfo();
  }, [payId, payAll, refresh]);
  // 获取支付确认信息
  const getPayInfo = async () => {
    const id = transportFleetId;
    const params = {
      tides: payAll ? undefined : payId.join(' '),
      isAll: payAll ? 1 : undefined,
      transportFleetId: payAll ? id : undefined,
    };

    if (payAll) {
      params.begin = payAllFilter.begin;
      params.end = payAllFilter.end;
      params.trailerPlateNumber = payAllFilter.trailerPlateNumber;
      params.name = payAllFilter.name;
    }
    const res = await transportStatistics.getFleetWaitPayTransport({ params });
    if (res.status === 0) {
      setInfo(res.result);
    } else {
      message.error(res.detail ? res.detail : res.description);
    }
  };

  const showPassword = () => {
    onClose && onClose();
    setPasswordModal(true);
  };

  // 个人单支付提交
  const paySubmit = async password => {
    const id = transportFleetId;

    const params = {
      tides: payAll ? undefined : payId.join(' '),
      isAll: payAll ? 1 : undefined,
      transportFleetId: payAll ? id : undefined,
      oldPrice: info.totalPrice,
      payPass: {
        passOne: password[0].value,
        passTwo: password[1].value,
        passThree: password[2].value,
        passFour: password[3].value,
        passFive: password[4].value,
        passSix: password[5].value,
      },
    };

    if (payAll) {
      params.begin = payAllFilter.begin;
      params.end = payAllFilter.end;
      params.trailerPlateNumber = payAllFilter.trailerPlateNumber;
      params.name = payAllFilter.name;
    }

    const res = await transportStatistics.payFleetTransport({ params });
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
