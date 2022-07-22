import { CloseCircleTwoTone, InfoCircleTwoTone } from '@ant-design/icons';
import { Button, Tooltip, message, Modal } from 'antd';
import PayPasswordInput from '@components/common/PayPasswordInput';
import { useState, useEffect } from 'react';

const descStyle = {
  fontSize: 18,
  color: '#333333',
  fontFamily: 'PingFangSC-Medium',
  textAlign: 'center',
};
/**
 * 密码输入表单
 * onSubmit 提交密码
 * onClose 关闭弹窗
 * result 提交密码返回结果
 * price 结算金额
 * afterPay 支付完成执行回调
 */
const passwordForm = ({ onSubmit, onClose, result, price, afterPay, onPayError, DetailComponent }) => {
  const [password, setPassword] = useState([]);
  const [errMsg, setErrMsg] = useState();

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

  // 监听支付结果
  useEffect(() => {
    setBtnLoading(false);
    if (result) {
      // 支付成功
      if (result.status === 0) {
        // 关闭输入密码框
        onClose && onClose();
        Modal.success({
          title: '支付成功',
          content: (
            <div style={descStyle}>
              您已成功支付<span style={{ color: '#477AEF' }}>{price}</span>元
            </div>
          ),
          onOk: () => afterPay && afterPay(),
        });
        return;
      } else if (result.status === 1) {
        // 未知错误请联系客服
        onClose && onClose();
        Modal.error({
          title: '支付失败',
          content: (
            <div style={descStyle}>
              请联系客服 <span style={{ color: '#477AEF' }}>400-690-8700</span>
            </div>
          ),
        });
      } else if (result.status === 16) {
        // 密码输入错误展示
        setErrMsg(result.description);
      } else if (result.status === 18) {
        onClose && onClose();
        Modal.success({
          title: `${result.description}`,
          content: <div style={descStyle}>{result.detail || result.description}</div>,
          onOk: () => afterPay && afterPay(),
        });
      } else {
        // 其他支付错误
        onClose && onClose();
        console.error(result.description);
        Modal.error({
          title: '支付失败',
          content: <div style={descStyle}>{result.detail || result.description}</div>,
          onOk: () => {
            onPayError && onPayError();
          },
        });
      }
    }
  }, [result]);

  return (
    <>
      <div style={{ textAlign: 'center', padding: '10px 0px' }}>
        <div style={{}}>
          <InfoCircleTwoTone style={{ fontSize: 18, verticalAlign: 'sub' }} twoToneColor="#faad14" />
          <span style={{ marginLeft: 3, fontSize: !6 }}>结算总额</span>
        </div>
        <h3 style={{ marginTop: 15, fontSize: 18 }}>
          您结算总额为<span style={{ color: '#477AEF' }}>{price || '-'}</span>元
        </h3>
        {/* 其他信息组件 */}
        {DetailComponent && <DetailComponent />}
        <div style={{ marginTop: 25, marginBottom: 15 }}>请输入支付密码</div>
        <PayPasswordInput onChange={setPassword} errMsg={errMsg} />
        {/* 密码锁定提示 */}
        {errMsg && (
          <div style={{ color: '#E44040', textAlign: 'left', fontSize: 12, marginTop: 5 }}>
            <CloseCircleTwoTone twoToneColor="#E44040" style={{ color: 'red', marginRight: 5 }} />
            {errMsg}
          </div>
        )}
        <div style={{ textAlign: 'right' }}>
          <Tooltip
            placement="topRight"
            title={
              '进入方向物流app -> 登录账号 -> 点击”我的”-> 点击”设置” -> 点击”密码管理” ->点击”修改支付密码” -> 设置密码'
            }>
            <span style={{ fontSize: 12, color: '#477AEF', cursor: 'pointer', marginRight: 60 }}>忘记密码？</span>
          </Tooltip>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <Button type="primary" onClick={() => submit()} loading={btnLoading}>
          立即支付
        </Button>
      </div>
    </>
  );
};

export default passwordForm;
