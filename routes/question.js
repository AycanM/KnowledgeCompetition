const express = require('express');
const router = express.Router();
const Question = require('../models/Question');


router.get('/', (req, res) => {
    Question.find({})
            .then( questions => {
                res.json(questions);
            })
            .catch( err => {
                res.json(
                    { 
                        status : 0,
                        message:'Get process'
                    }
                );
            })
});

router.get('/:id', (req, res) => {
    Question.findById(req.params.id)
            .then( question => {
                res.json(question);
            })
            .catch( err => {
                res.json(
                    { 
                        status : 0,
                        message:'GetById process'
                    }
                );
            })
});

router.post('/', (req, res) => {
    const question = new Question(req.body);
  
    question.save()
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
         res.json({
             status:0,
             message:'Post process'
         });
    });
  });

  router.put('/:id', (req, res) => {
    Question.findByIdAndUpdate(req.params.id, req.body)
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
          res.json({
              status:0,
              message:'Put process'
          });
      });
  });
  router.delete('/:id', (req, res) => {
    const id = req.params.id;
  
    Question.findByIdAndRemove(id)
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
          res.json({
              status:0,
              message:'Delete process'
          });
    });
  });

  module.exports = router;