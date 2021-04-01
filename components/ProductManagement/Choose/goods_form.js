import { Input, Button, Form, Radio, Select } from 'antd';
import { useState, useEffect, useCallback } from 'react';
import styles from './styles.less';
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
};

const GoodsForm = ({ formData = {}, onSubmit, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  // 提交数据
  const handleSubmit = async values => {
    setLoading(true);
    onSubmit &&
      onSubmit({
        ...values,
        id: formData.id,
        goodsName: formData.goodsName,
        inventoryId: formData.inventoryId,
        companyName: formData.companyName,
      });
    setLoading(false);
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  return (
    <Form
      className={styles['goods-form']}
      {...formItemLayout}
      initialValues={formData}
      autoComplete="off"
      layout="inline"
      form={form}
      onFinish={handleSubmit}
      onFinishFailed={onFinishFailed}>
      <div className={styles.title}>基础信息</div>
      <div className={styles.row}>
        <div className={styles.col}>
          <span className={styles.label}>货物类型：</span>
          <span>{formData.goodsType}</span>
        </div>
        <div className={styles.col}>
          <span className={styles.label}>货品名称：</span>
          <span>{formData.goodsName}</span>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.col}>
          <span className={styles.label}>合作方：</span>
          <span>{formData.companyName || '-'}</span>
        </div>
        <div className={styles.col}>
          <Form.Item
            label="成本单价(元/吨)"
            name="unitPrice"
            validateFirst={true}
            rules={[
              { required: true, message: '成本单价不可为空' },
              { pattern: /^([1-9][0-9]*(\.\d*)?)|(0\.\d*)$/, message: '内容必须是数字且大于0' },
              { pattern: /^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/, message: '最多输入2位小数' },
            ]}>
            <Input placeholder="请输入成本单价" />
          </Form.Item>
        </div>
      </div>

      <div className={styles.title}>指标标准</div>
      <div className={styles.row}>
        {/* 水分 */}
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>水分(% Mad)
              </div>
            }
            // label="水分(% Mad)"
            name="standard_mad"
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
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
        {/* 灰分 */}
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>灰分(% Ad)
              </div>
            }
            // label="灰分(% Ad)"
            name="standard_ad"
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
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.col}>
          {/* 挥发 */}
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>挥发(% Vdaf)
              </div>
            }
            // label="挥发(% Vdaf)"
            name="standard_vdaf"
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
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
        {/* 焦渣特征 */}
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>焦渣特征(1-8
                CRC)
              </div>
            }
            // label="焦渣特征(1-8 CRC)"
            name="standard_crc"
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
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        {/* 全硫 */}
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>全硫(% Std)
              </div>
            }
            // label="全硫(% Std)"
            name="standard_std"
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
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
        {/* 固定碳 */}
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>固定碳(% Fcd)
              </div>
            }
            // label="固定碳(% Fcd)"
            name="standard_fcd"
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
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
      </div>
      {/* 回收 */}
      <div className={styles.row}>
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>回收(% r)
              </div>
            }
            // label="回收(% r)"
            name="standard_r"
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
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
        {/* 全水分 */}
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>全水分(% Mt)
              </div>
            }
            // label="全水分(% Mt)"
            name="standard_mt"
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
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        {/* 粘结指数 */}
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>粘结指数(GRI)
              </div>
            }
            // label="粘结指数(GRI)"
            name="standard_gri"
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
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
        {/* 胶质层 */}
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>胶质层(Y)
              </div>
            }
            // label="胶质层(Y)"
            name="standard_y"
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
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
      </div>
      <div className={styles.row}>
        {/* 含矸石 */}
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>含矸石(%)
              </div>
            }
            // label="含矸石(%)"
            name="standard_gangue"
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
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
        {/* 含中煤 */}
        <div className={styles.col}>
          <Form.Item
            label={
              <div>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>含中煤(%)
              </div>
            }
            // label="含中煤(%)"
            name="standard_middle"
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
            <Input placeholder="请输入" />
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
            // label="含精煤(%)"
            name="standard_coal"
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
            <Input placeholder="请输入" />
          </Form.Item>
        </div>
        <div className={styles.col}></div>
      </div>
      <div className={styles.bottom}>
        <Button size="default" onClick={() => onClose && onClose()}>
          取消
        </Button>
        <Button size="default" type="primary" style={{ marginLeft: 8 }} htmlType="submit" loading={loading}>
          提交
        </Button>
      </div>
    </Form>
  );
};

export default GoodsForm;
