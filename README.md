# Discord Spam Removal Script

We often see in the Post Promotion channel of the Discord that people posts his posts more than once or more than one in 24 hours. So this script will automatically delete those posts if it finds duplicate or more than one in 24 hours.

To get started first create a Discord Bot, if you are not sure how to do it Check https://steemit.com/technology/@codingdefined/let-s-learn-how-to-create-a-discord-bot.

Then run this script which will create a Sqlite db if it does not exists and start getting the values from the Discord Channel.

Bot in Action

![](https://steemitimages.com/0x0/https://res.cloudinary.com/hpiynhbhq/image/upload/v1516698538/i6ba9rwblfjnix41vjtp.png)

As of now the Bot will save the Channel ID where the posts have been written along with Discord Name, now if you use more than one discord account you can still spam using the different account. We need to store the Steemit Username, Discord Name, Channel Id, Guild Id and Posts URL to reduce the spamming as much as possible. Create Test Cases and error handling.

The code is freely available in Github which you can fork and create a pull request. If you need any feature to be added, you can also talk to me on the Discord (Id - codingdefined) or create an issue.

