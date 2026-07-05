import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request, ForbiddenException, ParseIntPipe } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('messages')
export class MessagesController {
  constructor(private service: MessagesService) {}

  // Public: client sends a message
  @Post()
  create(@Body() body: { name: string; phone: string; message?: string }) {
    return this.service.create(body);
  }

  // Admin routes — must come BEFORE the dynamic :id route
  @Get('admin')
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.findAll();
  }

  @Get('admin/unread-count')
  @UseGuards(JwtAuthGuard)
  unreadCount(@Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.unreadCount();
  }

  @Post('admin/:id/read')
  @UseGuards(JwtAuthGuard)
  markRead(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.markRead(id);
  }

  @Post('admin/:id/reply')
  @UseGuards(JwtAuthGuard)
  reply(@Request() req: any, @Param('id', ParseIntPipe) id: number, @Body() body: { reply: string }) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.reply(id, body.reply);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.remove(id);
  }

  // Public: client polls for their own message status (knows ID from localStorage)
  // Must be LAST — dynamic route would otherwise shadow static admin/* routes
  @Get(':id/status')
  getStatus(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }
}
