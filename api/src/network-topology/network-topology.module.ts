import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NetworkNode } from './entities/network-node.entity';
import { NetworkEdge } from './entities/network-edge.entity';
import { NetworkTopologyController } from './network-topology.controller';
import { NetworkTopologyService } from './network-topology.service';
import { NetworkTopologyRepository } from './repositories/network-topology.repository';

@Module({
  imports: [TypeOrmModule.forFeature([NetworkNode, NetworkEdge])],
  controllers: [NetworkTopologyController],
  providers: [NetworkTopologyService, NetworkTopologyRepository],
  exports: [NetworkTopologyService],
})
export class NetworkTopologyModule {}
