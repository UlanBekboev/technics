import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private service: OrdersService) {}

  @Get()
  getOrders(@Request() req: any) {
    return this.service.getOrders(req.user.userId);
  }

  @Get('admin/all')
  getAllOrders(@Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.getAllOrders();
  }

  @Get(':id')
  getOrder(@Request() req: any, @Param('id') id: string) {
    return this.service.getOrder(req.user.userId, +id);
  }

  @Post()
  createOrder(
    @Request() req: any,
    @Body() body: { address: string; comment?: string },
  ) {
    return this.service.createOrder(req.user.userId, body.address, body.comment);
  }

  @Patch(':id/status')
  updateStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.updateStatus(+id, body.status);
  }
}
