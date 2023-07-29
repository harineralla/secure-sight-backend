import boto3
import botocore
import json

import datetime
from threading import Thread
import logging
from inventory import Inventory
import utils as utils
import sys
import os
import pwd
import pathlib
server_path = os.path.join(pathlib.Path(__file__).parent.resolve().parent.resolve() ,'')


username = pwd.getpwuid(os.getuid())[0]
sys.path.append(server_path)
from elasticsearch_insert_func import insert_elasticdb

logger = logging.getLogger(__name__)

class container(Thread):

    def run(self, access_key, secret_key):
        accclient = boto3.client("sts", aws_access_key_id=access_key, aws_secret_access_key=secret_key)
        account_id = accclient.get_caller_identity()["Account"]
        
        obj_inv = Inventory(access_key, secret_key)
        
        inventory_list = {}
        
        inventory_list['ecs-cluster'] = obj_inv.get_inventory(
            aws_service = "ecs", 
            aws_region = "all", 
            function_name = "describe_clusters", 
            key_get = "clusters"
        )
        
        inventory_list['ecs-services'] = obj_inv.get_inventory(
            aws_service = "ecs", 
            aws_region = "all", 
            function_name = "list_services", 
            key_get = "serviceArns",
            detail_function = "describe_services", 
            join_key = "", 
            detail_join_key = "services", 
            detail_get_key = "services",
            pagination = True,
            pagination_detail = True
        )
        
        inventory_list['ecs-task-definitions'] = obj_inv.get_inventory(
            aws_service = "ecs", 
            aws_region = "all", 
            function_name = "list_task_definitions", 
            key_get = "taskDefinitionArns",
            detail_function = "describe_task_definition", 
            join_key = "taskDefinitionArn", 
            detail_join_key = "taskDefinition", 
            detail_get_key = "taskDefinition",
            pagination = True,
            pagination_detail = True
        )

        inventory_list['eks-cluster'] = obj_inv.get_inventory(
            aws_service = "eks", 
            aws_region = "all", 
            function_name = "list_clusters", 
            key_get = "clusters",
            detail_function = "describe_cluster", 
            join_key = "", 
            detail_join_key = "name", 
            detail_get_key = "cluster"
        )
       
        inventory = {}

        desc_repo_list =  obj_inv.get_inventory(
            aws_service = "ecr", 
            aws_region = "all", 
            function_name = "describe_repositories", 
            key_get = "repositories"
        )

        # Not very handy: we have to disrupt our method

        images_list = {}

        if (len(desc_repo_list) > 0):
        
            for repo in desc_repo_list:

                inventory[repo['repositoryName']] = {
                    'repositoryArn': repo['repositoryName'],
                    'registryId': repo['registryId'],
                    'repositoryName': repo['repositoryName'],
                    'RegionName': repo['RegionName'],
                    'repositoryUri': repo['repositoryUri'],
                    'createdAt': repo['createdAt'],
                    'imageTagMutability': repo['imageTagMutability'],
                    'imageScanningConfiguration': repo['imageScanningConfiguration'],
                    'encryptionConfiguration': repo['encryptionConfiguration'],
                    'imagesList': {}
                    }

                # inventory[repo['repositoryName']]['imagesList'] = obj_inv.get_inventory(
                #     ownerId = oId,
                #     profile = profile,
                #     boto3_config = boto3_config,
                #     selected_regions = repo['RegionName'],
                #     aws_service = "ecr", 
                #     aws_region = "all", 
                #     function_name = "list_images", 
                #     key_get = "imageIds",
                #     additional_parameters = {'repositoryName': repo['repositoryName']},
                #     detail_function = "describe_images",
                #     join_key = "imageIds", 
                #     detail_join_key = "imageIds", 
                #     detail_get_key = "imageDetails",
                #     pagination_detail = True
                # )
        
        inventory_list['ecr-repositories'] = inventory

        data = inventory_list
        print("RESULT of get_container.py", data)
        index_namee = 'aws-container-out-'

        doc_type = 'ecs-cluster'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'ecs-services'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'ecs-task-definitions'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'eks-cluster'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        # doc_type = 'ecr-repositories'
        # for i in data[doc_type]:
        #     i["_accountID"] = account_id
        #     index_name = index_namee + doc_type
        #     insert_elasticdb(i, doc_type, index_name)

if (__name__ == '__main__'):
    print('Module => Do not execute')

    