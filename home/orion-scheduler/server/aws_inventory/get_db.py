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

class db(Thread):

    def run(self, access_key, secret_key):
        accclient = boto3.client("sts", aws_access_key_id=access_key, aws_secret_access_key=secret_key)
        account_id = accclient.get_caller_identity()["Account"]
        
        obj_inv = Inventory(access_key, secret_key)
        
        inventory_list = {}
        
        inventory_list['rds-instances'] = obj_inv.get_inventory(
            aws_service = "rds", 
            aws_region = "all", 
            function_name = "describe_db_instances", 
            key_get = "DBInstances",
            pagination = True
        )

        inventory_list['rds-clusters'] = obj_inv.get_inventory(
            aws_service = "rds",
            aws_region = "all",
            function_name = "describe_db_clusters",
            key_get = "DBClusters",
            pagination = True
        )
        
            
        inventory_list['dynamodb'] = obj_inv.get_inventory(
            aws_service = "dynamodb", 
            aws_region = "all", 
            function_name = "list_tables", 
            key_get = "TableNames",
            detail_function = "describe_table", 
            join_key = "TableName", 
            detail_join_key = "TableName", 
            detail_get_key = "Table",
            pagination = True
        )
        
        inventory_list['redshift-clusters'] = obj_inv.get_inventory(
            aws_service = "redshift", 
            aws_region = "all", 
            function_name = "describe_clusters", 
            key_get = "Clusters",
            pagination = True
        )

        inventory_list['redshift-reserved-nodes'] = obj_inv.get_inventory(
            aws_service = "redshift", 
            aws_region = "all", 
            function_name = "describe_reserved_nodes", 
            key_get = "ReservedNodes",
            pagination = True
        )

        # Looking for instances

        inventory_list['docdb-instances'] = obj_inv.get_inventory(
            aws_service = "docdb", 
            aws_region = "all", 
            function_name = "describe_db_instances", 
            key_get = "DBInstances",
            pagination = True
        )

        # Looking for clusters

        inventory_list['docdb-clusters'] = obj_inv.get_inventory(
            aws_service = "docdb", 
            aws_region = "all", 
            function_name = "describe_db_clusters", 
            key_get = "DBClusters",
            pagination = True
        )

        inventory_list['memorydb-clusters'] = obj_inv.get_inventory(
            aws_service = "memorydb", 
            aws_region = "all", 
            function_name = "describe_clusters", 
            key_get = "Clusters"
        )

        data = inventory_list
        print("RESULT of get_db.py", data)
        index_namee = 'aws-db-out-'

        doc_type = 'rds-instances'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'rds-clusters'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'dynamodb'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'redshift-clusters'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'redshift-reserved-nodes'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'docdb-instances'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'docdb-clusters'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'memorydb-clusters'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
 
if (__name__ == '__main__'):
    print('Module => Do not execute')

    