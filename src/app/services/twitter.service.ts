import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { filter, first, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TwitterService {

  private readonly baseUrl: string = environment.backendUrl;

  constructor(public http: HttpClient) { }

  fetchTwitter(city: string) {
    return this.http.post(this.baseUrl + 'tweets', { query: `${city} Weather` }).pipe(
      first(), map((res: any) => res && res.statuses.length ? res.statuses : []),
      filter((tweets: any) => tweets.map(tweet => tweet.text && tweet.text.match(/weather/g))),
      map((tweets: any) => tweets.map(tweet => ({
        text: tweet.text,
        date: tweet.created_at,
        user: {
          name: tweet.user.name,
          photo: tweet.user.profile_image_url_https,
          handle: tweet.user.screen_name
        },
        url: (() => tweet.entities.urls.length && tweet.entities.urls[0].expanded_url.slice(18).includes('https://twitter.com') ? tweet.entities.urls[0].expanded_url : `http://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`)()
      }))),
      map((tweets: any) => tweets.slice(0, 4))
    );
  }

}
