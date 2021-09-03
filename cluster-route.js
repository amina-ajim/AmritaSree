//cluster route
var express = require('express');
var group = express.Router();
var clusterHelper = require('../helpers/cluster-helper');
var responder = require('../responder');
var logger = require('../helpers/logger-helper').logger;
var groupHelper = require('../helpers/group-helper')
var util = require('./util');

cluster.get('/cluster/district/:id', function(req,res,next) { 
    let reqUser = util.getUser(req);
    let districtId = parseInt(req.params.id);
    var district = clusterHelper.findDistrictById(districtId);
    try{
        let clusterModels = clusterHelper.findAllByDistrictId(district,reqUser);
        if(clusterModels && clusterModels.length > 0) {
            responder.respond(res,clusterModels,responder.SUCCESS,"Clusters retrieved successfully");
        }
        else {
            responder.respond(res,null,responder.FAILED,"No clusters found");
        }
    } catch(fault) {
        logger.error("Cluster query failed. Reason: ", fault);
        responder.respond(res,null,responder.FAILED,"Cluster query failed. Reason: "+ fault);
    }

});


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

/*Cluster Updation*/
cluster.put('/:id', async function(req,res,next) { 
    var clusterJson = req.body;
    var requester = util.getUser(req);

    try{
        let clusterUpdated = await clusterHelper.clusterUpdate(clusterJson, requester);
        if(clusterUpdated) {
            responder.respond(res,clusterUpdated,responder.SUCCESS,"Cluster updated successfully");
        }
        else{
            responder.respond(res,null,responder.FAILED,"Cluster updation failed");
        }
    } catch(fault) {
        logger.error("Cluster updation failed. Reason: " + fault);
        responder.respond(res,null,responder.FAILED,"Cluster updation failed. Reason: " + fault);
    }
});

