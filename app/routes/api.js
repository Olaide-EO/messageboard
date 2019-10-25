/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectId;

module.exports = function (app, db) {
  var boardCollection = db.collection("boards");
  var threadCollection = db.collection("threads");
  var replyCollection = db.collection("replies");
  var tenThreads = [];
  
  app.route('/api/threads/:board')
    .get(function (req, res){
      console.log("********/api/threads/:board GET********");
      // console.log(req);
      console.log(req.url);
      console.log((req.url).split('/')[3]);
    
      var boardName = decodeURIComponent((req.url).split('/')[3]);
      console.log('boardName: ' + boardName);
      
      boardCollection.findOne({board: boardName}, function (err, board) {            
        if(err) {
          console.log('Board find method returns error: ' +err);
          res.send('Board find method returns error: ' +err);
        } else {
          console.log(board);
          console.log(board.thread_id);
          
          // (board.thread_id).forEach((x, index) => {
          //   console.log(index)
          //   if (index <= 9) {
          //     threadCollection.findOne({_id: ObjectId(x)}, {fields: {delete_password: 0, reported: 0}}, function (err, thread) {
          //       if(err) {
          //         console.log('Thread find method returns error: ' +err);
          //         res.send('Thread find method returns error: ' +err);
          //       } else {
          //         // console.log(thread);
          //         // tenThreads.push(thread);
          //         storeThreads(thread, res);
          //       }
          //     });
          //   }
          // });
          
          threadCollection.find({_id: {$in: board.thread_id}}, {fields: {delete_password: 0, reported: 0}}).sort({bumped_on: -1}).limit(10).toArray(function (err, thread) {
          // threadCollection.find({_id: {$all: board.thread_id}}).toArray(function (err, thread) {
            if (err) {
              console.log('Thread find method returns error: ' +err);
              res.send('Thread find method returns error: ' +err);
            } else {
              console.log('******thread results: ');
              console.log(thread);
              
              // console.log('thread replies results: ');
              // console.log(thread.reply_id);
              
              // var tResults = {};
              // thread.forEach((x) => {
              // });
              
              thread.forEach((th, index) => {
                console.log('******th');
                console.log(th);
                console.log('th.reply_id: ');
                console.log(th.reply_id);
                if (th.reply_id) {
                  replyCollection.find({_id: {$in: th.reply_id}}, {fields: {delete_password: 0, reported: 0}}).sort({bumped_on: -1}).toArray(function (err, reply) {
                    if (err) {
                      console.log('Reply find method returns error: ' +err);
                      res.send('Reply find method returns error: ' +err);
                    } else {
                      console.log('******reply results: ');
                      console.log(reply);
                      console.log(reply.length);

                      th.replies = reply.slice(0, 3);
                      th.replycount = reply.length;
                      console.log('th in replyCollection: ');
                      console.log(th);

                      console.log('*****final thread: ');
                      console.log(thread);
                      console.log('index: ' +index);
                      if (index == thread.length - 1)
                        res.json(thread);
                    }
                  });
                }
              });
              // console.log('***** Total Threads *****');
              // console.log(thread);
            }
          });
            
        }
      });
    })
  
    .post(function (req, res){
      console.log("********/api/threads/:board POST********");
      // console.log(req);
      // console.log(req.url);
      // console.log(req.body);
      // console.log(req.body.board);
      var boardName;
      if (req.body.board) {
        boardName = req.body.board;
      } else {
        boardName = decodeURIComponent((req.url).split('/')[3]);
      }
      var thread_id = new ObjectId();
      boardCollection.findOneAndUpdate({board: boardName}, {$push: {thread_id: thread_id}}, {returnOriginal: false, upsert: true}, function (err, board) {            // Needs to replace with method that finds stock but if not present inserts it in database
        if(err) {
          console.log('Board find method returns error: ' +err);
          res.send('Board find method returns error: ' +err);
        } else {
          console.log('Unique board value: ');
          console.log(board.value.board);
          console.log(board.value.thread_id);
          console.log(typeof thread_id);
          console.log((board.value.thread_id).some(document => document.equals(thread_id)))
          if ((board.value.thread_id).some(document => document.equals(thread_id))) {
            threadCollection.findOneAndUpdate({_id: thread_id}, {$set: {text: req.body.text, delete_password: req.body.delete_password, created_on: new Date(), bumped_on: new Date(), reported: false, reply_id: []}}, {returnOriginal: false, upsert: true}, function (err, thread) {
              if(err) {
                console.log('Thread find method returns error: ' +err);
                res.send('Thread find method returns error: ' +err);
              } else {
                // console.log(thread.value);
                res.redirect('/b/' +board.value.board+ '/');
              }
            });
          }
        }
      });
    })
    
    .delete(function (req, res){
      console.log("********/api/threads/:board DELETE********");
      // console.log(req);
    
      var boardName;
      if (req.body.board) {
        boardName = req.body.board;
      } else {
        boardName = decodeURIComponent((req.url).split('/')[3]);
      }
      console.log(boardName);
      console.log(req.body);
      console.log(req.body.thread_id);
      console.log(req.body.delete_password);
    
      boardCollection.findOneAndUpdate({board: boardName}, {$pull: {thread_id: ObjectId(req.body.thread_id)}}, function (err, board) {            
        if(err) {
          console.log('Board find method returns error: ' +err);
          res.send('Board find method returns error: ' +err);
        } else {
          console.log(board);
          if ((board.value.thread_id).some(document => document.equals(req.body.thread_id))) {                                      // Start: If method for ((board.thread_id).some(document => document.equals(req.body.thread_id)))
          
            threadCollection.findOne({_id: ObjectId(req.body.thread_id)}, function (err, thread) {
            if(err) {
              console.log('Thread find method returns error: ' +err);
              res.send('Thread find method returns error: ' +err);
            } else {
              console.log('thread: ');
              console.log(thread);
              replyCollection.remove({_id: {$in: thread.reply_id}}, function (err, reply_Rem) {
                if(err) {
                  console.log('Reply remove method returns error: ' +err);
                  res.send('Reply remove method returns error: ' +err);
                } else {
                    console.log(reply_Rem)
                    console.log('Replies have been removed.');
                    threadCollection.remove({_id: ObjectId(req.body.thread_id)}, {$and: {delete_password: req.body.delete_password}}, function (err, thread_Rem) {
                      if(err) {
                        console.log('Thread remove method returns error: ' +err);
                        // res.send('Thread remove method returns error: ' +err);
                      } else {
                        console.log(thread_Rem);
                        console.log('Thread has been removed.');
                        if (thread_Rem)
                          res.send('success')
                        else
                          res.send('incorrect password');
//                         boardCollection.findOne({board: req.body.board}, function (err, board) {
//                           if(err) {
//                             console.log('Board remove method returns error: ' +err);
//                             res.send('Board remove method returns error: ' +err);
//                           } else {
                            
//                           }
//                         });
                      }
                    });
                }
              });
            }
          });
          }                                                                                                                 // End: If method for ((board.thread_id).some(document => document.equals(req.body.thread_id)))
        }
      });
    })
  
    .put(function (req, res){
      var threadName;
      console.log("********/api/threads/:board PUT********");
      // console.log(req);
      console.log(req.url);
      console.log(req.body);
      if (req.body.report_id) {
        threadName = req.body.report_id;
      } else {
        threadName = req.body.thread_id;
      }
      
      threadCollection.findOneAndUpdate({_id: ObjectId(threadName)}, {$set: {reported: true}}, {returnOriginal: false}, function (err, thread) {  
        if(err) {
          console.log('Thread find method returns error: ' +err);
          res.send('Thread find method returns error: ' +err);
        } else {
          console.log('thread: ');
          console.log(thread);
          res.send('success');
        }
      });
    })
    
  app.route('/api/replies/:board')
    .get(function (req, res){                                                              // Testing url: https://fcc-anonymous-message-board-v1.glitch.me/api/replies/Testable?thread_id=5b88131c6d80eb040732f345
      console.log(req.url);
      var urlToSplit = decodeURIComponent((req.url).split('/')[3]);
      var boardName = urlToSplit.split('?')[0];
      var threadId = (urlToSplit.split('?')[1]).split('=')[1];
    
      console.log(urlToSplit);
      console.log(req.query)
      console.log(boardName);
      console.log('threadId: ');
      console.log(threadId);
    
      // threadCollection.findOne({_id: ObjectId(threadId)}, function (err, thread) {  
      //   if(err) {
      //     console.log('Thread find method returns error: ' +err);
      //     res.send('Thread find method returns error: ' +err);
      //   } else {
      //     console.log(thread);
      //     console.log(thread.reply_id)
      //     replyCollection.find({_id: {$in: thread.reply_id}}).toArray(function (err, reply) {
      //       if (err) {
      //         console.log('Reply find method returns error: ' +err);
      //         res.send('Reply find method returns error: ' +err);
      //       } else {
      //         console.log('reply results: ');
      //         console.log(reply);
      //         res.json(reply);
      //       }
      //     });
      //   }
      // });
    
      threadCollection.findOne({_id: ObjectId(threadId)}, {fields: {delete_password: 0, reported: 0}}, function (err, thread) {
            if (err) {
              console.log('Thread find method returns error: ' +err);
              res.send('Thread find method returns error: ' +err);
            } else {
              console.log('******thread results: ');
              console.log(thread);
                
                replyCollection.find({_id: {$in: thread.reply_id}}, {fields: {delete_password: 0, reported: 0}}).sort({bumped_on: -1}).toArray(function (err, reply) {
                  if (err) {
                    console.log('Reply find method returns error: ' +err);
                    res.send('Reply find method returns error: ' +err);
                  } else {
                    console.log('******reply results: ');
                    console.log(reply);
                    console.log(reply.length);
                    
                    thread.replies = reply;
                    thread.replycount = reply.length;
                    console.log('thread in replyCollection: ');
                    console.log(thread);
                    
                    console.log('*****final thread: ');
                    console.log(thread);
                    res.json(thread);
                  }
                }); 
            }
          });
    })
  
    .post(function (req, res){
      var replyId = new ObjectId();
      var boardName = decodeURIComponent((req.url).split('/')[3]);
      console.log('req.body: ');
      console.log(req.body);
      console.log('req.body.thread_id: ' +req.body.thread_id);
      console.log(boardName);
//       boardCollection.findOne({board: req.body.board}, function (err, board) {            
//         if(err) {
//           console.log('Board find method returns error: ' +err);
//           res.send('Board find method returns error: ' +err);
//         } else {
//           console.log(board);
//           console.log(board.board);
//           console.log(board.thread_id);
//           console.log(req.body.thread_id);
//           if ((board.thread_id).some(document => document.equals(req.body.thread_id))) {
//             console.log('yes it is');
//             // threadCollection.findOneAndUpdate({_id: req.body.thread_id}, {$set: {bumped_on: new Date()}}, {$push: {reply_id: replyId}}, {returnOriginal: false, upsert: true}, function (err, thread) {
//             threadCollection.findOneAndUpdate({_id: ObjectId(req.body.thread_id), delete_password: req.body.delete_password}, {$set: {bumped_on: new Date()}, $push: {reply_id: replyId}}, {returnOriginal: false, upsert: true}, function (err, thread) {
//               if(err) {
//                 console.log('Thread find method returns error: ' +err);
//                 res.send('Thread find method returns error: ' +err);
//               } else {
//                 console.log('thread: ');
//                 console.log(thread);
//                 console.log('thread.value: ');
//                 console.log(thread.value);
//                 // console.log('req.body.board: ' +req.body.board);
//                 // res.redirect('/b/' +req.body.board+ '/');
                
//                 replyCollection.findOneAndUpdate({_id: replyId}, {$set: {text: req.body.text, created_on: new Date(), bumped_on: new Date(), reported: false}}, {returnOriginal: false, upsert: true}, function (err, reply) {
//                   if(err) {
//                     console.log('Reply find method returns error: ' +err);
//                     res.send('Reply find method returns error: ' +err);
//                   } else {
//                     console.log('reply: ')
//                     console.log(reply);
//                     console.log('reply.value: ');
//                     console.log(reply.value);
//                   }
//                 });
//               }
//             });
//           }
//         }
//       });
    
    threadCollection.findOneAndUpdate({_id: ObjectId(req.body.thread_id), delete_password: req.body.delete_password}, {$set: {bumped_on: new Date()}, $push: {reply_id: replyId}}, {returnOriginal: false, upsert: true}, function (err, thread) {
              if(err) {
                console.log('Thread find method returns error: ' +err);
                res.send('Thread find method returns error: ' +err);
              } else {
                console.log('thread: ');
                console.log(thread);
                console.log('thread.value: ');
                console.log(thread.value);
                // console.log('req.body.board: ' +req.body.board);
                // res.redirect('/b/' +req.body.board+ '/');
                
                replyCollection.findOneAndUpdate({_id: replyId}, {$set: {text: req.body.text, created_on: new Date(), bumped_on: new Date(), reported: false}}, {returnOriginal: false, upsert: true}, function (err, reply) {
                  if(err) {
                    console.log('Reply find method returns error: ' +err);
                    res.send('Reply find method returns error: ' +err);
                  } else {
                    console.log('reply: ')
                    console.log(reply);
                    console.log('reply.value: ');
                    console.log(reply.value);
                    console.log('boardName: ');
                    console.log(boardName);
                    console.log('thread.value._id: ');
                    console.log(thread.value._id);
                    // if (thread.value._id
                    res.redirect('/b/' +boardName+ '/' +thread.value._id+ '/');
                  }
                });
              }
            });
    
      
    
    })
    
    .delete(function (req, res){
      console.log("********/api/replies/:board DELETE********");
      // console.log(req);
      console.log(req.body);
      console.log(req.body.thread_id);
      console.log(req.body.delete_password);
      console.log('req.body.reply_id: ');
      console.log(req.body.reply_id);
    
//       boardCollection.findOneAndUpdate({board: req.body.board}, {$pull: {thread_id: ObjectId(req.body.thread_id)}}, function (err, board) {            
//         if(err) {
//           console.log('Board find method returns error: ' +err);
//           res.send('Board find method returns error: ' +err);
//         } else {
//           console.log(board);
//           if ((board.value.thread_id).some(document => document.equals(req.body.thread_id))) {                                      // Start: If method for ((board.thread_id).some(document => document.equals(req.body.thread_id)))
          
//             threadCollection.findOne({_id: ObjectId(req.body.thread_id)}, function (err, thread) {
//             if(err) {
//               console.log('Thread find method returns error: ' +err);
//               res.send('Thread find method returns error: ' +err);
//             } else {
//               console.log('thread: ');
//               console.log(thread);
//               replyCollection.remove({_id: {$in: thread.reply_id}}, function (err, reply_Rem) {
//                 if(err) {
//                   console.log('Reply remove method returns error: ' +err);
//                   res.send('Reply remove method returns error: ' +err);
//                 } else {
//                     console.log(reply_Rem)
//                     console.log('Replies have been removed.');
//                     threadCollection.remove({_id: ObjectId(req.body.thread_id)}, function (err, thread_Rem) {
//                       if(err) {
//                         console.log('Thread remove method returns error: ' +err);
//                         res.send('Thread remove method returns error: ' +err);
//                       } else {
//                         console.log(thread_Rem);
//                         console.log('Thread has been removed.');
//                         boardCollection.findOne({board: req.body.board}, function (err, board) {
//                           if(err) {
//                             console.log('Board remove method returns error: ' +err);
//                             res.send('Board remove method returns error: ' +err);
//                           } else {
                            
//                           }
//                         });
//                       }
//                     });
//                 }
//               });
//             }
//           });
//           }                                                                                                                 // End: If method for ((board.thread_id).some(document => document.equals(req.body.thread_id)))
//         }
//       });
    
      threadCollection.findOneAndUpdate({_id: ObjectId(req.body.thread_id)}, {$pull: {reply_id: ObjectId(req.body.reply_id)}}, function (err, thread) {
            if(err) {
              console.log('Thread find method returns error: ' +err);
              res.send('Thread find method returns error: ' +err);
            } else {
              console.log('thread: ');
              console.log(thread);
              if ((thread.value.reply_id).some(document => document.equals(req.body.reply_id))) {  
                replyCollection.remove({_id: ObjectId(req.body.reply_id)}, function (err, reply_Rem) {
                  if(err) {
                    console.log('Reply remove method returns error: ' +err);
                    res.send('Reply remove method returns error: ' +err);
                  } else {
                      console.log('reply_Rem: ');
                      console.log(reply_Rem)
                      // console.log('Reply has been removed.');
                      if (reply_Rem)
                          res.send('success')
                        else
                          res.send('incorrect password');
                  }
                });
              }
            }
          });
    })
  
    .put(function (req, res){
      // console.log(req);
      // console.log(req.url);
      // console.log(req.body);
      replyCollection.findOneAndUpdate({_id: ObjectId(req.body.reply_id)}, {$set: {reported: true}}, {returnOriginal: false}, function (err, reply) {  
        if(err) {
          console.log('Reply find method returns error: ' +err);
          res.send('Reply find method returns error: ' +err);
        } else {
          console.log('reply: ');
          console.log(reply);
          res.send('success');
        }
      });
    })
  
};
