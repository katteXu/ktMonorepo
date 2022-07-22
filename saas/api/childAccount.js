/**
 * Created by qiaoyuning on 2019/9/11
 */
import request from './request';

const getTableData = ({ params } = {}) => {
  params = {
    ...params,
  };
  return request({
    method: 'get',
    url: 'api/v1/user/show_children',
    params,
  });
};

const getRoleData = ({ params } = {}) => {
  params = {
    ...params,
  };
  return request({
    method: 'get',
    url: 'api/v1/auth/list_role',
    params,
  });
};

const deleteAccount = ({ params } = {}) => {
  params = {
    ...params,
  };
  return request({
    method: 'get',
    url: 'api/v1/user/delete_child',
    params,
  });
};

const list_user_permission = ({ params } = {}) => {
  params = {
    ...params,
  };
  return request({
    method: 'get',
    url: 'api/v1/auth/list_user_permission',
    params,
  });
};

const change_child_amount = ({ params } = {}) => {
  params = {
    ...params,
  };
  return request({
    method: 'get',
    url: 'api/v1/user/change_child_amount',
    params,
  });
};

const send_verify_sms = ({ params } = {}) => {
  params = {
    ...params,
  };
  return request({
    method: 'get',
    url: 'api/v1/sms/send_verify_sms',
    params,
  });
};

const create_child = ({ params } = {}) => {
  params = {
    ...params,
  };
  return request({
    method: 'get',
    url: 'api/v1/user/create_child',
    params,
  });
};

const syn_child_poundbill = ({ params } = {}) => {
  params = {
    ...params,
  };
  return request({
    method: 'get',
    url: 'api/v1/user/syn_child_poundbill',
    params,
  });
};

const get_child_info = ({ params } = {}) => {
  params = {
    ...params,
  };
  return request({
    method: 'get',
    url: 'api/v1/user/get_child_info',
    params,
  });
};

const update_child = ({ params } = {}) => {
  params = {
    ...params,
  };
  return request({
    method: 'get',
    url: 'api/v1/user/update_child',
    params,
  });
};

const amount_limit_detail = ({ params } = {}) => {
  params = {
    ...params,
  };
  return request({
    method: 'get',
    url: 'api/v1/user/amount_limit_detail',
    params,
  });
};

// 获取子账号列表
const getChildUsers = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_sass/user/get_all_chid_users',
    params,
  });
};

// 获取权限组列表
const getGroupList = ({ params } = {}) => {
  return request({
    method: 'get',
    url: 'api/v_admin/user/permission_group_list',
    params,
  });
};

// 删除子账号
const deleteChildUser = ({ params } = {}) => {
  return request({
    method: 'post',
    url: 'api/v_sass/user/del_child_user',
    data: params,
  });
};

export default {
  getTableData,
  deleteAccount,
  getRoleData,
  list_user_permission,
  change_child_amount,
  send_verify_sms,
  create_child,
  syn_child_poundbill,
  get_child_info,
  update_child,
  amount_limit_detail,

  getChildUsers,
  getGroupList,
  deleteChildUser,
};
