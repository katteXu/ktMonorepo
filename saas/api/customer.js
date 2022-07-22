import request from './request';

// 客户列表
const getDataList = ({ params } = {}) => {
  params = {
    limit: 10,
    page: 1,
    ...params,
  };

  return request({
    method: 'get',
    url: 'api/v1/user/customerAddressList',
    params,
  });
};

// 客户列表 cyg
const getAddresslist = ({ params } = {}) => {
  params = {
    limit: 10,
    page: 1,
    ...params,
  };

  return request({
    method: 'get',
    url: 'api/v1/user/customerAddressManage',
    params,
  });
};

// 客户详情
const getDetail = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/user/getAddressData',
    params,
  });
};

// 新建客户信息  create:'/v1/create',
const addCustomer = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/create',
    data: params,
  });
};

// 编辑客户信息
const updateCustomer = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/user/modifyAddressData',
    params,
  });
};

// 批量导入信息
const importCustomer = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/user/importAddressData',
    data: params,
  });
};

// 删除客户信息
const delCustomer = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/user/deleteAddressData',
    params,
  });
};

// 下载模板
const downTemplate = () => {
  return request({
    method: 'get',
    url: 'api/v1/user/getAddressTemplate',
  });
};

// 客户管理改版

// 新增客户
const createCustomer = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/user/createCustomer',
    data: params,
  });
};
// 客户管理列表
const getCustomerAddressList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/user/getAddrData',
    params,
  });
};

// 修改客户信息
const modifyCustomerAddress = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/user/modifyCustomerAddress',
    data: params,
  });
};

// 修改装卸地址
const modifyCustomerLoadAddress = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/user/modifyCustomerLoadAddress',
    data: params,
  });
};

// 新增客户装卸货地址
const createCustomerLoadAddr = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/user/createCustomerLoadAddr',
    data: params,
  });
};

// 删除当前客户
const deleteCustomerAddress = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/user/deleteCustomerAddress',
    data: params,
  });
};

// 删除装卸货地址
const deleteLoadAddr = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/user/deleteLoadAddr',
    data: params,
  });
};

// 银行卡列表
const getBankList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/bankList',
    params,
  });
};

// 获取车队长列表
const getMiddleManList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/middleman/list',
    params,
  });
};

// 获取车队长信息
const getMiddleManByUserName = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/middleman/getUserInfo',
    params,
  });
};

// 创建车队长
const createMiddleMan = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/middleman/create',
    data: params,
  });
};

// 修改车队长
const updateMiddleMan = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/middleman/update',
    data: params,
  });
};

// 删除车队长
const removeMiddleMan = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/middleman/delete',
    data: params,
  });
};

// 获取车队长详情
const getMiddleManById = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/middleman/getDetail',
    params,
  });
};

// 获取使用中的银行卡信息
const getUsedCard = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/middleman/getUsedCard',
    params,
  });
};

// 获取地址名称
const selectPoundAddress = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/pound/selectPoundAddress',
    params,
  });
};

// 获取客户名称
const customer_list = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_sass/user/customer_list',
    params,
  });
};

// 创建客户
const create_customer = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_sass/user/create_customer',
    params,
  });
};

// 客户详情
const get_customer_detail = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_sass/user/get_customer_detail',
    params,
  });
};

// 客户修改
const modify_customer = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_sass/user/modify_customer',
    params,
  });
};

// 客户修改
const del_customer = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_sass/user/del_customer',
    params,
  });
};

// 公司名称模糊查询
const getCompanyByName = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_sass/user/companySearch',
    params,
  });
};

// 承运企业列表
const getOwnerByCompany = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_saas/user/getOwnerByCompany',
    params: { companyName: '' },
  });
};

export default {
  getDataList,
  getDetail,
  addCustomer,
  updateCustomer,
  importCustomer,
  delCustomer,
  downTemplate,

  createCustomer,
  getCustomerAddressList,
  modifyCustomerAddress,
  modifyCustomerLoadAddress,
  createCustomerLoadAddr,
  deleteCustomerAddress,
  deleteLoadAddr,

  getBankList,
  getMiddleManList,
  getMiddleManByUserName,
  createMiddleMan,
  updateMiddleMan,
  removeMiddleMan,
  getMiddleManById,
  getUsedCard,

  getAddresslist,
  selectPoundAddress,

  customer_list,
  create_customer,
  get_customer_detail,
  modify_customer,
  del_customer,

  getCompanyByName,

  getOwnerByCompany,
};
