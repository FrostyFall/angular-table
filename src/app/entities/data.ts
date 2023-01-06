import { faker } from '@faker-js/faker';

import { TableEntry } from '../interfaces/tableEntry.interface';

const entriesNum = 5;
const data: TableEntry[] = [];

for (let i = 0; i < entriesNum; i++) {
  data.push({
    id: i,
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    age: +faker.random.numeric(2),
  });
}

export default data;
