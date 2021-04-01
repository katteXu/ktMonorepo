import { Input, Button, Form, AutoComplete, message } from 'antd';
import { useState, useEffect, useCallback } from 'react';
import AreaPicker from '@components/AreaPicker';
import { getPlaceSearch } from '@components/Map';
import { getAddressLabel, getAddressCode } from '@utils/common';
import { customer } from '@api';
import { useDebounceFn } from 'ahooks';
import styles from './styles.less';
const { Option } = AutoComplete;
const hashTable = {};
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

const AddressForm = ({ formData = {}, onSubmit, onClose }) => {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [optionsData, setOptionsData] = useState([]);

  // 带入地址信息
  const [tempAddress, setTempAddress] = useState({});

  // 地址定位验证
  const [addressRules, setAddressRules] = useState({});
  // 提交数据
  const handleSubmit = async values => {
    setLoading(true);
    const {
      loadContactMobile,
      loadContactName,
      loadContact2Name,
      loadContact2Mobile,
      loadDetailAddress,
      upAndDownPos,
      loadAddressName,
    } = values;

    const keywords = getAddressLabel(upAndDownPos).join() + loadDetailAddress;
    // 获取定位坐标
    const points = await getPlaceSearch({ keywords });
    if (!points || (points && points.length === 0)) {
      setAddressRules({
        help: '地址定位失败',
        status: 'error',
      });
      setLoading(false);
      return false;
    }
    const [loadProvince, loadCity, loadDistrict] = getAddressLabel(upAndDownPos);
    const [privinceCode, cityCode, countyCode] = getAddressCode(upAndDownPos);

    const [loadLongitude, loadLatitude] = points[0].location.split(',');
    const data = {
      loadContactMobile,
      loadContactName,
      loadContact2Name,
      loadContact2Mobile,
      loadDetailAddress,
      loadProvince,
      loadCity,
      loadDistrict,
      loadLongitude,
      loadLatitude,
      loadAddressName,
      countyCode: tempAddress.countyCode || countyCode || formData.countyCode,
      companyId: tempAddress.companyId || formData.companyId || undefined,
    };
    if (typeof onSubmit === 'function') {
      onSubmit(data);
    }

    setLoading(false);
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  // 内容搜索
  const { run: handleSearch } = useDebounceFn(
    async value => {
      if (value !== '') {
        const params = {
          address: value,
          limit: 100,
        };
        const res = await customer.selectPoundAddress({ params });

        if (!res.status) {
          const data = res.result.data;
          setOptionsData(data);

          data.forEach(item => {
            hashTable[item.companyId] = item;
          });
        } else {
          message.error(res.detail || res.description);
        }
      }
    },
    { wait: 300 }
  );

  // 输入改变
  const handleChange = useCallback(
    value => {
      // 点击Clear清空
      if (value === undefined) {
        if (Object.keys(tempAddress).length > 0) {
          form.setFieldsValue({
            upAndDownPos: [],
            loadDetailAddress: '',
          });
          setTempAddress({});
        }
      }

      if (!value) {
        setOptionsData([]);
      }
    },
    [tempAddress]
  );

  const handleOnSelect = (value, option) => {
    if (value) {
      const info = hashTable[option.key];
      form.setFieldsValue({
        upAndDownPos: [info.province, info.city, info.district],
        loadDetailAddress: info.detailAddress,
      });
      setTempAddress(info);
    }
  };

  useEffect(() => {
    const { province, city, district } = formData;
    form.setFieldsValue({
      loadAddressName: formData.loadAddressName || '',
      upAndDownPos: province && city && district ? [province, city, district] : [],
      loadDetailAddress: formData.detailAddress,
      loadContactName: formData.contactName,
      loadContactMobile: formData.contactMobile,
      loadContact2Name: formData.contact2Name,
      loadContact2Mobile: formData.contact2Mobile,
    });
  }, [formData]);

  return (
    <Form
      {...formItemLayout}
      hideRequiredMark={true}
      initialValues={{}}
      form={form}
      onFinish={handleSubmit}
      onFinishFailed={onFinishFailed}>
      <Form.Item
        label="地址简称"
        name="loadAddressName"
        rules={[
          {
            required: true,
            message: '请输入地址简称',
          },
          {
            pattern: /^[\u4e00-\u9fa5()（）]+$/,
            message: '只能是汉字或（）',
          },
          {
            max: 25,
            message: '地址简称最多不超过25个字符',
          },
        ]}>
        <AutoComplete
          loading={loading}
          style={{ width: '100%' }}
          onSearch={handleSearch}
          onChange={handleChange}
          placeholder="如:方向洗煤厂"
          onSelect={handleOnSelect}
          allowClear={true}>
          {optionsData.map((item, index) => {
            return (
              <Option key={item.companyId} value={item.companyName}>
                {item.companyName}
              </Option>
            );
          })}
        </AutoComplete>
      </Form.Item>

      <Form.Item
        label="所在地区"
        name="upAndDownPos"
        rules={[
          {
            required: true,
            message: '请选择所在地区',
          },
        ]}>
        <AreaPicker useCode={true} />
      </Form.Item>

      <Form.Item
        label="详细地址"
        name="loadDetailAddress"
        help={addressRules.help}
        validateStatus={addressRules.status}
        rules={[
          {
            required: true,
            message: '请输入详细地址',
          },
        ]}>
        <Input placeholder="请输入详细地址" onChange={() => setAddressRules({})} />
      </Form.Item>

      <Form.Item
        label="联系人"
        name="loadContactName"
        validateFirst={true}
        rules={[
          {
            required: true,
            message: '请输入联系人的姓名',
          },
          {
            pattern: /^(?:[\u4e00-\u9fa5·]{2,16})$/,
            message: '姓名只能是汉字',
          },
          {
            max: 10,
            message: '联系人姓名的长度不能超过10',
          },
        ]}>
        <Input placeholder="请输入企业联系人" />
      </Form.Item>

      <Form.Item
        label="联系人电话"
        name="loadContactMobile"
        validateFirst={true}
        rules={[
          {
            required: true,
            message: '请输入联系人的电话',
          },
          {
            pattern: /^\d+$|^\d+[.]?\d+$/,
            message: '电话只能输入数字',
          },
        ]}>
        <Input placeholder="请输入联系人电话" />
      </Form.Item>
      <div style={{ textAlign: 'right' }} className={styles['btn-bottom']}>
        <Button size="default" onClick={() => onClose()}>
          取消
        </Button>
        <Button size="default" type="primary" style={{ marginLeft: 8 }} htmlType="submit" loading={loading}>
          提交
        </Button>
      </div>
    </Form>
  );
};

export default AddressForm;
