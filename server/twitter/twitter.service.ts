import { Injectable } from "@nestjs/common";

import * as Twitter from 'twitter';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class TwitterService {

  private twitter: Twitter;

  constructor() {
    this.twitter = new Twitter({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
      access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    });
  }

  async searchTweets({ query }) {
    try {
      const params = { q: query, count: 10 };
      return await new Promise((resolve, reject) => {
        this.twitter.get('search/tweets', params, (error, tweets, response) => {
          if (!error) {
            return resolve(tweets);
          } else {
            return reject(error)
          }
        });
      });
    } catch (e) {
      return { statusCode: e[0].code, message: e[0].message };
    }
  }

}