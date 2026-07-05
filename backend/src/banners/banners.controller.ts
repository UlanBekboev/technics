import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request, ForbiddenException, ParseIntPipe } from '@nestjs/common';
import { BannersService } from './banners.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('banners')
export class BannersController {
  constructor(private service: BannersService) {}

  @Get()
  findActive() { return this.service.findActive(); }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.findAll();
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard)
  create(@Request() req: any, @Body() body: any) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.create(body);
  }

  @Put('admin/:id')
  @UseGuards(JwtAuthGuard)
  update(@Request() req: any, @Param('id', ParseIntPipe) id: number, @Body() body: any) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.update(id, body);
  }

  @Put('admin/:id/toggle')
  @UseGuards(JwtAuthGuard)
  toggle(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.toggle(id);
  }

  @Post('admin/reorder')
  @UseGuards(JwtAuthGuard)
  reorder(@Request() req: any, @Body() body: { ids: number[] }) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.reorder(body.ids);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.remove(id);
  }
}
