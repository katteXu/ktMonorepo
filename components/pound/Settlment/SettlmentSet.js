import { Input, DatePicker, Select, Form, Button, message, Tooltip, Switch, Radio } from 'antd';
import { useState, useEffect, useCallback } from 'react';
import { Search, Msg } from '@components';
import router from 'next/router';
import moment from 'moment';
import { keepState, getState, clearState, Format } from '@utils/common';
import { pound, downLoadFile } from '@api';
import { QuestionCircleFilled } from '@ant-design/icons';
import styles from './styles.less';

const SettlmentSet = props => {
  const [form] = Form.useForm();
  // 表单布局
  const formItemLayout = {
    labelAlign: 'left',
  };
  const [isEraseZero, setIsEraseZero] = useState(true);
  const [isSumLossWeight, setIsSumLossWeight] = useState(false);
  const [sumType, setSumType] = useState(1);
  const [maLingRules, setMaLingRules] = useState(0);

  useEffect(() => {
    getInfo();
  }, []);

  const getInfo = async () => {
    const res = await pound.manPaySetInfo();

    if (res.status === 0) {
      const data = res.result;
      setIsEraseZero(data.isEraseZero);
      setIsSumLossWeight(data.isSumLossWeight);
      form.setFieldsValue({
        sumType: data.sumType + '',
        eraseZeroType: data.eraseZeroType + '',
        agreedLoss: data.agreedLoss > 0 ? (data.agreedLoss / 1000).toFixed(2) : '',
      });
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };

  const handleSubmit = async values => {
    const params = {
      sumType: isEraseZero ? values.sumType : undefined,
      eraseZeroType: isEraseZero ? values.eraseZeroType : undefined,
      agreedLoss: isSumLossWeight ? values.agreedLoss * 1000 : undefined,
      isEraseZero,
      isSumLossWeight,
    };
    const res = await pound.manPaySet({ params });

    if (res.status === 0) {
      message.success('设置成功');
      getInfo();
    } else {
      message.error(`${res.detail || res.description}`);
    }
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  const handleKeyPress = event => {
    if ([189, 187, 69].includes(event.keyCode)) {
      event.preventDefault();
    }
  };
  return (
    <div className={styles.set}>
      <Form
        {...formItemLayout}
        onFinish={handleSubmit}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        form={form}
        initialValues={{
          sumType: '1',
          eraseZeroType: '0',
        }}>
        <Tooltip title="可在此设置结算单中结算金额的抹零计算规则" placement="left">
          <span className={styles.title} style={{ marginBottom: 16, display: 'inline-block' }}>
            抹零设置
            <QuestionCircleFilled style={{ fontSize: 14, marginLeft: 5, color: '#D0D4DB' }} />:
          </span>
        </Tooltip>
        <Form.Item
          label={
            <div>
              <span className={styles.noStar}>*</span>运费抹零
            </div>
          }
          style={{ marginLeft: 32 }}
          wrapperCol={{ span: 20 }}
          name="eraseZero">
          <Switch
            size="small"
            onChange={checked => {
              setIsEraseZero(checked);
              form.setFieldsValue({
                sumType: '1',
                eraseZeroType: '0',
              });
            }}
            checked={isEraseZero}
          />
        </Form.Item>
        {isEraseZero && (
          <div>
            <Form.Item
              label={
                <div>
                  <span className={styles.noStar}>*</span>计算方式
                </div>
              }
              style={{ marginLeft: 32 }}
              wrapperCol={{ span: 20 }}
              name="sumType">
              <Radio.Group>
                <Radio value="0">逐笔计算</Radio>
                <Radio value="1">按车牌计算</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label={
                <div>
                  <span className={styles.noStar}>*</span>抹零规则
                </div>
              }
              style={{ marginLeft: 32 }}
              wrapperCol={{ span: 20 }}
              name="eraseZeroType">
              <Radio.Group>
                <Radio value="0">个位抹零</Radio>
                <Radio value="1">小数点抹零</Radio>
              </Radio.Group>
            </Form.Item>
          </div>
        )}
        <Tooltip
          title="打开计算路耗开关，则审核时编辑货物单价后自动计算路耗，规则：结算运费=运费单价*净重-货物单价*（路损-允许路损）"
          placement="left">
          <span className={styles.title} style={{ marginBottom: 16, display: 'inline-block' }}>
            路耗设置
            <QuestionCircleFilled style={{ fontSize: 14, marginLeft: 5, color: '#D0D4DB' }} />:
          </span>
        </Tooltip>
        <Form.Item
          label={
            <div>
              <span className={styles.noStar}>*</span>计算路耗
            </div>
          }
          style={{ marginLeft: 32 }}
          wrapperCol={{ span: 20 }}
          name="isSumLossWeight">
          <Switch
            size="small"
            onChange={checked => {
              setIsSumLossWeight(checked);
              form.setFieldsValue({
                agreedLoss: '',
              });
            }}
            checked={isSumLossWeight}
          />
        </Form.Item>

        {isSumLossWeight && (
          <Form.Item
            label="允许路损"
            style={{ marginLeft: 32 }}
            wrapperCol={{ span: 20 }}
            name="agreedLoss"
            validateFirst={true}
            rules={[
              { required: true, whitespace: true, message: '内容不能为空' },
              {
                validator: (rule, value) => {
                  if (!value) {
                    return Promise.resolve();
                  } else if (+value > 0) {
                    const val = value.replace(/^(-)*(\d+)\.(\d{1,2}).*$/, '$1$2.$3');
                    form.setFieldsValue({
                      agreedLoss: val,
                    });
                    return Promise.resolve();
                  } else {
                    if (value === '') {
                      return Promise.resolve();
                    } else {
                      const val = value.replace(/^(-)*(\d+)\.(\d{1,2}).*$/, '$1$2.$3');
                      form.setFieldsValue({
                        agreedLoss: val,
                      });
                      return Promise.reject('请输入大于0的数字');
                    }
                  }
                },
              },
            ]}>
            <Input
              placeholder="请输入路损"
              addonAfter={<span>吨</span>}
              style={{ width: 264 }}
              onKeyDown={handleKeyPress}
              type="number"
            />
          </Form.Item>
        )}
        <Form.Item style={{ margin: '24px 0 32px 0', position: 'relative', left: 118 }}>
          <Button type="primary" htmlType="submit">
            保存设置
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SettlmentSet;
