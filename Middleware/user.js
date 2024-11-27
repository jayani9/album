// check user role is equal to admin
const checkIsUser = (req, res, next) => {
  if (req.query.user === 'admin') {
    next();
  } else {
    return res.status(401).json({ message: 'Unauthorized Request!' });
  }
};

module.exports = checkIsUser;
