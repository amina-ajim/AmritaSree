var express = require('express');
var group = express.Router();
var clusterHelper = require('../helpers/cluster-helper');
var responder = require('../responder');
var logger = require('../helpers/logger-helper').logger;
var groupHelper = require('../helpers/group-helper')
var util = require('./util');


/* GET groups listing. */
group.get('/cluster/:id', function(req, res, next) {
    let reqUser = util.getUser(req);
    let clusterId = parseInt(req.params.id);
    var cluster = clusterHelper.findClusterById(clusterId);
    try{
        let groupModels = groupHelper.findAllByClusterId(cluster,reqUser);
        if(groupModels && groupModels.length > 0){
            responder.respond(res,groupModels,responder.SUCCESS,"Groups retrieved successfully");
        }
        else{
            responder.respond(res,null,responder.FAILED,"No groups found");
        }
    }catch(fault){
        logger.error("Groups query failed. Reason:",fault);
        responder.respond(res,null,responder.FAILED,"Groups query failed. Reason:"+fault);
    }
});

/*Create group */
group.post('/', async function(req, res, next) {
    var groupJson = req.body;
    var requester = util.getUser(req);
    try{
        let groupCreated = await groupHelper.create(groupJson,requester);
        console.log(groupCreated);
        if(groupCreated){
            responder.respond(res,groupCreated,responder.SUCCESS,"Group created successfully");
        }
        else{
            responder.respond(res,null,responder.FAILED,"Group creation failed");
        }
    }catch(fault){
        logger.error("Group creation failed. Reason:",fault);
        responder.respond(res,null,responder.FAILED,"Group creation failed. Reason:"+fault);
    }
});

group.put('/:id', async function(req, res, next) {
    var groupJson = req.body;

    var requester = util.getUser(req);
    try{
        let groupUpdated = await groupHelper.update(groupJson, requester);
        if(groupUpdated){
            responder.respond(res,groupUpdated,responder.SUCCESS,"Group updated successfully");
            
        }
        else{
            responder.respond(res,null,responder.FAILED,"Group update failed");
        }
    }catch(fault){
        logger.error("Groups update failed. Reason:",fault);
        responder.respond(res,null,responder.FAILED,"Group update failed. Reason:"+fault);
    }
});

group.put('cluster/:id', async function(req, res, next) {
    var groupJson = req.body;

    var user = util.getUser(req);
    try{
        //let userAccessible = userHelper.canManageMember(requester, userObject);
        //if(userAccessible){
        let groupUpdated = await groupHelper.updateClusterId(groupJson, user);
        if(groupUpdated){
            // socketHelper.broadcastUpdate(req.query.authToken,req.baseUrl,userUpdated,true,userJson.userId);
            responder.respond(res,groupUpdated,responder.SUCCESS,"Group added to cluster successfully");
            
        }
        else{
            responder.respond(res,null,responder.FAILED,"Group update failed");
        }
        //}
    }catch(fault){
        logger.error("Group's cluster addition failed. Reason:",fault);
        responder.respond(res,null,responder.FAILED,"Group's cluster addition failed. Reason:"+fault);
    }
});


module.exports = group;