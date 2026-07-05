import { Global, Module } from '@nestjs/common';
import { YooKassaService } from './yukassa.service';

@Global()
@Module({
  providers: [YooKassaService],
  exports: [YooKassaService],
})
export class YooKassaModule {}
