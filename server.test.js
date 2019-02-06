const request = require('supertest');
const server = require('./server');

describe('server.js', () => {
  test('it should return a 204', (done) => {
    request(server)
      .get('/v1/')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .end((err, res) => {
        expect(res.status).toBe(204);
        done();
      });
  });

  test('it should retrieve list of lions', (done) => {
    request(server)
      .post('/v1/lions')
      .send({
        name: 'lion',
        age: 10,
        pride: 'p',
        gender: 'unicorn',

      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .end((err, res) => {
        expect(res.statusCode).toBe(202);
        request(server)
          .get('/v1/')
          .end((error, resp) => {
            const { lions } = resp.body;
            expect(lions.length).toEqual(1);
            done();
          });
      });
  });


  test('it should post a new lion', (done) => {
    request(server)
      .post('/v1/lions')
      .send({
        name: 'lion',
        age: 10,
        pride: 'yellow beasts',
        gender: 'unicorn',

      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(202)
      .end((err, res) => {
        expect(res.body.message).toBe('lion created');
        done();
      });
  });

  test('it should not detect a json object', (done) => {
    request(server)
      .post('/v1/lions')
      .send()
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .end((err, res) => {
        expect(res.body.error).toBe('JSON object not detected or is empty');
        done();
      });
  });

  test('it should detect unwanted keys in JSON', (done) => {
    request(server)
      .post('/v1/lions')
      .send({
        name: 'lion',
        age: 10,
        pride: 'yellow beasts',
        gender: 'unicorn',
        bad: 3,

      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .end((err, res) => {
        const { error, unwantedKeys } = res.body;
        expect(error).toBe('unwanted keys found');
        expect(unwantedKeys[0]).toBe('bad');
        expect(res.statusCode).toEqual(400);
        done();
      });
  });

  test('it should detect missing keys in JSON', (done) => {
    request(server)
      .post('/v1/lions')
      .send({
        name: 'lion',
        age: 10,
        pride: 'yellow beasts',

      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .end((err, res) => {
        const { error, missingKeys } = res.body;
        expect(error).toBe('required keys missing');
        expect(missingKeys[0]).toBe('gender');
        expect(res.statusCode).toEqual(400);
        done();
      });
  });

  test('it should detect both missing and unwanted keys in JSON', (done) => {
    request(server)
      .post('/v1/lions')
      .send({
        name: 'lion',
        age: 10,
        pride: 'yellow beasts',
        bad: 'bad',

      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .end((err, res) => {
        const { error, missingKeys, unwantedKeys } = res.body;
        expect(error).toBe('required keys missing and unwanted keys exist');
        expect(missingKeys[0]).toBe('gender');
        expect(unwantedKeys[0]).toBe('bad');
        expect(res.statusCode).toEqual(400);
        done();
      });
  });

  test('it should validate type of data in JSON and return a list 0f 4 errors', (done) => {
    request(server)
      .post('/v1/lions')
      .send({
        name: 1,
        age: '1',
        pride: 1,
        gender: 1,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .end((err, res) => {
        const { validationErrors } = res.body;
        expect(validationErrors.length).toEqual(4);
        expect(res.statusCode).toEqual(400);
        done();
      });
  });

  it('should GET a single lion with id', (done) => {
    request(server)
      .get('/v1/')
      .set('Accept', 'application/json')
      .end((error, resp) => {
        const { lions } = resp.body;
        const { id } = lions[0];
        request(server)
          .get(`/v1/lions/${id}`)
          .set('Accept', 'application/json')
          .end((err, res) => {
            expect(res.body.name).toBe('lion');
            expect(res.statusCode).toEqual(200);
            done();
          });
      });
  });

  it('should return 404 when requesting lion with id', (done) => {
    request(server)
      .get('/v1/')
      .set('Accept', 'application/json')
      // eslint-disable-next-line no-unused-vars
      .end((error, resp) => {
        request(server)
          .get('/v1/lions/1')
          .set('Accept', 'application/json')
          .end((err, res) => {
            expect(res.body.message).toBe('lion not found');
            expect(res.statusCode).toEqual(404);
            done();
          });
      });
  });

  it('should update a single lion name with id', (done) => {
    request(server)
      .get('/v1/')
      .set('Accept', 'application/json')
      .end((error, resp) => {
        const { lions } = resp.body;
        const { id } = lions[0];
        expect(lions[0].name).toBe('lion');
        request(server)
          .put(`/v1/lions/${id}`)
          .send({
            name: 'king mufasa',
            age: 1,
            pride: '',
            gender: '',
          })
          .set('Accept', 'application/json')
          .end((err, res) => {
            expect(res.body.message).toBe('lion updated');
            request(server)
              .get(`/v1/lions/${id}`)
              .set('Accept', 'application/json')
              .end((e, r) => {
                expect(r.body.name).toBe('king mufasa');
                done();
              });
          });
      });
  });

  it('should return lion PUT with id not found', (done) => {
    request(server)
      .put('/v1/lions/2')
      .send({
        name: 'king mufasa',
        age: 1,
        pride: '',
        gender: '',
      })
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.body.message).toBe('lion not found');
        expect(res.statusCode).toEqual(404);
        done();
      });
  });

  it('should delete a lion', (done) => {
    request(server)
      .get('/v1/')
      .set('Accept', 'application/json')
      .end((err, res) => {
        const { id } = res.body.lions[0];
        request(server)
          .delete(`/v1/lions/${id}`)
          .end((error, resp) => {
            expect(resp.body.message).toBe('lion deleted');
            done();
          });
      });
  });

  it('should return delete lion with id not found', (done) => {
    request(server)
      .delete('/v1/lions/1')
      .end((error, resp) => {
        expect(resp.body.message).toBe('lion not found');
        expect(resp.statusCode).toEqual(404);
        done();
      });
  });

  // it('should run error handling middleware function', (done) => {
  //   request(server)
  //     .post('/v1/lions')
  //     .send({
  //       name: '',
  //       age: 10,
  //       pride: 'yellow beasts',
  //       ""gender"": "",
  //     })
  //     .set('Accept', 'application/json')
  //     .end((err, res) => {
  //       console.log(res.body);
  //       done();
  //     });
  // });
});
