import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SquareController } from './square.controller';
import { SquareService } from './square.service';
import { SensitiveWordService } from './sensitive-word.service';
import { ReviewService } from './review.service';
import { PrivateMessageService } from './private-message.service';
import { CommentReviewService } from './comment-review.service';
import { ReportService } from './report.service';
import { AutoReviewService } from './auto-review.service';
import { OfficialPostService } from './official-post.service';
import { NewsCrawlerService } from './news-crawler.service';
import { Post, Comment, Like, Follow, Topic, User, SensitiveWord, PostReview, PrivateMessage, Config, Kyc, Wallet, Report, ReviewLog, MemberLevel } from '../../entities';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Comment, Like, Follow, Topic, User, SensitiveWord, PostReview, PrivateMessage, Config, Kyc, Wallet, Report, ReviewLog, MemberLevel]),
    AuthModule,
  ],
  controllers: [SquareController],
  providers: [SquareService, SensitiveWordService, ReviewService, PrivateMessageService, CommentReviewService, ReportService, AutoReviewService, OfficialPostService, NewsCrawlerService],
  exports: [SquareService, SensitiveWordService, ReviewService, PrivateMessageService, CommentReviewService, ReportService, AutoReviewService, OfficialPostService, NewsCrawlerService],
})
export class SquareModule {}
