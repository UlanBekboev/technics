import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  imports: [ConfigModule],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
