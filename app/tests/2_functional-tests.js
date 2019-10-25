/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  var board_1 = 'test_1';
  var board_2 = 'test_2';
  var thread_id_1, thread_id_2;
  var delete_pwd_1 = 'test_pwd';
  var delete_pwd_2 = 'test_pwd';
  var reply_id_1, reply_id_2;
  
  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('Test POST /api/threads/:board', function(done) {
        chai.request(server)
          .post('/api/threads/' + board_1)
          .send({
            title: 'An example thread title',
            text: 'This is an example text',
            delete_password: delete_pwd_1
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            // console.log(res.body)
            // done();
          });
        chai.request(server)
          .post('/api/threads/' + board_2)
          .send({
            title: 'Another example thread title',
            text: 'This is another example text',
            delete_password: delete_pwd_2
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            // console.log(res.body)
            done();
          });
      });
    });
    
    suite('GET', function() {
      test('Test GET /api/threads/:board', function(done) {
        chai.request(server)
          .get('/api/threads/' + board_1)
          .end(function(err, res){
            assert.equal(res.status, 200);
            // console.log(res.body);
            assert.isArray(res.body, 'This is an array.');
            assert.property(res.body[0], '_id');
            assert.property(res.body[0], 'bumped_on');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'reply_id');
            assert.property(res.body[0], 'text');
            assert.property(res.body[0], 'replies');
            assert.property(res.body[0], 'replycount');
            assert.equal(res.body[0].text, 'This is an example text');
            assert.isArray(res.body[0].reply_id);
            assert.isArray(res.body[0].replies);
            assert.equal(res.body[0].replycount, 0);
            thread_id_1 = res.body[0]._id;
            // done();
          });
        chai.request(server)
          .get('/api/threads/' + board_2)
          .end(function(err, res){
            assert.equal(res.status, 200);
            // console.log(res.body);
            assert.isArray(res.body, 'This is another array.');
            assert.property(res.body[0], '_id');
            assert.property(res.body[0], 'bumped_on');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'reply_id');
            assert.property(res.body[0], 'text');
            assert.property(res.body[0], 'replies');
            assert.property(res.body[0], 'replycount');
            assert.equal(res.body[0].text, 'This is another example text');
            assert.isArray(res.body[0].reply_id);
            assert.isArray(res.body[0].replies);
            assert.equal(res.body[0].replycount, 0);
            thread_id_2 = res.body[0]._id;
            done();
          });
      });
    });
    
    suite('DELETE', function() {
      test('Test DELETE /api/threads/:board', function(done) {
        chai.request(server)
          .delete('/api/threads/' + board_1)
          .send({
            board: board_1,
            thread_id: thread_id_1,
            delete_password: delete_pwd_1
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            // console.log(res.status)
            // console.log(res.body);
            // console.log(res.text);
            assert.equal(res.text, 'success');
            done();
          });
      });
    });
    
    suite('PUT', function() {
      test('Test PUT /api/threads/:board', function(done) {
        chai.request(server)
          .put('/api/threads/' + board_1)
          .send({
            thread_id: thread_id_2,
            board: board_2,
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            // console.log(res.status)
            // console.log(res.body);
            assert.equal(res.text, 'success');
            done();
          });
      });
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    suite('POST', function() {
      test('Test POST /api/replies/:board', function(done) {
        chai.request(server)
            .post('/api/replies/' + board_2)
            .send({
              thread_id: thread_id_2,
              text: 'This is the first reply',
              delete_password: delete_pwd_2
            })
            .end(function(err, res){
              assert.equal(res.status, 200);

              // console.log(res.body)
            });
          chai.request(server)
            .post('/api/replies/' + board_2)
            .send({
              thread_id: thread_id_2,
              text: 'This is the second reply',
              delete_password: delete_pwd_2
            })
            .end(function(err, res){
              assert.equal(res.status, 200);
              // console.log(res.body)
              done();
            });
      });
    });
    
    suite('GET', function() {
      test('Test GET /api/replies/:board', function(done) {
        chai.request(server)
            .get('/api/replies/' + board_2)
            .query({
              thread_id: thread_id_2,
            })
            .end(function(err, res){
              assert.equal(res.status, 200);
              console.log(res.body);
              assert.property(res.body, '_id');
              assert.property(res.body, 'bumped_on');
              assert.property(res.body, 'created_on');
              assert.property(res.body, 'reply_id');
              assert.property(res.body, 'text');
              assert.property(res.body, 'replies');
              assert.isArray(res.body.replies, 'This is an array.');
              assert.property(res.body.replies[0], '_id');
              assert.property(res.body.replies[0], 'bumped_on');
              assert.property(res.body.replies[0], 'created_on');
              assert.property(res.body.replies[0], 'text');
              reply_id_1 = res.body.replies[0]._id;
              done();
            });
        });
    });
    
    suite('PUT', function() {
      test('Test PUT /api/replies/:board', function(done) {
        chai.request(server)
            .put('/api/replies/' + board_2)
            .send({
              reply_id: reply_id_1,
            })
            .end(function(err, res){
              assert.equal(res.status, 200);
              console.log('helllo');
              console.log(res.status)
              // console.log(res.body);
              assert.equal(res.text, 'success');
              done();
            });
      });
    });
    
    suite('DELETE', function() {
      test('Test DELETE /api/replies/:board', function(done) {
        console.log('delete reply_id: ' +reply_id_1);
        chai.request(server)
          .delete('/api/replies/' + board_2)
          .send({
            thread_id: thread_id_2,
            delete_password: delete_pwd_2,
            reply_id: reply_id_1
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            // console.log(res.status)
            // console.log(res.body);
            // console.log(res.text);
            assert.equal(res.text, 'success');
            done();
          });
      });
    });
    
  });

});
