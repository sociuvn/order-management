const debug = process.env.DEBUG_MODE;
export const log = (message: any): void => {
  if (debug === 'true') {
    console.log(message);
  }
};

export const info = (message: any): void => {
  console.log(message);
};
