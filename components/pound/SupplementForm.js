import React, { useState } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Table, Input, Popconfirm, Button, Modal, DatePicker, message } from 'antd';
import moment from 'moment';
import styles from './supplement.less';
import { ChildTitle } from '@components';
import { QuestionCircleFilled, PlusOutlined } from '@ant-design/icons';
const EditableContext = React.createContext();

const EditableCell = props => {
  const renderCell = ({ getFieldDecorator, getFieldValue, setFieldsValue, validateFields }) => {
    const { editing, dataIndex, title, inputType, record, index, children, ...restProps } = props;

    const getFormItem = () => {
      switch (dataIndex) {
        case 'trailerPlateNumber':
          return (
            <Form.Item style={{ margin: 0 }}>
              {getFieldDecorator('trailerPlateNumber', {
                initialValue: record[dataIndex],
                rules: [
                  {
                    required: true,
                    message: '请输入车牌号',
                  },
                  {
                    pattern: /^(?:[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领 A-Z]{1}[A-HJ-NP-Z]{1}(?:(?:[0-9]{5}[DF])|(?:[DF](?:[A-HJ-NP-Z0-9])[0-9]{4})))|(?:[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领 A-Z]{1}[A-Z]{1}[A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9 挂学警港澳]{1})$/i,
                    message: '车牌号格式输入有误',
                  },
                ],
              })(<Input placeholder="请输入车牌号" />)}
            </Form.Item>
          );

        case 'time':
          return (
            <Form.Item style={{ margin: 0 }}>
              {getFieldDecorator('time', {
                initialValue: record[dataIndex] ? moment(record[dataIndex]) : null,
                rules: [
                  {
                    required: true,
                    message: '请选择时间',
                  },
                ],
              })(<DatePicker placeholder="请选择时间" showTime style={{ width: '100%' }} />)}
            </Form.Item>
          );

        case 'mobilePhoneNumber':
          return (
            <Form.Item style={{ margin: 0 }}>
              {getFieldDecorator('mobilePhoneNumber', {
                initialValue: record[dataIndex],
                rules: [
                  {
                    required: true,
                    message: '请输入司机手机号',
                  },
                  {
                    pattern: /^(?:(?:\+|00)86)?1\d{10}$/,
                    message: '手机号格式输入有误',
                  },
                ],
              })(<Input placeholder="请输入司机手机号" />)}
            </Form.Item>
          );

        case 'totalWeight':
          return (
            <Form.Item style={{ margin: 0 }}>
              {getFieldDecorator('totalWeight', {
                initialValue: record[dataIndex],
                validateFirst: true,
                rules: [
                  {
                    required: true,
                    message: '请输入毛重',
                  },
                  {
                    pattern: /^(\d+|\d+\.\d{1,2})$/,
                    message: '毛重只能是数字，最多两位小数',
                  },
                  {
                    validator: (rule, value, cb) => {
                      let carWeight = getFieldValue('carWeight');
                      carWeight && validateFields(['carWeight']);

                      if (+value < 1) {
                        setFieldsValue({
                          goodsWeight: '',
                        });
                        cb('重量不可少于1吨');
                      }

                      if (+value > 50) {
                        setFieldsValue({
                          goodsWeight: '',
                        });
                        cb('重量不可超过50吨');
                      }

                      if (!value || !/^(\d+|\d+\.\d{1,2})$/.test(value) || !/^(\d+|\d+\.\d{1,2})$/.test(carWeight)) {
                        setFieldsValue({
                          goodsWeight: '',
                        });
                        cb();
                      }

                      if (value && +value <= 100 && /^(\d+|\d+\.\d{1,2})$/.test(carWeight)) {
                        if (carWeight > +value) {
                          setFieldsValue({
                            goodsWeight: '',
                          });
                          cb('毛重必须大于皮重');
                        } else if (!record.isSetting) {
                          carWeight &&
                            setFieldsValue({
                              goodsWeight: (+value - carWeight).toFixed(2),
                            });
                          cb();
                        }
                      }

                      cb();
                    },
                  },
                ],
              })(
                <Input
                  placeholder="请输入毛重"
                  onChange={() => {
                    record.isSetting = false;
                  }}
                />
              )}
            </Form.Item>
          );

        case 'carWeight':
          return (
            <Form.Item style={{ margin: 0 }}>
              {getFieldDecorator('carWeight', {
                initialValue: record[dataIndex],
                validateFirst: true,
                rules: [
                  {
                    required: true,
                    message: '请输入皮重',
                  },
                  {
                    pattern: /^(\d+|\d+\.\d{1,2})$/,
                    message: '皮重只能是数字，最多两位小数',
                  },
                  {
                    validator: (rule, value, cb) => {
                      let totalWeight = getFieldValue('totalWeight');

                      if (+value < 1) {
                        setFieldsValue({
                          goodsWeight: '',
                        });
                        cb('重量不可少于1吨');
                      }

                      if (+value > 50) {
                        setFieldsValue({
                          goodsWeight: '',
                        });
                        cb('重量不可超过50吨');
                      }

                      if (!value || !/^(\d+|\d+\.\d{1,2})$/.test(value) || !/^(\d+|\d+\.\d{1,2})$/.test(totalWeight)) {
                        setFieldsValue({
                          goodsWeight: '',
                        });
                        cb();
                      }

                      if (value && +value >= 1 && +value <= 100 && /^(\d+|\d+\.\d{1,2})$/.test(totalWeight)) {
                        if (totalWeight < +value) {
                          setFieldsValue({
                            goodsWeight: '',
                          });
                          cb('皮重不应该大于毛重');
                        } else if (!record.isSetting) {
                          totalWeight &&
                            setFieldsValue({
                              goodsWeight: (totalWeight - +value).toFixed(2),
                            });
                          cb();
                        }
                      }

                      cb();
                    },
                  },
                ],
              })(
                <Input
                  placeholder="请输入皮重"
                  onChange={() => {
                    record.isSetting = false;
                  }}
                />
              )}
            </Form.Item>
          );

        case 'goodsWeight':
          return (
            <Form.Item style={{ margin: 0 }}>
              {getFieldDecorator('goodsWeight', {
                initialValue: record[dataIndex],
                validateFirst: true,
                rules: [
                  {
                    required: true,
                    message: '请输入净重',
                  },
                  {
                    pattern: /^(\d+|\d+\.\d{1,2})$/,
                    message: '净重只能是数字，最多两位小数',
                  },
                  {
                    validator: (rule, value, cb) => {
                      if (+value <= 50) {
                        let fromGoodsWeight = getFieldValue('fromGoodsWeight');
                        if (value && fromGoodsWeight && /^(\d+|\d+\.\d{1,2})$/.test(fromGoodsWeight)) {
                          setFieldsValue({
                            loss: fromGoodsWeight - +value > 0 ? (fromGoodsWeight - +value).toFixed(2) : '0.00',
                          });
                          cb();
                        } else {
                          setFieldsValue({
                            loss: '',
                          });
                          cb();
                        }
                      } else {
                        setFieldsValue({
                          loss: '',
                        });
                        cb('重量不可超过50吨');
                      }
                    },
                  },
                ],
              })(
                <Input
                  placeholder="请输入净重"
                  onChange={e => handleGoodsWeightChange(e.target.value, getFieldValue, setFieldsValue, record)}
                />
              )}
            </Form.Item>
          );

        case 'fromGoodsWeight':
          return (
            <Form.Item style={{ margin: 0 }}>
              {getFieldDecorator('fromGoodsWeight', {
                initialValue: record[dataIndex],
                validateFirst: true,
                rules: [
                  {
                    required: true,
                    message: '请输入原发净重',
                  },
                  {
                    pattern: /^(\d+|\d+\.\d{1,2})$/,
                    message: '发货净重只能是数字，最多两位小数',
                  },
                  {
                    validator: (rule, value, cb) => {
                      let goodsWeight = getFieldValue('goodsWeight');
                      if (value && +value >= 1 && +value <= 100 && /^(\d+|\d+\.\d{1,2})$/.test(goodsWeight)) {
                        setFieldsValue({
                          loss: +value - goodsWeight > 0 ? (+value - goodsWeight).toFixed(2) : '0.00',
                        });
                        cb();
                      }

                      if (value && +value < 1) {
                        setFieldsValue({
                          loss: '',
                        });
                        cb('重量不可少于1吨');
                      }

                      if (value && +value > 100) {
                        setFieldsValue({
                          loss: '',
                        });
                        cb('重量不可超过50吨');
                      }

                      if (!value || !/^(\d+|\d+\.\d{1,2})$/.test(goodsWeight)) {
                        setFieldsValue({
                          loss: '',
                        });
                        cb();
                      }

                      cb();
                    },
                  },
                ],
              })(<Input placeholder="请输入原发净重" />)}
            </Form.Item>
          );

        case 'loss':
          return <Form.Item style={{ margin: 0 }}>{getFieldDecorator('loss')(<Input disabled={true} />)}</Form.Item>;
      }

      return jsx;
    };

    return <td {...restProps}>{editing ? getFormItem() : children}</td>;
  };

  const handleGoodsWeightChange = (userSetValue, getFieldValue, setFieldsValue, record) => {
    let minus = parseFloat((getFieldValue('totalWeight') - getFieldValue('carWeight')).toFixed(2));
    setFieldsValue = parseFloat((+userSetValue).toFixed(2));

    if (minus !== setFieldsValue) {
      record.isSetting = true;
    }
  };

  // render() {
  return <EditableContext.Consumer>{renderCell}</EditableContext.Consumer>;
  // }
};

