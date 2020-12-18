import { createContext } from 'react';

export default createContext({
  page: '',
  setPage: (pageName: string) => {},
});
