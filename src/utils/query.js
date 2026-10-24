function pagination(query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 8));
  return { page, limit, skip: (page - 1) * limit };
}
function dateRange(query, field = 'createdAt') {
  const filter = {};
  if (query.from || query.to) {
    filter[field] = {};
    if (query.from && !Number.isNaN(Date.parse(query.from))) filter[field].$gte = new Date(query.from);
    if (query.to && !Number.isNaN(Date.parse(query.to))) { const end = new Date(query.to); end.setHours(23,59,59,999); filter[field].$lte = end; }
    if (!Object.keys(filter[field]).length) delete filter[field];
  }
  return filter;
}
module.exports = { pagination, dateRange };
