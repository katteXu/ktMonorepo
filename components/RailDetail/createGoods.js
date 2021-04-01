import { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Select, Input, Button, message, Modal } from 'antd';
import { railWay, getGoodsType } from '@api';
import { QuestionCircleFilled } from '@ant-design/icons';
const { Option } = Select;
// 表单布局
const formItemLayout = {
  labelAlign: 'left',
  labelCol: { span: 4 },
  wrapperCol: { span: 21 },
};

const config = {
  rules: [{ required: true, whitespace: true, message: '选项不可为空' }],
};

const txt_config = {
  rules: [{ required: true, whitespace: true, message: '内容不可为空' }],
};

const styleBottom = {
  height: 50,
  padding: '0 22px',
  borderTop: '1px solid #f0f0f0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
};

class CreateGoods extends Component {
  state = {
    goodsTypes: [],
  };

  componentDidMount() {
    this.getGoodsType();
  }

  getGoodsType = async () => {
    const { status, result, detail, description } = await getGoodsType();
    if (!status) {
      this.setState({
        goodsTypes: result,
      });
    } else {
      message.error(detail || description);
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, onCreated, close } = this.props;

    form.validateFields(async (err, values) => {
      if (err) {
        console.log(err);
        return;
      }

      const params = {
        ...values,
      };

      const res = await railWay.createGoods({ params });

      if (res.status === 0) {
        // message.success('货品添加成功');
        Modal.confirm({
          title: '货品添加成功',
          content: '是否继续添加？',
          icon: <QuestionCircleFilled />,
          onOk: () => {
            form.resetFields();
          },
          onCancel: () => {
            if (typeof close === 'function') {
              form.resetFields();
              close();
            }
          },
        });
        if (typeof onCreated === 'function') {
          onCreated();
        }
      } else {
        Modal.error({
          title: res.description,
          content: res.detail,
          okText: '知道了',
        });
      }
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { goodsTypes } = this.state;

    return (
      <>
        <Form {...formItemLayout} onSubmit={this.handleSubmit} className="login-form" autoComplete="off">
          <Form.Item label="货物类型">
            {getFieldDecorator(
              'goodsType',
              config
            )(
              <Select placeholder="请选择货物类型" style={{ width: '100%' }}>
                {goodsTypes.map(({ key, name }) => (
                  <Option key={key} value={key}>
                    {name}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item label="货品名称">
            {getFieldDecorator('goodsName', {
              validateFirst: true,
              rules: [
                { required: true, whitespace: true, message: '内容不可为空' },
                { pattern: /^[ 0-9a-zA-Z\u4e00-\u9fa5 ]+$/, message: '内容只能是数字、字母或汉字' },
              ],
            })(<Input placeholder="请输入货品名称" />)}
          </Form.Item>
          <Form.Item
            label={
              <div style={{ display: 'inline-block' }}>
                <span style={{ display: 'inline-block', marginRight: 4, visibility: 'hidden' }}>*</span>货品编码
              </div>
            }>
            {getFieldDecorator('goodsCode', {})(<Input placeholder="请输入货品编码" />)}
          </Form.Item>
          <div style={{ textAlign: 'right', ...styleBottom }}>
            <Button
              size="default"
              onClick={() => {
                this.props.close();
              }}>
              取消
            </Button>
            <Button style={{ marginLeft: 8 }} htmlType="submit" type="primary">
              提交
            </Button>
          </div>
        </Form>
      </>
    );
  }
}

export default Form.create({ name: 'createGoods' })(CreateGoods);
