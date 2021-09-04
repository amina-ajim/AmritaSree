//Cluster Helper

 "use strict";
 var logger = require('./logger-helper').logger;
 var models = require('../models');
 var statusHelper = require('./status-helper');
 var crypto = require('crypto');
 var utilHelper = require('./util-helper');
 var Constants= require('../constants');
 var clusterHelper=require('./cluster-route');

 var ClusterHelper = {
     cacheLoaded: false,
     cluster: [],

     clusterIdMap: {},
     districtIdGroup : new Map(),
     updateCache: async function () {
         var ClusterHelper = this;
         if (statusHelper.cacheLoaded) {
             logger.info("Cluster helper: Cache start");
             var clusterCache = await this.findAllCache();
             if (clusterCache) {

                 clusterCache.forEach(function (cluster) {
                     ClusterHelper.addToCache(cluster);
                      logger.info("Cluster :"+cluster.clusterId+", ID:"+cluster.statusId);
                 })

                 ClusterHelper.cacheLoaded = true;
                 logger.info("Cluster helper: Cache populated");

             }
         } else {
             setTimeout(function () {
                ClusterHelper.updateCache();
             }, 1000);
         }
     },

     addToCache: function (cluster) { 
         cluster = JSON.parse(JSON.stringify(cluster));
    
          this.clusters.push(cluster);
        
         this.clusterIdMap[cluster.clusterId] = cluster;

         if(!this.districtIdCluster.has(cluster.districtId))
         {
             this.districtIdCluster.set(cluster.districtId,[]);
         }
         this.districtIdCluster.set(cluster.districtId, this.districtIdCluster.get(cluster.districtId).concat(cluster));
     },
 
 
     updateToCache: function (cluster) {
         this.removeFromCache(cluster);
         this.addToCache(cluster);
     },

     
     removeFromCache: function (cluster) {
         
         for (var i = 0; i < this.cluster.length; i++) {
             if (this.clusters[i].clusterId === cluster.clusterId) {
                 delete this.clusterIdMap[cluster.clusterId];
                 
                 this.districtIdCluster.get(cluster.districtId).splice(this.districtIdCluster.get(cluster.districtId).indexOf(cluster),1); 

                 this.cluster.splice(i, 1);
                 break;
             }
         }
     },
    
     findAllByDistrictId: function (district, requestingUser) {
        if (this.canManageDistrict(requestingUser, district.distictId))
            return this.districtIdGroup[district.districtId];
        else
            throw "Unauthorized user";
    },
   
     findAllCache: function () {
        return models.Cluster.findAll(
            {
                where: { statusId: statusHelper.statusMap['Active'].statusId }
            }
        );
    },

    findClusterById: function (id) {
        return models.Cluster.findOne({
            where: { clusterId: id, statusId: statusHelper.statusMap['Active'].statusId },
        });
    },

    findClusterByIdMap: function(id){
        return clusterIdMap[id];

    },

     
    create: async function (clusterToCreate, requester) {
        if (!this.canCreateCluster(clusterToCreate,requester)) {
            throw "Unauthorized request";
        }
        else {

                clusterToCreate.createdDate = new Date();
                clusterToCreate.lastUpdatedDate = new Date();
                clusterToCreate.createdBy = requester.userId;
                clusterToCreate.lastUpdatedBy = requester.userId;
                clusterToCreate.statusId = statusHelper.statusMap['Inactive'].statusId;
                var createdCluster = await models.Cluster.create(clusterToCreate);
                this.addToCache(createdCluster);
                console.log(createdCluster);
                return createdCluster;

        }
    },


    update: async function (clusterToUpdate, requester) {
        var clusterHelper = this;
        var cluster = await this.findClusterById(clusterToUpdate.clusterId);
        if (cluster) {

            if (!this.canManageCluster(requester, clusterToUpdate)) {
                throw "Unauthorized request";
            }
            else {
                if(!this.canManageStatus(requester,clusterToUpdate)){

                    cluster.lastUpdatedDate = new Date();

                }
                else
                    cluster.statusId = clusterToUpdate.statusId;
                        
                var updatedCluster=cluster.save();
                this.updateToCache(updatedCluster);
                return updatedCluster;
            }
        }

    },

    
    updateDistrictId: async function(clusterToUpdate,requester){
        var cluster = await this.findGroupByIdMap(clusterToUpdate.clusterId);
        if(!districtHelper.canAddToCluster(clusterToUpdate,requester))
            throw "Unauthorized request";
        else {
            cluster.districtId = clusterToUpdate.districtId;
            var updatedCluster = cluster.save();
            this.updateToCache(updatedCluster);
            return updatedCluster;
        }
    },
    
    canAddToCluster: function(user,requester){
        console.log(user.clusterId);
        if(requester.role==Constants.CLUSTER_ADMIN){
            if(requester.clusterId==0){
                if(user.userId==requester.userId)
                    return true;
                 else
                    return false;
            }
            else if(requester.userId==user.userId){
                if(requester.clusterId!=user.clusterId)
                    return false;
                else
                    return true;
             }
            else if(requester.clusterId==user.clusterId)
                return(user.clusterId==requester.clusterId);
        }
        else
            return false;
    },
   
    canManageStatus: function(cluster,requester){
        if(requester.role == Constants.STATE_ADMIN){
            var districtId = this.findGroupById(district.groupId).clusterId;
            var stateId = stateHelper.findStateByDistrict(districtId).stateId;
            return (requester.stateId == stateId);
        }
        else 
            return false;
    },
   
    canCreateDistrict: function(cluster, requester){
            if(requester.role == Constants.CLUSTER_ADMIN)
                return true;
            else if(requester.role== Constants.SYSTEM_ADMIN)
                    return true;
            else if(requester.role == Constants.STATE_ADMIN){
                var districtId = this.findGroupById(district.groupId).clusterId;
                var stateId = stateHelper.findStateByDistrict(districtId).stateId;
                return (requester.stateId == stateId);
            }
        },

    canManageCluster: function(cluster, requester){
        if(requester.role == Constants.CLUSTER_ADMIN)
            return (requester.clusterId == cluster.clusterId);

        else if(requester.role== Constants.SYSTEM_ADMIN)
                return true;
        else if(requester.role == Constants.STATE_ADMIN){
            var districtId = this.findClusterById(clusterId).districtId;
            var stateId = stateHelper.findStateByDistrict(districtId).stateId;
            return (requester.stateId == stateId);
        }
    },

    canManageDistrict: function(cluster,requester){
        if(requester.role == Constants.CLUSTER_ADMIN){
            var requestingUserCluster= this.findClusterById(requestingUser.clusterId)
            return (requestingUserCluster.clusterId == clusterid);
        }
    }

 };

 ClusterHelper.updateCache();
 module.exports = ClusterHelper;
 





