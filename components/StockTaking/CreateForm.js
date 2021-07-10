import React, { Component, useState, useEffect } from 'react';
import '@ant-design/compatible/assets/index.css';
import { Table, Input, InputNumber, Button, Modal, message, Form, Typography } from 'antd';
import s from './CreateForm.less';
import { AutoInputSelect } from '@components';
import { inventory } from '@api';
import { Format } from '@utils/common';
const EditableTable = ({ dataInfo, handleDetail, form, hasWareHouseId, handleDisabledSelect }) => {
  const [data, setData] = useState(dataInfo);
  const [hideAdd, setHideAdd] = useState(false);
  const [closeRow, setCloseRow] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingKey, setEditingKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [newGoodsType, setNewGoodsType] = useState(false);
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 1000,
  });
  const isEditing = record => record.id === editingKey;

  //判断是否有真实的货品信息
  const checkIsHasAdd = data => {
    let resultVal = [];
    if (data.length > 0) {
      resultVal = data.filter(item => item.id === '');
    }
    return resultVal.length ? false : true; //false没有真是货品 true有真实货品
  };

  //初始化渲染表格
  const getList = async ({ page, pageSize }, flag) => {
    const params = {
      page: page,
      limit: pageSize,
    };
    const res = await inventory.getWaitInventoryChecklist({ params });
    if (res.status === 0) {
      setShowAdd(checkIsHasAdd(res.result.data));
      setData(res.result.data);
      if (flag) {
        handleDetail(res.result.data);
        setEditingKey('');
        form.setFieldsValue({
          goodsName: undefined,
          checkNum: '',
        });
        setShowAdd(false);
        handleDisabledSelect(res.result.data.length > 0 ? true : false);
      }
    } else {
      message.error(res.detail || res.description);
    }
  };

  const EditableCell = ({ editing, dataIndex, title, inputType, record, index, children, ...restProps }) => {
    const inputNode =
      inputType === 'number' ? (
        <Input type="number" placeholder="请输入盘点数量" />
      ) : (
        <AutoInputSelect
          mode="goodsType"
          allowClear
          placeholder="请选择货品名称"
          newGoodsType={newGoodsType}
          style={{ width: 200 }}
        />
      );
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{
              margin: 0,
            }}
            validateFirst={true}
            rules={
              inputType === 'number'
                ? [
                  {
                    validator: (rule, value) => {
                      if (+value > 0) {
                        const val = value && value.replace(/^(-)*(\d+)\.(\d{1,2}).*$/, '$1$2.$3');

                        form.setFieldsValue({
                          checkNum: val,
                        });
                        return Promise.resolve();
                      } else {
                        if (!value) {
                          return Promise.reject('请输入盘点数量');
                        }
                        const val = value && value.replace(/^(-)*(\d+)\.(\d{1,2}).*$/, '$1$2.$3');
                        form.setFieldsValue({
                          checkNum: val,
                        });
                        return Promise.reject('请输入大于0的数字');
                      }
                    },
                  },
                ]
                : [{ required: true, message: '请选择货品名称' }]
            }>
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  // const handleEdit = record => {
  //   setShowEdit(true);
  //   form.setFieldsValue({
  //     ...record,
  //     goodsName: record.goodsName || '',
  //     checkNum: record.checkNum / 1000 || '',
  //   });
  //   setEditingKey(record.id);
  // };

  //取消添加货品
  const cancel = () => {
    setEditingKey('');
    form.setFieldsValue({
      goodsName: undefined,
      checkNum: '',
    });
    setShowEdit(false);
  };

  //删除货品
  const handleDelete = async id => {
    const params = {
      did: id,
    };
    const res = await inventory.inventoryCheckDetailDel({ params });
    if (res.status === 0) {
      getList({ ...query }, 1);
      message.success('删除成功');
    } else {
      message.error(res.detail || res.description);
    }
  };

  //保存货品调取接口
  const createFunc = async value => {
    setLoading(true);
    const params = {
      inventoryId: value.goodsName || undefined,
      num: value.checkNum * 1000 || undefined,
      wareHouseId: hasWareHouseId() == -1 ? 0 : hasWareHouseId(),
    };
    const res = await inventory.addInventoryCheckDetail({ params });
    if (res.status === 0) {
      getList({ ...query }, 1);
      message.success('添加成功');
    } else {
      message.error(res.detail || res.description);
      if (res.status == 7) {
        handleDetail(data);
        setEditingKey('');
        setCloseRow(true);
        return;
      }
    }
    form.setFieldsValue({
      goodsName: undefined,
      checkNum: undefined,
    });
    setLoading(false);
  };

  //保存货品
  const handleSave = async key => {
    try {
      const row = await form.validateFields();
      if (hasWareHouseId()) {
        if (key) {
          message.success('编辑成功');
          handleDetail(newData);
          // setData(newData);
          setEditingKey('');
          form.setFieldsValue({
            goodsName: undefined,
            checkNum: '',
          });
        } else createFunc(row);
        setShowEdit(false);
        setCloseRow(false);
      } else {
        message.error('请先选择仓库');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  //取消
  const delectcloseRow = () => {
    const list = data.pop();
    setData([...data]);
    setEditingKey('');
    setCloseRow(false);
    setShowAdd(false);
    form.setFieldsValue({
      goodsName: undefined,
      checkNum: '',
    });
  };

  //表格
  const columns = [
    {
      title: '货品名称',
      dataIndex: 'goodsName',
      width: '25%',
      editable: true,
      render: value => <span>{value || '--'}</span>,
    },
    {
      title: '盘点数量',
      dataIndex: 'checkNum',
      width: '20%',
      editable: true,
      render: value => <span>{Format.weight(value) || '--'}</span>,
    },
    {
      title: '账面库存',
      dataIndex: 'inventoryNum',
      width: '20%',
      editable: false,
      render: value => <span>{Format.weight(value)}</span>,
    },
    {
      title: '盈亏数量',
      dataIndex: 'formatDiffNum',
      width: '20%',
      editable: false,
      render: value => <span>{value || '--'}</span>,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      align: 'right',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Button type="link" size="small" onClick={() => handleSave(record.key)}>
              保存
            </Button>
            <Button type="link" size="small" onClick={() => (closeRow ? delectcloseRow() : cancel())}>
              取消
            </Button>
          </span>
        ) : (
          <div>
            {/* <Typography.Link disabled={editingKey !== ''} onClick={() => handleEdit(record)}>
              编辑
            </Typography.Link> */}
            <Button
              danger
              type="link"
              disabled={editingKey !== ''}
              onClick={() => {
                editingKey !== '' ? {} : handleDelete(record.id);
              }}>
              删除
            </Button>
          </div>
        );
      },
    },
  ];

  const mergedColumns = columns.map(col => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: record => ({
        record,
        inputType: col.dataIndex === 'checkNum' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  //添加一行
  const handleAdd = () => {
    const newData = {
      goodsName: undefined,
      checkNum: '',
      inventoryNum: '',
      formatDiffNum: '',
      id: '',
    };
    setData([...data, newData]);
    setEditingKey(newData.id);
    setCloseRow(true);
    setShowAdd(true);
  };

  useEffect(() => {
    setData(dataInfo);
    if (checkIsHasAdd(dataInfo)) setShowAdd(false);
    else setShowAdd(true);
  }, [dataInfo]);

  return (
    <Form form={form} component={false}>
      <Button
        onClick={handleAdd}
        disabled={!!editingKey || showAdd}
        type="primary"
        style={{
          marginBottom: 16,
        }}>
        新增
      </Button>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={data}
        rowKey={(record, i) => i}
        columns={mergedColumns}
        size="small"
        rowClassName="editable-row"
        // pagination={{
        //   onChange: cancel,
        //   showSizeChanger: false,
        //   pageSize: query.pageSize,
        //   current: query.page,
        //   total: data.length,
        // }}
        pagination={false}
      />
    </Form>
  );
};

export default EditableTable;
