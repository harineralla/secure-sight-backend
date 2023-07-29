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

class integration(Thread):

    def run(self, access_key, secret_key):
        accclient = boto3.client("sts", aws_access_key_id=access_key, aws_secret_access_key=secret_key)
        account_id = accclient.get_caller_identity()["Account"]
        
        obj_inv = Inventory(access_key, secret_key)
        
        inventory_list = {}
        
        inventory_list['sqs'] = obj_inv.get_inventory(
            aws_service = "sqs", 
            aws_region = "all", 
            function_name = "list_queues", 
            key_get = "QueueUrls",
            detail_function = "get_queue_attributes", 
            join_key = "QueueUrl", 
            detail_join_key = "QueueUrl", 
            detail_get_key = "Attributes"
        )

        inventory_list['mq-brokers'] = obj_inv.get_inventory(
            aws_service = "mq", 
            aws_region = "all", 
            function_name = "list_brokers", 
            key_get = "BrokerSummaries",
            detail_function = "describe_broker", 
            join_key = "BrokerId", 
            detail_join_key = "BrokerId", 
            detail_get_key = ""
        )

        inventory_list['mq-configurations'] = obj_inv.get_inventory(
            aws_service = "mq", 
            aws_region = "all", 
            function_name = "list_configurations", 
            key_get = "Configurations"
        )
        
        inventory_list['sns-topics'] = obj_inv.get_inventory(
            aws_service = "sns", 
            aws_region = "all", 
            function_name = "list_topics", 
            key_get = "Topics",
            pagination = True
        )

        inventory_list['sns-applications'] = obj_inv.get_inventory(
            aws_service = "sns", 
            aws_region = "all", 
            function_name = "list_platform_applications", 
            key_get = "PlatformApplications",
            pagination = True
        )

        inventory_list['stepfunctions-machines'] = obj_inv.get_inventory(
            aws_service = "stepfunctions", 
            aws_region = "all", 
            function_name = "list_state_machines", 
            key_get = "stateMachines",
            detail_function = "describe_state_machine",
            join_key = "stateMachineArn",
            detail_join_key = "stateMachineArn",
            detail_get_key = "",
            pagination_detail = False,
            pagination = True
        )

        inventory_list['stepfunctions-activities'] = obj_inv.get_inventory(
            aws_service = "stepfunctions", 
            aws_region = "all", 
            function_name = "list_activities", 
            key_get = "activities",
            pagination = True
        )
        
        inventory_list['flows'] = obj_inv.get_inventory(
            aws_service = "appflow", 
            aws_region = "all", 
            function_name = "list_flows", 
            key_get = "flows",
            detail_function = "describe_flow",
            join_key = "flowName",
            detail_join_key = "flowName",
            detail_get_key = "",
            pagination_detail = False,
            pagination = False
        )
        
        inventory_list['events-archives'] = obj_inv.get_inventory(
            aws_service = "events", 
            aws_region = "all", 
            function_name = "list_archives", 
            key_get = "Archives",
            detail_function = "describe_archive",
            join_key = "ArchiveName",
            detail_join_key = "ArchiveName",
            detail_get_key = "",
            pagination_detail = False,
            pagination = False
        )

        inventory_list['events-connections'] = obj_inv.get_inventory(
            aws_service = "events", 
            aws_region = "all", 
            function_name = "list_connections", 
            key_get = "Connections",
            detail_function = "describe_connection",
            join_key = "Name",
            detail_join_key = "Name",
            detail_get_key = "",
            pagination_detail = False,
            pagination = False
        )

        inventory_list['event_buses'] = obj_inv.get_inventory(
            aws_service = "events", 
            aws_region = "all", 
            function_name = "list_event_buses", 
            key_get = "EventBuses",
            detail_function = "describe_event_bus",
            join_key = "Name",
            detail_join_key = "Name",
            detail_get_key = "",
            pagination_detail = False,
            pagination = False
        )
     
        inventory_list['event_sources'] = obj_inv.get_inventory(
            aws_service = "events", 
            aws_region = "all", 
            function_name = "list_event_sources", 
            key_get = "EventSources",
            detail_function = "describe_event_source",
            join_key = "Name",
            detail_join_key = "Name",
            detail_get_key = "",
            pagination_detail = False,
            pagination = False
        )
        
        inventory_list['events-replays'] = obj_inv.get_inventory(
            aws_service = "events", 
            aws_region = "all", 
            function_name = "list_replays", 
            key_get = "ReplayName",
            detail_function = "describe_replay",
            join_key = "Name",
            detail_join_key = "ReplayName",
            detail_get_key = "",
            pagination_detail = False,
            pagination = False
        )
          
        inventory_list['events-rules'] = obj_inv.get_inventory(
            aws_service = "events", 
            aws_region = "all", 
            function_name = "list_rules", 
            key_get = "Rules",
            detail_function = "describe_rule",
            join_key = "Name",
            detail_join_key = "Name",
            detail_get_key = "",
            pagination_detail = False,
            pagination = False
        )
        
        data = inventory_list
        print("RESULT of get_integration.py", data)
        index_namee = 'aws-integration-out-'

        doc_type = 'sqs'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'mq-brokers'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'mq-configurations'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'sns-topics'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'sns-applications'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'stepfunctions-machines'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'stepfunctions-activities'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'flows'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'events-archives'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'events-connections'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'event_buses'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'event_sources'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'events-replays'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)
        doc_type = 'events-rules'
        for i in data[doc_type]:
            i["_accountID"] = account_id
            index_name = index_namee + doc_type
            insert_elasticdb(i, doc_type, index_name)

if (__name__ == '__main__'):
    print('Module => Do not execute')

    