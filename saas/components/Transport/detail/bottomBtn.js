import React, { useState, useEffect } from 'react';
import styles from './styles.less';
import { Button, Modal, message, Radio, Input, Checkbox } from 'antd';
import { Format } from '@utils/common';
import { ExclamationCircleFilled, QuestionCircleOutlined, CloseCircleFilled } from '@ant-design/icons';
import { transportStatistics, getUserInfo, getCommon } from '@api';
import PayDetailConfirm from '@components/Transport/flowPay/PayDetailConfirm.js';
import SettlementPay from '@components/Transport/flowPay/SettlementPay.js';
import router from 'next/router';
import { WhiteList } from '@store';

// 取消按钮
const showCancelBtn = ['PROCESS', 'CHECKING', 'APPLY_CANCEL', 'REJECT'];
// 结算按钮 (通过、驳回)
const showCheckBtn = ['CHECKING'];
// 支付按钮
const showPayBtn = ['WAIT_PAY'];

//待卸货 取消按钮
const showWaitConfirmed = ['WAIT_CONFIRMED'];

const radioStyle = {
  display: 'block',
  height: 35,
  lineHeight: '35px',
};

// 确认信息
const ConfirmDetail = ({ fromWeight, toWeight, unitName }) => {
  return (
    <div style={{ fontFamily: 'PingFangSC-Regular', color: '#333333', fontSize: 16 }}>
      <span>
        原发:{fromWeight} {unitName || '吨'}
      </span>
      <span style={{ marginLeft: 33 }}>
        实收:{toWeight} {unitName || '吨'}
      </span>
    </div>
  );
};

