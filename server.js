const express = require('express');
const bodyParser = require('body-parser');
const uuidv1 = require('uuid/v1');
const moment = require('moment');


/**
 * returns current date & time
 */
const createDate = () => moment().format('MMMM Do YYYY, h:mm:ss a');


const removeWhiteSpace = text => text.trim();


// lions container db
let lions = [];


const server = express();

server.use(bodyParser.json());

/**
 *  validates json keys and values
 */
const requestBodyValidator = () => {
  const validatorFunc = (req, res, next) => {
    // list of required values
    const requiredLionKeys = ['name', 'age', 'pride', 'gender'];
    const unwantedKeys = [];
    const { body } = req;
    const reqKeys = [];
    const typeValidator = { validationErrors: [] };
    const lionKeys = Object.keys(body);

    //   check if JSON is either empty or wasn't sent
    if (Object.entries(body).length === 0 && body.constructor === Object) {
      res.status(400).json({ error: 'JSON object not detected or is empty' });
      return;
    }


    // check if only required keys exist in the req object
    lionKeys.forEach((key) => {
      if (!requiredLionKeys.includes(key)) {
        unwantedKeys.push(key);
      }
    });

    // check if required keys exist
    requiredLionKeys.forEach((key) => {
      if (!lionKeys.includes(key)) {
        reqKeys.push(key);
      }
    });


    //   check if both required and unwanted keys exist
    // eslint-disable-next-line max-len
    if ((unwantedKeys.length > 0) && (reqKeys.length > 0 && reqKeys.length < requiredLionKeys.length)) {
      res.status(400).json({
        error: 'required keys missing and unwanted keys exist',
        missingKeys: reqKeys,
        unwantedKeys,
      });
      return;
    }

    //   check if unwanted keys exist and send back an error message
    if (unwantedKeys.length) {
      res.status(400).json({
        error: 'unwanted keys found',
        unwantedKeys,
      });

      return;
    }

    //   check if required keys are missing
    if (reqKeys.length > 0 && reqKeys.length < requiredLionKeys.length) {
      res.status(400).json({ error: 'required keys missing', missingKeys: reqKeys });
      return;
    }

    // validate file types
    const allKeys = Object.entries(body);

    const { validationErrors } = typeValidator;

    allKeys.forEach((key) => {
      if ((key[0] === 'age') && (!+key[1] || !Number.isInteger(key[1]))) {
        validationErrors.push({ age: 'must be integer' });
      }


      if ((typeof key[1] !== 'string') && (key[0] !== 'age')) {
        const keyErr = {};
        keyErr[key[0]] = 'must be a string';
        validationErrors.push(keyErr);
      }
    });


    if (validationErrors.length > 0) {
      res.status(400).json(typeValidator);
      return;
    }

    next();
  };

  return validatorFunc;
};

server.get('/v1', (req, res) => {
  if (lions.length) {
    res.json({ lions });
    return;
  }

  res.status(204).send();
});

server.get('/v1/lions/:id', (req, res) => {
  const { id } = req.params;
  // find the lion
  const singleLion = lions.find(lion => lion.id === id);
  if (!singleLion) {
    res.status(404).json({ message: 'lion not found' });
    return;
  }
  res.json(singleLion);
});

server.post('/v1/lions', requestBodyValidator(), (req, res) => {
  const createLion = {
    id: uuidv1(),
    ...req.body,
    dateCreated: createDate(),
  };
  lions.push(createLion);

  res.status(202).json({ message: 'lion created' });
});

server.put('/v1/lions/:id', requestBodyValidator(), (req, res) => {
  const { id } = req.params;
  const searchLion = lions.find(lion => lion.id === id);
  if (!searchLion) {
    res.status(404).json({ message: 'lion not found' });
  } else {
    // remove lion from list
    const removeLion = lions.filter(lion => lion.id !== id);
    const updateLion = {
      id: searchLion.id,
      dateCreated: searchLion.dateCreated,
      name: removeWhiteSpace(req.body.name) || searchLion.name,
      age: req.body.age || searchLion.age,
      pride: removeWhiteSpace(req.body.pride) || searchLion.pride,
      gender: removeWhiteSpace(req.body.gender) || searchLion.gender,
      dateUpdated: createDate(),
    };
    lions = [...removeLion, updateLion];
    res.status(200).json({ message: 'lion updated', updateLion });
  }
});

server.delete('/v1/lions/:id', (req, res) => {
  const { id } = req.params;
  const searchLion = lions.find(lion => lion.id === id);
  if (!searchLion) {
    res.status(404).json({ message: 'lion not found' });
  } else {
    // const removeLion = lions.filter(lion => lion.id !== id);
    lions = [...lions.filter(lion => lion.id !== id)];
    res.status(200).json({ message: 'lion deleted' });
  }
});

/* istanbul ignore next */
server.use((err, req, res, next) => {
  if (err) {
    // eslint-disable-next-line no-console
    console.log(err.message);
    res.status(err.statusCode || 500).json({ error: 'bad request' });
    next();
  }
});

module.exports = server;