// class EditableTable extends React.Component {
const EditableTable = props => {
  const [data, setData] = useState([
    {
      key: 0,
      time: '',
      trailerPlateNumber: '',
      mobilePhoneNumber: '',
      totalWeight: '',
      carWeight: '',
      goodsWeight: '',
      fromGoodsWeight: '',
      loss: '',
    },
  ]);

  const [editingKey, setEditingKey] = useState(0);
  const [count, setCount] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const columns = [
    {
      title: '日期',
      dataIndex: 'time',
      width: '232px',
      editable: true,
    },
    {
      title: '车牌号',
      dataIndex: 'trailerPlateNumber',
      editable: true,
      width: '152px',
    },
    {
      title: '司机手机号',
      dataIndex: 'mobilePhoneNumber',
      editable: true,
      width: '152px',
    },
    {
      title: '毛重(吨)',
      dataIndex: 'totalWeight',
      editable: true,
      width: '128px',
    },
    {
      title: '皮重(吨)',
      dataIndex: 'carWeight',
      editable: true,
      width: '128px',
    },
    {
      title: '净重(吨)',
      dataIndex: 'goodsWeight',
      editable: true,
      width: '128px',
    },
    {
      title: '原发净重(吨)',
      dataIndex: 'fromGoodsWeight',
      editable: true,
      width: '128px',
    },
    {
      title: '路损',
      dataIndex: 'loss',
      editable: true,
      width: '128px',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      fixed: 'right',
      align: 'right',
      width: 100,
      render: (text, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span style={{ lineHeight: '32px' }}>
            <EditableContext.Consumer>
              {form => (
                <Button type="link" size="small" onClick={() => save(form, record)}>
                  保存
                </Button>
              )}
            </EditableContext.Consumer>
            {!record.trailerPlateNumber ? (
              <Button danger type="link" size="small" onClick={() => handleRemove(record.key)}>
                取消
              </Button>
            ) : (
              <Popconfirm title="取消修改?" onConfirm={() => cancel(record)}>
                <Button danger type="link" size="small">
                  取消
                </Button>
              </Popconfirm>
            )}
          </span>
        ) : (
          <div>
            <a disabled={editingKey !== ''} onClick={() => setEditingKey(record.key)} style={{ marginRight: 8 }}>
              修改
            </a>
            <Popconfirm
              title="是否删除该磅单？"
              placement="topRight"
              icon={<QuestionCircleFilled />}
              onConfirm={() => handleRemove(record.key)}>
              <Button type="link" danger style={{ padding: 0, border: 'none', margin: 0 }}>
                删除
              </Button>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  const isEditing = record => record.key === editingKey;

  // 取消新增一行/删除一行
  const cancel = ({ trailerPlateNumber }) => {
    const { data, count } = this.state;
    setEditingKey('');

    if (!trailerPlateNumber) {
      data.splice(count - 1, 1);
      setCount(count - 1);
      setData([...data]);
    }
  };

  // 统一两位数展示
  const formarRecord = values => {
    let {
      carWeight,
      trailerPlateNumber,
      goodsWeight,
      fromGoodsWeight,
      loss,
      totalWeight,
      mobilePhoneNumber,
      time,
    } = values;

    // 统一两位数展示
    carWeight = (+carWeight).toFixed(2);
    goodsWeight = (+goodsWeight).toFixed(2);
    fromGoodsWeight = +fromGoodsWeight ? (+fromGoodsWeight).toFixed(2) : '';
    loss = +loss ? (+loss).toFixed(2) : '';
    totalWeight = (+totalWeight).toFixed(2);

    return {
      carWeight,
      trailerPlateNumber,
      goodsWeight,
      fromGoodsWeight,
      loss,
      totalWeight,
      mobilePhoneNumber,
      time: time.format('YYYY-MM-DD HH:mm:ss'),
    };
  };

  // 保存数据之前判断
  const save = (form, record) => {
    form.validateFields((err, row) => {
      const { key } = record;
      if (!err) {
        const { totalWeight, carWeight, goodsWeight } = row;
        if ((totalWeight - carWeight).toFixed(2) !== (+goodsWeight).toFixed(2)) {
          Modal.confirm({
            title: '当前输入净重和系统净重不符，是否继续补录？',
            content: '点击取消，将按照系统净重进行补录',
            icon: <QuestionCircleFilled />,
            onCancel: () => {
              row = {
                ...row,
                goodsWeight: (totalWeight - carWeight).toFixed(2),
              };
              handlePushInData(key, row);
            },
            onOk: () => handlePushInData(key, row),
          });
        } else {
          handlePushInData(key, row);
        }
      }
    });
  };

  // 把数据保存在 state 中
  const handlePushInData = (key, row) => {
    const newData = [...data];
    const index = newData.findIndex(item => key === item.key);

    row = formarRecord(row);
    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...row,
      });
      setData([...newData]);
      setEditingKey('');
    } else {
      newData.push(row);
      setData([...newData]);
      setEditingKey('');
    }
  };

  // 新增一项
  const handleAddBefore = () => {
    if (data.length) {
      // 上一个补录信息添加完成，才能继续添加
      let { trailerPlateNumber, mobilePhoneNumber, totalWeight, carWeight, goodsWeight } = data.slice(-1)[0];
      if (trailerPlateNumber && mobilePhoneNumber && totalWeight && carWeight && goodsWeight) {
        handleAdd();
      }
    } else {
      handleAdd();
    }
  };

  const handleAdd = () => {
    // const { data } = this.state;
    const newData = {
      key: data.length,
      time: '',
      trailerPlateNumber: '',
      mobilePhoneNumber: '',
      totalWeight: '',
      carWeight: '',
      goodsWeight: '',
      fromGoodsWeight: '',
      loss: '',
    };
    setData([...data, newData]);
    setCount(data.length + 1);
    setEditingKey(data.length);
  };

  // 删除一项
  const handleRemove = key => {
    // let { data, count } = this.state;

    const _data = data
      .filter(item => item.key !== key)
      .map((item, idx) => ({
        ...item,
        key: idx,
      }));

    // this.setState({ data, editingKey: '', count: count - 1 });
    setData([..._data]);
    setEditingKey('');
    setCount(count - 1);
  };

  const beforeSubmit = () => {
    if (!data.length) {
      message.warning('至少添加一条磅单');
    } else {
      let { trailerPlateNumber, mobilePhoneNumber, totalWeight, carWeight, goodsWeight } = data.slice(-1)[0];
      if (trailerPlateNumber && mobilePhoneNumber && totalWeight && carWeight && goodsWeight) {
        let selectedRowKeysTemp = [];

        if (!selectedRowKeys.length) {
          // 用户未选择，则提交所有
          selectedRowKeysTemp = data.map(({ key }) => key);

          setSelectedRowKeys(selectedRowKeysTemp);
        }

        props.submit(data, selectedRowKeys.length ? selectedRowKeys : selectedRowKeysTemp, (flag, leaveData) => {
          setSelectedRowKeys([]);
          if (flag === 'sure') {
            setData([...leaveData]);
          } else if (flag === 'new') {
            const newData = {
              key: 0,
              time: '',
              trailerPlateNumber: '',
              mobilePhoneNumber: '',
              totalWeight: '',
              carWeight: '',
              goodsWeight: '',
              fromGoodsWeight: '',
              loss: '',
            };
            setData([newData]);
            setCount(1);
            setEditingKey(0);
          }
        });
      } else {
        message.warning('请填写并保存当前磅单补录');
      }
    }
  };

  // render() {
  const { form, submiting } = props;
  // const { selectedRowKeys } = this.state;
  const components = {
    body: {
      cell: EditableCell,
    },
  };

  const _columns = columns
    .filter(c => {
      if (props.poundType === 'from' && (c.dataIndex === 'fromGoodsWeight' || c.dataIndex === 'loss')) {
        return false;
      }
      return true;
    })
    .map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          inputType: 'text',
          dataIndex: col.dataIndex,
          title: col.title,
          editing: isEditing(record),
        }),
      };
    });

  const rowSelection = {
    selectedRowKeys,
    // onChange: selectedRowKeys => this.setState({ selectedRowKeys }, console.log(selectedRowKeys)),
    onChange: selectedRowKeys => setSelectedRowKeys(selectedRowKeys),
    fixed: 'left',
  };

  return (
    <div className={styles['table-info']}>
      <div className={styles.header}>
        <div className={styles.title} style={{ marginBottom: 16 }}>
          <ChildTitle className="hei14">磅单列表</ChildTitle>
        </div>
      </div>
      <div className={styles.body}>
        <EditableContext.Provider value={form}>
          <Table
            components={components}
            columns={_columns}
            dataSource={data}
            // rowKey={(record, index) => index}
            rowClassName="editable-row"
            // rowSelection={rowSelection}
            pagination={false}
            scroll={{ x: 900 }}
          />
        </EditableContext.Provider>
      </div>
      <div className={styles['btn-add']}>
        <Button onClick={handleAddBefore} style={{ width: 400 }} block ghost>
          <PlusOutlined style={{ color: '#4A4A5A' }} />
          新增
        </Button>
      </div>
      <div className={styles['btn-bottom']}>
        <Button onClick={props.onClose}>取消</Button>
        <Button style={{ marginLeft: 8 }} onClick={beforeSubmit} type="primary">
          提交
        </Button>
      </div>
    </div>
  );
};

export default Form.create()(EditableTable);
