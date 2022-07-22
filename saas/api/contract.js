import request from './request';

// 查看合同
const getQueryContract = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/user/query_contract',
    params,
  });
};

// 合同详情
const getContractDetail = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/user/get_contractModel',
    params,
  });
};

// 下载合同
const downContract = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/transport/down_contract',
    params,
  });
};

// 货运合同列表
const getContractLit = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/user/contractModel_list',
    params,
  });
};

// 购销合同列表
const getPurchaseList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/contractOverload/contractList',
    params,
  });
};

// 购销合同详情
const getPurchaseDetail = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/contractOverload/contractDetail',
    params,
  });
};

// 删除购销合同
const deletePurchase = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/contractOverload/deleteContract',
    params,
  });
};

// 获取税率
const getTaxRate = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/contractOverload/getTaxRate',
    params,
  });
};

// 设置税率
const editTaxRate = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v1/contractOverload/setTaxRate',
    params,
  });
};

// 新建合同
const addContract = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/contractOverload/addContract',
    data: params,
  });
};

// 识别图片
const getWords = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v1/contractOverload/getWords',
    data: params,
  });
};

// 判断该专线是否开启
const isContractDispatch = ({ params } = {}) =>
  request({
    method: 'get',
    url: 'api/v1/contractOverload/isContractDispatch',
    params,
  });

// 合同列表
const contract_list = ({ params } = {}) =>
  request({
    method: 'get',
    url: 'api/v_sass/user/contract_list',
    params,
  });

// 创建合同
const create_contract = ({ params } = {}) =>
  request({
    method: 'post',
    url: 'api/v_sass/user/create_contract',
    data: params,
  });

// 合同详情
const contract_detail = ({ params } = {}) =>
  request({
    method: 'get',
    url: 'api/v_sass/user/contract_detail',
    params,
  });
// 关联合同
const relation_contract = ({ params } = {}) =>
  request({
    method: 'get',
    url: 'api/v_sass/user/relation_contract',
    params,
  });

// 关联合同
const get_thirty_contract_info = ({ params } = {}) =>
  request({
    method: 'get',
    url: 'api/v_sass/user/get_thirty_contract_info',
    params,
  });

// 删除合同
const del_contract = ({ params } = {}) =>
  request({
    method: 'get',
    url: 'api/v_sass/user/del_contract',
    params,
  });

// 编辑合同
const modify_contract = ({ params } = {}) =>
  request({
    method: 'get',
    url: 'api/v_sass/user/modify_contract',
    params,
  });

// 选择合同
const contract_choice = ({ params } = {}) =>
  request({
    method: 'get',
    url: 'api/v_sass/user/contract_choice',
    params,
  });
export default {
  getQueryContract,
  downContract,
  getContractLit,
  getContractDetail,
  getPurchaseList,
  getPurchaseDetail,
  deletePurchase,
  getTaxRate,
  editTaxRate,
  addContract,
  getWords,
  isContractDispatch,
  contract_list,
  create_contract,
  contract_detail,
  relation_contract,
  get_thirty_contract_info,
  del_contract,
  modify_contract,
  contract_choice,
};
