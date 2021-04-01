import React, { useState, useEffect } from 'react';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Input, Checkbox, message } from 'antd';
import styles from './styles.less';

const RemarkDetail = ({ onChange, formData = {}, id, mode }) => {
  const [isShow, setShow] = useState(false);
  const [data, setData] = useState({});
  const [status, setStatus] = useState('init');
  const [oldData, setOldData] = useState(formData);
  const [fromCompanyError, setFromCompanyError] = useState('');
  const [toCompanyError, setToCompanyError] = useState('');
  const [otherError, setOtherError] = useState('');
  useEffect(() => {
    // 初始化数据
    setData({
      plateNumColumnCheck: formData.plateNumColumnCheck,
      goodsTypeColumnCheck: formData.goodsTypeColumnCheck,
      truckTypeColumnCheck: formData.truckTypeColumnCheck,
      weightSumColumnCheck: formData.weightSumColumnCheck,
      remarkFromCompany: formData.remarkFromCompany,
      remarkToCompany: formData.remarkToCompany,
      otherRemark: formData.otherRemark,
    });

    setOldData({
      plateNumColumnCheck: formData.plateNumColumnCheck,
      goodsTypeColumnCheck: formData.goodsTypeColumnCheck,
      truckTypeColumnCheck: formData.truckTypeColumnCheck,
      weightSumColumnCheck: formData.weightSumColumnCheck,
      remarkFromCompany: formData.remarkFromCompany,
      remarkToCompany: formData.remarkToCompany,
      otherRemark: formData.otherRemark,
    });
  }, []);

  // 监听数数据改变
  useEffect(() => {
    const _newData = JSON.stringify(data);
    const _oldData = JSON.stringify(oldData);
    if (status !== 'init' && _newData !== _oldData) {
      onChange && onChange(data);
    } else {
      onChange && onChange(null);
    }
  }, [data]);

  // checkbox选择数据
  const onChangeCheckBox = (key, checked) => {
    setData(data => {
      return {
        ...data,
        [key]: checked,
      };
    });
    setStatus('modify');
  };

  // input改变数据
  const onChangeInput = (key, value) => {
    validateInput(key, value);

    setData(data => {
      return {
        ...data,
        [key]: value,
      };
    });
    setStatus('modify');
  };

  const validateInput = (key, value) => {
    let error = '';
    let reg = /^[\u2E80-\uFE4F|\uff08|\uff09|\(|\)]+$/;

    // 发货企业备注
    if (key === 'remarkFromCompany') {
      if (value) {
        // 有值判断
        if (value.length > 20) {
          error = '请输入不超过20个字';
        } else if (!reg.test(value)) {
          error = '您输入的内容有误，只能输入汉字或括号';
        } else {
          // 校验通过
          error = '';
        }
      } else {
        // 没有写内容
        error = '';
      }

      // 设置错误信息
      setFromCompanyError(error);
    }

    // 收货企业备注
    if (key === 'remarkToCompany') {
      if (value) {
        // 有值判断
        if (value.length > 20) {
          error = '请输入不超过20个字';
        } else if (!reg.test(value)) {
          error = '您输入的内容有误，只能输入汉字';
        } else {
          // 校验通过
          error = '';
        }
      } else {
        // 没有写内容
        error = '';
      }

      // 设置错误信息
      setToCompanyError(error);
    }

    if (key === 'otherRemark') {
      setOtherError(error);
    }
  };
  return (
    <div className={styles['remark-detail']}>
      <div style={{ textAlign: 'right', padding: 9, color: '#4A4A5A', userSelect: 'none' }}>
        <span className={styles['ctrl-btn']} onClick={() => setShow(state => !state)}>
          {isShow ? (
            <span>
              收起
              <UpOutlined style={{ marginLeft: 10 }} />
            </span>
          ) : (
            <span>
              {mode === 'view' ? '查看' : '编辑'}备注
              <DownOutlined style={{ marginLeft: 10 }} />
            </span>
          )}
        </span>
      </div>
      {isShow && (
        <div className={styles.form}>
          <div className="info-row">
            <div className="info-label">添加备注：</div>
            <div className="info-data">
              <Checkbox
                disabled={mode === 'view'}
                checked={data.plateNumColumnCheck}
                onChange={e => onChangeCheckBox('plateNumColumnCheck', e.target.checked)}>
                {formData.plateNum}
              </Checkbox>
              <Checkbox
                disabled={mode === 'view'}
                checked={data.goodsTypeColumnCheck}
                onChange={e => onChangeCheckBox('goodsTypeColumnCheck', e.target.checked)}>
                {formData.goodsType}
              </Checkbox>
              <Checkbox
                disabled={mode === 'view'}
                checked={data.truckTypeColumnCheck}
                onChange={e => onChangeCheckBox('truckTypeColumnCheck', e.target.checked)}>
                {formData.truckType}
              </Checkbox>
              <Checkbox
                disabled={mode === 'view'}
                checked={data.weightSumColumnCheck}
                onChange={e => onChangeCheckBox('weightSumColumnCheck', e.target.checked)}>
                {(formData.weightSum / 1000).toFixed(2)} {formData.unitName}
              </Checkbox>
            </div>
          </div>
          {/* <div className="info-row">
            <div className="info-label">供货方(发货企业)：</div>
            <div className="info-data">
              <Input
                disabled={mode === 'view'}
                placeholder="请输入发货企业"
                value={data.remarkFromCompany}
                onChange={e => onChangeInput('remarkFromCompany', e.target.value)}
              />
              <div className={styles.errMsg}>{fromCompanyError}</div>
            </div>
            <div className="info-label">收货方(收货企业)：</div>
            <div className="info-data">
              <Input
                disabled={mode === 'view'}
                placeholder="请输入收货企业"
                value={data.remarkToCompany}
                onChange={e => onChangeInput('remarkToCompany', e.target.value)}
              />
              <div className={styles.errMsg}>{toCompanyError}</div>
            </div>
          </div> */}
          <div className="info-row">
            <div className="info-label">其他备注：</div>
            <div className="info-data">
              <Input.TextArea
                disabled={mode === 'view'}
                placeholder="请输入其他备注信息"
                value={data.otherRemark}
                onChange={e => onChangeInput('otherRemark', e.target.value)}
              />
              <div className={styles.errMsg} style={{ lineHeight: '25px' }}>
                {otherError}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemarkDetail;
