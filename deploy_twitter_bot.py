# 6/2/2020
# version 0.1

import logging.config
import rephrased_twitter_api.AuthHandler

logging.config.fileConfig('logging_config.cfg')
logger = logging.getLogger('root')

rephrased_twitter_api.AuthHandler.AuthHandler('a', 'a', 'a', 'a')