// Sequelize Validator Error
export const sequelizeValidationError = (errors) => {
    const err = new Error("Validation failed");
    err.status = 400;
    err.errors = errors.reduce((acc, err) => {
        if(acc[err.path]) acc[err.path].push(err.message);
        else acc[err.path] = [err.message]
        return acc;
    }, {})

    return err
}

// Missing Required Field
export const missingFieldError = (missingFields) => {
    const err = new Error("Missing required fields");
    err.status = 400;
    err.errors = missingFields.map(field => ({ [field.toLowerCase()]: `${field} is required`}))

    return err;
}

// Non Sequelize Validator Error
export const validationError = (errors) => {
    const err = new Error("Validation failed");
    err.status = 400;
    err.errors = errors;

    return err;
}

// Generic Error
export const genericError = (message = "Internal Server Error") => {
    const err = new Error(message);
    err.status = 500;

    return err;
}

// 401 Unauthorized
export const unauthorizedError = (message = "Unauthorized") => {
  const err = new Error(message);
  err.status = 401;
  err.errors = { authorization: message };

  return err;
}

// 403 Forbidden
export const forbiddenError = (message = "Forbidden") => {
  const err = new Error(message);
  err.status = 403;
  err.errors = { authorization: message };

  return err;
}

// 404 Not Found
export const notFoundError = (resource, id) => {
    const err = new Error("Resource not found");
    err.status = 404;
    err.errors = {[resource.toLowerCase()]:`Resource ${resource.toLowerCase()} with key ${id} not found`}

    return err;
}

// 405 Method Not Allowed
export const methodNotAllowedError = (path, allowedMethods = []) => {
    const err = new Error(`Method not allowed for ${path}`);
    err.status = 405;
    err.errors = {
        path,
        allowedMethods,
        message: `Allowed methods for ${path}: ${allowedMethods.join(", ")}`,
    };
    err.allowedMethods = allowedMethods;

    return err;
};

// 409 Conflict
export const conflictError = (errors) => {
    const err = new Error("Conflict Found")
    err.status = 409;
    err.errors = errors;

    return err;
}

// 409 from a SequelizeUniqueConstraintError, naming the conflicting fields.
// Sequelize's own message is just "Validation error", which is useless to the
// client; the duplicated columns live in e.errors[].path.
export const uniqueConstraintError = (e) => {
    const fields = e?.errors?.length
        ? e.errors.map((item) => ({ [item.path]: `${item.path} already in use` }))
        : [{ message: "Duplicate value for a unique field" }];

    return conflictError(fields);
}

// 410 Gone
export const goneError = (resource, id, message = null) => {
  const err = new Error(message || "Resource gone");
  err.status = 410;
  err.errors = {
    [resource.toLowerCase()]: message || `Resource ${resource.toLowerCase()} with key ${id} is gone and no longer available`
  };

  return err;
}

// 418 I'm a teapot
export const teapotError = (message = "I'm a teapot") => {
  const err = new Error(message);
  err.status = 418;
  err.errors = { teapot: message };

  return err;
}