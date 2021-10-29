import { rm } from 'fs/promises';
import { join } from 'path';
import { getConnection } from 'typeorm';

global.beforeEach(async () => {
  try {
    await rm(join(__dirname, '../test.sqlite'));
  } catch (error) {
    console.log(error.message);
  }
});

global.afterEach(async () => {
  const con = getConnection();
  await con.close();
});
