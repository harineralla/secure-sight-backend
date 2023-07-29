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

class compute(Thread):

    def run(self, access_key, secret_key):
        accclient = boto3.client("sts", aws_access_key_id=access_key, aws_secret_access_key=secret_key)
        account_id = accclient.get_caller_identity()["Account"]
        
        obj_inv = Inventory(access_key, secret_key)
        
        inventory_list = {}
        
        inventory_list['ec2'] = obj_inv.get_inventory(
                aws_service = "ec2", 
                aws_region = "all", 
                function_name = "describe_instances", 
                key_get = "Reservations",
                pagination = True
            )

        inventory_list['ec2-network-interfaces'] = obj_inv.get_inventory(
                aws_service = "ec2", 
                aws_region = "all", 
                function_name = "describe_network_interfaces", 
                key_get = "NetworkInterfaces"
            )


        inventory_list['ec2-vpcs'] = obj_inv.get_inventory(
                aws_service = "ec2", 
                aws_region = "all", 
                function_name = "describe_vpcs", 
                key_get = "Vpcs"
            )


        inventory_list['ec2-subnets'] = obj_inv.get_inventory(
                aws_service = "ec2", 
                aws_region = "all", 
                function_name = "describe_subnets", 
                key_get = "Subnets"
            )


        inventory_list['ec2-volumes'] = obj_inv.get_inventory(
                aws_service = "ec2", 
                aws_region = "all", 
                function_name = "describe_volumes", 
                key_get = "Volumes",
                pagination = True
            )


        inventory_list['ec2-addresses'] = obj_inv.get_inventory(
                aws_service = "ec2", 
                aws_region = "all", 
                function_name = "describe_addresses", 
                key_get = "Addresses"
            )

        inventory_list['ec2-security-groups'] = obj_inv.get_inventory(
                aws_service = "ec2", 
                aws_region = "all", 
                function_name = "describe_security_groups", 
                key_get = "SecurityGroups",
                pagination = True
            )


        inventory_list['ec2-internet-gateways'] = obj_inv.get_inventory(
                aws_service = "ec2", 
                aws_region = "all", 
                function_name = "describe_internet_gateways", 
                key_get = "InternetGateways"
            )


        inventory_list['ec2-nat-gateways'] = obj_inv.get_inventory(
                aws_service = "ec2", 
                aws_region = "all", 
                function_name = "describe_nat_gateways", 
                key_get = "NatGateways"
            )


        inventory_list['lambda'] = obj_inv.get_inventory(
                aws_service = "lambda", 
                aws_region = "all", 
                function_name = "list_functions", 
                key_get = "Functions",
                pagination = True
            )
        
        data = inventory_list
        instance_data = json.dumps(data['ec2'],indent=4)
        # print(instance_data[0]['Instances'][0])
        
        print("RESULT of get_compute.py", print(len(data['ec2'])))
        index_namee = 'aws-compute-out-'
        
        doc_type = 'ec2'
        
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i['Instances'][0], doc_type, index_name)
        doc_type = 'ec2-network-interfaces'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'ec2-vpcs'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'ec2-subnets'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'ec2-volumes'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'ec2-addresses'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'ec2-security-groups'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'ec2-internet-gateways'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'ec2-nat-gateways'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'lambda'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)

if (__name__ == '__main__'):
    print('Module => Do not execute')

    