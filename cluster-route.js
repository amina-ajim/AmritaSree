//cluster route
var express = require('express');
var group = express.Router();
var clusterHelper = require('../helpers/cluster-helper');
var responder = require('../responder');
var logger = require('../helpers/logger-helper').logger;
var groupHelper = require('../helpers/group-helper')
var util = require('./util');






/*Create cluster */
cluster.post('/', async function(req, res, next) {
    var clusterJson = req.body;
    var requester = util.getUser(req);
    try{
        let clusterCreated = await clusterHelper.create(clusterJson,requester);
        console.log(clusterCreated);
        if(clusterCreated){
            responder.respond(res,clusterCreated,responder.SUCCESS,"Cluster created successfully");
        }
        else{
            responder.respond(res,null,responder.FAILED,"Cluster creation failed");
        }
    }catch(fault){
        logger.error("Cluster creation failed. Reason:",fault);
        responder.respond(res,null,responder.FAILED,"Cluster creation failed. Reason:"+fault);
    }
});

