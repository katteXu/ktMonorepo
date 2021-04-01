import { useState } from 'react';
import { createContainer } from 'unstated-next';

const useStore = ({ mode, setMode }) => {
  const [account, setAccount] = useState();
  const changeMode = account => {
    setAccount(account);
    setMode((mode + 1) % 2);
  };

  return { account, mode, changeMode };
};
export default createContainer(useStore);
