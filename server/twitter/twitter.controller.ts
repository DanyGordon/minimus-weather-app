import { Body, Controller, Post } from "@nestjs/common";
import { TwitterService } from "./twitter.service";

@Controller('tweets')
export class TwitterController {

  constructor(private TwiiterService: TwitterService) { }

  @Post()
  getLatestTweetsByHashtag(@Body() body: { query: string }): Promise<any> {
    return this.TwiiterService.searchTweets(body);
  }

}