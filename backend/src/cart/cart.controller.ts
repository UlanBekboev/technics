import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private service: CartService) {}

  @Get()
  getCart(@Request() req: any) {
    return this.service.getCart(req.user.userId);
  }

  @Post()
  addItem(@Request() req: any, @Body() body: { productId: number; quantity?: number }) {
    return this.service.addItem(req.user.userId, body.productId, body.quantity);
  }

  @Patch(':productId')
  updateItem(
    @Request() req: any,
    @Param('productId') productId: string,
    @Body() body: { quantity: number },
  ) {
    return this.service.updateItem(req.user.userId, +productId, body.quantity);
  }

  @Delete(':productId')
  removeItem(@Request() req: any, @Param('productId') productId: string) {
    return this.service.removeItem(req.user.userId, +productId);
  }

  @Delete()
  clearCart(@Request() req: any) {
    return this.service.clearCart(req.user.userId);
  }
}
