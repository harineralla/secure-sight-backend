import boto3
import threading
import os
import json
import requests

class aws_s3(threading.Thread):

    def run(self):
        result = []
        # Let's use Amazon S3
        s3 = boto3.resource('s3')
        
        result = s3.buckets.all()
        for bucket in s3.buckets.all():
            print(bucket.name)
        print(list(result))
        return result

class aws_test(threading.Thread):
    def run(self, access_key, secret_key):
        session = boto3.Session(
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            #aws_session_token=SESSION_TOKEN
        )
        #s3 = boto3.resource('s3')
        s3 = session.resource('s3')
        result = s3.buckets.all()
        for bucket in s3.buckets.all():
            print(bucket.name)
            #print(s3.get(bucket.name))
        print(list(result))
        return result
    
def get_ownerID(profile):

    """
        Get owner ID of the AWS account we are working on

        :return: owner ID
        :rtype: string
    """  

    session = boto3.Session(profile_name=profile)
    sts = session.client('sts')
    identity = sts.get_caller_identity()
    ownerId = identity['Account']
    return ownerId

if __name__ == '__main__':    
    obj = aws_test()
    obj.run(**{'access_key': 'AKIAUGGKIDDEA35JGCU2', 
    'secret_key': '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'})
    