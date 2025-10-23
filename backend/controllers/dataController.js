let data = [
  {
    id: 1,
    phone: '123-456-7890',
    email: 'example@email.com',
    address: '123 Main St, Anytown, USA',
  },
  {
    id: 2,
    phone: '123-456-7890',
    email: 'example@email.com',
    address: '123 Main St, Anytown, USA',
  },
];

const getAllData = (req, res) => {
  const limit = parseInt(req.query.limit) || data.length;
  const limitedData = data.slice(0, limit);
  console.log(limit);

  res.status(200).json(limitedData);
};

const getDataById = (req, res, next) => {
  const id = parseInt(req.params.id);

  let item = data.find((d) => d.id === id);

  if (!item) {
    if (!id) {
      const error = new Error('ID parameter is required');
      error.status = 400;
      return next(error);
    }
    const error = new Error(`Data with the I'd : ${id} was not found`);
    error.status = 404;
    return next(error);
  }
  res.status(200).json(item);
};

const addNewData = (req, res, next) => {
  const bodyData = req.body;
  console.log(bodyData);
  if (!bodyData || typeof bodyData !== 'object') {
    const error = new Error('Invalid data format');
    error.status = 400;
    return next(error);
  }

  const newId = data.length ? data[data.length - 1].id + 1 : 1;
  const newData = {
    id: newId,
    ...bodyData,
  };

  data.push(newData);
  res.status(201).json(newData);
};

const updateDataById = (req, res, next) => {
  const id = parseInt(req.params.id);
  const bodyData = req.body;
  if (!bodyData || typeof bodyData !== 'object') {
    const error = new Error('Invalid data format');
    error.status = 400;
    return next(error);
  }
  let itemIndex = data.findIndex((d) => d.id === id);

  if (itemIndex === -1) {
    const error = new Error(`Data with the ID : ${id} was not found`);
    error.status = 404;
    return next(error);
  }
  data[itemIndex] = { id, ...bodyData };
  res.status(200).json(data[itemIndex]);
};

const deleteDataById = (req, res, next) => {
  const id = parseInt(req.params.id);
  let itemIndex = data.findIndex((d) => d.id === id);

  if (itemIndex === -1) {
    const error = new Error(`Data with the ID : ${id} was not found`);
    error.status = 404;
    return next(error);
  }
  data.splice(itemIndex, 1);
  res.status(200).json({ message: 'Data deleted successfully' });
};

const deleteAllData = (req, res) => {
  data = [];
  res.status(200).json({ message: 'All data deleted successfully' });
};

module.exports = {
  getAllData,
  getDataById,
  addNewData,
  updateDataById,
  deleteDataById,
  deleteAllData,
};
