export function notFoundHandler(req, res) {
  res.status(404).json({ message: 'Not found' });
}

export function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
}
