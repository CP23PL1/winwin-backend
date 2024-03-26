import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GoogleApiService } from './google-api.service';

@Module({
  imports: [HttpModule.register({})],
  providers: [GoogleApiService],
  exports: [GoogleApiService],
})
export class GoogleApiModule {}
