import { getAccessToken } from '../../util/kiotviet.util';
import { log } from '../../util/console';
import { setEnvValue } from '../../util/env.util';

const tokenCommand = async (options: any) => {
  try {
    const accessToken: string = await getAccessToken();
    if (options.get) {
      log(accessToken);
    }

    if (options.set) {
      setEnvValue('KIOTVIET_TOKEN', accessToken);
    }
  } catch (error) {
    console.error(error.message);
  }
};

export { tokenCommand };
