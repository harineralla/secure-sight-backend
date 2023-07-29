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

class network(Thread):

    def run(self, access_key, secret_key):
        accclient = boto3.client("sts", aws_access_key_id=access_key, aws_secret_access_key=secret_key)
        account_id = accclient.get_caller_identity()["Account"]
        
        obj_inv = Inventory(access_key, secret_key)
        
        inventory_list = {}
        
        inventory_list['apigateway'] = obj_inv.get_inventory(
            aws_service = "apigateway", 
            aws_region = "all", 
            function_name = "get_rest_apis", 
            key_get = "items",
            pagination = True
        )

        inventory_list['cloudfront'] = obj_inv.get_inventory(
            aws_service = "cloudfront", 
            aws_region = "obj_inval", 
            function_name = "list_distributions", 
            key_get = "Items",
            #key_get = "DistributionList",
            pagination = True
        )

        inventory_list['route53-zones'] = obj_inv.get_inventory(
            aws_service = "route53", 
            aws_region = "obj_inval", 
            function_name = "list_hosted_zones_by_name", 
            key_get = "HostedZones",
            detail_function = "list_resource_record_sets", 
            join_key = "Id", 
            detail_join_key = "HostedZoneId", 
            detail_get_key = "ResourceRecordSets",
            pagination = True
        )

        inventory_list['route53-traffic-policies'] = obj_inv.get_inventory(
            aws_service = "route53", 
            aws_region = "obj_inval", 
            function_name = "list_traffic_policies", 
            key_get = "TrafficPolicySummaries",
            pagination = True
        )

        inventory_list['route53-domains'] = obj_inv.get_inventory(
            aws_service = "route53domains", 
            aws_region = "all", 
            function_name = "list_domains", 
            key_get = "Domains"
        )

        inventory_list['elb'] = obj_inv.get_inventory(
            aws_service = "elb",
            aws_region = "all",
            function_name = "describe_load_balancers",
            key_get = "LoadBalancerDescriptions",
            pagination = True
        )

        inventory_list['elbv2'] = obj_inv.get_inventory(
            aws_service = "elbv2", 
            aws_region = "all", 
            function_name = "describe_load_balancers", 
            key_get = "LoadBalancers",
            pagination = True
        )

        data = inventory_list
        print("RESULT of get_network.py", data)
        index_namee = 'aws-network-out-'

        doc_type = 'apigateway'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'cloudfront'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'route53-zones'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'route53-traffic-policies'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'route53-domains'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'elb'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'elbv2'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)

if (__name__ == '__main__'):
    print('Module => Do not execute')

    