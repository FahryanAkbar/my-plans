import { Module } from '@nestjs/common';
import { NetworkTopologyService } from './network-topology.service';
import { NetworkTopologyController } from './network-topology.controller';

@Module({
  providers: [NetworkTopologyService],
  controllers: [NetworkTopologyController],
})
export class NetworkTopologyModule {}
