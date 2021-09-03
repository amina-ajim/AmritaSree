 "use strict";
 var logger = require('./logger-helper').logger;
 var models = require('../models');
 var statusHelper = require('./status-helper');
 var crypto = require('crypto');
 var utilHelper = require('./util-helper');
 var Constants= require('../constants');
 var clusterHelper=require('./cluster-route');

 var GroupHelper = {
     cacheLoaded: false,
     groups: [],
     //userNamesMap: {},//userName->User
     groupIdMap: {},//groupId->group
     clusterIdGroup : new Map(),//clusterId->[groups]
     updateCache: async function () {
         var groupHelper = this;
         if (statusHelper.cacheLoaded) {
             logger.info("Group helper: Cache start");
             var groupCache = await this.findAllCache();
             if (groupCache) {
                 //function(users){
                 groupCache.forEach(function (group) {
                     groupHelper.addToCache(group);
                      logger.info("Group :"+group.groupId+", ID:"+group.statusId);
                 })
                 //groupHelper.admin =  groupHelper.userNamesMap['admin'];
                 groupHelper.cacheLoaded = true;
                 logger.info("Group helper: Cache populated");
                 //}
             }
         } else {
             setTimeout(function () {
                 groupHelper.updateCache();
             }, 1000);
         }
     },
     
     addToCache: function (group) { //No need of i
         group = JSON.parse(JSON.stringify(group));
         //this.populateDerivedFields(user);
        
          this.groups.push(group);
         
         this.groupIdMap[group.groupId] = group;
         //this.userNamesMap[user.userName] = user;
         //if(!this.groupIdUsers[user.groupId]) to handle duplicate entries
         if(!this.clusterIdGroup.has(group.clusterId))
         {
             this.clusterIdGroup.set(group.clusterId,[]);
         }
         this.clusterIdGroup.set(group.clusterId, this.clusterIdGroup.get(group.clusterId).concat(group));
         //this.groupIdUsers[user.groupId] = this.findUsersbyGroupId(user.groupId);
     },
 
     // this.groupIdUSers[user.groupId].append(user)
 
     updateToCache: function (group) {
         this.removeFromCache(group);
         this.addToCache(group);
     },
     removeFromCache: function (group) {
         //userId = parseInt(userId);
         for (var i = 0; i < this.groups.length; i++) {
             if (this.groups[i].groupId === group.groupId) {
                 delete this.groupIdMap[group.groupId];
                 //delete this.userNamesMap[this.users[i].userName];
                 this.clusterIdGroup.get(group.clusterId).splice(this.clusterIdGroup.get(group.clusterId).indexOf(group),1); 
                 //this.groupIdUsers[user.groupId] = findUsersbyGroupId(user.groupId);
                 this.groups.splice(i, 1);
                 break;
             }
         }
     },
     findAllByClusterId: function (cluster, requestingUser) {
        if (this.canManageCluster(requestingUser, cluster.clusterId))
            return this.clusterIdGroup[cluster.clusterId];
        else
            throw "Unauthorized user";
    },
     
     findAllCache: function () {
        return models.Group.findAll(
            {
                where: { statusId: statusHelper.statusMap['Active'].statusId }
            }
        );
    },

    findGroupById: function (id) {
        return models.Group.findOne({
            where: { groupId: id, statusId: statusHelper.statusMap['Active'].statusId },
        });
    },

    findGroupByIdMap: function(id){
        return groupIdMap[id];

    },
    create: async function (groupToCreate, requester) {
        if (!this.canCreateGroup(groupToCreate,requester)) {
            throw "Unauthorized request";
        }
        else {
//            if(this.canManageStatus(groupToCreate, requester)){
//                throw "Unauthorized request";
//            }
//            else{
                groupToCreate.createdDate = new Date();
                groupToCreate.lastUpdatedDate = new Date();
                groupToCreate.createdBy = requester.userId;
                groupToCreate.lastUpdatedBy = requester.userId;
                groupToCreate.statusId = statusHelper.statusMap['Inactive'].statusId;
                var createdGroup = await models.Group.create(groupToCreate);
                this.addToCache(createdGroup);
                console.log(createdGroup);
                return createdGroup;
//            }
        }
    },

    update: async function (groupToUpdate, requester) {
        var groupHelper = this;
        var group = await this.findGroupById(groupToUpdate.groupId);
        if (group) {
            //function(user){
            /*if(user.userName === 'admin' && groupToUpdate.userName !== 'admin')
            {
                return new Promise(function(resolve,reject){
                    resolve(null);
                });
            }*/
            if (!this.canManageGroup(requester, groupToUpdate)) {
                throw "Unauthorized request";
            }
            else {
                if(!this.canManageStatus(requester,groupToUpdate)){
                    group.groupRegisterNum = groupToUpdate.groupRegisterNum;
                    group.phoneNum = groupToUpdate.phoneNum;
                    //group.wardId = groupToUpdate.wardId;
                    //group.clusterId = groupToUpdate.clusterId;
                    group.bankAccountNum = groupToUpdate.bankAccountNum;
                    //group.bankBranchId = groupToUpdate.bankBranchId;
                    group.lastUpdatedBy = requester.userId;
                    group.lastUpdatedDate = new Date();
                    group.dateOfFormation = groupToUpdate.dateOfFormation;
                    group.bankAccountCreationDate = groupToUpdate.bankAccountCreationDate; 
                }
                else
                    group.statusId = groupToUpdate.statusId;
                
               
                var updatedGroup=group.save();
                this.updateToCache(updatedGroup);
                return updatedGroup;
            }
        }

    },
    updateClusterId: async function(groupToUpdate,requester){
        var group = await this.findGroupByIdMap(groupToUpdate.groupId);
        if(!clusterHelper.canAddToCluster(groupToUpdate,requester))
            throw "Unauthorized request";
        else {
            group.clusterId = groupToUpdate.clusterId;
            var updatedGroup = group.save();
            this.updateToCache(updatedGroup);
            return updatedGroup;
        }
    },
    canAddToGroup: function(user,requester){
        console.log(user.groupId);
        if(requester.role==Constants.GROUP_ADMIN){
            if(requester.groupId==0){
                if(user.userId==requester.userId)
                    return true;
                 else
                    return false;
            }
            else if(requester.userId==user.userId){
                if(requester.groupId!=user.groupId)
                    return false;
                else
                    return true;
             }
            else if(requester.groupId==user.groupId)
                return(user.groupId==requester.groupId);
        }
        else
            return false;
    },
    canManageStatus: function(group,requester){
        if(requester.role == Constants.STATE_ADMIN){
            var clusterId = this.findGroupById(group.groupId).clusterId;
            var districtId = clusterHelper.findClusterById(clusterId).districtId;
            var stateId = stateHelper.findStateByDistrict(districtId).stateId;
            return (requester.stateId == stateId);
        }
        else 
            return false;
    },
    canCreateGroup: function(group, requester){
            if(requester.role == Constants.GROUP_ADMIN)
                return true;
            else if(requester.role== Constants.SYSTEM_ADMIN)
                    return true;
            else if(requester.role == Constants.STATE_ADMIN){
                var clusterId = this.findGroupById(group.groupId).clusterId;
                var districtId = clusterHelper.findClusterById(clusterId).districtId;
                var stateId = stateHelper.findStateByDistrict(districtId).stateId;
                return (requester.stateId == stateId);
            }
        },
    canManageGroup: function(group, requester){
        if(requester.role == Constants.GROUP_ADMIN)
            return (requester.groupId == group.groupId);

        else if(requester.role== Constants.SYSTEM_ADMIN)
                return true;
        else if(requester.role == Constants.STATE_ADMIN){
            var clusterId = this.findGroupById(group.groupId).clusterId;
            var districtId = clusterHelper.findClusterById(clusterId).districtId;
            var stateId = stateHelper.findStateByDistrict(districtId).stateId;
            return (requester.stateId == stateId);
        }
    },
    canManageCluster: function(cluster,requester){
        if(requester.role == Constants.CLUSTER_ADMIN){
            var requestingUserGroup = this.findGroupById(requestingUser.groupId)
            return (requestingUserGroup.clusterId == clusterid);
        }
    }

 };
 GroupHelper.updateCache();
 module.exports = GroupHelper;
 