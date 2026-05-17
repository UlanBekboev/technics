import { Controller, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private service: ReviewsService) {}

  @Post()
  create(
    @Request() req: any,
    @Body() body: { productId: number; rating: number; comment?: string },
  ) {
    return this.service.create(req.user.userId, body.productId, body.rating, body.comment);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.service.remove(+id, req.user.userId, req.user.role);
  }
}
