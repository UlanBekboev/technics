import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private service: FavoritesService) {}

  @Get()
  getFavorites(@Request() req: any) {
    return this.service.getFavorites(req.user.userId);
  }

  @Get('ids')
  getIds(@Request() req: any) {
    return this.service.getIds(req.user.userId);
  }

  @Post(':productId')
  toggle(@Request() req: any, @Param('productId') productId: string) {
    return this.service.toggle(req.user.userId, +productId);
  }
}
