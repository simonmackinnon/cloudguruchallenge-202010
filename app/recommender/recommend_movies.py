import boto3
import logging
import os
import pandas as pd

from datetime import datetime, timedelta
from botocore.exceptions import ClientError

logger = logging.getLogger()

def setupLogger(loggerLevel):
    global logger
    logger.setLevel(loggerLevel)
    logging.basicConfig(
        format='%(asctime)s %(levelname)-8s %(message)s',
        level=loggerLevel,
        datefmt='%d-%m-%Y %H:%M:%S')

def tableIsEmpty(response):
    return response['Count'] == 0

def getTitles(response):
    if not tableIsEmpty(response):
        items = response['Items']
        items.sort(key=lambda x: x['titleid'], reverse=True)
        return items
    
    return None

def getTableScanResponse(table_name, dynamodb_resource):
    table = dynamodb_resource.Table(table_name)
    response = table.scan()
    return response

def searchForTitles(df_titles, searchString):
    logger.info("Searching for {}".format(searchString))
    movies = df_titles[df_titles['title'].str.contains(searchString)]
    return movies

def recommendTitlesForTitleId(df_titles, reftitle):
    logger.info("Recommending for {}".format(reftitle))
    label = df_titles[df_titles['titleid'] == reftitle]['label'].iloc[0]
    movies = df_titles[df_titles['label'] == label].sample(15)
    return movies

def main(args, event):
    tableName = args['tableName']
    loggerLevel = logging.__dict__[args['loggerLevel']]
    
    dynamodb_resource = boto3.resource('dynamodb', region_name='ap-southeast-2')
    
    return_titles = None

    try: 
        setupLogger(loggerLevel)
        logger.info('Starting...')

        response = getTableScanResponse(tableName, dynamodb_resource)
        df_titles = getTitles(response)

        if event.body.querytype == 'search':
            return_titles = searchForTitles(df_titles, event.body.search)
        elif event.body.querytype == 'recommend':
            return_titles = recommendTitlesForTitleId(df_titles, event.body.reftitle)
        else:
            logger.error('Invalid query type!')

        logger.info('Done!')
    except:
        logger.exception('Error in processing!')
    finally:
        logger.info('Finally Done!')

    return { 
        'titles' : return_titles.to_json(orient="index")
    }
 
def event_handler(event, context):
    args = dict()
    args['loggerLevel'] = os.environ['LOGGER_LEVEL']
    args['tableName'] = os.environ['TABLE_NAME']
    
    logger.info('Args: {}'.format(args))
    
    return main(args, event)
