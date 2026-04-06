import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { SearchController } from './search.controller';

@Module({
  controllers: [HealthController, SearchController],
})
export class HealthModule {}
