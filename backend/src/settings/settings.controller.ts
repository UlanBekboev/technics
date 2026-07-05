import { Controller, Get, Post, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('settings')
export class SettingsController {
  constructor(private service: SettingsService) {}

  @Get()
  findAll() { return this.service.getAll(); }

  @Post('admin')
  @UseGuards(JwtAuthGuard)
  update(@Request() req: any, @Body() body: Record<string, string>) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.updateAll(body);
  }
}
