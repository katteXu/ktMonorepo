import { Input, Button, Form } from 'antd';
import { useState } from 'react';
import styles from './styles.less';
import { ChildTitle } from '@components';
import router from 'next/router';
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
};

const RawGoods = ({ goods }) => {
  return (
    <div className={styles['raw-goods']}>
      {goods.map((good, i) => {
        return (
          <div className={styles['raw-col']}>
            <Form.Item
              label={good.goodsName}
              validateFirst={true}
              name={[good.id, 'inputs']}
              rules={[
                { required: true, message: `${good.goodsName}不可为空` },
                {
                  pattern: /^[0-9]+(.?[0-9]{1,2})?$/,
                  message: '最多输入两位小数',
                },
              ]}>
              <Input placeholder="请输入实际投产吨数" addonAfter="吨" style={{ width: 264 }}></Input>
            </Form.Item>
          </div>
        );
      })}
    </div>
  );
};

const SchemeForm = ({ formData = {}, onSubmit, onClose, targetGood, rawGoods }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 提交数据
  const handleSubmit = async values => {
    const params = {
      rawMaterial: rawGoods.map(item => ({ ...item, inputs: values[item.id].inputs * 1000 })),
      targetGoods: {
        inventoryId: targetGood.inventoryId,
        goodsName: targetGood.goodsName,
        unitPrice: targetGood.unitPrice || undefined,
        ashContent: values.ashContent && (values.ashContent * 100).toFixed(0) * 1,
        bond: values.bond && (values.bond * 100).toFixed(0) * 1,
        carbon: values.carbon && (values.carbon * 100).toFixed(0) * 1,
        cinder: values.cinder && (values.cinder * 100).toFixed(0) * 1,
        cleanCoal: values.cleanCoal && (values.cleanCoal * 100).toFixed(0) * 1,
        colloid: values.colloid && (values.colloid * 100).toFixed(0) * 1,
        midCoal: values.midCoal && (values.midCoal * 100).toFixed(0) * 1,
        output: (values.output * 1000).toFixed(0) * 1,
        recovery: values.recovery && (values.recovery * 100).toFixed(0) * 1,
        stone: values.stone && (values.stone * 100).toFixed(0) * 1,
        sulfur: values.sulfur && (values.sulfur * 100).toFixed(0) * 1,
        totalWaterContent: values.totalWaterContent && (values.totalWaterContent * 100).toFixed(0) * 1,
        volatilization: values.volatilization && (values.volatilization * 100).toFixed(0) * 1,
        waterContent: values.waterContent && (values.waterContent * 100).toFixed(0) * 1,
      },
    };

    setLoading(true);
    onSubmit && onSubmit(params);
    setLoading(false);
    router.push('/productManagement/coalBlendingManagement');
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  return (
    <Form
      className={styles['scheme-form']}
      {...formItemLayout}
      initialValues={formData}
      autoComplete="off"
      layout="inline"
      form={form}
      onFinish={handleSubmit}
      onFinishFailed={onFinishFailed}>
      <div className={styles.title}>
        <ChildTitle style={{ height: 26 }}>原料煤投入量</ChildTitle>
      </div>
      <RawGoods goods={rawGoods} />

      <div className={styles.title}>
        <ChildTitle style={{ height: 26 }}>实际产出指标</ChildTitle>
      </div>
      <div className={styles.row} style={{ marginTop: 24 }}>
        <div className={styles.col}>
          <Form.Item
            label={targetGood.goodsName}
            name="output"
            validateFirst={true}
            rules={[
              { required: true, message: `${targetGood.goodsName}不可为空` },
              {
                pattern: /^[0-9]+(.?[0-9]{1,2})?$/,
                message: '最多输入两位小数',
              },
            ]}>
            <Input placeholder={`请输入实际产出吨数`} addonAfter="吨" style={{ width: 264 }} />
          </Form.Item>
        </div>
        <div className={styles.col}></div>
      </div>
      <div className={styles.row}>
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>水分(% Mad)
              </div>
            }
            name="waterContent"
            validateFirst={true}
            rules={[
              {
                pattern: /^[0-9]+(.?[0-9]{1,2})?$/,
                message: '最多输入两位小数',
              },
              {
                whitespace: true,
                type: 'number',
                transform: value => Number(value) || 0,
                max: 100,
                message: '内容不可超过100',
              },
            ]}>
            <Input placeholder="请输入" style={{ width: 200 }} />
          </Form.Item>
        </div>
        <div className={styles.col}>
          <Form.Item
            label="灰分(% Ad)"
            name="ashContent"
            validateFirst={true}
            rules={[
              { required: true, message: `内容不可为空` },
              {
                pattern: /^[0-9]+(.?[0-9]{1,2})?$/,
                message: '最多输入两位小数',
              },
              {
                whitespace: true,
                type: 'number',
                transform: value => Number(value) || 0,
                max: 100,
                message: '内容不可超过100',
              },
            ]}>
            <Input placeholder="请输入" style={{ width: 200 }} />
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.col}>
          <Form.Item
            label="挥发(% Vdaf)"
            name="volatilization"
            validateFirst={true}
            rules={[
              { required: true, message: `内容不可为空` },
              {
                pattern: /^[0-9]+(.?[0-9]{1,2})?$/,
                message: '最多输入两位小数',
              },
              {
                whitespace: true,
                type: 'number',
                transform: value => Number(value) || 0,
                max: 100,
                message: '内容不可超过100',
              },
            ]}>
            <Input placeholder="请输入" style={{ width: 200 }} />
          </Form.Item>
        </div>
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>焦渣特征(1-8
                CRC)
              </div>
            }
            name="cinder"
            rules={[
              {
                pattern: /^[0-8]\d*$/,
                message: '请输入正确的数值:1-8',
              },
              {
                whitespace: true,
                type: 'number',
                transform: value => Number(value) || 0,
                max: 8,
                message: '请输入正确的数值:1-8',
              },
            ]}>
            <Input placeholder="请输入" style={{ width: 200 }} />
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.col}>
          <Form.Item
            label="全硫(% Std)"
            name="sulfur"
            validateFirst={true}
            rules={[
              { required: true, message: `内容不可为空` },
              {
                pattern: /^[0-9]+(.?[0-9]{1,2})?$/,
                message: '最多输入两位小数',
              },
              {
                whitespace: true,
                type: 'number',
                transform: value => Number(value) || 0,
                max: 100,
                message: '内容不可超过100',
              },
            ]}>
            <Input placeholder="请输入" style={{ width: 200 }} />
          </Form.Item>
        </div>
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>固定碳(% Fcd)
              </div>
            }
            name="carbon"
            validateFirst={true}
            rules={[
              { required: false, message: `内容不可为空` },
              {
                pattern: /^[0-9]+(.?[0-9]{1,2})?$/,
                message: '最多输入两位小数',
              },
              {
                whitespace: true,
                type: 'number',
                transform: value => Number(value) || 0,
                max: 100,
                message: '内容不可超过100',
              },
            ]}>
            <Input placeholder="请输入" style={{ width: 200 }} />
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>回收(% r)
              </div>
            }
            name="recovery"
            validateFirst={true}
            rules={[
              {
                pattern: /^[0-9]+(.?[0-9]{1,2})?$/,
                message: '最多输入两位小数',
              },
              {
                whitespace: true,
                type: 'number',
                transform: value => Number(value) || 0,
                max: 100,
                message: '内容不可超过100',
              },
            ]}>
            <Input placeholder="请输入" style={{ width: 200 }} />
          </Form.Item>
        </div>
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>全水分(% Mt)
              </div>
            }
            name="totalWaterContent"
            validateFirst={true}
            rules={[
              {
                pattern: /^[0-9]+(.?[0-9]{1,2})?$/,
                message: '最多输入两位小数',
              },
              {
                whitespace: true,
                type: 'number',
                transform: value => Number(value) || 0,
                max: 100,
                message: '内容不可超过100',
              },
            ]}>
            <Input placeholder="请输入" style={{ width: 200 }} />
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.col}>
          <Form.Item
            label="粘结指数(GRI)"
            name="bond"
            validateFirst={true}
            rules={[
              { required: true, message: `内容不可为空` },
              {
                pattern: /^[0-9]+(.?[0-9]{1,2})?$/,
                message: '最多输入两位小数',
              },
              {
                whitespace: true,
                type: 'number',
                transform: value => Number(value) || 0,
                max: 100,
                message: '内容不可超过100',
              },
            ]}>
            <Input placeholder="请输入" style={{ width: 200 }} />
          </Form.Item>
        </div>
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>胶质层(Y)
              </div>
            }
            name="colloid"
            validateFirst={true}
            rules={[
              {
                pattern: /^[0-9]+(.?[0-9]{1,2})?$/,
                message: '最多输入两位小数',
              },
              {
                whitespace: true,
                type: 'number',
                transform: value => Number(value) || 0,
                max: 100,
                message: '内容不可超过100',
              },
            ]}>
            <Input placeholder="请输入" style={{ width: 200 }} />
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>含矸石(%)
              </div>
            }
            name="stone"
            validateFirst={true}
            rules={[
              {
                pattern: /^[0-9]+(.?[0-9]{1,2})?$/,
                message: '最多输入两位小数',
              },
              {
                whitespace: true,
                type: 'number',
                transform: value => Number(value) || 0,
                max: 100,
                message: '内容不可超过100',
              },
            ]}>
            <Input placeholder="请输入" style={{ width: 200 }} />
          </Form.Item>
        </div>
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>含中煤(%)
              </div>
            }
            name="midCoal"
            validateFirst={true}
            rules={[
              {
                pattern: /^[0-9]+(.?[0-9]{1,2})?$/,
                message: '最多输入两位小数',
              },
              {
                whitespace: true,
                type: 'number',
                transform: value => Number(value) || 0,
                max: 100,
                message: '内容不可超过100',
              },
            ]}>
            <Input placeholder="请输入" style={{ width: 200 }} />
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        {/* 含精煤 */}
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>含精煤(%)
              </div>
            }
            name="cleanCoal"
            validateFirst={true}
            rules={[
              {
                pattern: /^[0-9]+(.?[0-9]{1,2})?$/,
                message: '最多输入两位小数',
              },
              {
                whitespace: true,
                type: 'number',
                transform: value => Number(value) || 0,
                max: 100,
                message: '内容不可超过100',
              },
            ]}>
            <Input placeholder="请输入" style={{ width: 200 }} />
          </Form.Item>
        </div>
        <div className={styles.col}></div>
      </div>
      <div className={styles.bottom}>
        <Button size="default" type="primary" htmlType="submit" loading={loading}>
          提交
        </Button>
      </div>
    </Form>
  );
};

export default SchemeForm;
