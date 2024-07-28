const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require('../expressError');

describe('sqlForPartialUpdate', () => {
  test('should generate proper SQL query and values for a single field update', () => {
    const dataToUpdate = { firstName: 'Aliya' };
    const jsToSql = { firstName: 'first_name' };
    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);
    
    expect(result).toEqual({
      setCols: '"first_name"=$1',
      values: ['Aliya'],
    });
  });

  test('should generate proper SQL query and values for multiple fields update', () => {
    const dataToUpdate = { firstName: 'Aliya', age: 32 };
    const jsToSql = { firstName: 'first_name' };
    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(result).toEqual({
      setCols: '"first_name"=$1, "age"=$2',
      values: ['Aliya', 32],
    });
  });

  test('should throw BadRequestError if no data is provided', () => {
    const dataToUpdate = {};
    const jsToSql = { firstName: 'first_name' };

    expect(() => {
      sqlForPartialUpdate(dataToUpdate, jsToSql);
    }).toThrow(BadRequestError);
  });

  test('should use column names as is if not found in jsToSql', () => {
    const dataToUpdate = { lastName: 'Smith' };
    const jsToSql = { firstName: 'first_name' };
    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(result).toEqual({
      setCols: '"lastName"=$1',
      values: ['Smith'],
    });
  });

  test('should handle mixed columns with and without jsToSql mappings', () => {
    const dataToUpdate = { firstName: 'Aliya', lastName: 'Smith', age: 32 };
    const jsToSql = { firstName: 'first_name' };
    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(result).toEqual({
      setCols: '"first_name"=$1, "lastName"=$2, "age"=$3',
      values: ['Aliya', 'Smith', 32],
    });
  });
});
