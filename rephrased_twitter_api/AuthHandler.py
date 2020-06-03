import logging
from tweepy import OAuthHandler

logger = logging.getLogger('root')

class AuthHandler:
    def __init__(self, consumer_key, consumer_secret, access_key, access_secret):
        self.consumer_key = consumer_key
        self.consumer_secret = consumer_secret
        self.access_key = access_key
        self.access_secret = access_secret
        self.auth = None
        self.authorize()

    def authorize(self):
        logger.info("[twitter_handler.authorize] Checking credentials...")
        self.auth = OAuthHandler(self.consumer_key, self.consumer_secret)
        self.auth.set_access_token(self.access_key, self.access_secret)