var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  if (req.headers.referer !== process.env.UI_URL) {
    res.status(401).send("You are not authorized to access this endpoint")
  }
  res.json([
    {id: 1, username: "kiarash"},
    {id: 2, username: "reza"}
  ])
});

module.exports = router;
