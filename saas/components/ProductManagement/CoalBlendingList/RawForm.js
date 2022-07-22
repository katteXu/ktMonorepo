import styles from './styles.less';
import { Form, Input, Button, Select } from 'antd';
import { WareHouseSelect } from '@components';

const Index = props => {
  const { index, onRemove, form, rawGoods = [], disabled, isShowWarehouse } = props;

  // 移除
  const handleRemove = name => {
    onRemove && onRemove();
    // 删除
    const formData = form.getFieldsValue();
    formData[name] = null;
    form.setFieldsValue({ ...formData });
  };

  return (
    <>
      <div className={styles['title-name']}>
        原料煤种{index}
        {index > 2 && !disabled && (
          <Button type="link" size="small" onClick={() => handleRemove(index)} className={styles['btn-remove']} danger>
            移除
          </Button>
        )}
      </div>
      {isShowWarehouse && (
        <div className={styles.row}>
          <Form.Item
            label="原料煤仓库"
            name={[index, 'wareHouseId']}
            validateFirst={true}
            initialValue={-1}
            rules={[
              {
                required: true,
                message: '请选择原料煤仓库',
              },
            ]}>
            <WareHouseSelect allowClear placeholder="请选择原料煤仓库" style={{ width: 280 }} />
          </Form.Item>
        </div>
      )}

      <div className={styles.row}>
        <Form.Item
          label="原料煤名称"
          name={[index, 'inventoryId']}
          validateFirst={true}
          rules={[{ required: true, message: '内容不可为空' }]}>
          <Select
            allowClear
            placeholder="请选择原料煤名称"
            style={{ width: 280 }}
            disabled={disabled}
            optionFilterProp="children"
            showSearch>
            {rawGoods.map(v => (
              <Select.Option key={v.id} value={v.id}>
                {v.goodsName}
                {' ' + v.addressCompany}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </div>
      <div className={styles.row}>
        <Form.Item
          label="原料煤投入量"
          name={[index, 'weight']}
          validateFirst={true}
          rules={[
            { required: true, message: '内容不可为空' },
            {
              pattern: /^\d+(\.?\d{1,2})?$/,
              message: '内容只能是数字，最多两位小数',
            },
          ]}>
          <Input style={{ width: 280 }} addonAfter="吨" placeholder="请输入原料煤投入量" />
        </Form.Item>
      </div>
    </>
  );
};

export default Index;
