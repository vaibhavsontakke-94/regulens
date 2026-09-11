import handleApi from "../../server/api.js";

export default function handler(req, res) {
  const segments = Array.isArray(req.query.path) ? req.query.path : req.query.path ? [req.query.path] : [];
  return handleApi(req, res, segments);
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "2mb",
    },
  },
};