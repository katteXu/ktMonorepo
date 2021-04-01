import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { getMessage } from '@api';

const useMessage = (initialState = []) => {
  const [messageList, setMessageList] = useState(initialState);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const { userId } = window.localStorage;
    if (userId) {
      const res = await getMessage();
      if (res.status === 0) {
        setMessageList(res.result.data);
      }
    }
  };

  const reloadPermissions = () => {
    setMessageList([]);
  };
  return { messageList, reloadPermissions };
};
export default createContainer(useMessage);
