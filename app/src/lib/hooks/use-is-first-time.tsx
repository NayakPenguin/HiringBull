import { useMMKVBoolean } from 'react-native-mmkv';

import { storage } from '../storage';

const IS_FIRST_TIME = 'IS_FIRST_TIME';

export const useIsFirstTime = (): [boolean, (value: boolean) => void] => {
  const [isFirstTime, setIsFirstTime] = useMMKVBoolean(IS_FIRST_TIME, storage);
  // const [isFirstTime, setIsFirstTime] = useState(true);
  if (isFirstTime === undefined) {
    return [true, setIsFirstTime];
  }
  return [isFirstTime, setIsFirstTime];
};
