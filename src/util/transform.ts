import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';

function transformObjects<T>(className: new () => T, data: object[]): T[] {
  return plainToInstance(className, data);
}

function transformObject<T>(className: new () => T, data: object): T {
  return plainToInstance(className, data);
}

export { transformObject, transformObjects };
