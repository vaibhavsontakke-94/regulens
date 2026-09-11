export function ok(res, data, status = 200) {
  return res.status(status).json({ ok: true, data });
}

export function created(res, data) {
  return ok(res, data, 201);
}

export function noContent(res) {
  return res.status(204).end();
}

export function fail(res, status, code, message) {
  return res.status(status).json({ ok: false, error: { code, message } });
}

export function badRequest(res, message) {
  return fail(res, 400, "BAD_REQUEST", message);
}

export function unauthorized(res, message = "Authentication required.") {
  return fail(res, 401, "UNAUTHORIZED", message);
}

export function forbidden(res, message = "You do not have access to this resource.") {
  return fail(res, 403, "FORBIDDEN", message);
}

export function notFound(res, message = "Resource not found.") {
  return fail(res, 404, "NOT_FOUND", message);
}

export function conflict(res, message = "Resource already exists.") {
  return fail(res, 409, "CONFLICT", message);
}

export function methodNotAllowed(res) {
  return fail(res, 405, "METHOD_NOT_ALLOWED", "HTTP method not supported for this route.");
}