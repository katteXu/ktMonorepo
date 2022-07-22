import React, { useState, useEfffect, useEffect } from 'react';
import { QuestionCircleFilled } from '@ant-design/icons';
import { Input, Button, Tooltip, Radio, Form } from 'antd';
import styles from './styles.less';
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  // labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

const UpdateForm = ({ onSubmit, onClose, initValue }) => {
  const [form] = Form.useForm();
  const [isLeavingAmount, setLeavingAmount] = useState(() => {
    return initValue.isLeavingAmount ? 1 : 0;
  });
  const handleSubmit = values => {
    onSubmit && onSubmit(values);
  };

  // 监听余量提醒
  useEffect(() => {
    if (isLeavingAmount === 0) {
      form.validateFields();
    }
  }, [isLeavingAmount]);

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div className={styles.formLeaving}>
      <Form
        {...formItemLayout}
        onFinish={handleSubmit}
        onFinishFailed={onFinishFailed}
        form={form}
        autoComplete="off"
        initialValues={{
          isLeavingAmount: initValue.isLeavingAmount ? 1 : 0,
          ruleLeavingAmount: initValue.ruleLeavingAmount ? (initValue.ruleLeavingAmount / 1000).toFixed(2) : undefined,
          routeContactMobile: initValue.routeContactMobile,
        }}>
        {/* 余量提醒 */}
        <Form.Item
          style={{ marginBottom: 19 }}
          name="isLeavingAmount"
          label={
            <span>
              <div style={{ display: 'inline-block' }}>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>余量提醒
              </div>
              <Tooltip
                overlayStyle={{ maxWidth: 'max-content', padding: '0 10px' }}
                title={
                  <div>
                    <div>1. 使用开票专线时, 余量会在发货磅单产生时更新.</div>
                    <div>发货磅单产生方式: 使用电子磅单功能或司机手动上传.</div>
                    <div>2. 使用磅室专线时, 余量会在车辆发货出站时更新.</div>
                    <div>客服: 400-690-8700</div>
                  </div>
                }
                placement="right">
                <QuestionCircleFilled style={{ marginRight: 0, marginLeft: 5, cursor: 'pointer', color: '#D0D4DB' }} />
              </Tooltip>
            </span>
          }>
          <Radio.Group
            onChange={e => {
              setLeavingAmount(e.target.value);
            }}>
            <Radio value={1}>开启</Radio>
            <Radio value={0}>关闭</Radio>
          </Radio.Group>
        </Form.Item>
        {isLeavingAmount === 1 ? (
          <div>
            <Form.Item
              label="限制进站余量"
              name="ruleLeavingAmount"
              validateFirst={true}
              rules={[
                {
                  required: isLeavingAmount === 1,
                  message: '内容不可为空',
                },
                {
                  pattern: /^([1-9][0-9]*(\.\d*)?)|(0\.\d*)$/,
                  message: '限制余量必须大于0',
                },
                {
                  pattern: /^\d+(\.?\d{1,2})?$/,
                  message: '限制余量只能是数字，最多两位小数',
                },
              ]}>
              <Input
                placeholder="请输入限制进站余量"
                addonAfter={<span style={{ color: '#BFBFBF' }}>吨</span>}
                style={{ width: 264 }}
              />
            </Form.Item>
            <Form.Item
              label="专线负责人"
              name="routeContactMobile"
              validateFirst={true}
              rules={[
                {
                  required: isLeavingAmount === 1,
                  message: '内容不可为空',
                },
                {
                  pattern: /^[1][2,3,4,5,6,7,8,9][0-9]{9}$/,
                  message: '手机号格式不正确',
                },
              ]}>
              <Input placeholder="请输入专线负责人手机号" maxLength={11} style={{ width: 264 }} />
            </Form.Item>
          </div>
        ) : (
          ''
        )}
        <div style={{ textAlign: 'right' }}>
          <Button onClick={onClose}>取消</Button>
          <Button style={{ marginLeft: 8 }} htmlType="submit" type="primary">
            确定
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default UpdateForm;
