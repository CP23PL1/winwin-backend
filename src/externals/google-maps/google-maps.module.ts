import { Module } from '@nestjs/common';
import { GoogleMapsService } from './google-maps.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule.register({})],
  providers: [GoogleMapsService],
  exports: [GoogleMapsService],
})
export class GoogleMapsModule {}