const BottomBtn = props => {
  const {
    unitName,
    deliverPoundPic,
    receivePoundPic,
    status,
    applyCancelType,
    id,
    goodsWeight,
    arrivalGoodsWeight,
    routeInfo,
    totalInfoFee,
    tag,
  } = props.dataInfo;
  console.log(props.dataInfo);
  const { whiteList } = WhiteList.useContainer();
  // 获取用户信息
  const getUser = async () => {
    const { userId } = localStorage;
    const res = await getUserInfo({ userId });
    if (res.status === 0) {
      const hasPayPass = res.result.hasPayPass;
      return hasPayPass;
    }
  };

  // 获取公共参数 设置税率
  const [transportRate, setTransportRate] = useState();
  const getCommonInfo = async () => {
    const res = await getCommon();
    if (res.status === 0) {
      const transportRate = res.result.find(({ key }) => key === 'transportRate');
      const value = transportRate ? transportRate.url : undefined;
      setTransportRate(value);
    }
  };

  useEffect(() => {
    getCommonInfo();
  }, []);

  // 驳回弹窗数据
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showOther, setShowOther] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorRejectMsg, setErrorRejectMsg] = useState('');
  const [showRejectError, setShowRejectError] = useState(false);
  const [rejectBtnLoading, setRejectBtnLoading] = useState(false);

  // 通过弹窗数据
  const [settlementBtnLoading, setSettlementBtnLoading] = useState(false);
  const [settlementChecked, setSettlementChecked] = useState();
  const [visible, setVisible] = useState(false);
  const [realPrice, setRealPrice] = useState();

  // 支付弹窗数据
  const [nowTime, setNowTime] = useState();
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState();
  const [totalPrice, setTotalPrice] = useState();
  const [confirmaPay, setConfirmaPay] = useState({});
  const [taxSum, setTaxSum] = useState();

  const [isModal, setIsModal] = useState(false);
  // 取消运单
  const handleCancel = () => {
    Modal.confirm({
      title: '是否取消当前运单，发起取消后，需要司机同意才能完全取消',
      icon: <ExclamationCircleFilled />,
      onOk: async () => {
        const params = {
          tid: id,
        };
        const res = await transportStatistics.grantTransportCancel({ params });
        if (res.status === 0) {
          message.success('已发起取消，请等待司机确认');
          props.reload && props.reload();
        } else {
          message.error(`${res.detail || res.description}`);
          props.reload && props.reload();
        }
      },
      cancelText: '我再想想',
      okText: '确认取消',
    });
  };

  // 取消待装货运单
  const handleCancelWaitConfirmed = () => {
    Modal.confirm({
      title: '是否取消当前运单',
      icon: <ExclamationCircleFilled />,
      onOk: async () => {
        const params = {
          tid: id,
          longitude: props.userInfo?.longitude,
          latitude: props.userInfo?.latitude,
        };
        const res = await transportStatistics.goodsOwnerCancelTransport({ params });
        if (res.status === 0) {
          message.success(`取消成功`, 1.5, props.close && props.close());
        } else {
          message.error(`${res.detail || res.description}`);
        }
      },
      cancelText: '我再想想',
      okText: '确认取消',
    });
  };

  // 撤销取消申请
  const handleRevokeCancel = () => {
    Modal.confirm({
      title: '是否撤回取消申请',
      icon: <QuestionCircleOutlined />,
      onOk: async () => {
        const params = {
          tid: id,
        };
        const res = await transportStatistics.continueTransport({ params });
        if (res.status === 0) {
          message.success('撤销取消申请成功');
          props.reload && props.reload();
        } else {
          message.error(`${res.detail || res.description}`);
          if (res.status === 12) {
            props.close && props.close();
          }
          props.reload && props.reload();
        }
      },
      cancelText: '我再想想',
      okText: '确认撤回',
    });
  };

  // 拒绝取消
  const handleReject = async () => {
    const params = {
      tid: id,
      attitude: 0,
    };
    const res = await transportStatistics.approveCancelTransport({ params });
    if (res.status === 0) {
      props.reload && props.reload();
    } else {
      message.error(`${res.detail || res.description}`);
      props.reload && props.reload();
    }
  };

  // 同意取消
  const handleArgee = () => {
    Modal.confirm({
      title: '是否要取消该运单',
      icon: <QuestionCircleOutlined />,
      onOk: async () => {
        const params = {
          tid: id,
          attitude: 1,
        };
        const r = await transportStatistics.approveCancelTransport({ params });
        if (r.status === 0) {
          message.success('同意取消成功');
          props.close && props.close();
        } else {
          message.error(`${r.detail || r.description}`);
          props.reload && props.reload();
        }
      },
      cancelText: '我再想想',
      okText: '确认取消',
    });
  };

  // 驳回事件
  // 选择驳回信息
  const selectRejectMsg = value => {
    if (value === -1) {
      setMsg('');
      setErrorRejectMsg('');
      setShowOther(true);
    } else {
      setMsg(value);
      setShowOther(false);
    }
  };

  // 隐藏驳回弹窗
  const hideRejectModal = () => {
    setShowRejectModal(false);
    setMsg('');
    setShowOther(false);
  };

  // 改变其他信息
  const handleChangeOtherMsg = e => {
    const msg = e.target.value;
    setMsg(msg);
    if (msg && (msg.length < 4 || msg.length > 30)) {
      setShowRejectError(true);
      setErrorRejectMsg('驳回原因输入字数应为4-30个');
    } else {
      setShowRejectError(false);
      setErrorRejectMsg('');
    }
  };

  // 驳回提交
  const rejectSubmit = async () => {
    if (msg) {
      setRejectBtnLoading(true);
      const params = {
        tid: id,
        isAgree: 0,
        msg,
        isOther: showOther ? 1 : 0,
      };

      const res = await transportStatistics.checkTransport({ params });
      if (res.status === 0) {
        setShowRejectModal(false);
        message.success('运单驳回成功');
        props.reload && props.reload();
      } else {
        message.error(`${res.detail || res.description}`);
        props.reload && props.reload();
      }

      setRejectBtnLoading(false);
    } else {
      message.error('驳回原因不可为空');
    }
  };

  useEffect(() => {
    if (settlementChecked !== undefined) {
      localStorage.setItem('settlementChecked', settlementChecked);
    }
  }, [settlementChecked]);

  /**
   * 保存金额
   * props.checkPrice 实际运费
   * _price 预计运费
   * 验证浮动：预计运费*费率(transportRate) 和 (预计运费-实际运费)的绝对值 作比较
   */
  const handlePass = () => {
    const price = props.checkPrice || '';
    // 未输入结算金额
    if (price === '') {
      // 如果预计运费为 0
      if (props.dataInfo.price === 0) {
        Modal.confirm({
          title: '结算失败',
          icon: <CloseCircleFilled style={{ color: '#E44040' }} />,
          content: <p>运费为0，请前往专线中修改运费单价。</p>,
          cancelText: '前往',
          cancelButtonProps: {
            type: 'primary',
          },
          onCancel: () => {
            router.push(`/railWay/mine/detail/?id=${props.dataInfo.routeInfo.id}`);
          },
          okText: '稍后再去',
          okButtonProps: {
            type: 'default',
          },
        });
      } else {
        // 不再提醒
        const { settlementChecked } = localStorage;

        if (settlementChecked === 'true') {
          confirmSettlement();
        } else {
          // 提醒
          Modal.confirm({
            title: '未填写结算运费，按预计运费结算?',
            icon: <ExclamationCircleFilled />,
            content: <Checkbox onChange={e => setSettlementChecked(e.target.checked)}>不再提示</Checkbox>,
            onOk: async () => {
              setIsModal(true);
              confirmSettlement();
              setTimeout(() => {
                setIsModal(false);
              }, 1000);
            },
            cancelText: '取消',
            okText: '确定',
          });
        }
      }
    } else {
      if (!/^(\d+)(\.\d{1,2})?$/.test(price)) {
        message.warn('结算运费格式有误，且最多输入两位小数');
        return;
      }
      if (price * 1 === 0) {
        message.warn('结算运费不能为0');
        return;
      }
      if (price > 100000) {
        message.warn('结算运费最多为10万元');
        return;
      }

      // 验证浮动
      if (!validatePrice()) {
        Modal.confirm({
          title: '当前结算运费与预计运费相差过大，是否仍要继续',
          icon: <QuestionCircleOutlined />,
          content: (
            <div>
              <div style={{ marginBottom: 6 }}>
                结算运费：<span style={{ color: '#477AEF' }}>{(price * 1).toFixed(2)}</span> 元
              </div>
              <div>
                预计运费：<span style={{ color: '#477AEF' }}>{Format.price(props.dataInfo.price)}</span> 元
              </div>
            </div>
          ),
          onOk: async () => {
            confirmSettlement();
          },
          okText: '继续结算',
          cancelText: '我在想想',
        });
        return;
      }
      confirmSettlement();
    }
  };

  // 验证浮动税费
  const validatePrice = () => {
    const price = props.checkPrice * 1;
    const _price = props.dataInfo.price / 100; // 预计运费

    const _p = Math.abs(price - _price);
    if (_price * transportRate < _p) {
      return false;
    }
    return true;
  };

  // 确认通过提交
  const confirmSettlement = () => {
    const realPrice = props.checkPrice != '' ? props.checkPrice : Format.price(props.dataInfo.price);
    setVisible(true);
    setRealPrice(realPrice);
  };

  // 取消支付
  const payCancel = () => {
    setShowModal(false);
    setResult(undefined);
  };

  // 支付完成
  const payFinish = status => {
    setShowModal(false);
    setResult(null);
    if (status !== 'fail') {
      props.reload && props.reload();
    }
  };

  // 个人单支付提交
  const paySubmit = async password => {
    const params = {
      oldPrice: totalPrice,
      tides: id,
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
    if (res.status === 0) {
      const result = { title: '支付成功', status: res.status };
      setResult(result);
    } else {
      const result = { title: '支付失败', description: res.description, detail: res.detail, status: res.status };
      setResult(result);
    }
  };

  // 车队单支付提交
  const payFleetSubmit = async password => {
    const params = {
      tides: id,
      oldPrice: totalPrice,
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
    if (res.status === 0) {
      const result = { title: '支付成功', status: res.status };
      setResult(result);
    } else {
      const result = { title: '支付失败', description: res.description, detail: res.detail, status: res.status };
      setResult(result);
    }
  };

  // 个人单支付
  const onLinePay = async () => {
    const hasPayPass = await getUser();
    // 未设置支付密码 提示去设置
    if (!hasPayPass) {
      Modal.warn({
        title: '未设置支付密码',
        content:
          '尚未设置支付密码, 请前往方向物流app设置，进入方向物流app -> 登录账号 -> 点击”我的”-> 点击”设置” -> 点击”密码管理” ->点击”修改支付密码” -> 设置密码 ->，设置完成后重新点击”线上支付”',
      });
      return;
    }

    const params = {
      tides: id,
    };

    // 获取结算信息
    const res = await transportStatistics.calculateWaitPayInfo({ params });

    if (res.status === 0) {
      setTotalPrice(res.result.realPrice);
      setTaxSum(res.result.taxSum);
      setShowModal(true);
      setNowTime(res.result.nowTime);
    } else {
      message.error(res.detail || res.description);
    }
  };

  // 车队单结算
  const fleetPay = async () => {
    const hasPayPass = await getUser();
    // 未设置支付密码 提示去设置
    if (!hasPayPass) {
      Modal.warn({
        title: '未设置支付密码',
        content:
          '尚未设置支付密码, 请前往方向物流app设置，进入方向物流app -> 登录账号 -> 点击”我的”-> 点击”设置” -> 点击”密码管理” ->点击”修改支付密码” -> 设置密码 ->，设置完成后重新点击”线上支付”',
      });
      return;
    }

    const params = {
      tides: id,
    };
    // 获取结算信息
    const res = await transportStatistics.calculateWaitPayInfo({ params });
    if (res.status === 0) {
      setTotalPrice(res.result.realPrice);
      setTaxSum(res.result.taxSum);
      setShowModal(true);
      setNowTime(res.result.nowTime);
    } else {
      message.error(res.detail || res.description);
    }
  };

  return (
    <>
      {/* 底部按钮 */}
      {(tag === 0 ||
        showCheckBtn.includes(status) ||
        (showCancelBtn.includes(status) && tag === 0) ||
        showPayBtn.includes(status)) && (
        <div className={styles['bottom-btn']}>
          {showCancelBtn.includes(status) && (
            <>
              {/* {applyCancelType != 0 ? (
         <Button onClick={handleRevokeCancel}>撤回取消申请</Button>
       ) : (
         <Button onClick={handleCancel}>取消运单</Button>
       )} */}

              {(applyCancelType === 2 || applyCancelType === 3) && (
                <Button onClick={handleRevokeCancel}>撤回取消申请</Button>
              )}

              {applyCancelType === 1 && (
                <>
                  <Button onClick={handleReject}>拒绝取消</Button>
                  <Button type="primary" onClick={handleArgee}>
                    同意取消
                  </Button>
                </>
              )}

              {applyCancelType === 0 && tag === 0 && <Button onClick={handleCancel}>取消运单</Button>}
            </>
          )}

          {showCheckBtn.includes(status) && applyCancelType == 0 && (
            <>
              <Button onClick={() => setShowRejectModal(true)} loading={rejectBtnLoading}>
                驳回
              </Button>
              <Button type="primary" loading={settlementBtnLoading} onClick={handlePass}>
                通过
              </Button>
            </>
          )}

          {showWaitConfirmed.includes(status) && tag === 0 && (
            <Button onClick={handleCancelWaitConfirmed}>取消运单</Button>
          )}

          {showPayBtn.includes(status) && (
            <Button type="primary" onClick={props.dataInfo.transportFleetId ? fleetPay : onLinePay}>
              支付
            </Button>
          )}
        </div>
      )}

      {/* 底部按钮占位 */}
      <div className={styles['bottom-btn-wrap']}></div>

      {/* 驳回弹窗 */}
      <Modal visible={showRejectModal} title="请选择驳回原因" destroyOnClose footer={null} onCancel={hideRejectModal}>
        <Radio.Group onChange={e => selectRejectMsg(e.target.value)}>
          <Radio style={radioStyle} value={'原发磅单上传有误'}>
            原发磅单上传有误
          </Radio>
          <Radio style={radioStyle} value={'发货净重与磅单不符'}>
            发货净重与磅单不符
          </Radio>
          <Radio style={radioStyle} value={'收货磅单上传有误'}>
            收货磅单上传有误
          </Radio>
          <Radio style={radioStyle} value={'收货净重与磅单不符'}>
            收货净重与磅单不符
          </Radio>
          <Radio style={radioStyle} value={'原发，收货净重上传有误'}>
            原发，收货净重上传有误
          </Radio>
          <Radio style={radioStyle} value={'原发，收货净重与磅单不符'}>
            原发，收货净重与磅单不符
          </Radio>
          <Radio style={radioStyle} value={-1}>
            其他
          </Radio>
        </Radio.Group>
        {showOther && (
          <div>
            <Input.TextArea placeholder="请输入其他驳回信息" onChange={handleChangeOtherMsg} />
            {showRejectError && <div style={{ color: 'red', fontSize: 12, marginTop: 5 }}>{errorRejectMsg}</div>}
          </div>
        )}

        <div style={{ textAlign: 'right', marginTop: 10 }}>
          <Button onClick={hideRejectModal}>取消</Button>
          <Button
            type="primary"
            disabled={showRejectError || !msg}
            style={{ marginLeft: 12 }}
            onClick={rejectSubmit}
            loading={rejectBtnLoading}>
            确定
          </Button>
        </div>
      </Modal>

      {/* 结算确认  */}
      <Modal
        maskClosable={false}
        title="运单结算/支付"
        visible={visible}
        destroyOnClose
        onCancel={() => setVisible(false)}
        footer={null}>
        <SettlementPay
          payInfo={{
            price: props.dataInfo.price,
            taxes: whiteList.heShun
              ? realPrice
                ? Math.ceil(realPrice * 10 + totalInfoFee / 10)
                : props.dataInfo.taxCharge
              : props.dataInfo.taxCharge,
            realPrice: realPrice,
            goodsWeight: goodsWeight,
            arrivalGoodsWeight: arrivalGoodsWeight,
            unitName: unitName,
            deliverPoundPic: deliverPoundPic || '',
            receivePoundPic: receivePoundPic || '',
            transportFleetId: props.dataInfo.transportFleetId,
            payPath: routeInfo.payPath,
            totalInfoFee: totalInfoFee,
          }}
          payRemark={props.payRemark}
          payId={id}
          onclose={() => {
            setVisible(false);
            props.reload && props.reload();
          }}
          onFinish={() => {
            setVisible(false);
            props.reload && props.reload();
          }}
        />
      </Modal>

      {/* 支付密码 */}
      <Modal
        title="运单支付"
        destroyOnClose
        maskClosable={false}
        footer={null}
        visible={showModal}
        onCancel={payCancel}>
        <PayDetailConfirm
          result={result}
          onSubmit={props.dataInfo.transportFleetId ? payFleetSubmit : paySubmit}
          onFinish={payFinish}
          DetailComponent={() =>
            ConfirmDetail({ fromWeight: goodsWeight, toWeight: arrivalGoodsWeight, unitName: unitName })
          }
          price={Format.addPrice(totalPrice + taxSum)}
        />
      </Modal>
    </>
  );
};
export default BottomBtn;
