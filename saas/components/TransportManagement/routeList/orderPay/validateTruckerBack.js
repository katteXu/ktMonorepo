import React, { useState, useEffect } from 'react';
import { CheckCircleTwoTone, InfoCircleTwoTone, LoadingOutlined } from '@ant-design/icons';
import { Modal, Button, message } from 'antd';
import { transportStatistics } from '@api';
import router from 'next/router';
import { getQuery } from '@utils/common';
const block_style = {
  padding: '0 30px',
};

const title_style = {
  fontFamily: 'PingFangSC-Regular',
  fontSize: 16,
  color: '#333333',
  userSelect: 'none',
};

const content_style = {
  marginTop: 20,
  fontFamily: 'PingFangSC-Regular',
  fontSize: 14,
  color: '#848485',
  userSelect: 'none',
};

const bottom_style = {
  marginTop: 26,
  lineHeight: '32px',
};

export default ({ status, phone, onCancel }) => {
  const [reject, setReject] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const [_status, setStatus] = useState();
  // 运费单价获取轮询函数
  const [unitPriceTimeout, setUnitPriceTimeout] = useState();

  // 取消按钮loading
  const [btnLoading, setBtnLoading] = useState(false);
  useEffect(() => {
    switch (status) {
      // case 'REJECT':
      //   setReject(true);
      //   break;
      // case 'DONE':
      //   setAgree(true);
      //   break;
      case 'APPROVE':
        setLoading(true);
        reload();
        break;
      case 'reload':
        reload();
      default:
        break;
    }
  }, [status]);

  useEffect(() => {
    return () => clearTimeout(unitPriceTimeout);
  }, []);

  const reload = async () => {
    // 获取运单id
    const { id } = getQuery();
    const params = {
      id,
    };
    // 如果没有id则不作请求;
    if (!id) return;
    const res = await transportStatistics.getDetail({ params });
    if (res.status === 0) {
      const { unitPriceStatus } = res.result;
      if (unitPriceStatus === 'APPROVE') {
        const getUnitPriceTimeout = setTimeout(() => {
          reload();
        }, 5000);
        setLoading(true);
        setReject(false);
        setAgree(false);
        // 设置轮询函数
        setUnitPriceTimeout(getUnitPriceTimeout);
      } else {
        // 其他情况弹窗不同
        switch (unitPriceStatus) {
          case 'REJECT':
            setLoading(false);
            setReject(true);
            setAgree(false);
            break;
          case 'DONE':
            setLoading(false);
            setReject(false);
            setAgree(true);
            break;
          default:
            break;
        }
      }
    }
  };

  // 拒绝确认
  const rejectOk = async () => {
    setReject(false);
    onCancel && onCancel();
  };

  // 同意确认
  const agreeOk = async () => {
    setAgree(false);
    onCancel && onCancel();
  };

  // 取消等待
  const loadingCancel = async () => {
    const { id } = getQuery();
    const params = {
      id,
      cancel: 1,
    };
    setBtnLoading(true);
    const res = await transportStatistics.modifyUnitPrice({ params });
    // 取消成功 停止轮询
    if (res.status === 0) {
      clearTimeout(unitPriceTimeout);
      onCancel && onCancel();
    } else {
      setLoading(false);
      clearTimeout(unitPriceTimeout);
      message.error(`${res.detail ? res.detail : res.description}`);
    }

    setLoading(false);
    setBtnLoading(false);
  };

  return (
    <>
      {/* 驳回请求 */}
      <Modal
        maskClosable={false}
        closable={false}
        title={null}
        visible={reject}
        footer={null}
        width={430}
        onCancel={() => setReject(false)}>
        <div style={block_style}>
          <div style={title_style}>
            <InfoCircleTwoTone twoToneColor="#E44040" style={{ marginRight: 5, fontSize: 18 }} />
            司机拒绝了您的请求
          </div>
          <p style={content_style}>
            检测到您更改了运费结算单价，请等待司机同意后方 可进行结算或您可以点击取消更改为原单价再结算。
          </p>
          <div style={bottom_style}>
            <span>司机电话：{phone}</span>
            <Button type="primary" style={{ float: 'right' }} onClick={rejectOk}>
              知道了
            </Button>
          </div>
        </div>
      </Modal>

      {/* 同意请求 */}
      <Modal
        maskClosable={false}
        closable={false}
        title={null}
        visible={agree}
        footer={null}
        width={430}
        onCancel={() => setAgree(false)}>
        <div style={block_style}>
          <div style={title_style}>
            <CheckCircleTwoTone twoToneColor="#52C41A " style={{ marginRight: 5, fontSize: 18 }} />
            司机同意了您的请求
          </div>
          <p style={content_style}>
            检测到您更改了运费结算单价，请等待司机同意后方 可进行结算或您可以点击取消更改为原单价再结算。
          </p>
          <div style={bottom_style}>
            <span>司机电话：{phone}</span>
            <Button type="primary" style={{ float: 'right' }} onClick={agreeOk}>
              知道了
            </Button>
          </div>
        </div>
      </Modal>

      {/* 等待请求 */}

      <Modal
        maskClosable={false}
        closable={false}
        title={null}
        footer={null}
        width={430}
        visible={loading}
        footer={null}
        onCancel={() => setLoading(false)}>
        <div style={block_style}>
          <div style={title_style}>
            <LoadingOutlined style={{ marginRight: 5, fontSize: 18, color: '#477AEF' }} />
            等待司机同意中...
          </div>
          <p style={content_style}>
            检测到您更改了运费结算单价，请等待司机同意后方 可进行结算或您可以点击取消更改为原单价再结算。
          </p>
          <div style={bottom_style}>
            <span>司机电话：{phone}</span>
            <Button type="primary" style={{ float: 'right' }} onClick={loadingCancel} loading={btnLoading}>
              取消
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
