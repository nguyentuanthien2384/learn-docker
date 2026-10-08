exports.index = (req, res) => {
  res.render("home/index", {
    title: "Hello World",
    method: req.method,
    path: req.path,
  });
};
