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

class iam(Thread):

    def run(self, access_key, secret_key):
        accclient = boto3.client("sts", aws_access_key_id=access_key, aws_secret_access_key=secret_key)
        account_id = accclient.get_caller_identity()["Account"]
        
        obj_inv = Inventory(access_key, secret_key)
        
        inventory_list = {}
        
        inventory_list['kms'] =  obj_inv.get_inventory(
            aws_service = "kms", 
            aws_region = "all", 
            function_name = "list_keys", 
            key_get = "Keys",
            detail_function = "describe_key", 
            join_key = "KeyId", 
            detail_join_key = "KeyId", 
            detail_get_key = "KeyMetadata",
            pagination = True
        )

        data = inventory_list
        print("RESULT of get_iam.py", data)
        index_namee = 'aws-iam-out-'
        
        doc_type = 'kms'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)

if (__name__ == '__main__'):
    print('Module => Do not execute')

    