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

class security(Thread):

    def run(self, access_key, secret_key):
        accclient = boto3.client("sts", aws_access_key_id=access_key, aws_secret_access_key=secret_key)
        account_id = accclient.get_caller_identity()["Account"]
        
        obj_inv = Inventory(access_key, secret_key)
        
        inventory_list = {}
        
        
        inventory_list['clouddirectory'] = obj_inv.get_inventory(
            aws_service = "clouddirectory", 
            aws_region = "all", 
            function_name = "list_directories", 
            key_get = "Directories",
            pagination = True
        )

        inventory_list['acm'] = obj_inv.get_inventory(
            aws_service = "acm", 
            aws_region = "all", 
            function_name = "list_certificates", 
            key_get = "CertificateSummaryList",
            detail_function = "describe_certificate", 
            join_key = "CertificateArn", 
            detail_join_key = "CertificateArn", 
            detail_get_key = "Certificate",
            pagination = True
        )

        inventory_list['acm-pca'] = obj_inv.get_inventory(
            aws_service = "acm-pca", 
            aws_region = "all", 
            function_name = "list_certificate_authorities", 
            key_get = "CertificateAuthorities"
        )

        inventory_list['secretsmanager'] = obj_inv.get_inventory(
            aws_service = "secretsmanager", 
            aws_region = "all", 
            function_name = "list_secrets", 
            key_get = "SecretList"
        )

        inventory_list['cloudhsmv2-clusters'] = obj_inv.get_inventory(
            aws_service = "cloudhsmv2", 
            aws_region = "all", 
            function_name = "describe_clusters", 
            key_get = "Clusters",
            pagination = True
        )

        inventory_list['waf'] = obj_inv.get_inventory(
            aws_service = "waf", 
            aws_region = "obj_inval", 
            function_name = "list_rules", 
            key_get = "Rules",
            pagination = True
        )


        inventory_list['wafv2'] = obj_inv.get_inventory(
            aws_service = "wafv2", 
            aws_region = "obj_inval", 
            function_name = "list_rule_groups", 
            key_get = "RuleGroups",
            pagination = False
        )

        inventory_list['waf-regional'] = {}
        
        inventory_list['waf-regional']['web_acls'] = obj_inv.get_inventory(
            aws_service = "waf-regional", 
            aws_region = "all", 
            function_name = "list_web_acls", 
            key_get = "WebACLs",
            pagination = False
        )
        
        inventory_list['waf-regional']['rules'] = obj_inv.get_inventory(
            aws_service = "waf-regional", 
            aws_region = "all", 
            function_name = "list_rules", 
            key_get = "Rules",
            pagination = False
        )

        inventory_list['guardduty-detectors'] = obj_inv.get_inventory(
            aws_service = "guardduty", 
            aws_region = "all", 
            function_name = "list_detectors", 
            key_get = "DetectorIds",
            detail_function = "get_detector", 
            join_key = "DetectorId", 
            detail_join_key = "DetectorId", 
            detail_get_key = "",
            pagination = True
        )
        
        data = inventory_list
        print("RESULT of get_security.py", data)
        index_namee = 'aws-security-out-'

        doc_type = 'clouddirectory'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'acm'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'acm-pca'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'secretsmanager'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'cloudhsmv2-clusters'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'waf'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'wafv2'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        # doc_type = 'waf-regional'
        # for i in data[doc_type]:
        #     i["_accountID"] = account_id
        #     index_name = index_namee + doc_type
        #     insert_elasticdb(i, doc_type, index_name)
        doc_type = 'guardduty-detectors'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)

if (__name__ == '__main__'):
    print('Module => Do not execute')

    