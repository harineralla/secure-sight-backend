import boto3
import botocore
import json

import datetime
import utils as utils
from threading import Thread
import logging

logger = logging.getLogger(__name__)

class Inventory():

    def __init__(self, aws_access_key_id, aws_secret_access_key):
        self.session = boto3.Session(aws_access_key_id=aws_access_key_id, aws_secret_access_key=aws_secret_access_key)
        self.not_opted_regions = utils.get_not_opted_regions('', '', self.session)
        pass
          
    def get_inventory(self, aws_service, function_name, key_get = "", aws_region = "all", 
                detail_function = "", join_key = "", detail_join_key = "", detail_get_key = "",
                pagination = False, pagination_detail = False, additional_parameters = {}
                ):
        inventory = []
        region_list = self.session.get_available_regions(aws_service)
        
        if aws_region == 'global':
            inventory = self.get_global_inventory(aws_service, function_name, key_get, aws_region, 
                detail_function, join_key, detail_join_key, detail_get_key,
                pagination, pagination_detail, additional_parameters)
            return inventory
        for region_name in region_list:
            if region_name in self.not_opted_regions:
                continue
            print("Get details of Service {} in region {}.".format(aws_service, region_name))
            logger.info("Get details of Service {} in region {}.".format(aws_service, region_name))
            t_try = datetime.datetime.now()
            try:
                client = self.session.client(aws_service, region_name)

                if (pagination):
                    
                    paginator = client.get_paginator(function_name)
                    page_iterator = paginator.paginate()

                    for detail in page_iterator:
                        for inventory_object in detail.get(key_get):
                            detailed_inv = self.get_inventory_detail(client, region_name, inventory_object, detail_function, join_key, detail_join_key, detail_get_key, pagination_detail)
                            inventory.append(json.loads(utils.json_datetime_converter(detailed_inv)))
                else:
                    inv_list = client.__getattribute__(function_name)(**additional_parameters).get(key_get)
                    #utils.display('ownerId', region_name, aws_service, function_name)

                    for inventory_object in inv_list:
                        detailed_inv = self.get_inventory_detail(client, region_name, inventory_object, detail_function, join_key, detail_join_key, detail_get_key, pagination_detail)
                        inventory.append(json.loads(utils.json_datetime_converter(detailed_inv)))

            except (botocore.exceptions.EndpointConnectionError, botocore.exceptions.ClientError) as e:
                # unsupported region for efs
                logger.warning("{} is not available (not supported ?) in region {}.".format(aws_service, region_name))
                logger.warning("aws service:{}, region:{}, function:{}, error type: {}, error text: {}".format(aws_service, region_name, function_name, type(e), e))
                logger.debug("aws service:{}, region:{}, function:{}, error type: {}, error text: {}".format(aws_service, region_name, function_name, type(e), e))

            except Exception as e:
                logger.error("Error while processing {}, {}, {}. Error: {}".format(aws_service, region_name, function_name, e))

            finally:
                t_fin = datetime.datetime.now() - t_try
                logger.debug("Overall exec time for {} {} {}: {}".format(aws_service, region_name, function_name, t_fin.total_seconds()))
    
        return inventory
    
    
    def get_inventory_detail(self, client, region_name, inventory_object, detail_function, 
            join_key, detail_join_key, detail_get_key, pagination_detail = False):

        '''
            Get details for the resource, if needed. Same parameters as get_detail but all are mandatory except detail_get_key and pagination_detail
            .. seealso:: :function:`get_inventory`
        '''

        detailed_inv = inventory_object

        # if no function is provided, not detail is needed

        if (detail_function != ""):
            print('{} detail function'.format(detail_function))
            logger.info('{} detail function'.format(detail_function))

            # we set the key value; it's something that identifies the objet and that we pass to 
            # the detail function as a search key. Sometimes the upper inventory functions returns 
            # full objects, and sometime only a list of id. That's why we test if we have an objet
            # or only a string passed as parameter.s

            if (isinstance(inventory_object, str)):
                # the upper inventory function returned str
                detailed_inv = {detail_get_key: inventory_object}
                key = inventory_object
            else:
                # normal objet; we retrieve the value of the 'join key' field
                key = inventory_object.get(join_key)

            # Now we add parameters (key) for the API Call
            param = {detail_join_key: key} # works only for a single value, but some functions needs tables[], like ECS Tasks

            # now we fetch the details; again, depending on the called function, the return object may contains
            # a list, an object, etc. The return value structure may vary a lot.

            if (detail_get_key != ""):

                # here a detail_get_ket is provided to get the right object, in the JSON response
                if (pagination_detail):
                    # in case that the detail function allows pagination, for large lists
                    paginator = client.get_paginator(detail_function)
                    page_iterator = paginator.paginate(**param)
                    for detail in page_iterator:
                        for detail_object in detail.get(detail_get_key):
                            detailed_inv[detail_get_key].append(detail_object)
                else:
                    # no pagination, so we call the detail function directly
                    detailed_inv[detail_get_key] = client.__getattribute__(detail_function)(**param).get(detail_get_key)

            else:

                # well, here there's no key, we return the object as is. 
                detail_get_key = 'details'

                # here a detail_get_ket is provided to get the right object, in the JSON response
                if (pagination_detail):
                    # in case that the detail function allows pagination, for large lists
                    paginator = client.get_paginator(detail_function)
                    page_iterator = paginator.paginate(**param)
                    for detail in page_iterator:
                        for detail_object in detail:
                            detailed_inv[detail_get_key].append(detail_object)
                else:
                    # no pagination, so we call the detail function directly
                    detailed_inv[detail_get_key] = client.__getattribute__(detail_function)(**param)

            if ("ResponseMetadata" in detailed_inv[detail_get_key]):
                del detailed_inv[detail_get_key]['ResponseMetadata']

        # Sometimes we loose region name; if so, we add it 
        if (type(detailed_inv) != str):
            if ('RegionName' not in detailed_inv):
                detailed_inv['RegionName'] = region_name

        return detailed_inv


    def get_global_inventory(self, aws_service, function_name, key_get = "", aws_region = "global", 
                detail_function = "", join_key = "", detail_join_key = "", detail_get_key = "",
                pagination = False, pagination_detail = False, additional_parameters = {}
                ):
        
        inventory = []
        try:
            logger.info("Get details of Service {}.".format(aws_service))
            print("Get details of Service {}.".format(aws_service))
            t_try = datetime.datetime.now()
            client = self.session.client(aws_service)
            if (pagination):

                paginator = client.get_paginator(function_name)
                page_iterator = paginator.paginate()
                
                for detail in page_iterator:
                    # CloudFront exception
                    if (aws_service == "cloudfront" and function_name == "list_distributions"):
                        detail = detail.get('DistributionList')
                    
                    for inventory_object in detail.get(key_get):
                        detailed_inv = self.get_inventory_detail(client, aws_region, inventory_object, detail_function, join_key, detail_join_key, detail_get_key, pagination_detail)
                        inventory.append(json.loads(utils.json_datetime_converter(detailed_inv)))

            else:

                inv_list = client.__getattribute__(function_name)().get(key_get)
                
                for inv in inv_list:
                    detailed_inv = self.get_inventory_detail(client, aws_region, inv, detail_function, join_key, detail_join_key, detail_get_key, pagination_detail)
                    inventory.append(json.loads(utils.json_datetime_converter(detailed_inv)))

        except (botocore.exceptions.EndpointConnectionError, botocore.exceptions.ClientError) as e:

            # unsupported region (or bad coding somewhere)
            logger.warning("A problem occurred or {} is not not supported.".format(aws_service))        
            logger.warning("aws service:{}, function:{}, error type: {}, error text: {}".format(aws_service, function_name, type(e), e))
            logger.debug("Error text : {}".format(e))

        except Exception as e:

            logger.error("Error while processing {}, {}.\n{}".format(aws_service, aws_region, e))

        finally:

            t_fin = datetime.datetime.now() - t_try
            logger.debug("Overall exec time for {} {} {}: {}".format(aws_service, aws_region, function_name, t_fin.total_seconds()))

        return inventory
    
