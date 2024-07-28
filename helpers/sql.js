const { BadRequestError } = require("../expressError");

//**The sqlForPartialUpdate function generates a SQL query for updating specified fields in a database table. 
// It takes two arguments: an object representing the fields to update and their new values, and a mapping object that translates JavaScript-style field names to SQL-style column names.
//  If no data is provided, the function throws a BadRequestError.
//  * 
//  * @param {*} dataToUpdate (Object): An object where the keys are the fields to update and the values are the new values for those fields.
//  *  Example: {firstName: 'Aliya',age: 32}

//  * @param {*} jsToSql  (Object): An object that maps JavaScript-style field names to SQL-style column names.
  //  If a field name in dataToUpdate does not exist in this mapping, it will be used as is. Example:
  //  { firstName: 'first_name'}
  
//  * @returns {Object}: An object containing two properties:

  // setCols (String): A string representing the SQL query fragment for setting the columns to the new values. Example:
          // "first_name"=$1, "age"=$2
  // values (Array): An array of the new values for the specified fields in the order they appear in setCols. Example:
          // ['Aliya', 32]

//  */ 



function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
