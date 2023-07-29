import boto3
import botocore
import json

import datetime
from threading import Thread
import logging
from inventory import Inventory
import utils as utils
from botocore.exceptions import ClientError
import sys
import os
import pwd
import pathlib
server_path = os.path.join(pathlib.Path(__file__).parent.resolve().parent.resolve() ,'')



username = pwd.getpwuid(os.getuid())[0]
sys.path.append(server_path)
from elasticsearch_insert_func import insert_elasticdb

logger = logging.getLogger(__name__)

class storage(Thread):

    def run(self, access_key, secret_key):
        accclient = boto3.client("sts", aws_access_key_id=access_key, aws_secret_access_key=secret_key)
        account_id = accclient.get_caller_identity()["Account"]
        
        obj_inv = Inventory(access_key, secret_key)
        
        inventory_list = {}
        inventory_list['s3-bucket'] = []
        
        bucket_list = obj_inv.get_inventory(
                aws_service = "s3", 
                aws_region = "global", 
                function_name = "list_buckets", 
                key_get = "Buckets"
            )

        # S3 needs some analysis (website, size)

        session = boto3.Session(aws_access_key_id=access_key, aws_secret_access_key=secret_key)
        s3 = session.client("s3")
        
        if len(bucket_list) > 0:

            for bucket in bucket_list:
                bucket_name = bucket['Name']

                # Check if a website if configured; if yes, it could lead to a DLP issue
                try:
                    has_website = 'unknown'
                    has_website = s3.get_bucket_website(Bucket = bucket_name)
                    del has_website['ResponseMetadata']
                except ClientError as ce:
                    if 'NoSuchWebsiteConfiguration' in ce.args[0]:
                        has_website = 'no'
                bucket['website'] = has_website

                # Tags
                try:
                    bucket['tags'] = s3.get_bucket_tagging(Bucket = bucket_name).get('TagSet')
                except:
                    pass

                # ACL
                try:
                    acl = s3.get_bucket_acl(Bucket = bucket_name)
                    del acl['ResponseMetadata']
                    bucket['acl'] = acl              
                except:
                    pass
                
                # Policy
                try:
                    policy = "no"
                    policy = json.JSONDecoder().decode(s3.get_bucket_policy(Bucket = bucket_name).get('Policy'))
                    del policy['ResponseMetadata']
                except:
                    pass
                bucket['policy'] = policy

                # Encryption
                try:
                    encrypt = "no"
                    encrypt = s3.get_bucket_encryption(Bucket = bucket_name)
                    del encrypt['ResponseMetadata']
                except:
                    pass
                bucket['encryption'] = encrypt  

                # Other
                bucket['location'] = s3.get_bucket_location(Bucket = bucket_name).get('LocationConstraint')

                # Summarize nb of objets and total size (for the current bucket)
                paginator = s3.get_paginator('list_objects_v2')
                nbobj = 0
                size = 0
                #page_objects = paginator.paginate(Bucket=bucketname,PaginationConfig={'MaxItems': 10})
                page_objects = paginator.paginate(Bucket = bucket_name)
                for objects in page_objects:
                    try:
                        nbobj += len(objects['Contents'])
                        for obj in objects['Contents']:
                            size += obj['Size']
                    except:
                        pass
                bucket['number_of_objects'] = nbobj
                bucket['total_size'] = size

                #inventory.append(bucket)
                inventory_list['s3-bucket'].append(bucket)


        inventory_list['efs'] = obj_inv.get_inventory(
            aws_service = "efs", 
            aws_region = "all", 
            function_name = "describe_file_systems", 
            key_get = "FileSystems",
            pagination = True
        )


        inventory_list['glacier'] = obj_inv.get_inventory(
            aws_service = "glacier", 
            aws_region = "all", 
            function_name = "list_vaults", 
            key_get = "VaultList",
            pagination = True
        )

        data = inventory_list
        print("RESULT of get_storage.py", data)
        index_namee = 'aws-storage-out-'

        doc_type = 's3-bucket'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'efs'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'glacier'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)

if (__name__ == '__main__'):
    print('Module => Do not execute')

    