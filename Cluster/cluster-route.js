var express = require('express');
var cluster = express.Router();
var clusterHelper = require('../helpers/cluster-helper');
var responder = require('../responder');
var logger = require('../helpers/logger-helper').logger;
var groupHelper = require('../helpers/group-helper')
var util = require('./util');

/* GET cluster listing. */
cluster.get('/cluster/:id', function(req, res, next) {
    let reqUser = util.getUser(req);
    let districtId = parseInt(req.params.id);
    var district = clusterHelper.findClusterById(districtId);
    try{
        let clusterModels = clusterHelper.findAllByClusterId(district,reqUser);
        if(clusterModels && clusterModels.length > 0){
            responder.respond(res,clusterModels,responder.SUCCESS,"Cluster retrieved successfully");
        }
        else{
            responder.respond(res,null,responder.FAILED,"No Clusters found");
        }
    }catch(fault){
        logger.error("Clusters query failed. Reason:",fault);
        responder.respond(res,null,responder.FAILED,"Clusters query failed. Reason:"+fault);
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

cluster.put('/:id', async function(req, res, next) {
    var clusterJson = req.body;

    var requester = util.getUser(req);
    try{
        let clusterUpdated = await clusterHelper.update(clusterJson, requester);
        if(clusterUpdated){
            responder.respond(res,clusterUpdated,responder.SUCCESS,"Cluster updated successfully");
            
        }
        else{
            responder.respond(res,null,responder.FAILED,"Cluster update failed");
        }
    }catch(fault){
        logger.error("Cluster update failed. Reason:",fault);
        responder.respond(res,null,responder.FAILED,"Cluster update failed. Reason:"+fault);
    }
});

cluster.put('district/:id', async function(req, res, next) {
    var clusterJson = req.body;

    var user = util.getUser(req);
    try{

        let clusterUpdated = await clusterHelper.updatedistrictId(clusterJson, user);
        if(clusterUpdated){

            responder.respond(res,clusterUpdated,responder.SUCCESS,"Cluster added to district successfully");
            
        }
        else{

            responder.respond(res,null,responder.FAILED,"Cluster update failed");
        }

    }catch(fault){
        logger.error("Cluster's District addition failed. Reason:",fault);
        responder.respond(res,null,responder.FAILED,"Cluster's District addition failed. Reason:"+fault);
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



/*Cluster update*/

cluster.put('cluster/group/:id', async function(req, res, next) {
    var groupJson = req.body;

    var user = util.getUser(req);
    try{

        let groupUpdated = await groupHelper.updateClusterId(groupJson, user);
        if(groupUpdated){

            responder.respond(res,groupUpdated,responder.SUCCESS,"Group added to cluster successfully");
            
        }
        else{
            responder.respond(res,null,responder.FAILED,"Group update failed");
        }

    }catch(fault){
        logger.error("Group's cluster addition failed. Reason:",fault);
        responder.respond(res,null,responder.FAILED,"Group's cluster addition failed. Reason:"+fault);
    }
});
