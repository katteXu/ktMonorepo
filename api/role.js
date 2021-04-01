import request from './request';

const getTableData = ({ params } = {}) => {
  params = {
    limit: 10,
    page: 1,
    ...params,
  };
  return request({
    method: 'get',
    url: 'api/v1/auth/list_role',
    params,
  });
};

const delete_role = ({ params } = {}) => {
  params = {
    ...params,
  };
  return request({
    method: 'get',
    url: 'api/v1/auth/delete_role',
    params,
  });
};

const list_permission = ({ params } = {}) => {
  params = {
    ...params,
  };
  return request({
    method: 'get',
    url: 'api/v1/auth/list_permission',
    params,
  });
};

const add_role = ({ params } = {}) => {
  params = {
    ...params,
  };
  return request({
    method: 'get',
    url: 'api/v1/auth/add_role',
    params,
  });
};

const update_role_permission = ({ params } = {}) => {
  params = {
    ...params,
  };
  return request({
    method: 'get',
    url: 'api/v1/auth/update_role_permission',
    params,
  });
};

export default {
  getTableData,
  delete_role,
  list_permission,
  add_role,
  update_role_permission,
};
