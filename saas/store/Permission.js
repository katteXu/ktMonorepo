import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { getUserPermission } from '@api';

const usePermission = (initialState = []) => {
  const [permissions, setPermissions] = useState(initialState);
  const [isSuperUser, setIsSuperUser] = useState(false);
  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const { userId } = window.localStorage;
    console.log(userId);
    if (userId) {
      const res = await getUserPermission();
      if (res.status === 0) {
        setPermissions(res.result.permissions);
        setIsSuperUser(res.result.is_boss);
      }
    }
  };

  const reloadPermissions = () => {
    setPermissions([]);
  };
  return { permissions, isSuperUser, reloadPermissions, reloadPermissions: () => getData() };
};
export default createContainer(usePermission);
